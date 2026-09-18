export default function GameCard({ game, onSelect }) {
    // Se non c'è una funzione onSelect passata, usiamo il comportamento link predefinito
    const handleClick = (e) => {
        if (onSelect) {
            e.preventDefault();
            onSelect(game);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="bg-zinc-900 rounded-xl overflow-hidden block hover:scale-[1.03] hover:border-purple-500/50 transition-all duration-300 border border-zinc-800 shadow-lg cursor-pointer group flex flex-col"
        >
            {/* Contenitore rigorosamente QUADRATO (1:1) */}
            <div className="w-full aspect-square bg-zinc-950 overflow-hidden relative border-b border-zinc-800">
                <img
                    src={game.cover}
                    alt={game.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay hover rapido */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs bg-black/80 text-white font-bold px-3 py-1.5 rounded-full border border-zinc-700 shadow-xl backdrop-blur">
                        Dettagli 🔍
                    </span>
                </div>
            </div>

            {/* Testo compatto in basso */}
            <div className="p-2.5 flex flex-col justify-between flex-grow">
                <h3 className="text-xs md:text-sm font-bold text-zinc-100 truncate group-hover:text-purple-400 transition-colors">
                    {game.title}
                </h3>

                {game.playtime !== undefined && (
                    <p className="text-[11px] font-mono text-zinc-400 mt-1">
                        ⏱️ {Math.round(game.playtime / 60)}h giocate
                    </p>
                )}
            </div>
        </div>
    );
}