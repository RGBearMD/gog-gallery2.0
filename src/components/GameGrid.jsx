import Cover from "./Cover";
import { useI18n } from "../i18n/context";
import { hoursPlayed, prefetchDetails, isLandscape } from "../services/gameData";

// Cards. Steam: copertina verticale con titolo in sovraimpressione. GOG: copertina ORIZZONTALE con il titolo sotto.
export default function GameGrid({ games, onSelect, meta = {}, dupOf }) {
  const { t, locale } = useI18n();
  const steam = games.length ? !isLandscape(games[0]) : true; // verticale: Steam ed Epic
  const cols = steam
    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <div className={`grid gap-3 ${cols}`}>
      {games.map((game) => {
        const year = meta[game.id]?.y;
        const hours = game.playtime > 0 ? `${hoursPlayed(game, locale)} h` : null;
        const dup = dupOf?.get(game.id);
        const info = (year || hours || dup) && (
          <p className="mt-0.5 text-[11px] text-muted">
            {year && <span className="font-semibold text-spark">{year}</span>}{year && hours && " · "}{hours}
            {dup?.length > 0 && <span className="block font-semibold text-spark">{t("strip.also", { list: dup.join(", ") })}</span>}
          </p>
        );
        const common = { id: `game-${game.id}`, onPointerDown: () => prefetchDetails(game), onClick: () => onSelect(game) };

        return !isLandscape(game) ? (
          <button key={game.id} {...common} className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-line/60 bg-panel text-left transition-transform duration-200 hover:-translate-y-1 hover:border-spark/70">
            <Cover game={game} width={420} className="transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 pt-8">
              <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-white sm:text-sm">{game.title}</h3>
              {info}
            </div>
          </button>
        ) : (
          <button key={game.id} {...common} className="group overflow-hidden rounded-xl border border-line/60 bg-panel text-left transition-transform duration-200 hover:-translate-y-1 hover:border-spark/70">
            <div className="aspect-[460/215] w-full overflow-hidden bg-ink">
              <Cover game={game} wide width={420} className="transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-2.5">
              <h3 className="line-clamp-2 text-xs font-semibold leading-tight sm:text-sm">{game.title}</h3>
              {info}
            </div>
          </button>
        );
      })}
    </div>
  );
}
