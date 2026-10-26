import { Icon } from "./Icons";
import { useI18n } from "../i18n/context";

// «Cos'è YGG»: spiegazione, sei punti di forza e 3 immagini d'esempio (giochi fittizi, in public/screens/: sostituibili con le tue).
const BOXES = [["image", "b1"], ["layers", "b2"], ["phone", "b3"], ["shield", "b4"], ["copy", "b5"], ["tag", "b6"]];
const SHOTS = [["strip", "about.cap1"], ["info", "about.cap2"], ["timeline", "about.cap3"]];

export default function About() {
  const { t, lang } = useI18n();
  return (
    <section className="mx-auto mt-14 max-w-3xl px-1 text-left" aria-labelledby="about-title">
      <h3 id="about-title" className="text-xl font-bold tracking-tight">{t("about.title")}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fog/90">{t("about.p")}</p>

      <ul className="mt-5 grid grid-cols-2 gap-3">
        {BOXES.map(([icon, id]) => (
          <li key={id} className="rounded-2xl border border-line/60 bg-panel p-4">
            <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-raised text-spark"><Icon name={icon} className="size-5" /></span>
            <h4 className="font-display text-sm font-semibold">{t(`about.${id}.t`)}</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted">{t(`about.${id}.d`)}</p>
          </li>
        ))}
      </ul>

      <div className="no-scrollbar -mx-3 mt-6 flex snap-x gap-3 overflow-x-auto px-3 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
        {SHOTS.map(([name, cap]) => (
          <figure key={name} className="w-44 shrink-0 snap-center md:w-auto">
            <img src={`/screens/${name}${lang === "en" ? "-en" : ""}.webp`} alt={t(cap)} width="390" height="844" loading="lazy" decoding="async" className="h-auto w-full rounded-xl border-2 border-line bg-panel shadow-lg" />
            <figcaption className="mt-1.5 text-xs leading-snug text-muted">{t(cap)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
