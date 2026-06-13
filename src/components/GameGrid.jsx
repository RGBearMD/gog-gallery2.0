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
                className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 cursor-pointer group hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(147,51,234,0.25)] hover:-translate-y-2 transition-all duration-300 flex flex-col"
                >
                    {/* Aspect ratio rigido verticale 2:3 per copertine standard */}
<div className="h-44 bg-zinc-950 overflow-hidden border-b border-zinc-800">
    <img
        src={game.cover}
        alt={game.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
    />
</div>

<div className="h-32 bg-zinc-950 overflow-hidden">
    <img
        src={
            game.previewScreenshot ||
            game.cover
        }
        alt={game.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
    />
</div>

{/*
<div className="border-t border-zinc-800 bg-zinc-900 px-4 py-4 min-h-[88px] flex items-center justify-center">
    <h3 className="text-center font-bold text-sm text-zinc-200 line-clamp-2 group-hover:text-white transition-colors">
        {game.title}
    </h3>
                        
                        {game.playtime > 0 && (
                            <p className="text-xs text-purple-400 mt-1 font-medium">
                                {game.playtime} ore registrate
                            </p>
                        )}
                        
                    </div>*/}
                </div>
            ))}
        </div>
    );
}