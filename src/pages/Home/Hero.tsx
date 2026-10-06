import { useEffect, useState, type FormEvent } from "react";
import SiteHeader from "../../components/SiteHeader/SiteHeader";
import { askAssistant, type AssistantOption, type AssistantResponse } from "../../services/assistant";
import { parseSearchQuery } from "../../services/searchQuery";
import { HERO_BACKGROUND } from "./galleryData";
import Steps, { type Step } from "./Steps";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function goToSearch(parsed: { query: string; type: string; category: string | null; intent: string | null; location: string | null; relation: null }) {
  sessionStorage.setItem("connecteo-search", JSON.stringify(parsed));
  window.location.hash = "#pages/Search";
}

export default function Hero() {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [assistant, setAssistant] = useState<AssistantResponse | null>(null);
  useEffect(() => {
    try {
      const target = sessionStorage.getItem("connecteo-scroll");
      if (target) {
        sessionStorage.removeItem("connecteo-scroll");
        window.setTimeout(() => scrollToId(target), 60);
      }
    } catch {
      /* stockage indisponible */
    }
  }, []);

  async function runSearch(text: string) {
    const value = text.trim();
    if (!value) {
      setMessage("Saisissez un lieu ou une question.");
      setAssistant(null);
      return;
    }
    setBusy(true);
    setAssistant(null);
    setMessage(`Recherche de « ${value} »…`);
    try {
      const parsed = await parseSearchQuery(value);
      if (parsed.category) {
        goToSearch({ ...parsed, query: value, relation: null });
        return;
      }
      const response = await askAssistant(value);
      setAssistant(response);
      setMessage(response.question);
    } catch {
      setMessage("L'assistant est indisponible. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!busy) void runSearch(query);
  }

  function chooseOption(opt: AssistantOption) {
    if (opt.action === "close") {
      setAssistant(null);
      setMessage("");
      return;
    }
    if (opt.action === "sos-send") {
      setAssistant(null);
      setMessage("Alerte envoyée. Vos contacts ont été prévenus.");
      return;
    }
    if (opt.ask) {
      setQuery(opt.ask);
      void runSearch(opt.ask);
      return;
    }
    if (opt.category) {
      goToSearch({
        query: opt.label,
        type: "category",
        category: opt.category,
        intent: opt.intent ?? null,
        location: opt.location ?? null,
        relation: null,
      });
      return;
    }
    setQuery(opt.label);
    void runSearch(opt.label);
  }

  function pickExample(step: Step) {
    if (step.target) {
      scrollToId(step.target);
      return;
    }
    if (step.example) {
      setQuery(step.example);
      document.getElementById("q")?.focus({ preventScroll: true });
    }
  }

  return (
    <section
      className="hero"
      id="accueil"
      style={{ backgroundImage: `linear-gradient(180deg,rgba(5,8,40,.62) 0%,rgba(5,8,40,.25) 18%,rgba(5,8,40,0) 30%),linear-gradient(180deg,rgba(8,12,52,.6) 0%,rgba(10,16,70,.4) 40%,rgba(8,12,52,.55) 100%),linear-gradient(90deg,rgba(8,12,52,.55) 0%,rgba(8,12,52,.1) 60%),url('${HERO_BACKGROUND}')` }}
    >

      <SiteHeader variant="page" page="home" />
      <div className="hero__content">
        <div className="hero__body">
          <div className="hero__main">
            <h1 className="hero__title">Posez votre question</h1>
            <p className="hero__lead">
              Trouvez rapidement le bon contact, le bon lieu ou la bonne démarche sur la carte de Madagascar.
            </p>
            <span className="dash" aria-hidden="true" />
            <form className="search" role="search" onSubmit={handleSubmit}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="q"
            type="search"
            placeholder="Où, que cherchez-vous ?"
            aria-label="Votre question"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" aria-label="Rechercher" disabled={busy || query.trim() === ""}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
        <div id="msg" aria-live="polite">{message}</div>

        {assistant && assistant.options.length > 0 && (
          <div className="assistant-options" aria-live="polite">
            {assistant.options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className={`assistant-option${opt.danger ? " danger" : ""}${opt.success ? " success" : ""}`}
                onClick={() => chooseOption(opt)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
          </div>
          <Steps onPick={pickExample} />
        </div>
      </div>
    </section>
  );
}
