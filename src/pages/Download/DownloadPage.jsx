import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./DownloadPage.css";

/* ------------------------------------------------------------------ *
 * 1. CONFIGURATION — à modifier : fichiers à télécharger et textes
 *    `file` = chemin du fichier servi par VOTRE site (ex. dossier public/).
 * ------------------------------------------------------------------ */
export const DEFAULT_PLATFORMS = [
  {
    id: "android",
    name: "Android",
    requirement: "Android 5.0 ou version ultérieure",
    buttonLabel: "Télécharger sur Google Play",
    file: "/downloads/connecteo.apk",
    fileName: "connecteo.apk",
    color: "#3a3cf4",
  },
  {
    id: "ios",
    name: "iOS",
    requirement: "iOS 13.0 ou version ultérieure",
    buttonLabel: "Télécharger sur App Store",
    file: "/downloads/connecteo.ipa",
    fileName: "connecteo.ipa",
    color: "#0b1437",
  },
  {
    id: "harmonyos",
    name: "HarmonyOS",
    requirement: "HarmonyOS 2.0 ou version ultérieure",
    buttonLabel: "Télécharger sur AppGallery",
    file: "/downloads/connecteo.hap",
    fileName: "connecteo.hap",
    color: "#e8112d",
  },
];

/* ------------------------------------------------------------------ *
 * 2. DÉTECTION DU SYSTÈME
 *    Retourne "android" | "ios" | "harmonyos" | null (ordinateur / inconnu)
 * ------------------------------------------------------------------ */
export function detectPlatform(nav) {
  const n = nav ?? (typeof navigator !== "undefined" ? navigator : null);
  if (!n) return null;
  const ua = n.userAgent || "";

  // HarmonyOS doit être testé AVANT Android (son UA contient souvent "Android")
  if (/HarmonyOS|OpenHarmony|ArkWeb|HMSCore|HuaweiBrowser/i.test(ua)) {
    return "harmonyos";
  }
  if (/Android/i.test(ua)) return "android";
  // iPadOS 13+ se présente comme un Mac : on vérifie l'écran tactile
  if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (n.platform === "MacIntel" && n.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  return null;
}

/** Hook : détecte la plateforme côté client (compatible SSR). */
export function usePlatform() {
  const [platform, setPlatform] = useState(null);
  useEffect(() => setPlatform(detectPlatform()), []);
  return platform;
}

/* ------------------------------------------------------------------ *
 * 3. ICÔNES
 * ------------------------------------------------------------------ */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const icons = {
  android: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="2.5" {...stroke} />
      <path d="M11 18h2" {...stroke} />
    </svg>
  ),
  ios: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" {...stroke} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  harmonyos: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" {...stroke} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
};

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="dl-btn__icon">
    <path d="M12 4v10m0 0-4-4m4 4 4-4M5 19h14" {...stroke} />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="dl-note__icon">
    <circle cx="12" cy="12" r="9" {...stroke} />
    <path d="m8 12.5 2.7 2.7L16 9.5" {...stroke} />
  </svg>
);

/* ------------------------------------------------------------------ *
 * 4. CARTE + GRILLE DE CARTES (briques internes réutilisées)
 *    Le bouton télécharge directement le fichier (attribut `download`).
 * ------------------------------------------------------------------ */
function PlatformCard({ platform: p, current }) {
  return (
    <li className={`dl-card${current ? " dl-card--current" : ""}`}>
      <span className="dl-card__logo" style={{ "--dl-logo-bg": p.color }}>
        {icons[p.id]}
      </span>
      <h3 className="dl-card__name">{p.name}</h3>
      <p className="dl-card__req">{p.requirement}</p>
      <a className="dl-btn" href={p.file} download={p.fileName ?? true}>
        <DownloadIcon />
        {p.buttonLabel ?? "Télécharger"}
      </a>
    </li>
  );
}

