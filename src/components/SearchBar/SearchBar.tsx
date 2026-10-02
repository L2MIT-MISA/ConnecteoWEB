import { useEffect, useRef, useState, type FormEvent } from "react";
import "./SearchBar.css";

interface SearchBarProps { active: boolean; loading: boolean; onActivate: () => void; onSearch: (query: string) => void; onMyLocation: () => void; }

export default function SearchBar({ active, loading, onActivate, onSearch, onMyLocation }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (active) inputRef.current?.focus(); }, [active]);
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const value = query.trim(); if (value) onSearch(value); }

  return (
    <form className="home-search" role="search" onSubmit={handleSubmit} onClick={onActivate}>
      <label className="home-search-field">
        <span className="home-search-input-row"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onFocus={onActivate} placeholder="Où allons-nous ?" aria-label="Rechercher une zone, un village ou une région" /></span>
      </label>
      <span className="home-search-divider" aria-hidden="true" />
      <button type="button" className="home-location-button" onClick={onMyLocation}><span className="home-search-input-row"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>Ma position</span></button>
      <button type="submit" className="home-search-submit" disabled={loading}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>{loading ? "Recherche..." : "Rechercher"}</button>
    </form>
  );
}
