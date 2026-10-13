import Cover from "./Cover";
import { hoursPlayed, prefetchDetails } from "../services/gameData";

export default function GameGrid({ games, onSelect, meta = {} }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {games.map((game) => (
        <button
          id={`game-${game.id}`}
          key={game.id}
          onPointerDown={() => prefetchDetails(game)}
          onClick={() => onSelect(game)}
          className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-line/60 bg-panel text-left transition-transform duration-200 hover:-translate-y-1 hover:border-spark/70"
        >
          <Cover game={game} className="transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 pt-8">
            <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-white sm:text-sm">{game.title}</h3>
            {(meta[game.id]?.y || game.playtime > 0) && (
              <p className="mt-0.5 text-[11px] text-muted">
                {meta[game.id]?.y && <span className="font-semibold text-spark">{meta[game.id].y}</span>}
                {meta[game.id]?.y && game.playtime > 0 && " · "}
                {game.playtime > 0 && `${hoursPlayed(game)} h`}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