function PlatformsSection({ platforms, current, eyebrow, title, subtitle, titleId }) {
  return (
    <section className="dl-platforms" aria-labelledby={titleId}>
      <div className="dl-container">
        <p className="dl-eyebrow">{eyebrow}</p>
        <h2 id={titleId} className="dl-title">{title}</h2>
        <p className="dl-subtitle">{subtitle}</p>
        <ul className="dl-grid" data-count={platforms.length}>
          {platforms.map((p) => (
            <PlatformCard key={p.id} platform={p} current={current === p.id} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 5. COMPOSANT PRINCIPAL — page « Télécharger » du site
 *
 * Props (toutes optionnelles) :
 *  - platforms     : tableau de plateformes (voir DEFAULT_PLATFORMS)
 *  - appName       : nom affiché dans les textes ("Connectéo")
 *  - redirectPath  : route de la page ouverte par le QR code
 *                    (défaut "/telecharger/auto")
 *  - qrUrl         : URL complète encodée dans le QR (prioritaire)
 *  - mode          : "all" (défaut) → les 3 cartes, comme la maquette
 *                    "filter" → sur mobile, seule la carte compatible
 *  - highlight     : true → contour discret sur la carte de l'utilisateur
 *                    (défaut false : rendu identique à la maquette)
 *  - showQr        : afficher la partie QR code (défaut true)
 *  - className     : classe CSS additionnelle
 * ------------------------------------------------------------------ */
export default function DownloadPage({
  platforms = DEFAULT_PLATFORMS,
  appName = "Connectéo",
  redirectPath = "/telecharger/auto",
  qrUrl,
  mode = "all",
  highlight = false,
  showQr = true,
  className = "",
}) {
  const detected = usePlatform();

  const visible = useMemo(() => {
    if (mode === "filter" && detected) {
      const match = platforms.filter((p) => p.id === detected);
      return match.length ? match : platforms;
    }
    return platforms;
  }, [mode, detected, platforms]);

  const qrValue = useMemo(() => {
    if (qrUrl) return qrUrl;
    if (typeof window === "undefined") return redirectPath;
    return `${window.location.origin}${redirectPath}`;
  }, [qrUrl, redirectPath]);

  return (
    <div className={`dl-root ${className}`.trim()}>
      <PlatformsSection
        platforms={visible}
        current={highlight ? detected : null}
        eyebrow="Disponible maintenant"
        title="Choisissez votre plateforme"
        subtitle="Une expérience rapide, sécurisée et adaptée à votre appareil."
        titleId="dl-title"
      />

      {showQr && (
        <section className="dl-qr" aria-labelledby="dl-qr-title">
          <div className="dl-container dl-qr__inner">
            <div className="dl-qr__box">
              <QRCodeSVG
                value={qrValue}
                size={132}
                level="M"
                bgColor="#ffffff"
                fgColor="#0b1437"
                title={`QR code de téléchargement ${appName}`}
              />
            </div>
            <div className="dl-qr__text">
              <p className="dl-eyebrow dl-eyebrow--left">Installation rapide</p>
              <h2 id="dl-qr-title" className="dl-title dl-title--left">
                Scannez. Téléchargez. C'est parti.
              </h2>
              <p className="dl-subtitle dl-subtitle--left">
                Ouvrez l'appareil photo de votre téléphone et pointez-le vers le
                code QR. {appName} détecte automatiquement votre plateforme.
              </p>
              <p className="dl-note">
                <CheckIcon />
                Application officielle, téléchargement sécurisé
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 6. PAGE OUVERTE PAR LE QR CODE
 *    Le système est détecté AVANT l'affichage ; la page ne montre que la
 *    carte de l'application correspondant à l'appareil. Si le système est
 *    inconnu (ordinateur…), les 3 cartes sont proposées.
 *    À monter sur la route `redirectPath`.
 * ------------------------------------------------------------------ */
export function DownloadForDevice({
  platforms = DEFAULT_PLATFORMS,
  appName = "Connectéo",
  className = "",
}) {
  const [detected, setDetected] = useState(undefined); // undefined = en cours

  useEffect(() => setDetected(detectPlatform()), []);

  if (detected === undefined) {
    return (
      <div className={`dl-root dl-wait ${className}`.trim()} role="status">
        Détection de votre appareil…
      </div>
    );
  }

  const match = platforms.filter((p) => p.id === detected);
  const list = match.length ? match : platforms;

  return (
    <div className={`dl-root ${className}`.trim()}>
      <PlatformsSection
        platforms={list}
        current={null}
        eyebrow={match.length ? "Appareil détecté" : "Disponible maintenant"}
        title={
          match.length
            ? `${appName} pour ${match[0].name}`
            : "Choisissez votre plateforme"
        }
        subtitle={
          match.length
            ? "Appuyez sur le bouton pour télécharger l'application."
            : "Votre appareil n'a pas pu être identifié : choisissez votre version."
        }
        titleId="dl-device-title"
      />
    </div>
  );
}