import { useState } from "react";
import Cover from "./Cover";
import Lightbox from "./Lightbox";
import { useGameShots } from "../services/screenshots";

function Row({ game, onSelect, onZoom }) {
  const [open, setOpen] = useState(false);
  // Gli screenshot vengono richiesti solo quando la riga si apre.
  const { shots, loading } = useGameShots(game, open);

  return (
    <article id={`game-${game.id}`} className="rounded-2xl border border-line/60 bg-panel p-3">
      <div className="flex items-center gap-3">
        <button onClick={() => onSelect(game)} className="min-w-0 flex-1 truncate text-left font-display text-base font-semibold hover:text-spark">
          {game.title}
        </button>
        <button onClick={() => onSelect(game)} className="shrink-0 rounded-lg bg-raised px-3 py-1 text-xs font-semibold hover:bg-line">
          Info
        </button>
      </div>

      {!open ? (
        <button onClick={() => setOpen(true)} aria-label={`Mostra screenshot di ${game.title}`} className="relative mt-2 block h-36 w-full overflow-hidden rounded-xl bg-ink">
          <Cover game={game} wide />
          <span className="absolute bottom-2 right-2 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold backdrop-blur">Screenshot</span>
        </button>
      ) : (
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {loading && Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-video animate-pulse rounded-lg bg-raised" />)}
            {!loading && shots.slice(0, 4).map((s, i) => (
              <button key={i} onClick={() => onZoom(shots, i)} className="aspect-video overflow-hidden rounded-lg bg-ink">
                <img src={s.thumb} alt={`${game.title}, screenshot ${i + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
              </button>
            ))}
          </div>
          {!loading && shots.length === 0 && <p className="py-3 text-sm text-muted">Nessuno screenshot disponibile per questo gioco.</p>}
          <button onClick={() => setOpen(false)} className="mt-2 text-xs text-muted hover:text-fog">Nascondi screenshot</button>
        </div>
      )}
    </article>
  );
}

export default function GameStrip({ games, onSelect }) {
  const [lb, setLb] = useState(null);
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
      {games.map((g) => <Row key={g.id} game={g} onSelect={onSelect} onZoom={(shots, index) => setLb({ shots, index })} />)}
      {lb && <Lightbox shots={lb.shots} index={lb.index} onIndex={(index) => setLb({ ...lb, index })} onClose={() => setLb(null)} />}
    </div>
  );
}
