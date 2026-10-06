export interface Step {
  n: number;
  title: string;
  text: string;
  /** Question pré-remplie dans la recherche (box 1) */
  example?: string;
  /** Section vers laquelle défiler au clic (box 2 et 3) */
  target?: string;
}

const STEPS: Step[] = [
  {
    n: 1,
    title: "Posez votre question",
    text: "Dites-nous ce que vous cherchez : un service, un lieu, une démarche ou une aide locale.",
    example: "Une pharmacie à Antananarivo",
  },
  {
    n: 2,
    title: "Explorer",
    text: "Explorer les destinations et la connectivité de Madagascar.",
    target: "galerie",
  },
  {
    n: 3,
    title: "Télécharger",
    text: "Utiliser l'application pour rester connecté 24h/24 n'importe où.",
    target: "telecharger",
  },
];

export default function Steps({ onPick }: { onPick: (step: Step) => void }) {
  return (
    <ol className="steps" aria-label="Comment ça marche">
      {STEPS.map((step) => (
        <li key={step.n}>
          <button
            type="button"
            className="step"
            onClick={() => onPick(step)}
            aria-label={step.target ? `${step.title} — aller à la section` : `${step.title} — essayer : ${step.example}`}
          >
            <span className="step__top">
              <span className="badge" aria-hidden="true">{step.n}</span>
              <span className="step__title">{step.title}</span>
            </span>
            <span className="step__text">{step.text}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
