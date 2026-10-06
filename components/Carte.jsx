import { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, AdvancedMarkerAnchorPoint, useMap } from '@vis.gl/react-google-maps';
import './Carte.css';
import PanneauSecurite from './PanneauSecurite';
import { useSecurityData } from './useSecurityData';

const CENTRE = { lat: -18.8792, lng: 47.5079 };

// URL du backend Neo4j (server.js)
const API_URL = import.meta.env.VITE_SEARCH_API_URL || 'http://127.0.0.1:3001';

// ============================================================
// Couleurs des technologies reseau
// ============================================================
const COULEUR_TECH = {
    '5g': '#16a34a', // vert
    '4g': '#16a34a', // vert
    '3g': '#eab308', // jaune
    '2g': '#f97316', // orange
    'none': '#e5484d'  // rouge
};

function couleurTech(tech) {
    return COULEUR_TECH[tech] || COULEUR_TECH.none;
}

// ============================================================
// Cache global des pylones reseau (lat/lng/tech)
// ============================================================
let _cacheReseau = null;
let _cachePromise = null;

async function chargerPylonesReseau() {
    if (_cacheReseau) return _cacheReseau;
    if (_cachePromise) return _cachePromise;

    _cachePromise = (async () => {
        const res = await fetch(`${API_URL}/api/pylones/network`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        _cacheReseau = data
            .map((p) => ({
                lat: Number(p.lat),
                lng: Number(p.lon),
                tech: p.tech || 'none'
            }))
            .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
        return _cacheReseau;
    })();

    return _cachePromise;
}

// ============================================================
// Distance approx (Haversine) en metres
// ============================================================
function distanceM(a, b) {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const x = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
}

// Renvoie la tech du pylone le plus proche du point.
// Seuil : si le pylone le plus proche est plus loin que SEUIL_M, on renvoie 'none'.
const SEUIL_M = 8000; // 8 km — ajuste selon ta densite de pylones

function techDuPoint(point, pylones) {
    let bestTech = 'none';
    let bestD = Infinity;
    for (const p of pylones) {
        const d = distanceM(point, p);
        if (d < bestD) {
            bestD = d;
            bestTech = p.tech;
        }
    }
    return bestD <= SEUIL_M ? bestTech : 'none';
}

// ============================================================
// Decoupe une polyligne en segments de meme couleur
// ============================================================
function decouperParReseau(points, pylones) {
    if (!points || points.length === 0) return [];

    // 1. Tech dominante pour chaque point
    const techs = points.map((pt) => techDuPoint(pt, pylones));

    // 2. Regroupe les points consecutifs de meme tech
    const segments = [];
    let courant = { tech: techs[0], points: [points[0]] };

    for (let i = 1; i < points.length; i++) {
        if (techs[i] === courant.tech) {
            courant.points.push(points[i]);
        } else {
            // Duplique le point charniere pour eviter un trou visuel
            courant.points.push(points[i]);
            segments.push(courant);
            courant = { tech: techs[i], points: [points[i]] };
        }
    }
    segments.push(courant);

    // 3. Convertit en segments colores
    return segments.map((s) => ({
        tech: s.tech,
        couleur: couleurTech(s.tech),
        points: s.points
    }));
}

// ============================================================
// MODES DE TRANSPORT
// ============================================================
const MODES = [
    {
        id: 'car',
        label: 'Voiture',
        serveur: 'https://routing.openstreetmap.de/routed-car',
        couleur: '#2f5fff',
        icone: (
            <svg viewBox="0 0 24 24">
                <path d="M3 17v-4l2-6h14l2 6v4z" />
                <circle cx="7.5" cy="17" r="1.6" />
                <circle cx="16.5" cy="17" r="1.6" />
                <path d="M3 13h18" />
            </svg>
        )
    },
    {
        id: 'bike',
        label: 'Vélo',
        serveur: 'https://routing.openstreetmap.de/routed-bike',
        couleur: '#16a34a',
        icone: (
            <svg viewBox="0 0 24 24">
                <circle cx="6" cy="16" r="3.5" />
                <circle cx="18" cy="16" r="3.5" />
                <path d="M6 16l4-8h5l3 8M10 8H8" />
            </svg>
        )
    },
    {
        id: 'foot',
        label: 'À pied',
        serveur: 'https://routing.openstreetmap.de/routed-foot',
        couleur: '#e5484d',
        icone: (
            <svg viewBox="0 0 24 24">
                <circle cx="13" cy="4.5" r="1.8" />
                <path d="M12 8l-2 5 3 2v5M10 13l-3 2M12 8l3 3 3 1" />
            </svg>
        )
    }
];

// ============================================================
// RECHERCHE DE LIEUX (Nominatim)
// ============================================================
async function chercherLieux(texte, limite = 5) {
    const url =
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=${limite}` +
        '&accept-language=fr&viewbox=47.35,-18.75,47.65,-19.05' +
        `&q=${encodeURIComponent(texte)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Service de recherche indisponible, réessayez.');
    const data = await res.json();
    return data.map((d) => {
        const morceaux = d.display_name.split(',').map((s) => s.trim());
        const [sud, nord, ouest, est] = (d.boundingbox || []).map(parseFloat);
        return {
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
            nom: d.display_name,
            libelle: d.name || morceaux[0],
            adresse: morceaux.slice(1).join(', '),
            bbox: [sud, nord, ouest, est].every((v) => Number.isFinite(v))
                ? { sud, nord, ouest, est }
                : null
        };
    });
}

async function geocoder(adresse) {
    const r = await chercherLieux(adresse, 1);
    if (r.length === 0) throw new Error(`Adresse non trouvée : « ${adresse} »`);
    return r[0];
}

function positionActuelle() {
    return new Promise((resolve, reject) => {
        const echec = () => reject(new Error('Position indisponible : indiquez un point de départ.'));
        if (!navigator.geolocation) return echec();
        navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, nom: 'Ma position', libelle: 'Ma position' }),
            echec,
            { timeout: 8000 }
        );
    });
}

