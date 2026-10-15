import { coverUrl, resizedUrl } from "../services/gameData";

// width: se indicato, la copertina passa dalla funzione `img` (versione leggera);
// se non risponde si ripiega sull'originale, e poi sull'immagine orizzontale.
export default function Cover({ game, wide = false, lowPriority = false, width, className = "" }) {
  const original = wide ? game.cover : coverUrl(game);
  const chain = [...new Set([width && original ? resizedUrl(original, width) : null, original, game.cover].filter(Boolean))];
  return (
    <img
      src={chain[0]}
      alt={game.title}
      loading="lazy"
      decoding="async"
      fetchPriority={lowPriority ? "low" : "auto"}
      onError={(e) => {
        const t = e.currentTarget;
        const stage = Number(t.dataset.stage) || 0;
        if (chain[stage + 1]) { t.dataset.stage = String(stage + 1); t.src = chain[stage + 1]; }
        else t.style.visibility = "hidden";
      }}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
