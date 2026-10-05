// @ts-nocheck
import { useState, useEffect } from 'react';
import {
    APIProvider, Map, AdvancedMarker, Polyline, InfoWindow, useMap
} from '@vis.gl/react-google-maps';
import './style/Carte.css';
import './style/Itineraire.css';
import './style/Bulle.css';
import './style/Zoom.css';

const CENTRE = { lat: -18.8792, lng: 47.5079 };
const API_URL = `${import.meta.env.VITE_SEARCH_API_URL || 'http://127.0.0.1:8000'}/api/pylones`;

const COULEURS_OPERATEURS = {
    'Orange': '#f39c12',
    'Airtel': '#db1e1e',
    'Telma': '#2249e6',
    'Yas': '#2249e6',      // Yas = Telma (même couleur)
    'default': '#3b5456'
};

function getCouleurOperateur(proprietaire) {
    if (!proprietaire) return COULEURS_OPERATEURS.default;
    const p = proprietaire.toLowerCase();
    if (p.includes('yas') || p.includes('telma')) return COULEURS_OPERATEURS['Yas'];
    if (p.includes('orange')) return COULEURS_OPERATEURS['Orange'];
    if (p.includes('airtel')) return COULEURS_OPERATEURS['Airtel'];
    return COULEURS_OPERATEURS.default;
}

function getIconeOperateur(codeOperateur) {
    if (!codeOperateur) return '/pylone.png';
    const code = String(codeOperateur).toUpperCase();
    if (code.includes('TELMA') || code.includes('YAS')) return '/yas.svg';
    if (code.includes('ORANGE')) return '/orange.svg';
    if (code.includes('AIRTEL')) return '/airtel.svg';
    if (code.includes('GULFSAT')) return '/gulfsat.svg';
    return '/pylone.png';
}

// ============================================================
// BOUTONS DE ZOOM
// ============================================================
function ZoomControls() {
    const map = useMap();
    return (
        <div className="zoom-controls">
            <button className="zoom-btn" onClick={() => map.setZoom((map.getZoom() || 6) + 1)}>+</button>
            <button className="zoom-btn" onClick={() => map.setZoom((map.getZoom() || 6) - 1)}>−</button>
        </div>
    );
}

// ============================================================
// BULLE PYLÔNE
// ============================================================
function BullePylone({ pylone, onClose }) {
    const operateurPourCouleur = pylone.code_operateur || pylone.proprietaire || '';
    const couleur = getCouleurOperateur(operateurPourCouleur);

    const badges = [];
    if (pylone.tech_5g) badges.push(<span key="5g" className="badge badge-5g">5G</span>);
    if (pylone.tech_4g) badges.push(<span key="4g" className="badge badge-4g">4G</span>);
    if (pylone.tech_3g) badges.push(<span key="3g" className="badge badge-3g">3G</span>);
    if (pylone.tech_2g) badges.push(<span key="2g" className="badge badge-2g">2G</span>);

    return (
        <InfoWindow
            position={{ lat: parseFloat(pylone.lat), lng: parseFloat(pylone.lon) }}
            onCloseClick={onClose}
            pixelOffset={[0, -50]}
        >
            <div className="bulle-pylone">
                <div className="bulle-header" style={{ borderBottomColor: couleur }}>
                    <span className="bulle-icone">📡</span>
                    <h3 style={{ color: couleur }}>{pylone.nom || pylone.code_site || 'Pylône'}</h3>
                </div>
                <div className="bulle-corps">
                    {pylone.code_operateur && (
                        <div className="bulle-ligne"><strong>Code opérateur :</strong> {pylone.code_operateur}</div>
                    )}
                    {pylone.nom_region && (
                        <div className="bulle-ligne"><strong>Région :</strong> {pylone.nom_region}</div>
                    )}
                    <div className="bulle-ligne">
                        <strong>Technologies :</strong>{' '}
                        {badges.length > 0 ? <span className="bulle-badges">{badges}</span> : <span className="bulle-vide">Aucune</span>}
                    </div>
                </div>
            </div>
        </InfoWindow>
    );
}

