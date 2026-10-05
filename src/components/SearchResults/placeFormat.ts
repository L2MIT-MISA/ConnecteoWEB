import type { PlaceResult } from "../../pages/Search/searchTypes";

export type Tone = "ok" | "warn" | "bad";

type Operator = PlaceResult["connectivityDetails"]["operators"][string];

export function connectivityTone(place: PlaceResult): Tone {
  const technologies = place.connectivityDetails?.summary?.technologies_available ?? [];
  if (!place.connectivityDetails?.available || technologies.length === 0) return "bad";
  return technologies.includes("4G") || technologies.includes("5G") ? "ok" : "warn";
}

export function connectivityLabel(place: PlaceResult) {
  return connectivityTone(place) === "bad" ? "Aucun réseau" : place.connectivity;
}

export function formatType(type: string) {
  const last = type.split(".").pop() ?? type;
  return last.replace(/_/g, " ");
}

export function formatOperator(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function nearestTower(operator: Operator) {
  const towers = Object.values(operator.nearest_towers_by_technology ?? {}).filter((tower) => tower !== null);
  if (towers.length === 0) return null;
  return towers.reduce((best, tower) => (tower.distance_meters < best.distance_meters ? tower : best));
}

export function formatMeters(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

export function safeWebsite(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
