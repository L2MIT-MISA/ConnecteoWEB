# mock-server : faux backend pour le front Connecteo

Remplace le serveur, la base de données (Neo4j) et l'edge function Supabase par un petit
serveur local, **sans toucher au code de `src/`**. Aucune dépendance (Node 18+).

## Installation (une fois)
1. Copier ce dossier `mock-server/` à la racine du projet (à côté de `src/` et `package.json`).
2. Copier `mock-server/env.local.example` vers `.env.local` à la racine du projet.
3. (Conseillé) éviter de commiter le dossier par erreur :
   `echo "mock-server/" >> .git/info/exclude`

## Utilisation
```bash
node mock-server/server.mjs   # terminal 1
npm run dev                   # terminal 2
```
(Relancer `npm run dev` si Vite tournait déjà : il lit `.env.local` au démarrage.)

## Ce qui est simulé
| Appel du front | Simulé par |
|---|---|
| `supabase.functions.invoke("search")` | `POST /functions/v1/search` |
| `POST /search` | 15 hôtels réels de `final_results.json` ; autres catégories : mêmes lieux renommés « (démo) » |
| `GET /api/pylones/bbox` et `/api/pylones` | ~900 pylônes générés (dont ceux cités dans la connectivité des hôtels) |

Non simulé : la connexion/inscription (Supabase Auth). Nominatim, OSRM et Google Maps sont les vrais services.

## Options
`PORT=8001 node mock-server/server.mjs` · `DELAY_MS=0` (sans délai) · `MOCK_STRICT=0` (accepte toutes les catégories).

Par défaut, le mock **imite le vrai backend** : il refuse avec une erreur 400 les catégories absentes de
`CATEGORIES_GEOAPIFY` dans `backend/search/main.py` (voir plus bas pour `bank` et `gas_station`).

## Tout enlever
Supprimer le dossier `mock-server/` et le fichier `.env.local` (ou y remettre les vraies valeurs).
Le code du front n'a pas changé : il fonctionne tel quel avec le vrai back.