// ============================================================
// BULLE LORA
// ============================================================
function BulleLora({ dispositif, onClose }) {
    return (
        <InfoWindow
            position={{ lat: dispositif.lat, lng: dispositif.lng }}
            onCloseClick={onClose}
            pixelOffset={[0, -40]}
        >
            <div className="bulle-pylone">
                <div className="bulle-header" style={{ borderBottomColor: '#27ae60' }}>
                    <span className="bulle-icone">📶</span>
                    <h3 style={{ color: '#27ae60' }}>{dispositif.id}</h3>
                </div>
                <div className="bulle-corps">
                    <div className="bulle-ligne">
                        <strong>Batterie :</strong> {dispositif.batterie}%
                    </div>
                    {dispositif.pylone_proche ? (
                        <>
                            <div className="bulle-ligne">
                                <strong>Pylône le plus proche :</strong>{' '}
                                {dispositif.pylone_proche.nom || dispositif.pylone_proche.code_site}
                            </div>
                            <div className="bulle-ligne">
                                <strong>Distance :</strong>{' '}
                                {(dispositif.pylone_proche.distance_m / 1000).toFixed(2)} km
                            </div>
                        </>
                    ) : (
                        <div className="bulle-ligne">Aucun pylône à proximité</div>
                    )}
                    <div className="bulle-coords">
                        📍 {dispositif.lat.toFixed(4)}, {dispositif.lng.toFixed(4)}
                    </div>
                </div>
            </div>
        </InfoWindow>
    );
}

// ============================================================
// MARQUEUR LORA + LIAISON VERS LE PYLÔNE LE PLUS PROCHE
// ============================================================
function MarqueurLora({ dispositif, onSelect }) {
    return (
        <>
            <AdvancedMarker
                position={{ lat: dispositif.lat, lng: dispositif.lng }}
                title={`${dispositif.id} — batterie ${dispositif.batterie}%`}
                onClick={() => onSelect(dispositif)}
            >
                <img
                    src="/lora.png"
                    alt="Dispositif LoRa"
                    style={{
                        width: '40px',
                        height: 'auto',
                        cursor: 'pointer',
                        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
                        transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
            </AdvancedMarker>

            {dispositif.pylone_proche && (
                <Polyline
                    path={[
                        { lat: dispositif.lat, lng: dispositif.lng },
                        { lat: dispositif.pylone_proche.lat, lng: dispositif.pylone_proche.lng }
                    ]}
                    strokeColor="#27ae60"
                    strokeOpacity={0.6}
                    strokeWeight={2}
                    icons={[{
                        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                        offset: '0',
                        repeat: '10px'
                    }]}
                />
            )}
        </>
    );
}

// ============================================================
// ITINÉRAIRE (POLYLIGNE)
// ============================================================
function ItineraireAffiche({ trace }) {
    const map = useMap();
    useEffect(() => {
        if (!trace || trace.length === 0 || !map) return;
        const bounds = new window.google.maps.LatLngBounds();
        trace.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds, { padding: 60 });
    }, [trace, map]);

    if (!trace || trace.length === 0) return null;

    return (
        <Polyline
            path={trace}
            strokeColor="#1a73e8"
            strokeWeight={6}
            strokeOpacity={0.85}
        />
    );
}

// ============================================================
// FONCTIONS UTILITAIRES (Nominatim + OSRM)
// ============================================================
async function geocoder(adresse) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
    const data = await res.json();
    if (data.length === 0) throw new Error(`Adresse non trouvée : "${adresse}"`);
    return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        nom: data[0].display_name
    };
}