async function calculerItineraire(mode, depart, arrivee) {
    const url = `${mode.serveur}/route/v1/driving/${depart.lng},${depart.lat};${arrivee.lng},${arrivee.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) throw new Error('Aucun itinéraire');
    const route = data.routes[0];
    return {
        trace: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
        distanceM: route.distance,
        dureeS: route.duration
    };
}

function formaterDistance(m) {
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function formaterDuree(s) {
    const minutes = Math.max(1, Math.round(s / 60));
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const reste = minutes % 60;
    return `${h} h ${String(reste).padStart(2, '0')}`;
}

// ============================================================
// TRACE : polyligne multicolore selon la couverture reseau
// ============================================================
function Trace({ path }) {
    const map = useMap();
    const [pylones, setPylones] = useState(null);

    // Charge une seule fois la liste des pylones reseau
    useEffect(() => {
        let alive = true;
        console.log('[Trace] Demande de chargement des pylones reseau...');
        chargerPylonesReseau()
            .then((data) => {
                console.log(`[Trace] ${data.length} pylones prets`);
                if (data.length > 0) {
                    console.log('[Trace] Exemple de pylone :', data[0]);
                    // Compte les techs pour voir la repartition
                    const counts = data.reduce((acc, p) => {
                        acc[p.tech] = (acc[p.tech] || 0) + 1;
                        return acc;
                    }, {});
                    console.log('[Trace] Repartition des techs :', counts);
                }
                if (alive) setPylones(data);
            })
            .catch((err) => {
                console.error('[Trace] Erreur chargement pylones :', err);
            });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        if (!map || !path || path.length === 0) return;

        // Tant que les pylones ne sont pas charges, on affiche une ligne neutre grise
        if (!pylones) {
            console.log('[Trace] dessin GRIS (pylones pas encore prets)');
            const contour = new window.google.maps.Polyline({
                path,
                map,
                strokeColor: '#ffffff',
                strokeOpacity: 0.95,
                strokeWeight: 9,
                zIndex: 1
            });
            const ligne = new window.google.maps.Polyline({
                path,
                map,
                strokeColor: '#9ca3af',
                strokeOpacity: 1,
                strokeWeight: 5,
                zIndex: 2
            });
            return () => {
                contour.setMap(null);
                ligne.setMap(null);
            };
        }

        // Sinon : segments colores selon la tech dominante
        console.log(`[Trace] dessin COLORE avec ${pylones.length} pylones`);
        console.log(`[Trace] polyligne de ${path.length} points`);

        const segments = decouperParReseau(path, pylones);
        console.log(`[Trace] ${segments.length} segments crees :`);
        segments.forEach((s, i) => {
            console.log(`  #${i} ${s.tech} -> ${s.couleur} (${s.points.length} points)`);
        });

        const polylines = [];

        for (const seg of segments) {
            if (seg.points.length < 2) continue;

            const contour = new window.google.maps.Polyline({
                path: seg.points,
                map,
                strokeColor: '#ffffff',
                strokeOpacity: 0.95,
                strokeWeight: 9,
                zIndex: 1
            });
            const ligne = new window.google.maps.Polyline({
                path: seg.points,
                map,
                strokeColor: seg.couleur,
                strokeOpacity: 1,
                strokeWeight: 5,
                zIndex: 2
            });
            polylines.push(contour, ligne);
        }

        return () => {
            polylines.forEach((p) => p.setMap(null));
        };
    }, [map, path, pylones]);

    return null;
}

