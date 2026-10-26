import { useRef } from "react";
import Cover from "./Cover";
import Thumb, { ThumbSkeleton } from "./Thumb";
import { useGameDetails, prefetchDetails, isLandscape } from "../services/gameData";
import { useNearViewport } from "../services/viewport";
import { useI18n } from "../i18n/context";

// Scheda della lista. Tutta la scheda apre «Info».
//  - GOG (copertina orizzontale): in alto copertina + «Titolo - anno», sotto 3 screenshot a tutta larghezza.
//  - Steam (copertina verticale): copertina piccola a sinistra; accanto «Titolo - anno» e sotto 2 screenshot.
function Row({ game, year, dup, onSelect }) {
  const { t } = useI18n();
  const ref = useRef(null);
  const near = useNearViewport(ref, "900px"); // i dati si chiedono poco prima che la riga arrivi sullo schermo
  const { shots, year: detailYear, loading, failed } = useGameDetails(game, near);
  const steam = !isLandscape(game); // copertina verticale (Steam, Epic); orizzontale solo GOG
  const count = steam ? 2 : 3;
  const shownYear = year ?? detailYear;
  const open = () => onSelect(game);

  const title = (
    <h3 className="line-clamp-2 min-w-0 flex-1 font-display text-base font-semibold leading-tight">
      {game.title}{shownYear && <span className="whitespace-nowrap text-spark"> - {shownYear}</span>}
    </h3>
  );
  const colspan = steam ? "col-span-2" : "col-span-3";
  const dupBadge = dup?.length ? <p className="text-[11px] font-semibold text-spark">{t("strip.also", { list: dup.join(", ") })}</p> : null;
  const pictures = (
    <div className={`grid gap-1.5 ${steam ? "grid-cols-2" : "grid-cols-3"}`}>
      {!near || loading
        ? Array.from({ length: count }, (_, i) => <ThumbSkeleton key={i} />)
        : shots.slice(0, count).map((s, i) => <Thumb key={s.thumb} src={s.thumb} alt={t("aria.shotsOf", { title: game.title, i: i + 1 })} delay={i * 60} eager />)}
      {near && !loading && shots.length === 0 && (
        <p className={`${colspan} text-xs text-muted`}>{failed ? t("strip.failed") : t("strip.none")}</p>
      )}
    </div>
  );

  return (
    <article
      ref={ref}
      id={`game-${game.id}`}
      role="button"
      tabIndex={0}
      aria-label={t("aria.openInfo", { title: game.title })}
      onClick={open}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
      onPointerDown={() => prefetchDetails(game)}
      className={`scroll-mb-28 scroll-mt-16 cursor-pointer rounded-2xl border border-line/60 bg-panel p-3 transition-colors hover:border-spark/60 ${steam ? "flex gap-3" : "flex flex-col gap-2.5"}`}
    >
      {steam ? (
        <>
          <div className="aspect-[2/3] w-14 shrink-0 self-start overflow-hidden rounded-md bg-ink"><Cover game={game} width={168} lowPriority /></div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">{title}{dupBadge}{pictures}</div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="aspect-[460/215] w-28 shrink-0 overflow-hidden rounded-md bg-ink"><Cover game={game} wide width={336} lowPriority /></div>
            {title}
          </div>
          {dupBadge}
          {pictures}
        </>
      )}
    </article>
  );
}

export default function GameStrip({ games, onSelect, meta = {}, dupOf }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
      {games.map((g) => <Row key={g.id} game={g} year={meta[g.id]?.y} dup={dupOf?.get(g.id)} onSelect={onSelect} />)}
    </div>
  );
}
