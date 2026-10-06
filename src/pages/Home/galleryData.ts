export interface GallerySlide {
  id: number;
  src: string;
  alt: string;
  title: string;
  place: string;
}

export const GALLERY_SLIDES: GallerySlide[] = [
  {
    id: 0,
    src: "/images/accueil/slide-1.jpg",
    alt: "Allée des baobabs au lever du jour",
    title: "Allée des baobabs",
    place: "Région de Menabe",
  },
  {
    id: 1,
    src: "/images/accueil/slide-2.jpg",
    alt: "La Fenêtre d'Isalo au coucher du soleil",
    title: "La Fenêtre d'Isalo",
    place: "Parc national de l'Isalo",
  },
  {
    id: 2,
    src: "/images/accueil/slide-3.jpg",
    alt: "Les Tsingy du Bemaraha",
    title: "Les Tsingy",
    place: "Bemaraha",
  },
  {
    id: 3,
    src: "/images/accueil/slide-4.jpg",
    alt: "Forêt de pierre entre deux falaises de calcaire",
    title: "Forêt de pierre",
    place: "Entre deux falaises de calcaire",
  },
  {
    id: 4,
    src: "/images/accueil/slide-5.jpg",
    alt: "Parc national de Masoala",
    title: "Masoala",
    place: "Parc national, nord-est",
  },
  {
    id: 5,
    src: "/images/accueil/slide-6.jpg",
    alt: "Rivières et rochers moussus des forêts tropicales",
    title: "Forêts tropicales",
    place: "Rivières et rochers moussus",
  },
];

export const HERO_BACKGROUND = "/images/accueil/hero.jpg";
