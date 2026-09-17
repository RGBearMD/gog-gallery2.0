import { useState, useEffect } from "react";

export default function GameStrip({ games, onSelect }) {
  const [expandedGameId, setExpandedGameId] = useState(null);
  const [activeLightbox, setActiveLightbox] = useState(null); // { screenshots: [], index: 0 }

  const toggleExpand = (e, gameId) => {
    e.stopPropagation();
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  const openLightbox = (e, screenshots, index) => {
    e.stopPropagation();
    if (!screenshots || screenshots.length === 0) return;
    setActiveLightbox({ screenshots, index });
  };

  const closeLightbox = () => setActiveLightbox(null);

  const prevImage = (e) => {
    e?.stopPropagation();
    if (!activeLightbox) return;
    setActiveLightbox((prev) => ({
      ...prev,
      index: (prev.index - 1 + prev.screenshots.length) % prev.screenshots.length,
    }));
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    if (!activeLightbox) return;
    setActiveLightbox((prev) => ({
      ...prev,
      index: (prev.index + 1) % prev.screenshots.length,
    }));
  };

  // Navigazione tramite frecce della tastiera
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeLightbox) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightbox]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {games.map((game) => {
        const isExpanded = expandedGameId === game.id;
        const screenshots = game.screenshots || [];
        // Se non ci sono screenshot, usiamo la copertina come ripiego per riempire i 4 slot
        const displayScreenshots = Array.from({ length: 4 }, (_, i) => screenshots[i] || game.cover);

        return (
          <div
            id={`game-${game.id}`}
            key={game.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 transition-all flex flex-col gap-2 hover:border-zinc-700"
          >
            {/* INTESTAZIONE SCHEDA */}
            <div
              onClick={() => onSelect(game)}
              className="cursor-pointer group flex items-center justify-between"
            >
              <h3 className="font-bold text-sm md:text-base text-zinc-100 group-hover:text-purple-400 transition-colors truncate">
                {game.title}
              </h3>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded group-hover:text-zinc-200 transition-colors">
                INFO ➔
              </span>
            </div>

            {/* CONTENITORE FISARMONICA */}
            <div className="w-full flex items-center gap-2 overflow-hidden h-36 relative">
              {/* COPERTINA COMPLETA */}
              <div
                onClick={(e) => toggleExpand(e, game.id)}
                className={`h-full bg-zinc-950 rounded border border-zinc-800 overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-500 ease-in-out relative group ${
                  isExpanded ? "w-0 opacity-0 pointer-events-none border-transparent" : "w-full"
                }`}
              >
                <img
                  src={game.cover}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs bg-black/70 backdrop-blur px-3 py-1.5 rounded-full font-bold border border-zinc-700">
                    🎬 Mostra 4 Screenshot
                  </span>
                </div>
              </div>

              {/* GRIGLIA 4 SCREENSHOT */}
              <div
                className={`h-full grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-grow transition-all duration-500 ease-in-out ${
                  isExpanded
                    ? "w-full opacity-100 scale-100"
                    : "w-0 opacity-0 scale-95 pointer-events-none absolute"
                }`}
              >
                {displayScreenshots.map((src, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => openLightbox(e, displayScreenshots, idx)}
                    className="relative h-full bg-zinc-950 rounded border border-zinc-800 overflow-hidden cursor-pointer group/shot"
                  >
                    <img
                      src={src}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover/shot:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover/shot:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] bg-black/80 text-white font-bold px-1.5 py-0.5 rounded">
                        🔍 Espandi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* LIGHTBOX / MODAL SCREENSHOT INGRANDITO */}
      {activeLightbox && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fade-in"
        >
          {/* CONTENITORE IMMAGINE E FRECCE */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
          >
            {/* FRECCIA SINISTRA */}
            <button
              onClick={prevImage}
              className="absolute left-2 z-10 bg-zinc-900/80 hover:bg-purple-600 text-white p-3 rounded-full border border-zinc-700 transition-all transform -translate-y-1/2 top-1/2 shadow-lg"
              title="Precedente"
            >
              ◀
            </button>

            {/* IMMAGINE PRINCIPALE */}
            <img
              src={activeLightbox.screenshots[activeLightbox.index]}
              alt="Screenshot ingrandito"
              className="max-w-full max-h-[80vh] object-contain rounded-lg border border-zinc-800 shadow-2xl"
            />

            {/* FRECCIA DESTRA */}
            <button
              onClick={nextImage}
              className="absolute right-2 z-10 bg-zinc-900/80 hover:bg-purple-600 text-white p-3 rounded-full border border-zinc-700 transition-all transform -translate-y-1/2 top-1/2 shadow-lg"
              title="Successivo"
            >
              ▶
            </button>

            {/* PULSANTE CHIUDI */}
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-zinc-400 hover:text-white font-bold text-sm bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700"
            >
              ✕ Chiudi
            </button>

            {/* INDICATORE CONTEGGIO */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              {activeLightbox.index + 1} / {activeLightbox.screenshots.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}