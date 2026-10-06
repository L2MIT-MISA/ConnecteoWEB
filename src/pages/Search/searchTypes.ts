// Contrat JSON de l'IA (voir 20261005-211430-marary-78f7.json) + modèle normalisé pour l'UI.

export interface Coordonnees {
  latitude: number;
  longitude: number;
  precision?: string | null;
}

export type ImageIA = string | { url: string; legende?: string | null };

export interface SourceIA {
  reference: string;
  origine?: string | null;
  titre?: string | null;
  url?: string | null;
  fichier?: string | null;
}

export interface LieuIA {
  nom: string;
  niveau?: string | null;
  code_officiel?: string | null;
  region?: string | null;
  district?: string | null;
  produit?: string | null;
  categorie?: string | null;
  description?: string | null;
  coordonnees?: Coordonnees | null;
  note_google?: number | null;
  avis?: unknown;
  sources_citees?: string[] | null;
  mots_cles?: string[];
  pertinence?: number | null;
  confiance?: number | null;
  origine?: string | null;
  source?: string | null;
  image_source?: string | null;
  images?: ImageIA[] | null;
}

export interface CarteIA {
  centre: { latitude: number; longitude: number };
  emprise?: { sud: number; nord: number; ouest: number; est: number };
  zoom_suggere?: number;
}

export interface ReponseIA {
  id_resultat: string;
  statut: string;
  date_creation?: string;
  date_fin?: string;
  requete?: { texte_original: string; intention?: string | null; mots_cles?: string[] };
  reponse?: {
    texte?: string | null;
    source_principale?: string | null;
    recherche_google?: string | null;
  } | null;
  lieux?: LieuIA[];
  lieux_approximative?: LieuIA[];
  carte?: CarteIA | null;
  sources?: SourceIA[];
  clarification?: unknown;
  urgence?: unknown;
  avertissements?: string[];
  erreur?: unknown;
}

export interface Image {
  url: string;
  legende: string | null;
}

export interface Lieu {
  id: string;
  nom: string;
  sousTitre: string;
  niveau: string | null;
  categorie: string | null;
  region: string | null;
  district: string | null;
  codeOfficiel: string | null;
  description: string | null;
  position: { lat: number; lng: number };
  precision: string | null;
  approximatif: boolean;
  noteGoogle: number | null;
  avis: string[];
  nbAvis: number | null;
  sourcesCitees: string[];
  images: Image[];
}
