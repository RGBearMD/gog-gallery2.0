import { useState, useEffect } from "react";
import GameGrid from "./components/GameGrid";
import { getAllGames } from "./services/gogApi";
import GameModal from "./components/GameModal";
import GameIndex from "./components/GameIndex";
import GameStrip from "./components/GameStrip";
import PublicProfileHelpModal from "./components/PublicProfileHelpModal";

const mockGames = [
  { id: "1", title: "Cyberpunk Mock", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg", playtime: 120, screenshots: ["https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb2.jpg", "https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb3.jpg"] },
  { id: "2", title: "Witcher Mock", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg", playtime: 84, screenshots: ["https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb2.jpg", "https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb3.jpg"] },
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
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col font-sans relative pb-12">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex flex-col gap-2">
        {/* Titolo in cima */}
        <div className="flex items-center gap-3">
          {hasGames && (
            <button
              onClick={() => setIsMobileIndexOpen(true)}
              className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 transition md:hidden text-xs"
            >
              ☰
            </button>
          )}
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
            GOG Gallery
          </h1>
        </div>

        {/* CONTROLLI COMPATTI SU UNA RIGA SOLA */}
        {hasGames && (
          <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto pb-1 no-scrollbar animate-fade-in">
            <button
              onClick={() => setViewMode("strip")}
              className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors flex-1 text-center ${
                viewMode === "strip" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              ☰ Strip
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors flex-1 text-center ${
                viewMode === "grid" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              ⚃ Cards
            </button>

            <button
              onClick={downloadList}
              className="bg-zinc-800 hover:bg-zinc-700 text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap transition"
              title="Scarica Lista"
            >
              📥 Lista
            </button>

            <button
              onClick={pickRandomGame}
              className="bg-purple-600 hover:bg-purple-700 text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap transition"
              title="Gioco Casuale"
            >
              🎲 Casual
            </button>
          </div>
        )}
      </header>

      {/* CORE WRAPPER */}
      <div className="flex flex-1 relative">
        <GameIndex
          games={games}
          onSelect={setSelectedGame}
          isOpen={isMobileIndexOpen}
          onClose={() => setIsMobileIndexOpen(false)}
        />

        <main className="flex-1 p-4 flex flex-col justify-center max-w-[1600px] mx-auto w-full">
          {!hasGames ? (
            <div className="text-center py-6 my-auto max-w-xl mx-auto w-full px-2 animate-fade-in">
              <h2 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight text-zinc-100">
                Crea la tua galleria personale
              </h2>
              <p className="text-zinc-400 mb-6 text-xs md:text-sm leading-relaxed">
                Importa istantaneamente la tua libreria digitale GOG e sfoglia i tuoi titoli con una UX da gaming moderna.
              </p>

              <div className="flex flex-col gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800 shadow-xl">
                <input
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (username || DEV_MOCK)) handleImport();
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
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 px-6 py-3 rounded-lg font-bold text-sm transition-all"
                >
                  {loading ? "Importazione..." : "Importa"}
                </button>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowHelp(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Come rendere pubblico il profilo GOG →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full h-full justify-start my-0">
              <div className="border-b border-zinc-800 pb-2">
                <h2 className="text-xs font-medium tracking-wide text-zinc-400">
                  Nella tua libreria ci sono {games.length} giochi
                </h2>
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

      {!hasGames && (
        <footer className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
          <button 
            onClick={() => setDEV_MOCK(!DEV_MOCK)} 
            className={`text-[11px] px-3 py-1 rounded-full font-mono font-bold tracking-wider border transition-all ${
              DEV_MOCK ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60" : "bg-zinc-950/80 text-zinc-500 border-zinc-800"
            }`}
          >
            ⚙️ Sviluppo - Mock Mode: {DEV_MOCK ? "ATTIVO" : "DISATTIVATO"}
          </button>
        </footer>
      )}

      <GameModal key={selectedGame?.id} game={selectedGame} onClose={() => setSelectedGame(null)} />
      <PublicProfileHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default App;