// ============================================================
// AJUSTER LA VUE
// ============================================================
function AjusterVue({ path }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !path || path.length === 0) return;
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        const large = window.innerWidth > 800;
        const padding = large
            ? { top: 60, bottom: 60, left: 440, right: 90 }
            : { top: Math.round(window.innerHeight * 0.55), bottom: 50, left: 30, right: 30 };
        map.fitBounds(bounds, padding);
    }, [map, path]);

    return null;
}

// ============================================================
// ALLER A UN LIEU
// ============================================================
function AllerA({ lieu }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !lieu) return undefined;
        const large = window.innerWidth > 800;
        const padding = large
            ? { top: 100, bottom: 220, left: 440, right: 90 }
            : { top: 90, bottom: Math.round(window.innerHeight * 0.55), left: 30, right: 70 };
        const bounds = lieu.bbox
            ? new window.google.maps.LatLngBounds(
                { lat: lieu.bbox.sud, lng: lieu.bbox.ouest },
                { lat: lieu.bbox.nord, lng: lieu.bbox.est }
            )
            : new window.google.maps.LatLngBounds(
                { lat: lieu.lat, lng: lieu.lng },
                { lat: lieu.lat, lng: lieu.lng }
            );
        map.fitBounds(bounds, padding);
        const plafond = lieu.bbox ? 17 : 16;
        const ecouteur = window.google.maps.event.addListenerOnce(map, 'idle', () => {
            if ((map.getZoom() || 0) > plafond) map.setZoom(plafond);
        });
        return () => ecouteur.remove();
    }, [map, lieu]);

    return null;
}

// ============================================================
// CONTROLES DE ZOOM
// ============================================================
function ZoomControls({ typeCarte, onToggleType }) {
    const map = useMap();
    const zoomer = (delta) => {
        if (!map) return;
        map.setZoom((map.getZoom() || 12) + delta);
    };
    return (
        <div className="zoom-controls">
            <button type="button" className="zoom-btn" onClick={() => zoomer(1)} aria-label="Zoom avant">+</button>
            <button type="button" className="zoom-btn" onClick={() => zoomer(-1)} aria-label="Zoom arrière">−</button>
            <button
                type="button"
                className="zoom-btn zoom-btn-type"
                onClick={onToggleType}
                aria-label="Changer le type de carte"
                title={typeCarte === 'hybrid' ? 'Passer au plan' : 'Passer au satellite'}
            >
                {typeCarte === 'hybrid' ? '🗺️' : '🛰️'}
            </button>
        </div>
    );
}

