import { useCallback, useEffect, useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import { SLIDES } from "./slides";
import "./Home.css";
import { askAssistant, type AssistantOption, type AssistantResponse } from "../../services/assistant";

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [searchActive, setSearchActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assistant, setAssistant] = useState<AssistantResponse | null>(null);

  const closeSearch = useCallback(() => {
    setSearchActive(false);
    setError("");
    setAssistant(null);
  }, []);

  useEffect(() => {
    if (searchActive) return;
    const timer = window.setInterval(() => setCurrent((value) => (value + 1) % SLIDES.length), 9000);
    return () => window.clearInterval(timer);
  }, [searchActive]);

  useEffect(() => {
    if (!searchActive) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeSearch(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closeSearch, searchActive]);

  async function handleSearch(query: string) {
    setLoading(true);
    setError("");
    setAssistant(null);
    try {
      setAssistant(await askAssistant(query));
    } catch {
      setError("L'assistant est indisponible. Réessayez dans un instant.");
    }
    setLoading(false);
  }

  // Clic sur une suggestion
  function chooseOption(opt: AssistantOption) {
    if (opt.action === "close") { setAssistant(null); return; }

    if (opt.action === "sos-send") {
      setAssistant({ question: "Alerte envoyée. Vos contacts ont été prévenus.", options: [] });
      window.setTimeout(() => setAssistant(null), 1800);
      return;
    }

    if (opt.ask) { handleSearch(opt.ask); return; }

    sessionStorage.setItem(
      "connecteo-search",
      JSON.stringify({
        query: opt.label,
        type: opt.category ? "category" : opt.location ? "place" : "intent",
        category: opt.category ?? null,
        intent: opt.intent ?? null,
        location: opt.location ?? null,
        relation: null,
      })
    );
    window.location.hash = "#pages/Search";
  }

  return (
    <div id="page-home" className={searchActive ? "search-is-active" : ""}>
      <div className="home-backgrounds" aria-hidden="true">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`home-background ${index === current ? "active" : ""}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
        ))}
      </div>
      <div className="home-overlay" aria-hidden="true" />
      <button type="button" className="home-search-close" aria-label="Fermer la recherche" onClick={closeSearch}>×</button>

      <main className="home-hero">
        {SLIDES.map((slide, index) => (
          <section
            key={slide.id}
            className={`home-slide-content ${index === current ? "active" : ""}`}
            aria-hidden={index !== current}
          >
            <span className="home-badge"><span />{slide.theme}</span>
            <h1>{slide.title}</h1>
            <p>{slide.description}</p>
          </section>
        ))}
      </main>

      <div className="home-search-area">
        {searchActive && !assistant && <h2>Où allons-nous ?</h2>}

        {assistant && (
          <div className="home-suggestions" aria-live="polite">
            <div className="hs-top">
              <div className="hs-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <div className="hs-meta">
                <div className="hs-label">Assistant Connectéo</div>
                <div className="hs-question">{assistant.question}</div>
              </div>
              <button type="button" className="hs-close" aria-label="Fermer" onClick={() => setAssistant(null)}>×</button>
            </div>
            {assistant.options.length > 0 && (
              <div className="hs-options">
                {assistant.options.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className={`hs-option${opt.danger ? " danger" : ""}${opt.success ? " success" : ""}`}
                    onClick={() => chooseOption(opt)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <SearchBar
          active={searchActive}
          loading={loading}
          onActivate={() => setSearchActive(true)}
          onSearch={handleSearch}
        />

        {error && <div className="home-search-result error" aria-live="polite">{error}</div>}
      </div>

      <div className="home-dots" aria-label="Choisir une image du diaporama">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={index === current ? "active" : ""}
            onClick={() => setCurrent(index)}
            aria-label={`Diapositive ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
