import { useState, useEffect } from "react";
import GameGrid from "./components/GameGrid";
import { getAllGames } from "./services/gogApi";
import GameModal from "./components/GameModal";
import GameIndex from "./components/GameIndex";
import GameStrip from "./components/GameStrip";
import PublicProfileHelpModal from "./components/PublicProfileHelpModal";

const mockGames = [
  { id: "1", title: "Cyberpunk Mock", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg", playtime: 120, screenshots: ["https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb2.jpg"] },
  { id: "2", title: "Witcher Mock", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg", playtime: 84 },
  { id: "3", title: "Deus Ex Mock", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r77.jpg", playtime: 12 },
  { id: "4", title: "Hades Mock", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2g7a.jpg", playtime: 45 },
];

function App() {
  const [username, setUsername] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isMobileIndexOpen, setIsMobileIndexOpen] = useState(false);
  const [DEV_MOCK, setDEV_MOCK] = useState(false);
  const [viewMode, setViewMode] = useState("strip");
  const [showHelp, setShowHelp] = useState(false);

  const hasGames = games.length > 0;

  useEffect(() => {
    console.log("GAMES STATUS UPDATED:", games);
  }, [games]);

  function pickRandomGame() {
    if (!games.length) return;
    const random = games[Math.floor(Math.random() * games.length)];
    setSelectedGame(random);
  }

  function downloadList() {
    const text = games.map((g) => g.title).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gog-games.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    setLoading(true);
    try {
      const data = DEV_MOCK ? mockGames : await getAllGames(username);
      const cleanData = Array.isArray(data) ? data : [];
      
      /* BONIFICA DI SICUREZZA: Rimuove duplicati basandosi sull'id prima di salvare lo stato */
      const uniqueData = cleanData.filter(
        (game, index, self) => self.findIndex((g) => g.id === game.id) === index
      );

      setGames(uniqueData);
    } catch (e) {
      console.error("IMPORT ERROR:", e);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col font-sans">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-4">
        {/* Titolo e Toggle Mock di Debug */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
            GOG Gallery
          </h1>
          {!hasGames && (
            <button 
              onClick={() => setDEV_MOCK(!DEV_MOCK)} 
              className={`text-xs px-2 py-1 rounded font-mono transition-colors ${DEV_MOCK ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-500"}`}
            >
              Mock Mode: {DEV_MOCK ? "ON" : "OFF"}
            </button>
          )}
        </div>

        {/* Barra controlli condizionale */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hamburger visibile su mobile se ci sono giochi */}
          {hasGames && (
            <button
              onClick={() => setIsMobileIndexOpen(true)}
              className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 transition md:hidden"
            >
              ☰
            </button>
          )}

          <button
            onClick={() => setViewMode("strip")}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === "strip" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Strip
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === "grid" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Cards
          </button>

          {hasGames && (
            <>
              <button
                onClick={downloadList}
                className="bg-zinc-800 hover:bg-zinc-700 text-sm font-bold px-3 py-1.5 rounded transition"
              >
                📥 Lista
              </button>

              <button
                onClick={pickRandomGame}
                className="bg-purple-600 hover:bg-purple-700 text-sm font-bold px-3 py-1.5 rounded transition"
                title="Scegli un gioco casuale"
              >
                🎲 Casual
              </button>
            </>
          )}
        </div>
      </header>

      {/* CORE WRAPPER */}
      <div className="flex flex-1 relative">
        
        {/* SIDEBAR COMPONENT */}
        <GameIndex
          games={games}
          onSelect={setSelectedGame}
          isOpen={isMobileIndexOpen}
          onClose={() => setIsMobileIndexOpen(false)}
        />

        {/* MAIN CONTENUTI GRIGLIA */}
        <main className="flex-1 p-4 max-w-[1600px] mx-auto w-full">
          {!hasGames ? (
            /* Schermata di Benvenuto / Import */
            <div className="text-center py-24 max-w-xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
                Crea la tua galleria personale
              </h2>
              <p className="text-zinc-400 mb-8 text-sm md:text-base">
                Importa istantaneamente la tua libreria digitale GOG e sfoglia i tuoi titoli con una UX da gaming moderna.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800 shadow-xl">
                <input
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleImport();
                  }}
                  className="flex-1 p-3 rounded-lg bg-zinc-900 text-white placeholder-zinc-500 border border-transparent focus:border-zinc-700 outline-none text-sm transition"
                  placeholder={DEV_MOCK ? "Modalità Mock attiva, clicca Importa" : "Inserisci username GOG"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={DEV_MOCK}
                />
                <button
                  onClick={handleImport}
                  disabled={loading || (!username && !DEV_MOCK)}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-600/10 active:scale-[0.98]"
                >
                  {loading ? "Importazione..." : "Importa"}
                </button>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowHelp(true)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Come rendere pubblico il profilo GOG →
                </button>
              </div>
            </div>
          ) : (
            /* Visualizzazione selettiva dei Giochi */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-xl font-bold tracking-tight text-zinc-200">
                  {viewMode === "strip" ? "Tabella Dettagliata" : "Galleria Copertine"}
                </h2>
                <span className="text-xs font-mono px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                  {games.length} elementi
                </span>
              </div>
              
              {viewMode === "strip" ? (
                <GameStrip games={games} onSelect={setSelectedGame} />
              ) : (
                <GameGrid games={games} onSelect={setSelectedGame} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DETTAGLI E HELP */}
      <GameModal
        key={selectedGame?.id}
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />

      <PublicProfileHelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}

export default App;