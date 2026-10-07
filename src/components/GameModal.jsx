import { useEffect, useState } from "react";
import Lightbox from "./Lightbox";
import { Icon } from "./Icons";
import { useGameShots, hoursPlayed, isSteam } from "../services/screenshots";

export default function GameModal({ game, onClose }) {
  const { shots, loading } = useGameShots(game);
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    if (!game) return;
    const onKey = (e) => e.key === "Escape" && zoom === null && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game, zoom, onClose]);

  if (!game) return null;
  const steam = isSteam(game);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 animate-fade-in" onClick={onClose}>
        <div className="custom-scrollbar relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-line/70 bg-panel p-5 shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} aria-label="Chiudi" className="absolute right-3 top-3 rounded-full bg-black/40 p-2.5 hover:bg-raised"><Icon name="close" /></button>

          <h2 className="pr-10 text-2xl font-bold tracking-tight md:text-3xl">{game.title}</h2>
          <div className="mb-5 mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${steam ? "bg-steam/15 text-steam" : "bg-gog/15 text-gog"}`}>{steam ? "Steam" : "GOG"}</span>
            {game.playtime > 0 && <span className="rounded-full bg-raised px-2.5 py-0.5 text-muted">{hoursPlayed(game)} h giocate</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {loading && Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-video animate-pulse rounded-lg bg-raised" />)}
            {!loading && shots.slice(0, 9).map((s, i) => (
              <button key={i} onClick={() => setZoom(i)} style={{ animationDelay: `${i * 50}ms` }} className="aspect-video animate-scale-up overflow-hidden rounded-lg border border-line/60 bg-ink hover:border-spark">
                <img src={s.thumb} alt={`${game.title}, screenshot ${i + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
              </button>
            ))}
          </div>
          {!loading && shots.length === 0 && <p className="text-sm text-muted">Nessuno screenshot disponibile per questo gioco.</p>}
        </div>
      </div>
      {zoom !== null && shots[zoom] && <Lightbox shots={shots} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} />}
    </>
  );
}
