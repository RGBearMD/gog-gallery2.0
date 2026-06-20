import GamePreview from "./GamePreview";
import { useState } from "react";

export default function GameStrip({ games, onSelect }) {
    // Stato per gestire quale riga è espansa per mostrare gli screenshot aggiuntivi
    const [expandedGameId, setExpandedGameId] = useState(null);

    const toggleExpand = (e, gameId) => {
        // Impedisce il trigger di onSelect quando si clicca sul toggle di espansione
        e.stopPropagation();
        setExpandedGameId(expandedGameId === gameId ? null : gameId);
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {games.map((game) => {
                const isExpanded = expandedGameId === game.id;

                return (
                    <div
                        id={`game-${game.id}`}
                        key={game.id}
                        onClick={() => onSelect(game)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 hover:bg-zinc-800/30 transition-all flex flex-col gap-4"
                    >
                        {/* LINEA PRINCIPALE (STRIP) */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Piccola Copertina Orizzontale/Verticale scalata */}
                                <div className="w-16 h-20 bg-zinc-950 rounded overflow-hidden flex-shrink-0 border border-zinc-800">
                                    <img 
                                        src={game.cover} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                
                                {/* Info Titolo */}
                                <div className="min-w-0">
                                    <h3 className="font-bold text-base text-zinc-100 truncate group-hover:text-white">
                                        {game.title}
                                    </h3>
                                    {game.playtime > 0 && (
                                        <p className="text-xs text-purple-400 mt-0.5">
                                            {game.playtime} ore di gioco
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Azioni sulla destra */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => toggleExpand(e, game.id)}
                                    className="p-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition"
                                >
                                    {isExpanded ? "Nascondi Screenshot ▴" : "Mostra Screenshot ▾"}
                                </button>
                            </div>
                        </div>

                        {/* PREVIEW SCREENSHOTS ESPANSA */}
                        {isExpanded && (
                            <div 
                                className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-zinc-800/60 animate-fade-in"
                                onClick={(e) => e.stopPropagation()} // Impedisce l'apertura del modal principale cliccando sulle preview
                            >
                                {/* Genera 4 preview sfruttando il componente pigro GamePreview */}
                                <GamePreview game={game} count={1} />
                                <GamePreview game={game} count={2} />
                                <GamePreview game={game} count={3} />
                                <GamePreview game={game} count={4} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}