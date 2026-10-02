import { useCallback, useEffect, useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import { supabase } from "../../services/supabase";
import { SLIDES } from "./slides";
import "./Home.css";

interface SearchResult {
  query: string;
  type: "place" | "category" | "intent" | "unknown";
  category: string | null;
  intent: string | null;
  location: string | null;
  location_verified?: boolean | null;
  place?: string | null;
  relation: string | null;
}

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [searchActive, setSearchActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const closeSearch = useCallback(() => { setSearchActive(false); setResult(null); setError(""); }, []);

  useEffect(() => { if (searchActive) return; const timer = window.setInterval(() => setCurrent((value) => (value + 1) % SLIDES.length), 9000); return () => window.clearInterval(timer); }, [searchActive]);
  useEffect(() => { if (!searchActive) return; const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeSearch(); }; document.addEventListener("keydown", closeOnEscape); return () => document.removeEventListener("keydown", closeOnEscape); }, [closeSearch, searchActive]);

  async function handleSearch(query: string) {
    setLoading(true); setError(""); setResult(null);
    let { data, error: searchError } = await supabase.functions.invoke<SearchResult>("search", { body: { query } });

    if (searchError || !data) {
      const normalized = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const categories: Array<[string, string[]]> = [
        ["restaurant", ["restaurant", "resto", "manger"]],
        ["hotel", ["hotel", "hebergement", "dormir"]],
        ["pharmacy", ["pharmacie", "medicament"]],
        ["hospital", ["hopital", "clinique", "soigner"]],
        ["bank", ["banque", "distributeur", "retirer"]],
        ["gas_station", ["station service", "station-service", "essence", "plein"]],
      ];
      const category = categories.find(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))?.[0] ?? null;
      const locationMatch = normalized.match(/(?:\ba|\bdans|\bsur|\bpres de|\bproche de)\s+(.+)$/);
      data = { query, type: category ? "category" : locationMatch ? "place" : "unknown", category, intent: null, location: locationMatch?.[1]?.trim() ?? null, relation: null };
    }

    setLoading(false);
    if (!data.category) { setResult(data); setError("Précisez un type de lieu, par exemple : restaurant à Antananarivo."); return; }
    sessionStorage.setItem("connecteo-search", JSON.stringify({ ...data, query }));
    window.location.hash = "#pages/Search";
  }

  function handleMyLocation() {
    setSearchActive(true); setError("");
    if (!navigator.geolocation) { setError("La géolocalisation n’est pas disponible sur cet appareil."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setResult({ query: "Ma position", type: "place", category: null, intent: null, location: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`, relation: null }),
      () => setError("Impossible d’accéder à votre position.")
    );
  }

  return (
    <div id="page-home" className={searchActive ? "search-is-active" : ""}>
      <div className="home-backgrounds" aria-hidden="true">{SLIDES.map((slide, index) => <div key={slide.id} className={`home-background ${index === current ? "active" : ""}`} style={{ backgroundImage: `url('${slide.image}')` }} />)}</div>
      <div className="home-overlay" aria-hidden="true" />
      <button type="button" className="home-search-close" aria-label="Fermer la recherche" onClick={closeSearch}>×</button>
      <main className="home-hero">{SLIDES.map((slide, index) => <section key={slide.id} className={`home-slide-content ${index === current ? "active" : ""}`} aria-hidden={index !== current}><span className="home-badge"><span />{slide.theme}</span><h1>{slide.title}</h1><p>{slide.description}</p></section>)}</main>
      <div className="home-search-area">
        {searchActive && <h2>Où allons-nous ?</h2>}
        <SearchBar active={searchActive} loading={loading} onActivate={() => setSearchActive(true)} onSearch={handleSearch} onMyLocation={handleMyLocation} />
        {(result || error) && <div className={`home-search-result ${error ? "error" : ""}`} aria-live="polite">{error || (result && (result.type === "unknown" ? `Aucun type de lieu reconnu pour « ${result.query} ».` : `Recherche comprise : ${result.category ?? result.intent ?? "destination"}${result.location ? ` à ${result.location}` : ""}.`))}</div>}
      </div>
      <div className="home-dots" aria-label="Choisir une image du diaporama">{SLIDES.map((slide, index) => <button key={slide.id} type="button" className={index === current ? "active" : ""} onClick={() => setCurrent(index)} aria-label={`Diapositive ${index + 1}`} />)}</div>
    </div>
  );
}
