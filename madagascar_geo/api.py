import os
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field

import config
import diagnostic
import indexation
import modele_ia
import recherche
import resultat_json


def demarrer_les_modeles_puis_indexer(evenement_arret):
    modele_ia.prechauffer_modeles()
    indexation.reindexer_regulierement(evenement_arret)


@asynccontextmanager
async def cycle_de_vie(application):
    evenement_arret = threading.Event()
    # Un seul fil, l'un après l'autre : charger deux modèles en même temps peut saturer la mémoire d'Ollama
    threading.Thread(target=demarrer_les_modeles_puis_indexer, args=(evenement_arret,), daemon=True).start()
    yield
    evenement_arret.set()


application = FastAPI(title="Recherche de lieux - Madagascar", lifespan=cycle_de_vie)
application.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
                           allow_methods=["GET", "POST"], allow_headers=["*"])
app = application


class DemandeDeRecherche(BaseModel):
    requete: str = Field(min_length=1, max_length=200)


class ReponseDeClarification(BaseModel):
    id_resultat: str = Field(max_length=100)
    id_option: str = Field(max_length=50)
    texte_libre: str | None = Field(default=None, max_length=200)


@application.get("/")
def afficher_la_page_de_demonstration():
    return FileResponse(config.PAGE_WEB_DEMONSTRATION)


@application.get("/fond.jpg")
def afficher_l_image_de_fond():
    chemin = config.DOSSIER_PROJET / "fond.jpg"

    if not chemin.is_file():
        raise HTTPException(status_code=404, detail="fond.jpg absent")

    return FileResponse(chemin)


@application.get("/favicon.ico", include_in_schema=False)
def ignorer_l_icone():
    return Response(status_code=204)


@application.get("/sante")
def verifier_les_services():
    return diagnostic.diagnostiquer_services()


@application.post("/recherche")
def demander_une_recherche(demande: DemandeDeRecherche):
    return recherche.lancer_recherche(demande.requete)


@application.post("/recherche/preciser")
def preciser_une_recherche(reponse: ReponseDeClarification):
    try:
        return recherche.preciser_recherche(reponse.id_resultat, reponse.id_option, reponse.texte_libre)
    except ValueError as erreur:
        raise HTTPException(status_code=400, detail=str(erreur)) from erreur


@application.get("/resultats/{id_resultat}")
def lire_un_resultat(id_resultat: str):
    resultat = resultat_json.lire_resultat(id_resultat)

    if resultat is None:
        raise HTTPException(status_code=404, detail="Résultat inconnu")

    return resultat