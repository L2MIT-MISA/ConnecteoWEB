import { useEffect, useState } from "react";
import ConnecteoMap from "../../components/ConnecteoMap/ConnecteoMap";
import SearchResults from "../../components/SearchResults/SearchResults";
import type { ParsedSearch, PlaceResult } from "./searchTypes";
import "./SearchPage.css";

interface ApiResponse { query: string; count: number; results: PlaceResult[]; }

function readSearch(): ParsedSearch | null {
  const raw = sessionStorage.getItem("connecteo-search");
  if (!raw) return null;
  try { return JSON.parse(raw) as ParsedSearch; } catch { return null; }
}

export default function SearchPage() {
  const [search] = useState(readSearch);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selected, setSelected] = useState<PlaceResult | null>(null);
  const [loading, setLoading] = useState(Boolean(search?.category));
  const [error, setError] = useState("");

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
      } catch (requestError) {
        if ((requestError as Error).name !== "AbortError") setError("Impossible de charger les résultats. Vérifiez que le backend de recherche est démarré.");
      } finally { setLoading(false); }
    }

    loadResults();
    return () => controller.abort();
  }, [search]);

  if (!search?.category) return <main className="search-page-state"><h1>Recherche incomplète</h1><p>Cette recherche ne contient aucune catégorie de lieu reconnue.</p><a href="#pages/Home">Retour à l’accueil</a></main>;
  if (loading) return <main className="search-page-state"><div className="search-loader" /><h1>Recherche en cours…</h1><p>Nous analysons les lieux et leur couverture réseau.</p></main>;
  if (error) return <main className="search-page-state"><h1>Recherche indisponible</h1><p>{error}</p><a href="#pages/Home">Retour à l’accueil</a></main>;

  return (
    <main className="search-map-page">
      <aside><SearchResults results={results} query={search?.query ?? "Recherche"} selectedId={selected?.id} onSelect={setSelected} /></aside>
      <section className="search-map-column" aria-label="Carte des résultats"><ConnecteoMap results={results} selected={selected} onSelect={setSelected} /></section>
    </main>
  );
}
