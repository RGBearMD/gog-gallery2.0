import { useEffect, useState } from "react";
import Lightbox from "./Lightbox";
import Thumb, { ThumbSkeleton } from "./Thumb";
import { Icon } from "./Icons";
import { useI18n } from "../i18n/context";
import { useGameDetails, hoursPlayed, platformName, platformClasses, storeUrl } from "../services/gameData";

// «Sviluppatore / Editore»; se coincidono compare una volta sola
const studioLine = (dev, pub) => {
  const d = dev.join(", "), p = pub.filter((x) => !dev.includes(x)).join(", ");
  return d && p ? `${d} / ${p}` : d || p;
};

export default function GameModal({ game, metaYear, onClose }) {
  const { t, locale } = useI18n();
  const { shots, year, dev, pub, loading, failed } = useGameDetails(game);
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    if (!game) return;
    const onKey = (e) => e.key === "Escape" && zoom === null && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game, zoom, onClose]);

  if (!game) return null;
  const name = platformName(game);
  const url = storeUrl(game);
  const shownYear = metaYear ?? year; // stessa fonte della lista (useMeta), così gli anni coincidono sempre
  const six = shots.slice(0, 6); // griglia 3×2: sei screenshot
  const badge = `rounded-full px-2.5 py-0.5 font-semibold ${platformClasses(game)}`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 animate-fade-in" onClick={onClose}>
        <div className="custom-scrollbar relative max-h-[92vh] w-full max-w-4xl animate-scale-up overflow-y-auto rounded-2xl border border-line/70 bg-panel p-5 shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} aria-label={t("aria.close")} className="absolute right-3 top-3 rounded-full bg-black/40 p-2.5 hover:bg-raised"><Icon name="close" /></button>

          <h2 className="pr-10 text-2xl font-bold tracking-tight md:text-3xl">
            {game.title}{shownYear && <span className="text-spark"> - {shownYear}</span>}
          </h2>
          {studioLine(dev, pub) && <p className="mt-1 text-sm text-muted">{studioLine(dev, pub)}</p>}
          <div className="mb-5 mt-2 flex flex-wrap items-center gap-2 text-xs">
            {url
              ? <a href={url} target="_blank" rel="noopener noreferrer" title={t("modal.badgeTitle", { name })} className={`${badge} hover:brightness-125`}>{name} ↗</a>
              : <span className={badge}>{name}</span>}
            {game.playtime > 0 && <span className="rounded-full bg-raised px-2.5 py-0.5 text-muted">{t("modal.played", { h: hoursPlayed(game, locale) })}</span>}
          </div>

          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }, (_, i) => <ThumbSkeleton key={i} />)
              : six.map((s, i) => <Thumb key={s.thumb} src={s.thumb} alt={t("aria.shotsOf", { title: game.title, i: i + 1 })} delay={i * 50} onClick={() => setZoom(i)} />)}
          </div>
          {!loading && six.length === 0 && (
            <p className="mt-3 text-sm text-muted">{failed ? t("modal.failed") : t("modal.none")}</p>
          )}
        </div>
      </div>
      {zoom !== null && six[zoom] && <Lightbox shots={six} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} />}
    </>
  );
}