// ============================================================
// BARRE DE RECHERCHE
// ============================================================
function BarreRecherche({ lieu, onChoisir, onEffacer }) {
    const [texte, setTexte] = useState('');
    const [resultats, setResultats] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [ouvert, setOuvert] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const fermer = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOuvert(false);
        };
        document.addEventListener('mousedown', fermer);
        return () => document.removeEventListener('mousedown', fermer);
    }, []);

    useEffect(() => {
        if (!lieu) {
            setTexte('');
            setResultats(null);
            setErreur(null);
            setOuvert(false);
        }
    }, [lieu]);

    const choisir = (l) => {
        setTexte(l.libelle);
        setOuvert(false);
        onChoisir(l);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const q = texte.trim();
        if (!q || chargement) return;
        setChargement(true);
        setErreur(null);
        try {
            const r = await chercherLieux(q, 5);
            if (r.length === 0) {
                setResultats(null);
                setErreur(`Aucun résultat pour « ${q} »`);
                setOuvert(true);
                return;
            }
            setResultats(r);
            setOuvert(r.length > 1);
            setTexte(r[0].libelle);
            onChoisir(r[0]);
        } catch (err) {
            setErreur(err.message);
            setOuvert(true);
        } finally {
            setChargement(false);
        }
    };

    const vider = () => {
        setTexte('');
        setResultats(null);
        setErreur(null);
        setOuvert(false);
        onEffacer();
    };

    return (
        <div className="search-wrap" ref={ref}>
            <form className="search-bar" onSubmit={handleSubmit} role="search">
                <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                    type="text"
                    placeholder="Rechercher un lieu, une adresse, un quartier…"
                    value={texte}
                    onChange={(e) => setTexte(e.target.value)}
                    onFocus={() => (resultats || erreur) && setOuvert(true)}
                    onKeyDown={(e) => e.key === 'Escape' && setOuvert(false)}
                    autoComplete="off"
                    aria-label="Rechercher un lieu"
                />
                {texte && (
                    <button type="button" className="search-clear" onClick={vider} aria-label="Effacer la recherche">✕</button>
                )}
                <button type="submit" className="search-submit" disabled={chargement || !texte.trim()}>
                    {chargement ? <span className="spinner" /> : 'Chercher'}
                </button>
            </form>

            {ouvert && (erreur || (resultats && resultats.length > 1)) && (
                <div className="search-results">
                    {erreur && <div className="search-empty">{erreur}</div>}
                    {!erreur && <div className="list-label">Autres résultats</div>}
                    {!erreur && resultats.map((l, i) => (
                        <button type="button" key={`${l.lat},${l.lng},${i}`} className="search-item" onClick={() => choisir(l)}>
                            <span className="search-item-pin">📍</span>
                            <span className="search-item-text">
                                <span className="search-item-name">{l.libelle}</span>
                                <span className="search-item-addr">{l.adresse || l.nom}</span>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================
// FICHE LIEU
// ============================================================
function FicheLieu({ lieu, onItineraire, onFermer }) {
    return (
        <div className="place-card">
            <div className="place-card-body">
                <div className="place-card-title">{lieu.libelle}</div>
                <div className="place-card-addr">{lieu.adresse || lieu.nom}</div>
                <div className="place-card-coords">
                    {lieu.lat.toFixed(5)}, {lieu.lng.toFixed(5)}
                </div>
            </div>
            <div className="place-card-actions">
                <button type="button" className="btn-primary" onClick={onItineraire}>
                    <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                    Itinéraire
                </button>
                <button type="button" className="btn-ghost" onClick={onFermer}>Fermer</button>
            </div>
        </div>
    );
}

// ============================================================
// PANNEAU ITINERAIRE
// ============================================================
function Panneau({ arriveeInitiale, onRechercher, onEffacer, onRetour, resultats, modeActif, onChoisirMode, chargement, erreur, destination }) {
    const [depart, setDepart] = useState('');
    const [arrivee, setArrivee] = useState(arriveeInitiale || '');
    const [replie, setReplie] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!arrivee.trim()) return;
        onRechercher(depart.trim(), arrivee.trim());
    };

    const handleEffacer = () => {
        setDepart('');
        setArrivee('');
        onEffacer();
    };

    const inverser = () => {
        setDepart(arrivee);
        setArrivee(depart);
    };

    const reference = resultats && resultats[MODES[0].id];

    return (
        <aside className={'sidebar' + (replie ? ' replie' : '')}>
            <div className="sidebar-head">
                <button type="button" className="sidebar-back" onClick={onRetour} aria-label="Retour à la recherche" title="Retour">
                    ←
                </button>
                <div className="sidebar-head-text">
                    <h2 className="sidebar-title">Itinéraire</h2>
                    <div className="sidebar-count">
                        {resultats
                            ? `Vers ${destination}`
                            : 'Choisissez un départ et une destination'}
                    </div>
                </div>
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() => setReplie((v) => !v)}
                    aria-label={replie ? 'Déplier le panneau' : 'Replier le panneau'}
                >
                    {replie ? '▾' : '▴'}
                </button>
            </div>

            <form className="route-form" onSubmit={handleSubmit}>
                <div className="route-fields">
                    <label className="route-field">
                        <span className="dot dot-start" />
                        <input
                            type="text"
                            placeholder="Départ (vide = ma position)"
                            value={depart}
                            onChange={(e) => setDepart(e.target.value)}
                            autoComplete="off"
                            autoFocus
                        />
                    </label>
                    <label className="route-field">
                        <span className="dot dot-end" />
                        <input
                            type="text"
                            placeholder="Destination"
                            value={arrivee}
                            onChange={(e) => setArrivee(e.target.value)}
                            autoComplete="off"
                        />
                    </label>
                    <button type="button" className="swap-btn" onClick={inverser} aria-label="Inverser départ et destination" title="Inverser">
                        ⇅
                    </button>
                </div>
                <div className="route-actions">
                    <button type="submit" className="btn-primary" disabled={chargement || !arrivee.trim()}>
                        {chargement && <span className="spinner" />}
                        {chargement ? 'Calcul…' : 'Rechercher'}
                    </button>
                    <button type="button" className="btn-ghost" onClick={handleEffacer}>Effacer</button>
                </div>
            </form>

            {erreur && <div className="route-error">{erreur}</div>}

            <div className="sidebar-list">
                {resultats && <div className="list-label">Moyens de transport</div>}
                {resultats && MODES.map((mode) => {
                    const r = resultats[mode.id];
                    if (!r) {
                        return (
                            <div key={mode.id} className="result-item disabled">
                                <div className="result-icon">{mode.icone}</div>
                                <div className="result-info">
                                    <div className="result-name">{mode.label}</div>
                                    <div className="result-meta">Non disponible pour ce trajet</div>
                                </div>
                            </div>
                        );
                    }
                    const identique =
                        mode.id !== MODES[0].id && reference &&
                        Math.abs(r.distanceM - reference.distanceM) / reference.distanceM < 0.01;

                    return (
                        <div
                            key={mode.id}
                            role="button"
                            tabIndex={0}
                            className={'result-item' + (modeActif === mode.id ? ' active' : '')}
                            onClick={() => onChoisirMode(mode.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onChoisirMode(mode.id);
                                }
                            }}
                        >
                            <div className="result-icon">{mode.icone}</div>
                            <div className="result-info">
                                <div className="result-name">{mode.label}</div>
                                <div className="result-meta">
                                    <span className="result-distance">{formaterDuree(r.dureeS)}</span>
                                    <span>{formaterDistance(r.distanceM)}</span>
                                    {identique && <span className="badge-same">Même chemin que la voiture</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legende reseau */}
            <div className="legend-reseau">
                <div className="legend-title">Couverture réseau</div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: COULEUR_TECH['5g'] }} />
                    <span>5G / 4G</span>
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: COULEUR_TECH['3g'] }} />
                    <span>3G</span>
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: COULEUR_TECH['2g'] }} />
                    <span>2G</span>
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: COULEUR_TECH['none'] }} />
                    <span>Aucun réseau</span>
                </div>
            </div>

            <div className="sidebar-foot">Itinéraires : OpenStreetMap · OSRM</div>
        </aside>
    );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
