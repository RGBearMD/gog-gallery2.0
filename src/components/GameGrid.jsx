export default function GameGrid({ games, onSelect }) {
    return (
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2 p-3">       
            {games.map((game) => (
                <div
                    id={`game-${game.id}`}
                    key={game.id}
                    onClick={() => {
    console.log(
        "CLICK CARD",
        game.id,
        game.title
    );

    onSelect(game);
}}
                className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer group hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(147,51,234,0.25)] hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300 flex flex-col"
                >
                    {/* Aspect ratio rigido verticale 2:3 per copertine standard */}
                    <div className="relative w-full h-full overflow-hidden transition-transform duration-500">
                        <img
                            src={game.cover}
                            alt={game.title}
                            loading="lazy"
    className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        {/* Overlay Gradient al passaggio del mouse */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <span className="text-xs bg-purple-600 text-white font-bold px-2 py-1 rounded shadow">
                                Vedi Dettagli ➔
                            </span>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="p-3 flex-1 flex flex-col justify-between bg-zinc-900/50">
                        <h3 className="font-bold text-sm text-zinc-200 line-clamp-2 group-hover:text-white transition-colors min-h-[3.5rem]">
                            {game.title}
                        </h3>
                        {/*
                        {game.playtime > 0 && (
                            <p className="text-xs text-purple-400 mt-1 font-medium">
                                {game.playtime} ore registrate
                            </p>
                        )}
                        */}
                    </div>
                </div>
            ))}
        </div>
    );
}