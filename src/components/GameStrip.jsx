import GamePreview from "./GamePreview";
import { useState } from "react";

export default function GameStrip({ games, onSelect }) {
    // Stato per gestire quale riga ha la fisarmonica degli screenshot aperta
    const [expandedGameId, setExpandedGameId] = useState(null);

    const toggleExpand = (e, gameId) => {
        // Blocca la propagazione così non si apre il modal principale di App.jsx
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
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 hover:bg-zinc-800/30 transition-all flex flex-col gap-3"
                    >
                        {/* 1. TITOLO SOPRA (A TUTTA LARGHEZZA) */}
                        <div>
                            <h3 className="font-bold text-base md:text-lg text-zinc-100 group-hover:text-white truncate">
                                {game.title}
                            </h3>
                        </div>

                        {/* 2. AREA CONTENUTO (COPERTINA CLICCABILE) */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Copertina che funge da trigger per la fisarmonica */}
                                <div 
                                    onClick={(e) => toggleExpand(e, game.id)}
                                    className={`relative w-20 h-24 bg-zinc-950 rounded overflow-hidden flex-shrink-0 border cursor-pointer transition-all duration-200 hover:scale-105 ${
                                        isExpanded ? "border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]" : "border-zinc-700 hover:border-zinc-500"
                                    }`}
                                    title="Clicca la cover per vedere gli screenshot"
                                >
                                    <img 
                                        src={game.cover} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {/* Indicatore visivo sopra la cover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-lg font-bold">
                                            {isExpanded ? "▴" : "📸"}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-xs text-zinc-500 hidden sm:block">
                                    {isExpanded ? "← Clicca la cover per chiudere" : "← Clicca la cover per gli screenshot"}
                                </div>
                            </div>

                            {/* Freccetta indicatrice sulla destra della striscia */}
                            <div className="text-zinc-600 font-bold pr-2 text-sm">
                                Dettagli ➔
                            </div>
                        </div>

                        {/* 3. FISARMONICA SCREENSHOTS */}
                        {isExpanded && (
                            <div 
                                className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-zinc-800/60 animate-fade-in"
                                onClick={(e) => e.stopPropagation()} // Evita l'apertura del modal cliccando sui rettangoli delle preview
                            >
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