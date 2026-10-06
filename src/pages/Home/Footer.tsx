function go(hash: string) {
  window.location.hash = hash;
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <a
          className="brand"
          href="#accueil"
          aria-label="Connectéo — retour en haut"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("accueil")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" />
            <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
          Connectéo
        </a>
        <nav className="footer__nav" aria-label="Navigation secondaire">
          <button type="button" onClick={() => go("#pages/Download")}>
            Télécharger
          </button>
          <button type="button" onClick={() => go("#pages/About")}>
            À propos
          </button>
          <button type="button" onClick={() => go("#pages/Auth")}>
            Se connecter
          </button>
        </nav>
      </div>
      <p className="footer__note">Connectéo — la carte de Madagascar, même hors connexion.</p>
    </footer>
  );
}
