export default function GameGrid({ games, onSelect }) {
  const uniqueGames = games.filter(
    (game, index, self) => self.findIndex((g) => g.id === game.id) === index
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-2">
      {uniqueGames.map((game) => (
        <div
          id={`game-${game.id}`}
          key={game.id}
          onClick={() => {
            console.log("CLICK CARD", game.id, game.title);
            onSelect(game);
          }}
          className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer group hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full"
        >
          {/* ★ COPERTINA: Aspect ratio 1:1 forzato, object-cover per riempire il quadrato */}
          <div className="w-full aspect-square bg-zinc-950 overflow-hidden border-b border-zinc-800/60 relative">
            <img
              src={game.cover}
              alt={game.title}
              loading="lazy"
              className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2318181b'/><text x='50' y='55' text-anchor='middle' fill='%2352525b' font-size='10' font-family='sans-serif'>No Cover</text></svg>";
              }}
            />
            {/* Badge piattaforma compatto */}
            <span className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-[9px] text-zinc-300 font-bold px-1.5 py-0.5 rounded border border-zinc-700/50">
              {game.platform}
            </span>
          </div>

          {/* ★ TITOLO: Font compatto (0.7em) e line-clamp per evitare overflow */}
          <div className="p-2 bg-zinc-900/50 flex-1 flex flex-col justify-center">
            <h3 className="font-semibold text-[0.7em] leading-tight text-zinc-200 line-clamp-2 group-hover:text-white transition-colors">
              {game.title}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}