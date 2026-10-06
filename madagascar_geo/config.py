import os
from pathlib import Path

DOSSIER_PROJET = Path(__file__).resolve().parent


def _charger_fichier_env() -> None:
    chemin = DOSSIER_PROJET / ".env"

    if not chemin.is_file():
        return

    for ligne in chemin.read_text(encoding="utf-8").splitlines():
        ligne = ligne.strip()

        if not ligne or ligne.startswith("#") or "=" not in ligne:
            continue

        nom, valeur = ligne.split("=", 1)
        os.environ.setdefault(nom.strip(), valeur.strip().strip('"').strip("'"))


_charger_fichier_env()

# --- Services externes -------------------------------------------------------------------------------------------
URL_BASE_DE_DONNEES = os.getenv("DATABASE_URL", "")
CLE_API_GOOGLE = os.getenv("GOOGLE_API_KEY", "")
IDENTIFIANT_MOTEUR_GOOGLE = os.getenv("GOOGLE_CX", "")
# Recherche web : les fournisseurs sont essayés dans cet ordre, le premier qui répond est utilisé.
ORDRE_FOURNISSEURS_RECHERCHE = [nom.strip() for nom in os.getenv("FOURNISSEURS_RECHERCHE", "searxng,duckduckgo,wikipedia,brave,google").split(",") if nom.strip()]
URL_SEARXNG = os.getenv("SEARXNG_URL", "http://localhost:8080").rstrip("/")
CLE_API_BRAVE = os.getenv("BRAVE_API_KEY", "")
URL_OLLAMA = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODELE_REDACTION = os.getenv("MODELE", "qwen3:4b")
MODELE_VECTEURS = os.getenv("MODELE_EMBEDDING", "bge-m3")
DIMENSION_VECTEUR = 1024                      # doit correspondre à vector(1024) dans schema_rag.sql
DUREE_MODELE_EN_MEMOIRE = "30m"               # keep_alive d'Ollama
URL_NOMINATIM = "https://nominatim.openstreetmap.org/search"
IDENTIFIANT_APPLICATION = os.getenv("USER_AGENT", "connecteo-madagascar-geo/1.0")
PORT_API = int(os.getenv("PORT", "8000"))

# --- Dossiers et fichiers ----------------------------------------------------------------------------------------
DOSSIER_DONNEES = Path(os.getenv("DOSSIER_DONNEES", DOSSIER_PROJET / "donnees"))
DOSSIER_LIEUX_JSON = DOSSIER_DONNEES / "lieux"
DOSSIER_PRODUITS_JSON = DOSSIER_DONNEES / "produits"
DOSSIER_COMPLEMENTAIRES_JSON = DOSSIER_DONNEES / "complementaires"
DOSSIER_RESULTATS = DOSSIER_DONNEES / "resultats"
DOSSIER_CSV_PROPRES = DOSSIER_DONNEES / "csv_propres"
CHEMIN_EXCEL = DOSSIER_PROJET.parent / "Carte Infra_Opér_Début 2024_VFin.xlsx"
PAGE_WEB_DEMONSTRATION = DOSSIER_PROJET / "web2.html"

# --- Fonctionnement ----------------------------------------------------------------------------------------------
INTERVALLE_REINDEXATION_EN_SECONDES = 600     # 10 minutes
DUREE_CACHE_RESULTATS_EN_SECONDES = 600       # 10 minutes
NOMBRE_FRAGMENTS_RECUPERES = 30
NOMBRE_LIEUX_MAX = 30
NOMBRE_LIEUX_POUR_LE_RESUME = 5
NOMBRE_PAGES_WEB_LUES = 4
CARACTERES_MAX_PAR_PAGE = 6000

# --- Seuils de recherche -----------------------------------------------------------------------------------------
SEUIL_SIMILARITE_NOM_LIEU = 0.5               
SEUIL_SIMILARITE_FRAGMENT = 0.45              
SEUIL_COUVERTURE_MOTS_CLES = 0.5              
BONUS_MOT_CLE_COMMUN = 0.2

