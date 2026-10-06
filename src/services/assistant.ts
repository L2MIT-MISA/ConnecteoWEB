
export interface AssistantOption {
  label: string;
  ask?: string;        // si présent : on relance l'assistant avec cette phrase
  category?: string;   // si présent : on va sur la carte avec cette catégorie
  location?: string;
  intent?: string;
  danger?: boolean;    // bouton rouge
  success?: boolean;   // bouton vert
  action?: "sos-send" | "close";
}

export interface AssistantResponse {
  question: string;            // la phrase de l'assistant
  options: AssistantOption[];  // les suggestions à cliquer
}

// Langues de l'assistant (mêmes codes que src/i18n). */
export type AssistantLang = "MG" | "FR" | "EN";

//données pour les simulations de l'IA (français — référence)
const FLOWS_FR: Record<string, AssistantResponse> = {
  sante: {
    question: "D'accord. Que cherchez-vous exactement ?",
    options: [
      { label: "Un dentiste", category: "dentist" }, 
      { label: "Un hôpital", category: "hospital" },
      { label: "Une pharmacie", category: "pharmacy" },
      { label: "C'est une urgence", ask: "urgence", danger: true },
    ],
  },
  urgence: {
    question: "Confirmer l'envoi d'une alerte prioritaire ?",
    options: [
      { label: "Oui, envoyer", action: "sos-send", success: true },
      { label: "Annuler", action: "close" },
    ],
  },
  ressources: {
    question: "Très bien. Que voulez-vous trouver ?",
    options: [
      { label: "Les producteurs", intent: "producteurs" },
      { label: "Les marchés", intent: "marches" },
      { label: "Les coopératives", intent: "cooperatives" },
    ],
  },
  lieu: {
    question: "Vers où souhaitez-vous aller ?",
    options: [
      { label: "Itaosy", location: "Itaosy" },
      { label: "Antananarivo", location: "Antananarivo" },
      { label: "Mahitsy", location: "Mahitsy" },
      { label: "Autre destination", ask: "je cherche un village" },
    ],
  },
  general: {
    question: "Pouvez-vous préciser votre besoin ?",
    options: [
      { label: "Un lieu", ask: "je cherche un lieu" },
      { label: "Une ressource", ask: "une ressource" },
      { label: "Un service de santé", ask: "un service de santé" },
      { label: "Une urgence", ask: "urgence", danger: true },
    ],
  },
  detresse: {
    question:
      "Ça a l'air difficile en ce moment, et vous n'êtes pas seul(e). " +
      "Parlez-en à une personne de confiance ou aux services d'aide de votre région.",
    options: [
      { label: "Envoyer une alerte SOS", ask: "urgence", danger: true },
      { label: "Fermer", action: "close" },
    ],
  },
};

/* Scénarios traduits (mêmes clés techniques category/intent/location/action
   que FLOWS_FR — seuls les textes affichés changent). */
