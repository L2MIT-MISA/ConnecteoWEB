
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

//données pour les simulations de l'IA 
const FLOWS: Record<string, AssistantResponse> = {
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

const DISTRESS_WORDS = ["mourir", "suicide", "me tuer", "en finir", "plus envie de vivre"];

// Utilisé aussi par la page carte pour traiter la détresse AVANT toute recherche de lieu
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


export async function askAssistant(query: string): Promise<AssistantResponse> {
  await new Promise((r) => setTimeout(r, 600)); //simule la réflexion
  return FLOWS[detectFlow(query)];

  //fetch vers l'IA 
}