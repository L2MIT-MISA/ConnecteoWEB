import type { PlaceResult } from "../../pages/Search/searchTypes";
import "./SearchResults.css";

interface SearchResultsProps {
  results: PlaceResult[];
  query: string;
  selectedId?: string;
  onSelect: (result: PlaceResult) => void;
}

function connectivityTone(result: PlaceResult) {
  const technologies = result.connectivityDetails?.summary?.technologies_available ?? [];
  if (!result.connectivityDetails?.available || technologies.length === 0) return "bad";
  return technologies.includes("4G") || technologies.includes("5G") ? "ok" : "warn";
}

export default function SearchResults({ results, query, selectedId, onSelect }: SearchResultsProps) {
  return (
    <section className="search-results-panel" aria-label="Résultats de recherche">
      <div className="search-results-heading">
        <span>Résultats de recherche</span>
        <h1>{query}</h1>
        <p>{results.length} {results.length > 1 ? "lieux trouvés" : "lieu trouvé"}</p>
      </div>

      <div className="search-results-list">
        {results.map((result) => {
          const tone = connectivityTone(result);
          return (
            <button
              key={result.id}
              type="button"
              className={`search-result-card ${result.id === selectedId ? "selected" : ""}`}
              onClick={() => onSelect(result)}
            >
              <span className="search-result-pin" aria-hidden="true">●</span>
              <span className="search-result-body">
                <span className="search-result-name-row">
                  <strong>{result.name}</strong>
                  <small>{result.type.replaceAll("_", " ")}</small>
                </span>
                <span className="search-result-address">{result.address}</span>
                <span className={`search-connectivity ${tone}`}>
                  <span />{result.connectivity}
                </span>
                {result.openingHours && <span className="search-result-hours">🕐 {result.openingHours}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
