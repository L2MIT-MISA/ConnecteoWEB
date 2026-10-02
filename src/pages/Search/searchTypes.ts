export interface NearestTower {
  name: string;
  distance_meters: number;
}

export interface ConnectivityDetails {
  available: boolean;
  operators: Record<string, {
    technologies: Record<"2G" | "3G" | "4G" | "5G", boolean>;
    technologies_actives: string[];
    nearest_towers_by_technology: Record<string, NearestTower | null>;
  }>;
  summary: {
    technologies_available: string[];
    operators_available: string[];
  };
}

export interface PlaceResult {
  id: string;
  name: string;
  type: string;
  address: string;
  location: { latitude: number; longitude: number };
  distance?: number;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  connectivity: string;
  connectivityDetails: ConnectivityDetails;
}

export interface ParsedSearch {
  query: string;
  type: "place" | "category" | "intent" | "unknown";
  category: string | null;
  intent: string | null;
  location: string | null;
  relation: string | null;
}
