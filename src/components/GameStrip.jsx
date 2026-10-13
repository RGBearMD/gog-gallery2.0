import { useRef } from "react";
import Cover from "./Cover";
import Thumb, { ThumbSkeleton } from "./Thumb";
import { useGameDetails, prefetchDetails } from "../services/gameData";
import { useNearViewport } from "../services/viewport";

// Scheda: copertina a sinistra; accanto, in alto titolo + anno e sotto 2 screenshot. Tutta la scheda apre «Info».
function Row({ game, year, onSelect }) {
  const ref = useRef(null);
  const near = useNearViewport(ref); // gli screenshot si chiedono solo per le righe che si stanno per vedere
  const { shots, year: detailYear, loading } = useGameDetails(game, near);
  const shownYear = year ?? detailYear;
  const open = () => onSelect(game);

  return (
    <article
      ref={ref}
      id={`game-${game.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Apri le informazioni di ${game.title}`}
      onClick={open}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
      onPointerDown={() => prefetchDetails(game)}
      className="flex scroll-mb-28 scroll-mt-16 cursor-pointer gap-3 rounded-2xl border border-line/60 bg-panel p-3 transition-colors hover:border-spark/60"
    >
      <div className="aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg bg-ink"><Cover game={game} /></div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-tight">
          {game.title}{" "}
          {shownYear && <span className="ml-1 whitespace-nowrap text-xs font-semibold text-spark">{shownYear}</span>}
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {!near || loading
            ? [0, 1].map((i) => <ThumbSkeleton key={i} />)
            : shots.slice(0, 2).map((s, i) => <Thumb key={s.thumb} src={s.thumb} alt={`${game.title}, screenshot ${i + 1}`} delay={i * 60} />)}
          {near && !loading && shots.length === 0 && <p className="col-span-2 text-xs text-muted">Nessuno screenshot disponibile.</p>}
        </div>
      </div>
    </article>
  );
}

export default function GameStrip({ games, onSelect, meta = {} }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
      {games.map((g) => <Row key={g.id} game={g} year={meta[g.id]?.y} onSelect={onSelect} />)}
    </div>
  );
}
