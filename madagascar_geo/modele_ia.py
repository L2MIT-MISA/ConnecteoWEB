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


def _demander_json_openrouter(messages: list[dict], classe_reponse: type[BaseModel], nombre_de_tokens_max: int):
    """Appel à l'API OpenRouter (format OpenAI-compatible)."""
    headers = {
        "Authorization": f"Bearer {config.CLE_API_OPENROUTER}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/connecteo",
        "X-Title": "Connecteo Madagascar Geo",
    }
    donnees_envoyees = {
        "model": config.MODELE_OPENROUTER,
        "messages": messages,
        "temperature": 0.1,
        "max_tokens": nombre_de_tokens_max,
        "response_format": {"type": "json_schema", "json_schema": {"name": classe_reponse.__name__, "schema": classe_reponse.model_json_schema()}},
    }

    with _file_d_attente_redaction:
        for numero_tentative in range(1, NOMBRE_DE_TENTATIVES + 1):
            try:
                reponse = httpx.post(config.URL_OPENROUTER, headers=headers, json=donnees_envoyees,
                                     timeout=DELAI_REDACTION_EN_SECONDES)
                reponse.raise_for_status()
                contenu = reponse.json()["choices"][0]["message"]["content"]
                return classe_reponse.model_validate_json(contenu)
            except (httpx.HTTPError, ValidationError, KeyError) as erreur:
                journal.warning("Réponse OpenRouter inutilisable (tentative %d/%d) : %s",
                                numero_tentative, NOMBRE_DE_TENTATIVES, erreur)

    return None


def _demander_json_au_modele(messages: list[dict], classe_reponse: type[BaseModel], nombre_de_tokens_max: int):
    """Utilise OpenRouter si clé configurée, renvoie None sinon (pas de fallback Ollama)."""
    if config.UTILISER_OPENROUTER:
        return _demander_json_openrouter(messages, classe_reponse, nombre_de_tokens_max)

    # Pas de fallback Ollama si clé OpenRouter non définie
    journal.info("Clé OpenRouter non configurée, réponse IA abandonnée")
    return None


def rediger_resume(messages: list[dict]) -> ResumeDuModele | None:
    return _demander_json_au_modele(messages, ResumeDuModele, NOMBRE_DE_TOKENS_RESUME)


def extraire_lieux(messages: list[dict]) -> ReponseDuModele | None:
    return _demander_json_au_modele(messages, ReponseDuModele, NOMBRE_DE_TOKENS_EXTRACTION)


def prechauffer_modeles():
    try:
        calculer_vecteurs(["préchauffage"])
        if config.UTILISER_OPENROUTER:
            headers = {
                "Authorization": f"Bearer {config.CLE_API_OPENROUTER}",
                "Content-Type": "application/json",
            }
            reponse = httpx.post(config.URL_OPENROUTER, headers=headers, timeout=DELAI_REDACTION_EN_SECONDES, json={
                "model": config.MODELE_OPENROUTER, "messages": [{"role": "user", "content": "ok"}], "max_tokens": 1})
            reponse.raise_for_status()
        else:
            journal.info("Clé OpenRouter non configurée, préléchauffage skipped (modèle non disponible)")
    except (httpx.HTTPError, ValueError) as erreur:
        journal.warning("Préchauffage des modèles impossible : %s", erreur)