function Carte() {
    const [vue, setVue] = useState('recherche');
    const [lieu, setLieu] = useState(null);
    const { data: securityData, chargement: secuChargement, erreur: secuErreur } = useSecurityData(lieu);

    const [resultats, setResultats] = useState(null);
    const [modeActif, setModeActif] = useState(null);
    const [points, setPoints] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [typeCarte, setTypeCarte] = useState('hybrid');

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Pre-charge les pylones reseau des l'ouverture de la page
    useEffect(() => {
        chargerPylonesReseau()
            .then((data) => console.log(`${data.length} pylones reseau charges`))
            .catch((err) => console.warn('Pylones reseau indisponibles :', err.message));
    }, []);

    const handleRechercher = async (texteDepart, texteArrivee) => {
        setChargement(true);
        setErreur(null);
        setResultats(null);
        setPoints(null);

        try {
            const arrivee = lieu && texteArrivee === lieu.libelle
                ? lieu
                : await geocoder(texteArrivee);
            const depart = texteDepart ? await geocoder(texteDepart) : await positionActuelle();

            const reponses = await Promise.allSettled(
                MODES.map((m) => calculerItineraire(m, depart, arrivee))
            );

            const res = {};
            MODES.forEach((m, i) => {
                if (reponses[i].status === 'fulfilled') res[m.id] = reponses[i].value;
            });

            const premier = MODES.find((m) => res[m.id]);
            if (!premier) throw new Error('Aucun itinéraire trouvé entre ces deux points.');

            setPoints({ depart, arrivee });
            setResultats(res);
            setModeActif(premier.id);
        } catch (err) {
            console.error('Erreur itinéraire :', err);
            setErreur(err.message);
        } finally {
            setChargement(false);
        }
    };

    const handleEffacerItineraire = () => {
        setResultats(null);
        setModeActif(null);
        setPoints(null);
        setErreur(null);
    };

    const handleRetour = () => {
        handleEffacerItineraire();
        setVue('recherche');
    };

    const handleFermerLieu = () => {
        setLieu(null);
    };

    const modeCourant = MODES.find((m) => m.id === modeActif);
    const traceCourante = resultats && modeActif ? resultats[modeActif].trace : null;

    return (
        <div className={'carte-wrapper' + (vue === 'recherche' && lieu ? ' avec-securite' : '')}>
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultZoom={12}
                    defaultCenter={CENTRE}
                    mapId="DEMO_MAP_ID"
                    mapTypeId={typeCarte}
                    gestureHandling="greedy"
                    disableDefaultUI={true}
                    style={{ width: '100%', height: '100%' }}
                >
                    {/* Lieu trouvé par la recherche */}
                    {vue === 'recherche' && lieu && (
                        <>
                            <AdvancedMarker
                                position={{ lat: lieu.lat, lng: lieu.lng }}
                                title={lieu.libelle}
                                anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                            >
                                <div className="marker-pin marker-end">📍</div>
                            </AdvancedMarker>
                            <AllerA lieu={lieu} />
                        </>
                    )}

                    {/* Itinéraire : marqueurs départ/arrivée */}
                    {vue === 'itineraire' && points && (
                        <>
                            <AdvancedMarker
                                position={{ lat: points.depart.lat, lng: points.depart.lng }}
                                title="Départ"
                                anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                            >
                                <div className="marker-pin marker-start" />
                            </AdvancedMarker>
                            <AdvancedMarker
                                position={{ lat: points.arrivee.lat, lng: points.arrivee.lng }}
                                title="Destination"
                                anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                            >
                                <div className="marker-pin marker-end">📍</div>
                            </AdvancedMarker>
                        </>
                    )}

                    {/* Polyligne multicolore selon couverture réseau */}
                    {vue === 'itineraire' && traceCourante && modeCourant && (
                        <>
                            <Trace path={traceCourante} />
                            <AjusterVue path={traceCourante} />
                        </>
                    )}
                </Map>

                <ZoomControls
                    typeCarte={typeCarte}
                    onToggleType={() => setTypeCarte((t) => (t === 'hybrid' ? 'roadmap' : 'hybrid'))}
                />
            </APIProvider>

            {vue === 'recherche' && (
                <>
                    <BarreRecherche lieu={lieu} onChoisir={setLieu} onEffacer={handleFermerLieu} />
                    {lieu && (
                        <FicheLieu
                            lieu={lieu}
                            onItineraire={() => setVue('itineraire')}
                            onFermer={handleFermerLieu}
                        />
                    )}
                    {lieu && (
                        <PanneauSecurite
                            lieu={lieu}
                            securityData={securityData}
                            chargement={secuChargement}
                            erreur={secuErreur}
                            onRetour={handleFermerLieu}
                            onItineraire={() => setVue('itineraire')}
                        />
                    )}
                </>
            )}

            {vue === 'itineraire' && (
                <Panneau
                    arriveeInitiale={lieu ? lieu.libelle : ''}
                    onRechercher={handleRechercher}
                    onEffacer={handleEffacerItineraire}
                    onRetour={handleRetour}
                    resultats={resultats}
                    modeActif={modeActif}
                    onChoisirMode={setModeActif}
                    chargement={chargement}
                    erreur={erreur}
                    destination={points ? points.arrivee.libelle : ''}
                />
            )}
        </div>
    );
}

export default Carte;