const FLOWS_MG: Record<string, AssistantResponse> | null = {
  sante: {
    question: "Tsara. Inona marina no tadiavinao ?",
    options: [
      { label: "Mpitsabo nify", category: "dentist" },
      { label: "Hopitaly", category: "hospital" },
      { label: "Farmasia", category: "pharmacy" },
      { label: "Maika", ask: "maika", danger: true },
    ],
  },
  urgence: {
    question: "Hamarino ny fandefasana fanairana ?",
    options: [
      { label: "Eny, alefaso", action: "sos-send", success: true },
      { label: "Foano", action: "close" },
    ],
  },
  ressources: {
    question: "Tsara. Inona no tianao ho hita ?",
    options: [
      { label: "Ny mpamokatra", intent: "producteurs" },
      { label: "Ny tsena", intent: "marches" },
      { label: "Ny kaoperativa", intent: "cooperatives" },
    ],
  },
  lieu: {
    question: "Aiza no tianao haleha ?",
    options: [
      { label: "Itaosy", location: "Itaosy" },
      { label: "Antananarivo", location: "Antananarivo" },
      { label: "Mahitsy", location: "Mahitsy" },
      { label: "Toerana hafa", ask: "mitady tanana" },
    ],
  },
  general: {
    question: "Afaka manazava ny ilainao ve ianao ?",
    options: [
      { label: "Toerana", ask: "mitady toerana" },
      { label: "Harena", ask: "mitady harena" },
      { label: "Fahasalamana", ask: "fahasalamana" },
      { label: "Maika", ask: "maika", danger: true },
    ],
  },
  detresse: {
    question:
      "Toa sarotra ny zava-misy ankehitriny, ary tsy irery ianao. " +
      "Miresaha amin'ny olona atokisanao na amin'ny tolotra fanampiana any aminareo.",
    options: [
      { label: "Alefaso ny fanairana SOS", ask: "maika", danger: true },
      { label: "Akatona", action: "close" },
    ],
  },
};
const FLOWS_EN: Record<string, AssistantResponse> | null = {
  sante: {
    question: "Got it. What exactly are you looking for?",
    options: [
      { label: "A dentist", category: "dentist" },
      { label: "A hospital", category: "hospital" },
      { label: "A pharmacy", category: "pharmacy" },
      { label: "It's urgent", ask: "urgent", danger: true },
    ],
  },
  urgence: {
    question: "Confirm sending a priority alert?",
    options: [
      { label: "Yes, send it", action: "sos-send", success: true },
      { label: "Cancel", action: "close" },
    ],
  },
  ressources: {
    question: "Great. What do you want to find?",
    options: [
      { label: "Producers", intent: "producteurs" },
      { label: "Markets", intent: "marches" },
      { label: "Cooperatives", intent: "cooperatives" },
    ],
  },
  lieu: {
    question: "Where would you like to go?",
    options: [
      { label: "Itaosy", location: "Itaosy" },
      { label: "Antananarivo", location: "Antananarivo" },
      { label: "Mahitsy", location: "Mahitsy" },
      { label: "Another place", ask: "looking for a village" },
    ],
  },
  general: {
    question: "Could you clarify what you need?",
    options: [
      { label: "A place", ask: "looking for a place" },
      { label: "A resource", ask: "looking for a resource" },
      { label: "A health service", ask: "a health service" },
      { label: "An emergency", ask: "urgent", danger: true },
    ],
  },
  detresse: {
    question:
      "Things seem difficult right now, and you are not alone. " +
      "Talk to someone you trust or to support services in your area.",
    options: [
      { label: "Send an SOS alert", ask: "urgent", danger: true },
      { label: "Close", action: "close" },
    ],
  },
};

function flowsFor(lang: AssistantLang): Record<string, AssistantResponse> {
  if (lang === "MG" && FLOWS_MG) return FLOWS_MG;
  if (lang === "EN" && FLOWS_EN) return FLOWS_EN;
  return FLOWS_FR;
}

const DISTRESS_WORDS = ["mourir", "suicide", "me tuer", "en finir", "plus envie de vivre"];

export function isDistress(query: string): boolean {
  const t = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return DISTRESS_WORDS.some((w) => t.includes(w));
}

function detectFlow(query: string): string {
  const t = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (DISTRESS_WORDS.some((w) => t.includes(w))) return "detresse";
  if (/(sos|urgence|secours|danger|accident|aide\b)/.test(t)) return "urgence";
  if (/(malade|mal\b|douleur|sante|fievre|dents|dent|tete|ventre|dos|medecin|docteur|hopital|pharmacie)/.test(t)) return "sante";
  if (/(cacao|vanille|riz|cafe|ressource|producteur|marche|cooperative)/.test(t)) return "ressources";
  if (/(lieu|village|aller|route|itineraire|chemin|ou est|itaosy|antsirabe|toamasina|mahitsy)/.test(t)) return "lieu";
  return "general";
}


export async function askAssistant(query: string, lang: AssistantLang = "FR"): Promise<AssistantResponse> {
  await new Promise((r) => setTimeout(r, 600)); //simule la réflexion
  return flowsFor(lang)[detectFlow(query)];

  //fetch vers l'IA 
}
