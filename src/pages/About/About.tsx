
import './About.css'

type AboutProps = {
  show?: boolean
}

function About({ show = true }: AboutProps) {
  return (
    <div id="view-about" className={show ? 'show' : ''}>
      <div className="about-wrap">

        <section className="about-hero">
          <div className="about-eyebrow">
            <span className="dot"></span>
            Notre histoire
          </div>

          <h1>
            Connecter ceux que <em>le réseau oublie.</em>
          </h1>

          <p>
            Connectéo est né d'un constat simple : à Madagascar, des millions
            de personnes vivent dans des zones blanches, sans accès fiable à
            Internet ni au réseau mobile. Nous construisons l'infrastructure
            qui les relie.
          </p>
        </section>

        <section className="about-mission">
          <div className="mission-card">
            <div className="mission-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>

            <h2>Notre mission</h2>

            <p>
              Bâtir un réseau de communication résilient, décentralisé et
              accessible à tous les Malagasy — quel que soit leur lieu de vie,
              leur moyen ou leur situation.
            </p>
          </div>
        </section>

        <section className="about-stats">
          <div className="stat-card">
            <div className="stat-value">142</div>
            <div className="stat-label">Nœuds actifs</div>
            <div className="stat-meta">À travers Madagascar</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">1 847</div>
            <div className="stat-label">Utilisateurs</div>
            <div className="stat-meta">Depuis le lancement</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">78%</div>
            <div className="stat-label">Couverture</div>
            <div className="stat-meta">Des zones ciblées</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">14</div>
            <div className="stat-label">Zones blanches</div>
            <div className="stat-meta">En cours de connexion</div>
          </div>
        </section>

        <section className="about-values">
          <div className="values-head">
            <h2>Ce qui nous guide</h2>
          </div>

          <div className="values-grid">

            <div className="value-card">
              <div className="value-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a7 7 0 0 0-7 7c0 3 2 5.5 3.5 7.5S11 21 12 22c1-1 2-3.5 3.5-5.5S19 12 19 9a7 7 0 0 0-7-7z" />
                </svg>
              </div>

              <h3>Accessibilité</h3>

              <p>
                Chaque personne, quel que soit son âge, son niveau
                d'alphabétisation ou son handicap, doit pouvoir utiliser
                Connectéo.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="4" cy="6" r="1.5" />
                  <circle cx="20" cy="6" r="1.5" />
                  <circle cx="4" cy="18" r="1.5" />
                  <circle cx="20" cy="18" r="1.5" />
                  <line x1="5.5" y1="7" x2="10.5" y2="11" />
                  <line x1="18.5" y1="7" x2="13.5" y2="11" />
                  <line x1="5.5" y1="17" x2="10.5" y2="13" />
                  <line x1="18.5" y1="17" x2="13.5" y2="13" />
                </svg>
              </div>

              <h3>Décentralisation</h3>

              <p>
                Le réseau n'appartient à personne et appartient à tous. Il
                fonctionne sans serveur central, sans point unique de
                défaillance.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>

              <h3>Résilience</h3>

              <p>
                Cyclones, pannes, coupures — Connectéo continue de fonctionner
                quand tout le reste s'arrête.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <h3>Communauté</h3>

              <p>
                Chaque utilisateur est un relais. Plus nous sommes nombreux,
                plus le réseau est puissant et étendu.
              </p>
            </div>

          </div>
        </section>

        <section className="about-contact">
          <div className="contact-head">
            <h2>Parlons-en.</h2>

            <p>
              Une question, un projet, un partenariat ? Notre équipe vous
              répond sous 48 heures.
            </p>
          </div>

          <div className="contact-grid">

            <a
              href="mailto:contact@connecteo.mg"
              className="contact-card"
            >
              <div className="contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </div>

              <div className="contact-label">Email</div>
              <div className="contact-value">contact@connecteo.mg</div>
            </a>

            <a
              href="tel:+261340000000"
              className="contact-card"
            >
              <div className="contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2.1z" />
                </svg>
              </div>

              <div className="contact-label">Téléphone</div>
              <div className="contact-value">+261 34 00 000 00</div>
            </a>

            <a href="#" className="contact-card">
              <div className="contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              <div className="contact-label">Adresse</div>
              <div className="contact-value">
                Antananarivo, Madagascar
              </div>
            </a>

            <a href="#" className="contact-card">
              <div className="contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>

              <div className="contact-label">Site web</div>
              <div className="contact-value">
                www.connecteo.mg
              </div>
            </a>

          </div>
        </section>

        <footer className="about-footer">

          <div className="footer-brand">
            <div className="footer-mark"></div>
            <span>Connectéo</span>
          </div>

          <p className="footer-line">
            Réseau maillé décentralisé pour Madagascar · Fait avec soin à
            Antananarivo
          </p>

          <div className="footer-links">
            <a href="#">Mentions légales</a>
            <span>·</span>
            <a href="#">Politique de confidentialité</a>
            <span>·</span>
            <a href="#">Contact</a>
          </div>

          <div className="footer-copy">
            © 2026 Connectéo — Tous droits réservés.
          </div>

        </footer>

      </div>
    </div>
  )
}

export default About
