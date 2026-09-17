import { useState, useEffect } from "react";

// Screenshot di riserva ad alta risoluzione in caso l'API non restituisca immagini
const FALLBACK_SCREENSHOTS = [
    "https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb2.jpg",
    "https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb3.jpg",
    "https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb4.jpg",
    "https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb5.jpg"
];

export default function GameModal({ game, onClose }) {
    const [activeScreenshot, setActiveScreenshot] = useState(null);
    const [screenshots, setScreenshots] = useState(
        () => (game?.screenshots && game.screenshots.length > 0) 
            ? game.screenshots 
            : [game?.cover].filter(Boolean)
    );
    const [loadingScreenshots, setLoadingScreenshots] = useState(true);

    useEffect(() => {
        if (!game) return;

        let cancelled = false;

        async function load() {
            setLoadingScreenshots(true);
            
            // Se il gioco ha già screenshot caricati (es. dai Mock o stato globale), li usiamo
            if (game.screenshots && game.screenshots.length > 1) {
                setScreenshots(game.screenshots);
                setLoadingScreenshots(false);
                return;
            }

            try {
                const res = await fetch(
                    `/.netlify/functions/gameDetails?id=${game.id}`
                );

                const data = await res.json();

                if (!cancelled) {
                    if (data.screenshots && data.screenshots.length > 0) {
                        setScreenshots(data.screenshots.slice(0, 6));
                    } else {
                        // Fallback se l'API risponde senza screenshot
                        setScreenshots(FALLBACK_SCREENSHOTS);
                    }
                }
            } catch (e) {
                console.error("Screenshot fetch error:", e);

                if (!cancelled) {
                    // Fallback in caso di errore di rete / Netlify function
                    setScreenshots(
                        game.cover ? [game.cover, ...FALLBACK_SCREENSHOTS.slice(1)] : FALLBACK_SCREENSHOTS
                    );
                }
            } finally {
                if (!cancelled) setLoadingScreenshots(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [game]);

    if (!game) return null;

    console.log("MODAL GAME:", game.id, game.title);

    return (
        <>
            {/* OVERLAY PRINCIPALE */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            >
                <div
                    className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-xl overflow-y-auto shadow-2xl custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Pulsante chiusura */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-zinc-800 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
                    >
                        ✕
                    </button>

                    {/* HEADER GIOCO */}
                    <div className="p-6 md:p-8 relative z-10">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
                            {game.title}
                        </h2>

                        <div className="flex items-center gap-3 text-xs text-zinc-400 mb-6">
                            <span className="text-zinc-500 font-mono">ID: {game.id}</span>
                            {game.playtime !== undefined && (
                                <span className="text-purple-400 font-semibold bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded">
                                    ⏱️ {game.playtime}h giocate
                                </span>
                            )}
                        </div>

                        {/* LAYOUT: COVER + SCREENSHOT */}
                        <div className="grid md:grid-cols-[220px_1fr] gap-6">
                            {/* COVER */}
                            <div className="w-full max-w-[220px] mx-auto md:mx-0">
                                <div className="aspect-[2/3] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-700 shadow-md">
                                    <img
                                        src={game.cover}
                                        alt={game.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* SCREENSHOT GRID */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                                    {loadingScreenshots ? "Caricamento screenshot..." : `Screenshot (${screenshots.length})`}
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {screenshots.map((src, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setActiveScreenshot(src)}
                                            className="aspect-video bg-zinc-950 rounded-md overflow-hidden cursor-pointer border border-zinc-800 hover:border-purple-500 transition-all duration-300 group relative"
                                        >
                                            <img
                                                src={src}
                                                alt={`Screenshot ${index + 1}`}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />

                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                <span className="text-xs bg-black/70 px-2.5 py-1 rounded text-white font-bold backdrop-blur">
                                                    Ingrandisci 🔍
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIGHTBOX (FULLSCREEN VIEWER) */}
            {activeScreenshot && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
                    onClick={() => setActiveScreenshot(null)}
                >
                    <button 
                        onClick={() => setActiveScreenshot(null)}
                        className="absolute top-4 right-4 text-white text-xl bg-zinc-900/80 p-3 rounded-full hover:bg-zinc-800 border border-zinc-700"
                    >
                        ✕
                    </button>
                    <img
                        src={activeScreenshot}
                        alt="Screenshot Ingrandito"
                        className="max-w-full max-h-[95vh] rounded shadow-2xl object-contain animate-scale-up"
                    />
                </div>
            )}
        </>
    );
}