import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Lieu, SourceIA } from "../../pages/Search/searchTypes";
import { chargerCouverture, type Couverture } from "./couverture";
import { ImageIcon } from "./icons";
import { distance, fmt1, hueDe, libellePrecision, plur, typeDe, urlHttp } from "./placeFormat";

type Carte = "photos" | "infos" | "reseau";
const TECHS = ["2G", "3G", "4G", "5G"] as const;

interface Props {
  lieu: Lieu;
  sources: SourceIA[];
}

// Rendu avec key={lieu.id} côté parent : l'état repart à zéro à chaque lieu.
export default function PlaceInfo({ lieu, sources }: Props) {
  const [ouvert, setOuvert] = useState<Carte | null>(null);
  const [slide, setSlide] = useState(0);
  const [casses, setCasses] = useState<string[]>([]);
  const [couverture, setCouverture] = useState<Couverture | null>(null);
  const touche = useRef(0);

  const n = lieu.images.length;
  const idx = n ? slide % n : 0;
  const image = lieu.images[idx];
  const hue = hueDe(lieu.id);

  useEffect(() => {
    if (n < 2) return;
    const timer = setInterval(() => {
      if (Date.now() - touche.current >= 4000) setSlide((s) => s + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, [n]);

  useEffect(() => {
    const ctrl = new AbortController();
    chargerCouverture(lieu.position.lat, lieu.position.lng, ctrl.signal)
      .then(setCouverture)
      .catch(() => {});
    return () => ctrl.abort();
  }, [lieu.position.lat, lieu.position.lng]);

  const aller = (i: number) => { touche.current = Date.now(); setSlide(i); };
  const bump = (d: number) => aller((idx + d + n) % n);
  const visible = (c: Carte) => !ouvert || ouvert === c;
  const cls = (c: Carte, large = false) => `sr-card${ouvert === c ? " open" : ""}${large ? " wide" : ""}`;

  const fond = (k: number) => `linear-gradient(135deg, hsl(${hue + k * 16},42%,38%), hsl(${hue + 34 + k * 16},48%,26%))`;
  const sourcesCitees = lieu.sourcesCitees.map((ref) => sources.find((s) => s.reference === ref) ?? { reference: ref });

  const lignes: { k: string; v: ReactNode }[] = [];
  const type = typeDe(lieu);
  if (type) lignes.push({ k: "Type", v: type });
  if (lieu.district) lignes.push({ k: "District", v: lieu.district });
  if (lieu.region) lignes.push({ k: "Région", v: lieu.region });
  if (lieu.codeOfficiel) lignes.push({ k: "Code officiel", v: lieu.codeOfficiel });
  lignes.push({ k: "Position", v: libellePrecision(lieu) });
  if (lieu.noteGoogle !== null) lignes.push({ k: "Note Google", v: `${fmt1(lieu.noteGoogle)} / 5` });
  if (lieu.nbAvis !== null) lignes.push({ k: "Avis", v: plur(lieu.nbAvis, "avis", "avis") });
  for (const a of lieu.avis) lignes.push({ k: "Avis", v: a });
  if (sourcesCitees.length) {
    lignes.push({
      k: "Sources",
      v: sourcesCitees.map((s, i) => {
        const href = "url" in s ? urlHttp(s.url) : null;
        const label = ("titre" in s && s.titre) || s.reference;
        return (
          <span key={s.reference}>
            {i > 0 && ", "}
            {href ? <a href={href} target="_blank" rel="noopener noreferrer">{label}</a> : label}
          </span>
        );
      }),
    });
  }

  const puce = lieu.noteGoogle !== null
    ? { texte: `★ ${fmt1(lieu.noteGoogle)}`, ton: lieu.noteGoogle >= 4 ? "ok" : "warn" }
    : type ? { texte: type, ton: "" } : null;

  const Moins = () => <button type="button" className="sr-less" onClick={() => setOuvert(null)}>Voir moins ↑</button>;
  const Plus = ({ pour }: { pour: Carte }) => <button type="button" className="sr-more" onClick={() => setOuvert(pour)}>Voir plus ↓</button>;

  return (
    <section className="sr-info" aria-label="Informations sur le lieu choisi">
      <div className="sr-cards">
        {n > 0 && visible("photos") && (
          <article className={cls("photos", true)}>
            <div className="sr-card-head">
              <h3>Photos</h3>
              {ouvert === "photos" && <Moins />}
            </div>
            <div className="sr-photos">
              <div className={`sr-photo-box${ouvert === "photos" ? " open" : ""}`} style={{ background: fond(idx) }}>
                {image && !casses.includes(image.url) ? (
                  <img src={image.url} alt={image.legende ?? lieu.nom} onError={() => setCasses((c) => [...c, image.url])} />
                ) : (
                  <span className="sr-photo-ph"><ImageIcon /><span>Photo indisponible</span></span>
                )}
                {n > 1 && (
                  <>
                    <button type="button" className="sr-photo-hit" aria-label="Photo suivante" onClick={() => bump(1)} />
                    <div className="sr-dots" aria-hidden="true">
                      {lieu.images.map((_, k) => <span key={k} className={k === idx ? "on" : ""} />)}
                    </div>
                  </>
                )}
                {ouvert === "photos" && n > 1 && (
                  <>
                    <button type="button" className="sr-arrow left" aria-label="Photo précédente" onClick={() => bump(-1)}>‹</button>
                    <button type="button" className="sr-arrow right" aria-label="Photo suivante" onClick={() => bump(1)}>›</button>
                  </>
                )}
              </div>
              {ouvert === "photos" && (
                <div className="sr-thumbs">
                  {lieu.images.map((im, k) => (
                    <button
                      key={im.url}
                      type="button"
                      className={k === idx ? "on" : ""}
                      aria-label={`Voir la photo ${k + 1}${im.legende ? ` : ${im.legende}` : ""}`}
                      style={{ background: fond(k) }}
                      onClick={() => aller(k)}
                    >
                      {casses.includes(im.url) ? k + 1 : <img src={im.url} alt="" onError={() => setCasses((c) => [...c, im.url])} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="sr-caption">
              <span>{image?.legende ?? ""}</span>
              <span>{n > 1 ? `${idx + 1} / ${n}` : "1 photo"}</span>
            </div>
            {ouvert !== "photos" && <Plus pour="photos" />}
          </article>
        )}

        {visible("infos") && (
          <article className={cls("infos")}>
            <div className="sr-card-head">
              <h3>Informations</h3>
              {puce && <span className={`sr-badge ${puce.ton}`}>{puce.texte}</span>}
              {ouvert === "infos" && <Moins />}
            </div>
            {ouvert === "infos" ? (
              <div className="sr-rows">
                {lieu.description && <p className="sr-desc">{lieu.description}</p>}
                {lignes.map((r, i) => (
                  <div className="sr-row" key={i}><span>{r.k}</span><strong>{r.v}</strong></div>
                ))}
              </div>
            ) : (
              <>
                <p className="sr-brief clamp">{lieu.description ?? (lieu.sousTitre || "Aucune description.")}</p>
                <Plus pour="infos" />
              </>
            )}
          </article>
        )}

        {couverture && visible("reseau") && (
          <article className={cls("reseau")}>
            <div className="sr-card-head">
              <h3>Connectivité</h3>
              <span className={`sr-badge ${couverture.ok ? "ok" : "warn"}`}>{couverture.label}</span>
              {ouvert === "reseau" && <Moins />}
            </div>
            {ouvert === "reseau" ? (
              <div className="sr-rows">
                {couverture.operateurs.map((o) => (
                  <div className="sr-op" key={o.nom}>
                    <strong>{o.nom}</strong>
                    <div className="sr-techs">
                      {TECHS.map((t) => <span key={t} className={o.techs[t] ? "on" : "off"}>{t}</span>)}
                    </div>
                    <span className="sr-op-tw">
                      {o.pylone ? `Pylône ${o.pylone.nom} à ${distance(o.pylone.distance)}` : `Aucun pylône ${o.nom} à proximité`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="sr-brief">{couverture.brief}</p>
                <Plus pour="reseau" />
              </>
            )}
          </article>
        )}
      </div>
    </section>
  );
}
