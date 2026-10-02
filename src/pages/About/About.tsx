import "./About.css";

export default function About() {
  return (
    <div id="page-about" className="page active">
      <div id="aboutScene"></div>

      <main className="content">
        <section className="hero-section">
          <div className="badge">
            <span className="dot"></span>
            Notre histoire
          </div>

          <h1>
            Connecter ceux que
            <br />
            <span className="accent">le réseau oublie.</span>
          </h1>

          <p>
            Connectéo est né d'un constat simple : à Madagascar, des millions
            de personnes vivent dans des zones blanches, sans accès fiable à
            Internet ni au réseau mobile. Notre mission est de leur redonner
            une voix, un lien, et un accès aux services essentiels.
          </p>
        </section>

        <div className="cards-grid">
          <div className="info-card">
            <div className="icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>

            <h3>Un réseau maillé</h3>

            <p>
              Grâce à la technologie LoRa, chaque téléphone devient un nœud du
              réseau. Les messages rebondissent de proche en proche pour
              atteindre leur destination, même sans couverture télécom.
            </p>
          </div>

          <div className="info-card">
            <div className="icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <h3>Pour tous les citoyens</h3>

            <p>
              Muet, aveugle, analphabète ou simplement éloigné : chacun trouve
              son parcours. L'application s'adapte en amont pour garantir un
              accès universel aux services de santé, d'éducation et
              d'administration.
            </p>
          </div>

          <div className="info-card">
            <div className="icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>

            <h3>En cas d'urgence</h3>

            <p>
              Un bouton SOS transmet une alerte prioritaire en moins de 1,2
              seconde, même en zone blanche isolée. Les secours et les proches
              sont prévenus instantanément, où qu'ils soient.
            </p>
          </div>
        </div>

        <div className="mission">
          <h2>Notre mission</h2>

          <p>
            Nous croyons que la connexion ne devrait jamais être un privilège.
            Connectéo œuvre chaque jour pour bâtir une infrastructure
            résiliente, inclusive et respectueuse des réalités locales — afin
            que chaque village, chaque famille, chaque personne puisse rester
            reliée au monde, quoi qu'il arrive.
          </p>
        </div>

        <section className="contact-section">
          <h2 className="contact-title">Nous contacter</h2>

          <div className="contact-grid">
            <a
              href="mailto:contact@connecteo.mg"
              className="contact-card"
            >
              <div className="icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </div>

              <div className="label">Email</div>
              <div className="value">contact@connecteo.mg</div>
            </a>

            <a href="tel:+261340000000" className="contact-card">
              <div className="icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2.1z" />
                </svg>
              </div>

              <div className="label">Téléphone</div>
              <div className="value">+261 34 00 000 00</div>
            </a>

            <a href="#" className="contact-card">
              <div className="icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              <div className="label">Adresse</div>
              <div className="value">Antananarivo, Madagascar</div>
            </a>

            <a href="#" className="contact-card">
              <div className="icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>

              <div className="label">Site web</div>
              <div className="value">www.connecteo.mg</div>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <p>
          © 2026 Connectéo — Réseau maillé décentralisé pour Madagascar. Tous
          droits réservés.
        </p>
      </footer>
    </div>
  );
}