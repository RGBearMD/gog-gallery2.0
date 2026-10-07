import { useState } from "react";
import Cover from "./Cover";
import Lightbox from "./Lightbox";
import { useGameShots } from "../services/screenshots";

function Row({ game, open, onToggle, onSelect, onZoom }) {
  // "mounted" tiene gli screenshot nel DOM solo durante la chiusura animata.
  const [mounted, setMounted] = useState(false);
  const show = open || mounted;
  const { shots, loading } = useGameShots(game, show); // richiesta solo quando serve
  const toggle = () => { setMounted(true); onToggle(game.id); };

  return (
    <article id={`game-${game.id}`} className="scroll-mb-28 scroll-mt-16 rounded-2xl border border-line/60 bg-panel p-3">
      <div className="flex items-center gap-3">
        <button onClick={() => onSelect(game)} className="min-w-0 flex-1 truncate text-left font-display text-base font-semibold hover:text-spark">{game.title}</button>
        <button onClick={() => onSelect(game)} className="shrink-0 rounded-lg bg-raised px-3 py-1 text-xs font-semibold hover:bg-line">Info</button>
      </div>

      <button onClick={toggle} aria-expanded={open} aria-label={`Screenshot di ${game.title}`} className="relative mt-2 block h-36 w-full overflow-hidden rounded-xl bg-ink">
        <Cover game={game} wide />
        <span className="absolute bottom-2 right-2 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold">{open ? "Chiudi" : "Screenshot"}</span>
      </button>

      {/* Apertura/chiusura animata: solo grid-rows + opacity, leggere anche su mobile */}
      <div
        onTransitionEnd={(e) => { if (e.target === e.currentTarget && !open) setMounted(false); }}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0 overflow-hidden">
          {show && (
            <div className="pt-2">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {loading && Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-video animate-pulse rounded-lg bg-raised" />)}
                {!loading && shots.slice(0, 4).map((s, i) => (
                  <button key={i} onClick={() => onZoom(shots, i)} style={{ animationDelay: `${i * 70}ms` }} className="aspect-video animate-scale-up overflow-hidden rounded-lg bg-ink">
                    <img src={s.thumb} alt={`${game.title}, screenshot ${i + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              {!loading && shots.length === 0 && <p className="py-2 text-sm text-muted">Nessuno screenshot disponibile per questo gioco.</p>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function GameStrip({ games, onSelect }) {
  const [openId, setOpenId] = useState(null); // una sola riga aperta alla volta
  const [lb, setLb] = useState(null);

  function toggle(id) {
    const opening = openId !== id;
    setOpenId(opening ? id : null);
    // Dopo l'animazione porto la riga in vista (la chiusura di quella sopra sposta il contenuto).
    if (opening) setTimeout(() => document.getElementById(`game-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 340);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
      {games.map((g) => (
        <Row key={g.id} game={g} open={openId === g.id} onToggle={toggle} onSelect={onSelect} onZoom={(shots, index) => setLb({ shots, index })} />
      ))}
      {lb && <Lightbox shots={lb.shots} index={lb.index} onIndex={(index) => setLb({ ...lb, index })} onClose={() => setLb(null)} />}
    </div>
  );
}
