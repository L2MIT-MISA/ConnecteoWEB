import './DownloadPage.css';

export default function DownloadPage() {
  return (
    <div id="page-download">
      <div id="downloadScene"></div>

      <main className="content">
        <section className="hero-section">
          <div className="badge">
            <span className="dot"></span> Version 2.4.1 disponible
          </div>
          <h1>
            Emportez Connectéo
            <br />
            <span className="accent">partout avec vous.</span>
          </h1>
          <p>
            Scannez le code pour installer l'application directement sur votre téléphone.
            Fonctionne même hors réseau, en zone blanche.
          </p>
        </section>

        <section className="phone-section">
          {/* Maquette du telephone avec le QR code*/}
          <div className="phone-mockup">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="app-logo"></div>
                <div className="app-name">Connectéo</div>
                <div className="app-tagline">Réseau maillé</div>

                <div className="qr-wrapper">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="#f5f1e8" />
                    <rect x="6" y="6" width="20" height="20" fill="none" stroke="#152019" strokeWidth="4" />
                    <rect x="11" y="11" width="10" height="10" fill="#152019" />
                    <rect x="74" y="6" width="20" height="20" fill="none" stroke="#152019" strokeWidth="4" />
                    <rect x="79" y="11" width="10" height="10" fill="#152019" />
                    <rect x="6" y="74" width="20" height="20" fill="none" stroke="#152019" strokeWidth="4" />
                    <rect x="11" y="79" width="10" height="10" fill="#152019" />
                    <g fill="#152019">
                      <rect x="32" y="6" width="4" height="4" /><rect x="40" y="6" width="4" height="4" /><rect x="52" y="6" width="4" height="4" /><rect x="60" y="6" width="4" height="4" />
                      <rect x="32" y="14" width="4" height="4" /><rect x="48" y="14" width="4" height="4" /><rect x="60" y="14" width="4" height="4" />
                      <rect x="36" y="22" width="4" height="4" /><rect x="44" y="22" width="4" height="4" /><rect x="56" y="22" width="4" height="4" />
                      <rect x="6" y="32" width="4" height="4" /><rect x="14" y="32" width="4" height="4" /><rect x="26" y="32" width="4" height="4" /><rect x="34" y="32" width="4" height="4" /><rect x="46" y="32" width="4" height="4" /><rect x="58" y="32" width="4" height="4" /><rect x="70" y="32" width="4" height="4" /><rect x="82" y="32" width="4" height="4" /><rect x="90" y="32" width="4" height="4" />
                      <rect x="10" y="40" width="4" height="4" /><rect x="22" y="40" width="4" height="4" /><rect x="38" y="40" width="4" height="4" /><rect x="50" y="40" width="4" height="4" /><rect x="62" y="40" width="4" height="4" /><rect x="74" y="40" width="4" height="4" /><rect x="86" y="40" width="4" height="4" />
                      <rect x="6" y="48" width="4" height="4" /><rect x="18" y="48" width="4" height="4" /><rect x="30" y="48" width="4" height="4" /><rect x="42" y="48" width="4" height="4" /><rect x="54" y="48" width="4" height="4" /><rect x="66" y="48" width="4" height="4" /><rect x="78" y="48" width="4" height="4" /><rect x="90" y="48" width="4" height="4" />
                      <rect x="14" y="56" width="4" height="4" /><rect x="26" y="56" width="4" height="4" /><rect x="38" y="56" width="4" height="4" /><rect x="50" y="56" width="4" height="4" /><rect x="62" y="56" width="4" height="4" /><rect x="74" y="56" width="4" height="4" /><rect x="86" y="56" width="4" height="4" />
                      <rect x="32" y="64" width="4" height="4" /><rect x="44" y="64" width="4" height="4" /><rect x="56" y="64" width="4" height="4" /><rect x="68" y="64" width="4" height="4" /><rect x="80" y="64" width="4" height="4" /><rect x="92" y="64" width="4" height="4" />
                      <rect x="32" y="72" width="4" height="4" /><rect x="44" y="72" width="4" height="4" /><rect x="56" y="72" width="4" height="4" /><rect x="68" y="72" width="4" height="4" /><rect x="80" y="72" width="4" height="4" /><rect x="92" y="72" width="4" height="4" />
                      <rect x="32" y="80" width="4" height="4" /><rect x="44" y="80" width="4" height="4" /><rect x="56" y="80" width="4" height="4" /><rect x="68" y="80" width="4" height="4" /><rect x="80" y="80" width="4" height="4" /><rect x="92" y="80" width="4" height="4" />
                      <rect x="32" y="88" width="4" height="4" /><rect x="44" y="88" width="4" height="4" /><rect x="56" y="88" width="4" height="4" /><rect x="68" y="88" width="4" height="4" /><rect x="80" y="88" width="4" height="4" /><rect x="92" y="88" width="4" height="4" />
                    </g>
                  </svg>
                </div>
                <div className="qr-caption">Scannez pour installer</div>
              </div>
            </div>
          </div>

          <div className="download-col">
            <h2>Installez l'application</h2>
            <p className="sub">
              Ouvrez l'appareil photo de votre téléphone et scannez le code QR pour télécharger
              Connectéo directement. Aucun store requis, aucune connexion internet nécessaire
              pour l'installation.
            </p>

            {/*la partie de telechargement, il faut juste changer le lien et mettre le fichier dans le dossier /public*/}

            <a href="/connecteo.apk" className="apk-btn" download>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger l'APK directement
            </a>
            <div className="apk-info">Version 2.4.1 — 38 Mo — Android 8.0+</div>
          </div>
        </section>

        {/* Section purement informative*/}
        <h2 className="features-title">Ce que l'app vous permet</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Messagerie hors-ligne</h3>
            <p>
              Envoyez des messages texte et vocaux via le réseau maillé, sans connexion internet
              ni réseau mobile.
            </p>
          </div>
          <div className="feature-card">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7Z" />
              </svg>
            </div>
            <h3>Carte des nœuds</h3>
            <p>
              Visualisez en temps réel les nœuds actifs autour de vous et la couverture réseau de
              votre zone.
            </p>
          </div>
          <div className="feature-card">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3>Alertes communautaires</h3>
            <p>
              Recevez et diffusez des alertes météo, sanitaires ou de sécurité à l'échelle de
              votre communauté.
            </p>
          </div>
          <div className="feature-card">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3>Mode relais</h3>
            <p>
              Transformez votre téléphone en relais maillé pour étendre la couverture vers les
              villages voisins.
            </p>
          </div>
        </div>

        <div className="req-section">
          <div className="req-card">
            <h4>Android</h4>
            <ul>
              <li>Android 8.0 (Oreo) ou supérieur</li>
              <li>Bluetooth Low Energy (BLE)</li>
              <li>38 Mo d'espace libre</li>
              <li>GPS recommandé</li>
            </ul>
          </div>
          <div className="req-card">
            <h4>Compatibilité</h4>
            <ul>
              <li>Fonctionne hors connexion internet</li>
              <li>Aucun compte requis au démarrage</li>
              <li>Interface en français</li>
              <li>Accessible à tous les profils</li>
            </ul>
          </div>
          <div className="req-card">
            <h4>Matériel maillé</h4>
            <ul>
              <li>Module LoRa SX1276 / SX1262</li>
              <li>Compatible Heltec, TTGO, RAK</li>
              <li>Portée : 2–15 km en zone rurale</li>
              <li>Alimentation solaire supportée</li>
            </ul>
          </div>
        </div>
      </main>

      <footer>
        <p>© 2026 Connectéo — Réseau maillé décentralisé pour Madagascar. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