# --- Classement des lieux ----------------------------------------------------------------------------------------
NOTE_MOYENNE_DE_REFERENCE = 3.5
NOMBRE_AVIS_DE_REFERENCE = 10
POIDS_CLASSEMENT = {"pertinence": 0.45, "note": 0.15, "confiance": 0.15, "origine": 0.10, "precision": 0.15}
POIDS_ORIGINE = {"referentiel": 1.0, "base_connaissances": 0.8, "google": 0.5}
POIDS_PRECISION = {"precis": 1.0, "centroide": 0.6, "repli_hierarchique": 0.2, "absent": 0.0}
CONFIANCE_DONNEES_PRODUITS = 0.7

# --- Madagascar : emprise géographique (pour détecter les coordonnées fausses) ------------------------------------
LATITUDE_MIN, LATITUDE_MAX = -26.0, -11.5
LONGITUDE_MIN, LONGITUDE_MAX = 42.5, 51.0

# --- Opérateurs mobiles (fichier Excel). Lettre = celle des colonnes 2GT2023, COUVT... ---------------------------
# À VÉRIFIER avec la feuille Desserte_des_Communes : seule E = GULFSAT est mentionnée dans le LISEZMOI.
OPERATEURS_PAR_LETTRE = {"T": "TELMA", "O": "ORANGE", "A": "AIRTEL", "B": "BLUELINE", "E": "GULFSAT"}
OPERATEURS_VALIDES = set(OPERATEURS_PAR_LETTRE.values())

# --- Synonymes : un mot cherché trouve aussi tous les mots de son groupe -----------------------------------------
GROUPES_DE_SYNONYMES = [
    ["CACAO", "CACAOYER", "CACAOYERE", "CHOCOLAT", "KAKAO"],
    ["VANILLE", "VANILLIER", "VANILLA"],
    ["CANNE A SUCRE", "CANNE", "SUCRE", "SAKARY"],
    ["RIZ", "RIZIERE", "VARY"],
    ["CAFE", "CAFEIER", "KAFE"],
    ["GIROFLE", "GIROFLIER", "CLOU DE GIROFLE"],
    ["POIVRE", "POIVRIER"],
    ["LITCHI", "LYCHEE", "LETCHI"],
    ["HOPITAL", "CLINIQUE", "CSB", "CENTRE DE SANTE", "DISPENSAIRE"],
    ["MARCHE", "MARKET", "TOKO"],
    ["ECOLE", "LYCEE", "COLLEGE", "UNIVERSITE"],
]

# --- Fenêtre de précision (requête floue) et urgence -------------------------------------------------------------
QUESTION_REQUETE_FLOUE = "Que cherchez-vous exactement ?"
QUESTION_AUCUN_RESULTAT = "Je n'ai rien trouvé. Pouvez-vous préciser votre recherche ?"
MESSAGE_URGENCE = "En cas d'urgence, contactez immédiatement les secours."
# À RENSEIGNER APRÈS VÉRIFICATION, ex. [{"service": "Police", "numero": "117"}]. Vide = un avertissement est affiché.
NUMEROS_D_URGENCE: list[dict] = []

OPTIONS_DE_CLARIFICATION = [
    {"id": "lieu", "libelle": "Un lieu", "termes_de_recherche": [],
     "question_suivante": "Quel lieu cherchez-vous ? (ville, commune, site...)"},
    {"id": "ressource", "libelle": "Une ressource ou un produit", "termes_de_recherche": [],
     "question_suivante": "Quelle ressource ou quel produit cherchez-vous ? (cacao, vanille, riz...)"},
    {"id": "sante", "libelle": "Un service de santé", "termes_de_recherche": ["santé", "hôpital", "centre de santé"],
     "question_suivante": "Dans quelle ville ou commune cherchez-vous un service de santé ?"},
    {"id": "urgence", "libelle": "Une urgence", "style": "danger", "urgence": True,
     "termes_de_recherche": [], "question_suivante": ""},
]