# mock-server : faux backend pour le front Connecteo

Remplace le serveur, la base de données (Neo4j) et l'edge function Supabase par un petit
serveur local, **sans toucher au code de `src/`**. Aucune dépendance (Node 18+).

## Installation (une fois)
1. Copier ce dossier `mock-server/` à la racine du projet (à côté de `src/` et `package.json`).
   Le fichier à lancer doit être `mock-server/server.mjs` (pas `mock-server/mock-server/server.mjs`).
2. Copier `mock-server/env.local.example` vers `.env.local` à la racine du projet.
3. (Conseillé) éviter de commiter le dossier par erreur :
   `echo "mock-server/" >> .git/info/exclude`

## Utilisation
```bash
node mock-server/server.mjs   # terminal 1
npm run dev                   # terminal 2
```
(Relancer `npm run dev` si Vite tournait déjà : il lit `.env.local` au démarrage.)

Vérifier que la bonne version tourne :
```bash
curl -X POST localhost:8000/assistant -H 'Content-Type: application/json' -d '{"query":"mal aux dents"}'
```
Une réponse `{"detail":"Not Found"}` signifie que c'est une ancienne version, sans la route `/assistant`.

## Ce qui est simulé
| Appel du front | Simulé par |
|---|---|
| `supabase.functions.invoke("search")` | `POST /functions/v1/search` : **le vrai code** de `supabase/functions/search` (fautes de frappe, « où manger », lieu vérifié avec Nominatim), empaqueté dans `search-function.mjs` |
| `POST /assistant` (front : `src/services/assistant.ts`) | Scénarios de la boîte de décision (santé, urgence, ressources, lieu, détresse), écrits dans `assistant-flows.mjs` |
| `POST /search` | 15 hôtels réels de `final_results.json` ; autres catégories : mêmes lieux renommés « (démo) » |
| `GET /api/pylones/bbox` et `/api/pylones` | ~900 pylônes générés (dont ceux cités dans la connectivité des hôtels) |

Limites : les lieux renvoyés par `POST /search` sont **toujours les mêmes, autour d'Antananarivo**, quel que soit le lieu cherché. Ils ne dépendent que de la catégorie.

Non simulé : la connexion/inscription (Supabase Auth). Nominatim, OSRM et Google Maps sont les vrais services.

## Quelles recherches fonctionnent

Le front analyse d'abord la phrase (`/functions/v1/search`). Si une catégorie est reconnue, il lance
`POST /search` avec cette catégorie. Sinon, la phrase part vers l'assistant (`POST /assistant`).

### Recherches qui affichent des lieux sur la carte
| Phrase tapée | Catégorie envoyée | Résultat |
|---|---|---|
| restaurant, resto, restauration, snack, fast food, café, « où manger » | `restaurant` | OK (lieux « démo ») |
| hôtel, hébergement, « où dormir », « se loger » | `hotel` | OK (15 vrais hôtels) |
| pharmacie | `pharmacy` | OK (lieux « démo ») |
| hôpital | `hospital` | OK (lieux « démo ») |

Les fautes de frappe sont corrigées sur les mots de 6 lettres ou plus (« restorant » devient « restaurant »).

### Recherches refusées en mode strict (erreur 400)
| Phrase tapée | Catégorie envoyée | Pourquoi |
|---|---|---|
| banque, distributeur, « retirer de l'argent » | `bank` | `CATEGORIES_GEOAPIFY` ne connaît que `banque`, `atm`, `distributeur` |
| station service | `gas_station` | `CATEGORIES_GEOAPIFY` ne connaît que `station service` et `station essence` |

Le front affiche alors « Impossible de charger les résultats ». Pour tester quand même ces cas :
`MOCK_STRICT=0 node mock-server/server.mjs` (les catégories inconnues renvoient alors des lieux de type « commercial »).
Le vrai correctif est dans `backend/search/main.py` ou dans le dictionnaire de l'edge function : les deux doivent employer les mêmes clés.

### Phrases qui passent par l'assistant
L'assistant détecte des mots-clés (sans accents, sans majuscules) et répond avec une question et des boutons.

| Scénario | Mots déclencheurs | Boutons |
|---|---|---|
| détresse | mourir, suicide, me tuer, en finir, plus envie de vivre | SOS, fermer |
| urgence | sos, urgence, secours, danger, accident, aide | confirmer l'alerte, annuler |
| santé | malade, mal, douleur, santé, fièvre, dent(s), tête, ventre, dos, médecin, docteur, hôpital, pharmacie | dentiste, hôpital, pharmacie, urgence |
| ressources | cacao, vanille, riz, café, ressource, producteur, marché, coopérative | producteurs, marchés, coopératives |
| lieu | lieu, village, aller, route, itinéraire, chemin, où est, Itaosy, Antsirabe, Toamasina, Mahitsy | Itaosy, Antananarivo, Mahitsy, autre destination |
| autre | tout le reste | lieu, ressource, santé, urgence |

La détresse est testée par le front avant toute recherche : aucune recherche de lieu n'est lancée dans ce cas.

Ce que donne le clic sur un bouton :
- **Hôpital, pharmacie** : lancent une recherche de lieux (OK).
- **Un dentiste** : envoie `dentist`, que `CATEGORIES_GEOAPIFY` ne connaît pas (elle a `dentiste`). Erreur 400 en mode strict.
- **Urgence, SOS** : affichent « Alerte envoyée », rien n'est réellement envoyé.
- **Producteurs, marchés, coopératives, Itaosy, Antananarivo, Mahitsy** : le front répond « Je ne peux pas encore afficher cette recherche sur la carte ». Ces boutons n'envoient ni catégorie ni lieu exploitable.
- **Autre destination, lieu, ressource, service de santé** : relancent une recherche avec leur texte, donc retour vers les scénarios ci-dessus.

## Mettre à jour l'analyse de requête
`search-function.mjs` est une copie de `supabase/functions/search` à la date de création. Si ce code change dans le projet, ce fichier ne suit pas automatiquement.

## Options
`PORT=8001 node mock-server/server.mjs` · `DELAY_MS=0` (sans délai) · `MOCK_STRICT=0` (accepte toutes les catégories).

Si le port change, mettre la même valeur dans `VITE_SEARCH_API_URL` du `.env.local`.

Par défaut, le mock **imite le vrai backend** : il refuse avec une erreur 400 les catégories absentes de
`CATEGORIES_GEOAPIFY` dans `backend/search/main.py` (voir « Recherches refusées en mode strict » plus haut pour `bank` et `gas_station`).

## Tout enlever
Supprimer le dossier `mock-server/` et le fichier `.env.local` (ou y remettre les vraies valeurs).
Le code du front n'a pas changé : il fonctionne tel quel avec le vrai back.
