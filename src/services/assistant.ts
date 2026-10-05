export interface AssistantOption {
  label: string;
  ask?: string;
  category?: string;
  location?: string;
  intent?: string;
  danger?: boolean;
  success?: boolean;
  action?: "sos-send" | "close";
}

export interface AssistantResponse {
  question: string;
  options: AssistantOption[];
}

const ASSISTANT_URL = `${import.meta.env.VITE_SEARCH_API_URL || "http://127.0.0.1:8000"}/assistant`;

const DISTRESS_WORDS = ["mourir", "suicide", "me tuer", "en finir", "plus envie de vivre"];

// La detresse doit passer avant toute recherche de lieu, donc ce test reste cote front
export function isDistress(query: string): boolean {
  const t = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return DISTRESS_WORDS.some((w) => t.includes(w));
}

export async function askAssistant(query: string): Promise<AssistantResponse> {
  const response = await fetch(ASSISTANT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error("Assistant indisponible");
  return response.json();
}
