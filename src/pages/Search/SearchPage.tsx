import { useEffect, useRef, useState } from "react";
import ConnecteoMap from "../../components/ConnecteoMap/ConnecteoMap";
import SearchResults, { type ChatMessage, type PanelView } from "../../components/SearchResults/SearchResults";
import { askAssistant, isDistress, type AssistantOption } from "../../services/assistant";
import { parseSearchQuery } from "../../services/searchQuery";
import type { ParsedSearch, PlaceResult } from "./searchTypes";
import "./SearchPage.css";

interface ApiResponse { query: string; count: number; results: PlaceResult[]; }

const STORAGE_KEY = "connecteo-search";

function readSearch(): ParsedSearch | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as ParsedSearch; } catch { return null; }
}

export default function SearchPage() {
  const [search, setSearch] = useState<ParsedSearch | null>(readSearch);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selected, setSelected] = useState<PlaceResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(Boolean(search?.category));
  const [error, setError] = useState("");

  // "results" = liste des lieux, "assistant" = conversation en plein panneau
  const [view, setView] = useState<PanelView>("results");

  const idRef = useRef(1);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    search?.query ? [{ id: 0, from: "ai", text: `Voici les résultats pour « ${search.query} ».` }] : []
  );

  function addMessage(message: Omit<ChatMessage, "id">) {
    setMessages((list) => [...list, { ...message, id: idRef.current++ }]);
  }

  useEffect(() => {
    if (!search?.category) return;
    const controller = new AbortController();
    const apiUrl = import.meta.env.VITE_SEARCH_API_URL || "http://127.0.0.1:8000";

    async function loadResults() {
      try {
        const response = await fetch(`${apiUrl}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(search),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json() as ApiResponse;
        setResults(data.results ?? []);
        setSelected(data.results?.[0] ?? null);
        setDetailOpen(false);
        setError("");
        setLoaded(true);
      } catch (requestError) {
        if ((requestError as Error).name !== "AbortError") setError("Impossible de charger les résultats. Vérifiez que le backend de recherche est démarré.");
      } finally { setLoading(false); }
    }

    loadResults();
    return () => controller.abort();
  }, [search]);

  //Lance une vraie recherche de lieux et revient à la liste
  function runSearch(parsed: ParsedSearch) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    setView("results");
    setSearch(parsed);
  }

  async function handleNewSearch(query: string) {
    addMessage({ from: "user", text: query });
    setLoading(true);
    setError("");
    try {
      // La détresse passe avant toute recherche de lieu
      if (!isDistress(query)) {
        const parsed = await parseSearchQuery(query);
        if (parsed.category) {
          addMessage({ from: "ai", text: `Voici les résultats pour « ${query} ».` });
          runSearch(parsed); // loading est remis à false par le useEffect
          return;
        }
      }
      // Phrase vague : l'assistant prend tout le panneau avec ses suggestions
      const response = await askAssistant(query);
      addMessage({ from: "ai", text: response.question, options: response.options });
      setView("assistant");
    } catch {
      addMessage({ from: "ai", text: "L'assistant est indisponible. Réessayez dans un instant." });
      setView("assistant");
    }
    setLoading(false);
  }

  // Clic sur une suggestion
  function handleOption(opt: AssistantOption) {
    if (opt.action === "close") {
      if (results.length > 0) setView("results");
      return;
    }

    if (opt.action === "sos-send") {
      addMessage({ from: "ai", text: "Alerte envoyée. Vos contacts ont été prévenus." });
      return;
    }

    if (opt.ask) { handleNewSearch(opt.ask); return; }

    if (opt.category) {
      addMessage({ from: "user", text: opt.label });
      addMessage({ from: "ai", text: `Voici les résultats pour « ${opt.label} ».` });
      setLoading(true);
      runSearch({
        query: opt.label,
        type: "category",
        category: opt.category,
        intent: opt.intent ?? null,
        location: opt.location ?? null,
        relation: null,
      });
      return;
    }

    addMessage({ from: "user", text: opt.label });
    addMessage({ from: "ai", text: "Je ne peux pas encore afficher cette recherche sur la carte. Essayez avec un type de lieu, par exemple « pharmacie »." });
  }

  function handleSelect(place: PlaceResult | null) {
    setSelected(place);
    setDetailOpen(place !== null);
  }

  if (!search?.category) return <main className="search-page-state"><h1>Recherche incomplète</h1><p>Cette recherche ne contient aucune catégorie de lieu reconnue.</p><a href="#pages/Home">Retour à l'accueil</a></main>;
  if (loading && !loaded) return <main className="search-page-state"><div className="search-loader" /><h1>Recherche en cours...</h1><p>Nous analysons les lieux et leur couverture réseau.</p></main>;
  if (error && !loaded) return <main className="search-page-state"><h1>Recherche indisponible</h1><p>{error}</p><a href="#pages/Home">Retour à l'accueil</a></main>;

  return (
    <main className="search-map-page">
      <aside className="search-map-side">
        <SearchResults
          results={results}
          title={search.query}
          selected={selected}
          detailOpen={detailOpen}
          busy={loading}
          message={error}
          messages={messages}
          view={view}
          onViewChange={setView}
          onSelect={handleSelect}
          onBack={() => setDetailOpen(false)}
          onFocus={() => setSelected((place) => (place ? { ...place } : place))}
          onSearch={handleNewSearch}
          onOption={handleOption}
        />
      </aside>
      <section className="search-map-column" aria-label="Carte des résultats"><ConnecteoMap results={results} selected={selected} onSelect={handleSelect} /></section>
    </main>
  );
}