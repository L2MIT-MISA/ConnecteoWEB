from __future__ import annotations

import functools
import logging
import threading

import httpx
from pydantic import BaseModel, ValidationError

import config
from modeles import ReponseDuModele, ResumeDuModele

journal = logging.getLogger("modele_ia")

DELAI_VECTEURS_EN_SECONDES = 120
DELAI_REDACTION_EN_SECONDES = 600
NOMBRE_DE_TENTATIVES = 2
NOMBRE_DE_TOKENS_RESUME = 200
NOMBRE_DE_TOKENS_EXTRACTION = 900

CONTEXTE_EN_TOKENS = 4096

_file_d_attente_redaction = threading.Semaphore(1)


def calculer_vecteurs(textes: list[str]) -> list[list[float]]:
    reponse = httpx.post(f"{config.URL_OLLAMA}/api/embed", timeout=DELAI_VECTEURS_EN_SECONDES,
                         json={"model": config.MODELE_VECTEURS, "input": textes,
                               "keep_alive": config.DUREE_MODELE_EN_MEMOIRE})
    reponse.raise_for_status()
    vecteurs = reponse.json()["embeddings"]

    for vecteur in vecteurs:
        if len(vecteur) != config.DIMENSION_VECTEUR:
            raise ValueError(f"Le modèle {config.MODELE_VECTEURS} renvoie {len(vecteur)} dimensions "
                             f"au lieu de {config.DIMENSION_VECTEUR} (voir schema_rag.sql)")

    return vecteurs


@functools.lru_cache(maxsize=256)
def calculer_vecteur_de_la_requete(texte: str) -> tuple[float, ...]:
    return tuple(calculer_vecteurs([texte])[0])


def _demander_json_au_modele(messages: list[dict], classe_reponse: type[BaseModel], nombre_de_tokens_max: int):
    donnees_envoyees = {
        "model": config.MODELE_REDACTION,
        "messages": messages,
        "stream": False,
        "think": False,
        "keep_alive": config.DUREE_MODELE_EN_MEMOIRE,
        "format": classe_reponse.model_json_schema(),
        "options": {"temperature": 0.1, "num_ctx": CONTEXTE_EN_TOKENS, "num_predict": nombre_de_tokens_max},
    }

    with _file_d_attente_redaction:
        for numero_tentative in range(1, NOMBRE_DE_TENTATIVES + 1):
            try:
                reponse = httpx.post(f"{config.URL_OLLAMA}/api/chat", json=donnees_envoyees,
                                     timeout=DELAI_REDACTION_EN_SECONDES)
                reponse.raise_for_status()

                return classe_reponse.model_validate_json(reponse.json()["message"]["content"])
            except (httpx.HTTPError, ValidationError, KeyError) as erreur:
                journal.warning("Réponse du modèle inutilisable (tentative %d/%d) : %s",
                                numero_tentative, NOMBRE_DE_TENTATIVES, erreur)

    return None


def rediger_resume(messages: list[dict]) -> ResumeDuModele | None:
    return _demander_json_au_modele(messages, ResumeDuModele, NOMBRE_DE_TOKENS_RESUME)


def extraire_lieux(messages: list[dict]) -> ReponseDuModele | None:
    return _demander_json_au_modele(messages, ReponseDuModele, NOMBRE_DE_TOKENS_EXTRACTION)


def prechauffer_modeles():
    try:
        calculer_vecteurs(["préchauffage"])
        reponse = httpx.post(f"{config.URL_OLLAMA}/api/chat", timeout=DELAI_REDACTION_EN_SECONDES, json={
            "model": config.MODELE_REDACTION, "messages": [{"role": "user", "content": "ok"}], "stream": False,
            "think": False, "keep_alive": config.DUREE_MODELE_EN_MEMOIRE,
            "options": {"num_ctx": CONTEXTE_EN_TOKENS, "num_predict": 1}})
        reponse.raise_for_status()
    except (httpx.HTTPError, ValueError) as erreur:
        journal.warning("Préchauffage des modèles impossible : %s", erreur)
