import { useState } from "react";

// Miniatura che appare con dissolvenza quando l'immagine è davvero arrivata (niente "salti").
// Senza onClick è solo un'immagine (nella Strip tutta la scheda è il pulsante).
export default function Thumb({ src, alt, onClick, delay = 0, eager = false }) {
  const [ready, setReady] = useState(false);
  const cls = `aspect-video animate-scale-up overflow-hidden rounded-lg bg-raised ${ready ? "" : "animate-pulse"}`;
  const img = (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setReady(true)}
      className={`h-full w-full object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
  return onClick
    ? <button onClick={onClick} style={{ animationDelay: `${delay}ms` }} className={cls}>{img}</button>
    : <div style={{ animationDelay: `${delay}ms` }} className={cls}>{img}</div>;
}

export const ThumbSkeleton = () => <div className="aspect-video animate-pulse rounded-lg bg-raised" />;
