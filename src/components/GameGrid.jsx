export default function GameGrid({ games, onSelect }) {
  const uniqueGames = games.filter(
    (game, index, self) => self.findIndex((g) => g.id === game.id) === index
  );

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 p-2">
      {uniqueGames.map((game) => (
        <button
          id={`game-${game.id}`}
          key={game.id}
          onClick={() => onSelect(game)}
          className="group relative w-full bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(147,51,234,0.25)] hover:-translate-y-0.5 transition-all duration-200 text-left"
        >
          {/* FORCED 1:1 SQUARE COVER */}
          <div className="relative w-full aspect-square bg-zinc-950 overflow-hidden">
            <img
              src={game.cover}
              alt={game.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2318181b'/><text x='50' y='55' text-anchor='middle' fill='%2352525b' font-size='10' font-family='sans-serif'>No Cover</text></svg>";
              }}
            />
            {/* Platform badge */}
            <span className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-[9px] text-zinc-300 font-bold px-1.5 py-0.5 rounded border border-zinc-700/50">
              {game.platform || "GAME"}
            </span>
          </div>

          {/* COMPACT TITLE */}
          <div className="p-1.5 bg-zinc-900">
            <h3 className="font-semibold text-[0.65em] leading-tight text-zinc-200 line-clamp-2 group-hover:text-white transition-colors">
              {game.title}
            </h3>
          </div>
        </button>
      ))}
    </div>
  );
}