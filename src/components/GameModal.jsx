import { useEffect, useState } from "react";
import Lightbox from "./Lightbox";
import Thumb, { ThumbSkeleton } from "./Thumb";
import { Icon } from "./Icons";
import { useGameDetails, usePlayers, hoursPlayed, isSteam, storeUrl } from "../services/gameData";

const yn = (v) => (v === true ? "Sì" : v === false ? "No" : "—");

// Primo riquadro della griglia: la «targhetta» del gioco, come in un museo.
function InfoCell({ game, year, local, online, players }) {
  const steam = isSteam(game);
  const url = storeUrl(game);
  const localText = players?.players ? `${players.players} giocatori` : yn(local === true || players?.local === true ? true : local === false || players?.local === false ? false : null);
  const onlineText = yn(online === true || players?.online === true ? true : online === false || players?.online === false ? false : null);
  const row = "flex items-baseline justify-between gap-2";
  return (
    <div className="col-span-2 flex flex-col justify-between gap-2 rounded-lg border border-line/60 bg-raised/60 p-3 text-sm md:col-span-1 md:aspect-video md:p-2.5 md:text-xs">
      <dl className="space-y-1">
        <div className={row}><dt className="text-muted">Anno di uscita</dt><dd className="font-semibold text-spark">{year ?? "—"}</dd></div>
        <div className={row}><dt className="text-muted" title="Fonte: PCGamingWiki">Multiplayer locale</dt><dd className="font-semibold">{localText}</dd></div>
        <div className={row}><dt className="text-muted">Multiplayer online</dt><dd className="font-semibold">{onlineText}</dd></div>
      </dl>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className={`rounded-lg py-2 text-center text-xs font-bold text-ink hover:brightness-110 ${steam ? "bg-steam" : "bg-gog"}`}>
          Vedi su {steam ? "Steam" : "GOG"}
        </a>
      )}
    </div>
  );
}

export default function GameModal({ game, metaYear, onClose }) {
  const { shots, year, local, online, loading } = useGameDetails(game);
  const players = usePlayers(game, !loading && local !== false); // il numero di giocatori si cerca solo se il locale non è escluso
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    if (!game) return;
    const onKey = (e) => e.key === "Escape" && zoom === null && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game, zoom, onClose]);

  if (!game) return null;
  const steam = isSteam(game);
  const five = shots.slice(0, 5); // massimo 5 screenshot: il sesto riquadro è la scheda del gioco

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 animate-fade-in" onClick={onClose}>
        <div className="custom-scrollbar relative max-h-[92vh] w-full max-w-4xl animate-scale-up overflow-y-auto rounded-2xl border border-line/70 bg-panel p-5 shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} aria-label="Chiudi" className="absolute right-3 top-3 rounded-full bg-black/40 p-2.5 hover:bg-raised"><Icon name="close" /></button>

          <h2 className="pr-10 text-2xl font-bold tracking-tight md:text-3xl">{game.title}</h2>
          <div className="mb-5 mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${steam ? "bg-steam/15 text-steam" : "bg-gog/15 text-gog"}`}>{steam ? "Steam" : "GOG"}</span>
            {game.playtime > 0 && <span className="rounded-full bg-raised px-2.5 py-0.5 text-muted">{hoursPlayed(game)} h giocate</span>}
          </div>

          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
            <InfoCell game={game} year={year ?? metaYear} local={local} online={online} players={players} />
            {loading
              ? Array.from({ length: 5 }, (_, i) => <ThumbSkeleton key={i} />)
              : five.map((s, i) => <Thumb key={s.thumb} src={s.thumb} alt={`${game.title}, screenshot ${i + 1}`} delay={i * 50} onClick={() => setZoom(i)} />)}
          </div>
          {!loading && five.length === 0 && <p className="mt-3 text-sm text-muted">Nessuno screenshot disponibile per questo gioco.</p>}
        </div>
      </div>
      {zoom !== null && five[zoom] && <Lightbox shots={five} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} />}
    </>
  );
}