async function calculerItineraire(depart, arrivee) {
    const url = `https://router.project-osrm.org/route/v1/driving/${depart.lng},${depart.lat};${arrivee.lng},${arrivee.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) throw new Error("Aucun itinéraire trouvé");
    const route = data.routes[0];
    const trace = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    return {
        trace,
        distance: `${(route.distance / 1000).toFixed(1)} km`,
        duree: `${Math.round(route.duration / 60)} min`
    };
}

// ============================================================
// PANNEAU ITINÉRAIRE
// ============================================================
function PanneauItineraire({ onCalculer, onEffacer, infos, chargement }) {
    const [ouvert, setOuvert] = useState(false);
    const [depart, setDepart] = useState('');
    const [arrivee, setArrivee] = useState('');

    const handleCalculer = (e) => {
        e.preventDefault();
        if (!depart.trim() || !arrivee.trim()) return;
        onCalculer(depart.trim(), arrivee.trim());
    };

    const handleEffacer = () => {
        setDepart('');
        setArrivee('');
        onEffacer();
    };

    return (
        <div className="itineraire-panel">
            {!ouvert && (
                <button className="itineraire-toggle" onClick={() => setOuvert(true)} title="Calculer un itinéraire" aria-label="Calculer un itinéraire"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polygon points="16 8 14 14 8 16 10 10 16 8" /></svg></button>
            )}
            {ouvert && (
                <div className="itineraire-contenu">
                    <div className="itineraire-header">
                        <h3>Itinéraire</h3>
                        <button className="itineraire-fermer" onClick={() => setOuvert(false)}>✕</button>
                    </div>
                    <form onSubmit={handleCalculer}>
                        <div className="itineraire-champ">
                            <span className="icone">🟢</span>
                            <input type="text" placeholder="Point de départ" value={depart} onChange={(e) => setDepart(e.target.value)} />
                        </div>
                        <div className="itineraire-champ">
                            <span className="icone">🔴</span>
                            <input type="text" placeholder="Destination" value={arrivee} onChange={(e) => setArrivee(e.target.value)} />
                        </div>
                        <div className="itineraire-actions">
                            <button type="submit" className="btn-calculer" disabled={chargement}>
                                {chargement ? 'Calcul...' : 'Calculer'}
                            </button>
                            <button type="button" className="btn-effacer" onClick={handleEffacer}>Effacer</button>
                        </div>
                    </form>
                    {infos && infos.distance && (
                        <div className="itineraire-infos">
                            <div className="info-ligne"><strong>Distance :</strong> {infos.distance}</div>
                            <div className="info-ligne"><strong>⏱Durée :</strong> {infos.duree}</div>
                        </div>
                    )}
                    {infos && infos.erreur && (<div className="itineraire-erreur">{infos.erreur}</div>)}
                    <div className="itineraire-credit">Itinéraire : OpenStreetMap</div>
                </div>
            )}
        </div>
    );
}

// ============================================================
// BBOX + ZOOM SELON RAYON
// ============================================================
function bboxAutourDe(lat, lng, rayonKm) {
    const deltaLat = rayonKm / 111;
    const deltaLng = rayonKm / (111 * Math.cos(lat * Math.PI / 180));
    return {
        minLat: lat - deltaLat,
        maxLat: lat + deltaLat,
        minLng: lng - deltaLng,
        maxLng: lng + deltaLng
    };
}

function zoomPourRayon(rayonKm) {
    if (rayonKm <= 1) return 15;
    if (rayonKm <= 2) return 14;
    if (rayonKm <= 5) return 13;
    if (rayonKm <= 10) return 12;
    if (rayonKm <= 20) return 11;
    if (rayonKm <= 50) return 10;
    return 9;
}

// ============================================================
// CONFIG
// ============================================================
const RAYON_KM = 10;

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
function ConnecteoMap({ results = [], selected = null, onSelect }: any) {
    const [pylones, setPylones] = useState([]);
    const [pyloneSelectionne, setPyloneSelectionne] = useState(null);
    const [trace, setTrace] = useState(null);
    const [infosItineraire, setInfosItineraire] = useState(null);
    const [chargementItineraire, setChargementItineraire] = useState(false);
    const [mapInstance, setMapInstance] = useState(null);

    // LoRa (temps réel via WebSocket)
    const [dispositifsLora] = useState([]);
    const [loraSelectionneId, setLoraSelectionneId] = useState(null);
    const loraSelectionne = dispositifsLora.find((d) => d.id === loraSelectionneId) || null;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!selected || !mapInstance) return;
        mapInstance.panTo({ lat: selected.location.latitude, lng: selected.location.longitude });
        mapInstance.setZoom(15);
    }, [selected, mapInstance]);

    // ----------------------------------------------------------
    // Charge les pylônes dans une bounding box
    // ----------------------------------------------------------
    const chargerPylonesDansBbox = async (bbox) => {
        try {
            const url = `${API_URL}/bbox?minLat=${bbox.minLat}&minLng=${bbox.minLng}&maxLat=${bbox.maxLat}&maxLng=${bbox.maxLng}`;
            console.log('Chargement pylônes depuis', url);

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            const valides = data.filter(p =>
                p.lat != null && p.lon != null &&
                !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lon))
            );
            console.log(`${valides.length} pylônes reçus`);
            setPylones(valides);
        } catch (err) {
            console.error('Erreur chargement pylônes :', err);
            setPylones([]);
        }
    };

    // ----------------------------------------------------------
    // Chargement initial autour d'Antananarivo
    // ----------------------------------------------------------
    useEffect(() => {
        const bbox = bboxAutourDe(CENTRE.lat, CENTRE.lng, RAYON_KM);
        chargerPylonesDansBbox(bbox);
    }, []);

    // ----------------------------------------------------------
    // Itinéraire
    // ----------------------------------------------------------
    const handleCalculer = async (adresseDepart, adresseArrivee) => {
        setChargementItineraire(true);
        setInfosItineraire(null);
        setTrace(null);

        try {
            const depart = await geocoder(adresseDepart);
            const arrivee = await geocoder(adresseArrivee);
            const resultat = await calculerItineraire(depart, arrivee);
            setTrace(resultat.trace);
            setInfosItineraire({ distance: resultat.distance, duree: resultat.duree });
        } catch (err) {
            console.error('Erreur itinéraire :', err);
            setInfosItineraire({ erreur: err.message });
        } finally {
            setChargementItineraire(false);
        }
    };

    const handleEffacer = () => {
        setTrace(null);
        setInfosItineraire(null);
    };

    const handleMapClick = () => {
        setPyloneSelectionne(null);
        setLoraSelectionneId(null);
    };

    // ----------------------------------------------------------
    // Rendu
    // ----------------------------------------------------------
    return (
        <div className="carte-wrapper">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultZoom={zoomPourRayon(RAYON_KM)}
                    defaultCenter={CENTRE}
                    mapId="DEMO_MAP_ID"
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    style={{ width: '100%', height: '100%' }}
                    onClick={handleMapClick}
                    onIdle={(e) => {
                        if (e.map && !mapInstance) setMapInstance(e.map);
                    }}
                >
                    {/* Résultats de la recherche principale */}
                    {results.map((result) => (
                        <AdvancedMarker
                            key={`result-${result.id}`}
                            position={{ lat: result.location.latitude, lng: result.location.longitude }}
                            title={result.name}
                            onClick={() => onSelect?.(result)}
                            zIndex={2000}
                        >
                            <div className={`result-map-marker ${selected?.id === result.id ? 'selected' : ''}`}>●</div>
                        </AdvancedMarker>
                    ))}

                    {selected && (
                        <InfoWindow
                            position={{ lat: selected.location.latitude, lng: selected.location.longitude }}
                            onCloseClick={() => onSelect?.(null)}
                            pixelOffset={[0, -34]}
                        >
                            <div className="result-map-popup">
                                <strong>{selected.name}</strong>
                                <span>{selected.address}</span>
                                <em>{selected.connectivity}</em>
                            </div>
                        </InfoWindow>
                    )}

                    {/* Pylônes */}
                    {pylones.map((pylone, i) => {
                        const icone = getIconeOperateur(pylone.code_operateur || pylone.proprietaire);
                        return (
                            <AdvancedMarker
                                key={pylone.code_site || i}
                                position={{
                                    lat: parseFloat(pylone.lat),
                                    lng: parseFloat(pylone.lon)
                                }}
                                title={pylone.nom || 'Pylône'}
                                onClick={() => setPyloneSelectionne(pylone)}
                            >
                                <img
                                    src={icone}
                                    alt={`Pylône ${pylone.code_operateur || ''}`}
                                    style={{
                                        width: '36px',
                                        height: 'auto',
                                        cursor: 'pointer',
                                        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
                                        transition: 'transform 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            </AdvancedMarker>
                        );
                    })}

                    {pyloneSelectionne && (
                        <BullePylone
                            pylone={pyloneSelectionne}
                            onClose={() => setPyloneSelectionne(null)}
                        />
                    )}

                    {/* Dispositifs LoRa en temps réel */}
                    {dispositifsLora.map((d) => (
                        <MarqueurLora
                            key={d.id}
                            dispositif={d}
                            onSelect={(disp) => setLoraSelectionneId(disp.id)}
                        />
                    ))}

                    {loraSelectionne && (
                        <BulleLora
                            dispositif={loraSelectionne}
                            onClose={() => setLoraSelectionneId(null)}
                        />
                    )}

                    {trace && <ItineraireAffiche trace={trace} />}
                    <ZoomControls />
                </Map>
            </APIProvider>

            <PanneauItineraire
                onCalculer={handleCalculer}
                onEffacer={handleEffacer}
                infos={infosItineraire}
                chargement={chargementItineraire}
            />
        </div>
    );
}

export default ConnecteoMap;