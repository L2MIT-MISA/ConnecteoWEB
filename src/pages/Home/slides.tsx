import type { ReactNode } from "react";

export interface Slide {
  id: number;
  theme: string;
  image: string;
  alt: string;
  description: string;
  title: ReactNode;
}

export const SLIDES: Slide[] = [
  { id: 0, theme: "Voyage et sécurité", image: "/images/home/slide-voyage.jpg", alt: "Allée des Baobabs à Madagascar, au lever du jour", description: "Consultez votre environnement, votre itinéraire et la connectivité sur les zones traversées.", title: <>Voyagez en toute sécurité,<br />connecté ou pas.</> },
  { id: 1, theme: "Continuité de la communication", image: "/images/home/slide-communaute.jpg", alt: "Communauté sur l’Allée des Baobabs au coucher du soleil", description: "Gardez l’accès aux infos et à la communication, même là où le réseau traditionnel faiblit.", title: <>Aucune barrière<br />ne nous arrête.</> },
  { id: 2, theme: "Urgence", image: "/images/home/slide-urgence.jpg", alt: "Pirogue au coucher du soleil sur la côte malgache", description: "Transmettez une alerte et localisez les zones concernées pour faire circuler l’essentiel.", title: <>Une urgence ?<br />Nous sommes là.</> },
  { id: 3, theme: "Orientation", image: "/images/home/slide-orientation.jpg", alt: "Rue de village à Madagascar, vers les hautes terres", description: "Cherchez une destination, explorez les lieux, et suivez votre itinéraire sur la carte.", title: <>Ne perdez plus<br />jamais votre route.</> },
];
