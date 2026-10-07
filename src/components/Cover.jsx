import { coverUrl } from "../services/screenshots";

// wide = usa l'immagine orizzontale originale (banner), altrimenti la copertina verticale.
export default function Cover({ game, wide = false, className = "" }) {
  return (
    <img
      src={wide ? game.cover : coverUrl(game)}
      alt={game.title}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const t = e.currentTarget;
        if (!t.dataset.fb && game.cover) { t.dataset.fb = "1"; t.src = game.cover; }
        else t.style.visibility = "hidden";
      }}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
