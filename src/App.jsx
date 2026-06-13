import { useState } from "react";
import GameGrid from "./components/GameGrid";
import { getAllGames } from "./services/gogApi";
import GameModal from "./components/GameModal";
import GameIndex from "./components/GameIndex";
import { useEffect } from "react";

const [viewMode, setViewMode] = useState("strip");

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

  {/* attiva disattiva mockup */ }
  const hasGames = games.length > 0;

  useEffect(() => {
    console.log("GAMES:", games);
  }, [games]);

  useEffect(() => {
  if (games.length) {
    console.log("FIRST GAME:", games[0]);
  }
}, [games]);

  function pickRandomGame() {
    if (!games.length) return;
    const random = games[Math.floor(Math.random() * games.length)];
    setSelectedGame(random);
  }

  async function handleImport() {
    setLoading(true);

    try {
      const data = DEV_MOCK
        ? mockGames
        : await getAllGames(username);

      setGames(Array.isArray(data) ? data : []);
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
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger per Mobile */}
          (
            <button
              onClick={() => setIsMobileIndexOpen(true)}
              className="md:hidden p-2 bg-zinc-800 rounded hover:bg-zinc-700 transition"
            >
              ☰
            </button>
          )
          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
            GOG Gallery
          </h1>
        </div>

        {/* Bottone Random rapido se ci sono giochi */}
        {hasGames && (
          <button
            onClick={pickRandomGame}
            className="bg-purple-600 hover:bg-purple-700 text-xs md:text-sm font-bold px-4 py-2 rounded-full transition shadow-lg shadow-purple-600/20 flex items-center gap-1.5"
          >
            🎲 <span className="hidden sm:inline">Gioco Casuale</span>
          </button>
        )}
      </header>

      {/* CORE WRAPPER (Layout a colonne affiancate) */}
      <div className="flex flex-1 relative">

        {/* SIDEBAR COMPONENT (Gestisce internamente desktop e mobile) */}
        <GameIndex
          games={games}
          onSelect={setSelectedGame}
          isOpen={isMobileIndexOpen}
          onClose={() => setIsMobileIndexOpen(false)}
        />

        {/* MAIN CONTENUTI GRIGLIA */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">

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
      if (e.key === "Enter") {
        handleImport();
      }
    }}
                  className="flex-1 p-3 rounded-lg bg-zinc-900 text-white placeholder-zinc-500 border border-transparent focus:border-zinc-700 outline-none text-sm transition"
                  placeholder="Inserisci username GOG"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-600/10 active:scale-[0.98]"
                >
                  {loading ? "Importazione..." : "Importa"}
                </button>
              </div>
            </div>
          ) : (
            /* Griglia Giochi Attiva */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-xl font-bold tracking-tight text-zinc-200">Tutti i Giochi</h2>
                <span className="text-xs font-mono px-2 py-1 bg-zinc-800 rounded text-zinc-400">{games.length} elementi</span>
              </div>
              <GameGrid games={games} onSelect={setSelectedGame} />
            </div>
          )}
        </main>
      </div>

      {/* MODAL DETTAGLI */}
      <GameModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </div>
  );
}

export default App;