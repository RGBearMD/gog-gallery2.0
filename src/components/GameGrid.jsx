export default function GameGrid({ games, onSelect }) {
    // Sicurezza: rimuove eventuali record duplicati con lo stesso ID a monte
    const uniqueGames = games.filter(
        (game, index, self) => self.findIndex((g) => g.id === game.id) === index
    );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-3">       
            {uniqueGames.map((game) => (
                <div
                    id={`game-${game.id}`}
                    key={game.id}
                    onClick={() => {
                        console.log("CLICK CARD", game.id, game.title);
                        onSelect(game);
                    }}
                    className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 cursor-pointer group hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(147,51,234,0.25)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                    {/* CONTENITORE COPERTINA UNICA: Aspect ratio 3:4 protetto senza tagli */}
                    <div className="w-full aspect-[3/4] bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800/60 relative">
                        <img
                            src={game.cover}
                            alt={game.title}
                            loading="lazy"
                            className="w-full h-full object-contain transform group-hover:scale-[1.02] transition-transform duration-500"
                        />
                        
                        {/* Se esiste uno screenshot di preview, lo mostriamo solo in un piccolo badge o al passaggio del mouse se preferisci, evitiamo di duplicare sotto */}
                        {game.previewScreenshot && (
                            <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-[10px] text-purple-400 font-bold px-1.5 py-0.5 rounded border border-zinc-700/50">
                                📸 Preview
                            </span>
                        )}
                    </div>

                    {/* DETTAGLI DEL GIOCO (RIATTIVATI) */}
                    <div className="p-3 bg-zinc-900/50 flex-1 flex flex-col justify-between gap-1">
                        <h3 className="font-bold text-sm text-zinc-200 line-clamp-2 group-hover:text-white transition-colors">
                            {game.title}
                        </h3>
                        
                        {/*<div>
                            {game.playtime > 0 ? (
                                <p className="text-xs text-purple-400 font-medium">
                                    {game.playtime} ore registrate
                                </p>
                            ) : (
                                <p className="text-xs text-zinc-500 font-medium">
                                    Mai giocato
                                </p>
                            )}
                        </div>*/}
                    </div>
                </div>
            ))}
        </div>
    );
}