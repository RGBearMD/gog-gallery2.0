import { useState, useRef } from "react";
import GameGrid from "./components/GameGrid";
import { getAllGames } from "./services/gogApi";
import GameModal from "./components/GameModal";
import GameIndex from "./components/GameIndex";
import GameStrip from "./components/GameStrip";
import PublicProfileHelpModal from "./components/PublicProfileHelpModal";

const mockGames = [
  {
    id: "1",
    title: "Cyberpunk 2077",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg",
    playtime: 120,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb2.jpg",
      "https://images.igdb.com/igdb/image/upload/t_1080p/sc7xb3.jpg",
    ],
  },
  // ... (altri mock games)
];

function App() {
  const [platform, setPlatform] = useState("gog");
  const [username, setUsername] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isMobileIndexOpen, setIsMobileIndexOpen] = useState(false);
  const [DEV_MOCK, setDEV_MOCK] = useState(false);
  const [viewMode, setViewMode] = useState("strip");
  const [showHelp, setShowHelp] = useState(false);
  
  // Riferimento per l'input file nascosto
  const fileInputRef = useRef(null);

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
    a.download = `${platform}-games.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ★ NUOVO: Gestione upload file JSON
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedGames = JSON.parse(e.target.result);
        if (!Array.isArray(parsedGames) || parsedGames.length === 0) {
          throw new Error("Il file JSON non contiene una lista di giochi valida.");
        }
        
        // Rimuovi duplicati
        const uniqueData = parsedGames.filter(
          (game, index, self) => self.findIndex((g) => g.id === game.id) === index
        );
        
        setGames(uniqueData);
        setLoading(false);
        console.log(`✅ Importati ${uniqueData.length} giochi da JSON.`);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        setErrorMsg("Errore nella lettura del file JSON. Assicurati che sia valido.");
        setLoading(false);
      }
    };
    reader.readAsText(file);
    // Reset input per permettere di ricaricare lo stesso file se necessario
    event.target.value = null;
  };

  // ★ NUOVO: Fetch screenshot on-demand (Lazy Loading)
// All'interno di function App() in src/App.jsx

  const handleGameSelect = async (game) => {
  // 1. Mostra subito il modal con i dati base (cover, titolo, ecc.)
  setSelectedGame(game);

  // 2. Lazy loading degli screenshot: solo se mancano E abbiamo un appId valido
  if ((!game.screenshots || game.screenshots.length === 0) && game.appId) {
    try {
      const res = await fetch(`/.netlify/functions/fetchSteamDetails?appId=${game.appId}`);
      
      // ★ Controllo di robustezza sulla risposta della Netlify Function
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La Netlify Function ha restituito un formato non valido.");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore nel recupero dettagli Steam.");
      }

      const appData = data[game.appId];
      
      // 3. Estrai e limita gli screenshot (Max 9 per info/modal)
      if (appData?.success && appData.data?.screenshots) {
        const newScreenshots = appData.data.screenshots
          .slice(0, 9) // ★ Limite massimo 9 screenshot per performance e layout
          .map((s) => s.path_full);

        // Aggiorna immediatamente il gioco selezionato (il Modal si aggiornerà in tempo reale)
        setSelectedGame((prev) => ({ ...prev, screenshots: newScreenshots }));

        // Aggiorna l'array principale in background: i click successivi su questo gioco saranno istantanei
        setGames((prevGames) =>
          prevGames.map((g) =>
            g.id === game.id ? { ...g, screenshots: newScreenshots } : g
          )
        );
      }
    } catch (err) {
      // Fail-silently: non bloccare l'UX se gli screenshot non si caricano
      console.warn(`Impossibile recuperare screenshot per: ${game.title}`, err);
    }
  }
};

  async function handleImport() {
    setLoading(true);
    setErrorMsg(null);
    try {
      let data = [];
      if (DEV_MOCK) {
        data = mockGames;
      } else if (platform === "steam") {
        // Fallback al vecchio metodo se l'utente insiste a usare l'input testuale
        const res = await fetch(`/.netlify/functions/fetchSteamGames?user=${encodeURIComponent(username)}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("La Netlify Function ha restituito un formato non valido.");
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Errore durante l'importazione da Steam.");
        data = json.games || [];
      } else {
        data = await getAllGames(username);
      }
      
      const uniqueData = Array.isArray(data) ? data.filter(
        (game, index, self) => self.findIndex((g) => g.id === game.id) === index
      ) : [];
      
      setGames(uniqueData);
    } catch (e) {
      console.error("IMPORT ERROR:", e);
      setErrorMsg(e.message || "Errore durante il recupero dei dati.");
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col font-sans relative pb-12">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex flex-col gap-2">
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
            GOG & Steam Gallery
          </h1>
        </div>
        {hasGames && (
          <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto pb-1 no-scrollbar animate-fade-in">
            <button onClick={() => setViewMode("strip")} className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors flex-1 text-center ${viewMode === "strip" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>☰ Strip</button>
            <button onClick={() => setViewMode("grid")} className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors flex-1 text-center ${viewMode === "grid" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>⚃ Cards</button>
            <button onClick={downloadList} className="bg-zinc-800 hover:bg-zinc-700 text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap transition">📥 Lista</button>
            <button onClick={pickRandomGame} className="bg-purple-600 hover:bg-purple-700 text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap transition">🎲 Casual</button>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 relative">
        <GameIndex games={games} onSelect={handleGameSelect} isOpen={isMobileIndexOpen} onClose={() => setIsMobileIndexOpen(false)} />
        <main className="flex-1 p-4 flex flex-col justify-center max-w-[1600px] mx-auto w-full">
          {!hasGames ? (
            <div className="text-center py-6 my-auto max-w-xl mx-auto w-full px-2 animate-fade-in">
              <h2 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight text-zinc-100">Crea la tua galleria personale</h2>
              <p className="text-zinc-400 mb-6 text-xs md:text-sm leading-relaxed">
                Importa istantaneamente la tua libreria digitale e sfoglia i tuoi titoli con una UX da gaming moderna.
              </p>

              {/* SELETTORE TAB PIATTAFORMA */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-3 max-w-md mx-auto">
                <button type="button" onClick={() => { setPlatform("gog"); setUsername(""); setErrorMsg(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${platform === "gog" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-200"}`}>
                  <span className="w-2 h-2 rounded-full bg-purple-300"></span> GOG
                </button>
                <button type="button" onClick={() => { setPlatform("steam"); setUsername(""); setErrorMsg(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${platform === "steam" ? "bg-sky-600 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-200"}`}>
                  <span className="w-2 h-2 rounded-full bg-sky-300"></span> STEAM
                </button>
              </div>

              {/* FORM DI IMPORTAZIONE */}
              <div className="flex flex-col gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800 shadow-xl">
                
                {/* ★ SEZIONE STEAM: Upload JSON o Input Classico */}
                {platform === "steam" && !DEV_MOCK && (
                  <div className="flex flex-col gap-2 mb-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 rounded-lg bg-sky-600/20 border border-sky-500/50 text-sky-300 text-xs font-bold hover:bg-sky-600/30 transition flex items-center justify-center gap-2"
                    >
                      📂 Carica file `steam_games.json` (Consigliato)
                    </button>
                    <div className="text-[10px] text-zinc-500 text-left px-1">
                      Oppure usa il metodo classico (richiede profilo pubblico):
                   3
                    </div>
                  </div>
                )}

                <input
                  onKeyDown={(e) => { if (e.key === "Enter" && (username || DEV_MOCK)) handleImport(); }}
                  className="flex-1 p-3 rounded-lg bg-zinc-900 text-white placeholder-zinc-500 border border-transparent focus:border-zinc-700 outline-none text-sm transition"
                  placeholder={DEV_MOCK ? `Modalità Mock attiva` : platform === "steam" ? "Username Steam (metodo classico)..." : "Inserisci il tuo username GOG..."}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={DEV_MOCK}
                />
                
                <button
                  onClick={handleImport}
                  disabled={loading || (!username && !DEV_MOCK)}
                  className={`px-6 py-3 rounded-lg font-bold text-sm transition-all disabled:bg-zinc-800 disabled:text-zinc-600 ${platform === "gog" ? "bg-purple-600 hover:bg-purple-500" : "bg-sky-600 hover:bg-sky-500"}`}
                >
                  {loading ? "Importazione..." : `Importa Libreria ${platform.toUpperCase()}`}
                </button>
              </div>

              {errorMsg && (
                <div className="mt-3 p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-300 text-left">⚠️ {errorMsg}</div>
              )}
              <div className="mt-4">
                <button type="button" onClick={() => setShowHelp(true)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  Come esportare/importare i giochi {platform.toUpperCase()} →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full h-full justify-start my-0">
              <div className="border-b border-zinc-800 pb-2 flex justify-between items-center">
                <h2 className="text-xs font-medium tracking-wide text-zinc-400">
                  Nella tua libreria ci sono {games.length} giochi ({platform.toUpperCase()})
                </h2>
                <button onClick={() => setGames([])} className="text-[11px] text-zinc-500 hover:text-zinc-300 underline">Cambia utente / piattaforma</button>
              </div>
              {viewMode === "strip" ? (
                <GameStrip games={games} onSelect={handleGameSelect} />
              ) : (
                <GameGrid games={games} onSelect={handleGameSelect} />
              )}
            </div>
          )}
        </main>
      </div>

      {!hasGames && (
        <footer className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
          <button onClick={() => setDEV_MOCK(!DEV_MOCK)} className={`text-[11px] px-3 py-1 rounded-full font-mono font-bold tracking-wider border transition-all ${DEV_MOCK ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60" : "bg-zinc-950/80 text-zinc-500 border-zinc-800"}`}>
            ⚙️ Sviluppo - Mock Mode: {DEV_MOCK ? "ATTIVO" : "DISATTIVATO"}
          </button>
        </footer>
      )}
      <GameModal key={selectedGame?.id} game={selectedGame} onClose={() => setSelectedGame(null)} />
      <PublicProfileHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} platform={platform} />
    </div>
  );
}

export default App;