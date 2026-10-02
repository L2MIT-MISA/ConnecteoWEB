import { useEffect, useRef, useState } from "react";
import { signOut } from "../../services/auth";
import { supabase } from "../../services/supabase";
import "./Header.css";

function goToAuth() {
  window.location.hash = "#pages/Auth";
}

export default function Header() {
  const [currentPage, setCurrentPage] = useState(
    window.location.hash.replace("#", "") || "home"
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const page = window.location.hash.replace("#", "") || "home";
      setCurrentPage(page);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setIsAuthenticated(Boolean(data.session));
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(Boolean(session));

        if (!session) {
          setIsMenuOpen(false);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  async function handleSignOut() {
    setIsSigningOut(true);
    const { error } = await signOut();
    setIsSigningOut(false);

    if (error) {
      console.error("Erreur lors de la déconnexion :", error);
      return;
    }

    setIsMenuOpen(false);
    window.location.hash = "#pages/About";
  }

  return (
    <header id="mainHeader">
      <a
        className="brand"
        href="#pages/Home"
        data-page="home"
        aria-label="Connectéo accueil"
      >
        <div className="brand-mark"></div>
        <span className="brand-name">Connectéo</span>
      </a>

      <nav>
        <a
          href="#pages/Home"
          data-page="home"
          className={currentPage === "pages/Home" || currentPage === "home" ? "active" : ""}
        >
          Accueil
        </a>

        <a
          href="#pages/Download"
          data-page="download"
          className={currentPage === "pages/Download" || currentPage === "download" ? "active" : ""}
        >
          Télécharger
        </a>

        <a
          href="#pages/About"
          data-page="about"
          className={currentPage === "pages/About" || currentPage === "about" ? "active" : ""}
        >
          À propos
        </a>
      </nav>

      {isAuthenticated ? (
        <div className="account-menu" ref={accountRef}>
          <button
            type="button"
            className="avatar-button"
            aria-label="Ouvrir le menu du compte"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="account-dropdown" role="menu">
              <button
                type="button"
                role="menuitem"
                className="sign-out-button"
                disabled={isSigningOut}
                onClick={handleSignOut}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10 17l5-5-5-5M15 12H3" />
                  <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
                </svg>
                {isSigningOut ? "Déconnexion..." : "Se déconnecter"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button type="button" className="header-action" onClick={goToAuth}>
          Se connecter
        </button>
      )}
    </header>
  );
}
