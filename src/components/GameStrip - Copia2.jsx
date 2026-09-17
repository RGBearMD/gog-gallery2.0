import GamePreview from "./GamePreview";
import { useState } from "react";

export default function GameStrip({ games, onSelect }) {
    const [expandedGameId, setExpandedGameId] = useState(null);

    const toggleExpand = (e, gameId) => {
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
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 transition-all flex flex-col gap-2.5 hover:border-zinc-700"
                    >
                        {/* TITOLO SOPRA CLICCABILE PER APRIRE IL MODAL */}
                        <div 
                            onClick={() => onSelect(game)}
                            className="cursor-pointer group flex items-center justify-between"
                        >
                            <h3 className="font-bold text-base text-zinc-100 group-hover:text-purple-400 transition-colors truncate">
                                {game.title}
                            </h3>
                            <span className="text-[10px] bg-zinc-800 text-zinc-500 font-mono px-1.5 py-0.5 rounded group-hover:text-zinc-300 transition-colors">
                                INFO ➔
                            </span>
                        </div>

                        {/* CONTENITORE DINAMICO ORIZZONTALE CON ANIMAZIONE */}
                        <div className="w-full flex items-center gap-2 overflow-hidden h-28 relative">
                            
                            {/* COPERTINA INTERA ORIZZONTALE (Scompare fluidamente all'apertura) */}
                            <div 
                                onClick={(e) => toggleExpand(e, game.id)}
                                className={`h-full bg-zinc-950 rounded border border-zinc-800 overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-500 ease-in-out relative group ${
                                    isExpanded ? "w-0 opacity-0 pointer-events-none border-transparent" : "w-full"
                                }`}
                            >
                                <img 
                                    src={game.cover} 
                                    alt="" 
                                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs bg-black/60 px-2 py-1 rounded font-bold">
                                        🎬 Mostra Screenshot
                                    </span>
                                </div>
                            </div>

                            {/* FISARMONICA DI 2 SCREENSHOT (Appare occupando lo spazio quando la cover scompare) */}
                            <div 
                                onClick={(e) => toggleExpand(e, game.id)}
                                className={`h-full grid grid-cols-2 gap-2 flex-grow transition-all duration-500 ease-in-out cursor-pointer ${
                                    isExpanded ? "w-full opacity-100 scale-100" : "w-0 opacity-0 scale-95 pointer-events-none absolute"
                                }`}
                                title="Clicca qui per tornare alla copertina"
                            >
                                <GamePreview game={game} count={1} />
                                <GamePreview game={game} count={2} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}