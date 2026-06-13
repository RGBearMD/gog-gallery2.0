import { useState, useEffect } from "react";

export default function GameModal({ game, onClose }) {
    const [activeScreenshot, setActiveScreenshot] = useState(null);
    const [screenshots, setScreenshots] = useState([]);

    useEffect(() => {
        if (!game) return;

        async function load() {
            try {
                const res = await fetch(
                    `/.netlify/functions/gameDetails?id=${game.id}`
                );

                const data = await res.json();

                setScreenshots(data.screenshots || []);
            } catch (e) {
                console.error("Screenshot error", e);
                setScreenshots([game.cover]);
            }
        }

        load();
    }, [game]);

    if (!game) return null;

    return (
        <>
            {/* OVERLAY PRINCIPALE */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-xl overflow-y-auto shadow-2xl custom-scrollbar">

                    {/* HERO BACKGROUND BANNER */}
                    <div className="relative h-64 md:h-80 w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent z-10" />
                        <img
                            src={screenshots[0]}
                            alt=""
                            className="w-full h-full object-cover blur-sm opacity-40 scale-105"
                        />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-zinc-800 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* CONTENUTO MODAL */}
                    <div className="p-6 md:p-8 -mt-32 relative z-10 flex flex-col md:flex-row gap-6">
                        {/* Cover Principale */}
                        <div className="w-48 h-72 bg-zinc-950 rounded-lg shadow-xl overflow-hidden flex-shrink-0 mx-auto md:mx-0 border border-zinc-700">
                            <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Dettagli Gioco */}
                        <div className="flex-1 text-center md:text-left pt-24 md:pt-32">
                            <h2 className="text-3xl font-black tracking-tight text-white mb-2">{game.title}</h2>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-zinc-400 mb-6">
                                <div>Ore di gioco: <span className="text-purple-400 font-semibold">{game.playtime || "0"}h</span></div>
                                <div>Ultima sessione: <span className="text-zinc-300">{game.lastSession || "Mai giocato"}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* SEZIONE SCREENSHOTS */}
                    <div className="p-6 md:p-8 border-t border-zinc-800 bg-zinc-950/50">
                        <h3 className="text-lg font-bold text-zinc-200 mb-4 tracking-wide uppercase text-xs">Gallery Screenshot</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {screenshots.map((src, index) => (
                                <div
                                    key={index}
                                    onClick={() => setActiveScreenshot(src)}
                                    className="aspect-video bg-zinc-900 rounded-md overflow-hidden cursor-pointer border border-zinc-800 hover:border-purple-500 transition-all duration-300 group relative"
                                >
                                    <img
                                        src={src}
                                        alt={`Screenshot ${index + 1}`}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <span className="text-xs bg-black/60 px-2 py-1 rounded text-white">Ingrandisci 🔍</span>
                                    </div>
                                </div>
                            ))}
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
                    <button className="absolute top-4 right-4 text-white text-xl bg-zinc-900/80 p-3 rounded-full hover:bg-zinc-800">
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