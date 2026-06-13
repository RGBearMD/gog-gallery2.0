export default function GameGrid({ games, onSelect }) {
    return (
<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-1">           
            {games.map((game) => (
                <div
                    id={`game-${game.id}`}
                    key={game.id}
                    onClick={() => onSelect(game)}
                    className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer group hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.15)] transition-all duration-300 flex flex-col"
                >
                    {/* Aspect ratio rigido verticale 2:3 per copertine standard */}
                    <div className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500">
                        <img
                            src={game.cover}
                            alt={game.title}
                            loading="lazy"
                            className="w-full h-full object-contain p-2 transform group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Overlay Gradient al passaggio del mouse */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <span className="text-xs bg-purple-600 text-white font-bold px-2 py-1 rounded shadow">
                                Vedi Dettagli ➔
                            </span>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="p-3 flex-1 flex flex-col justify-between bg-zinc-900/50">
                        <h3 className="font-bold text-sm text-zinc-200 line-clamp-1 group-hover:text-white transition-colors">
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