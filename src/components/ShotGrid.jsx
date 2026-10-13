import { useState } from "react";

// Miniatura che appare con dissolvenza quando l'immagine è davvero arrivata (niente "salti").
function Thumb({ src, alt, onClick, delay }) {
  const [ready, setReady] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`aspect-video animate-scale-up overflow-hidden rounded-lg bg-raised ${ready ? "" : "animate-pulse"}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setReady(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </button>
  );
}

// Griglia di screenshot: i riquadri hanno sempre la stessa dimensione, quindi la pagina non si sposta mentre carica.
export default function ShotGrid({ shots, loading, count, cols = "grid-cols-2", title, onZoom }) {
  if (!loading && shots.length === 0) return <p className="py-2 text-sm text-muted">Nessuno screenshot disponibile per questo gioco.</p>;
  return (
    <div className={`grid gap-1.5 ${cols}`}>
      {loading
        ? Array.from({ length: count }, (_, i) => <div key={i} className="aspect-video animate-pulse rounded-lg bg-raised" />)
        : shots.slice(0, count).map((s, i) => (
            <Thumb key={s.thumb} src={s.thumb} alt={`${title}, screenshot ${i + 1}`} delay={i * 60} onClick={() => onZoom(shots, i)} />
          ))}
    </div>
  );
}
