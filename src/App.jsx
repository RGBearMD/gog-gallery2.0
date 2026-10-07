import { useState, useRef, useEffect } from "react";
import GameGrid from "./components/GameGrid";
import GameStrip from "./components/GameStrip";
import GameModal from "./components/GameModal";
import GameIndex from "./components/GameIndex";
import Dock from "./components/Dock";
import { Icon } from "./components/Icons";
import PublicProfileHelpModal from "./components/PublicProfileHelpModal";
import { getAllGames } from "./services/gogApi";
import { normalizeSteamGame } from "./services/screenshots";

const STORE_KEY = "ygg:library:v1";
const mockGames = [{ id: "1", title: "Gioco di prova", cover: "", playtime: 120, platform: "GOG" }]; // solo in sviluppo

const loadLibrary = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } };
const slim = (g) => { const c = { ...g }; delete c.rawGame; delete c.screenshots; return c; };
const dedupe = (list) => { const seen = new Set(); return list.filter((g) => !seen.has(g.id) && seen.add(g.id)); };

export default function App() {
  const [saved] = useState(loadLibrary);
  const [platform, setPlatform] = useState(saved.platform || "gog");
  const [games, setGames] = useState(saved.games || []);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [viewMode, setViewMode] = useState("strip");
  const [showHelp, setShowHelp] = useState(false);
  const [mock, setMock] = useState(false);
  const fileInputRef = useRef(null);
  const hasGames = games.length > 0;

  // Ricordo la libreria importata: niente nuovo upload ad ogni visita.
  useEffect(() => {
    try {
      if (games.length) localStorage.setItem(STORE_KEY, JSON.stringify({ platform, games: games.map(slim) }));
      else localStorage.removeItem(STORE_KEY);
    } catch { /* quota piena o storage disabilitato */ }
  }, [games, platform]);

  const pickRandomGame = () => hasGames && setSelectedGame(games[Math.floor(Math.random() * games.length)]);

  function downloadList() {
    const url = URL.createObjectURL(new Blob([games.map((g) => g.title).join("\n")], { type: "text/plain" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${platform}-games.txt` });
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const list = dedupe(JSON.parse(reader.result).map(normalizeSteamGame).filter(Boolean));
        if (!list.length) throw new Error("vuoto");
        setPlatform("steam");
        setGames(list);
      } catch {
        setErrorMsg("File non valido: carica il file steam_games.json creato dallo script (vedi la guida).");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleImport() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = mock ? mockGames : await getAllGames(username.trim());
      const list = dedupe(Array.isArray(data) ? data : []);
      if (!list.length) throw new Error("Nessun gioco trovato: controlla l'username e che la libreria GOG sia pubblica.");
      setGames(list);
    } catch (err) {
      setErrorMsg(err.message || "Errore durante il recupero dei dati.");
    } finally {
      setLoading(false);
    }
  }

  const isGog = platform === "gog";
  const tab = (id, label, on) => (
    <button type="button" onClick={() => { setPlatform(id); setErrorMsg(null); }}
      className={`flex-1 rounded-lg py-2 font-display text-sm font-semibold transition-colors ${platform === id ? on : "text-muted hover:text-fog"}`}>
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line/60 bg-ink/85 px-3 backdrop-blur-xl">
        {hasGames && (
          <button onClick={() => setIndexOpen(true)} aria-label="Apri la lista dei giochi" className="rounded-lg p-2 text-fog hover:bg-raised"><Icon name="menu" className="size-6" /></button>
        )}
        <h1 className="flex-1 truncate font-display text-lg font-bold tracking-tight">Your Games Gallery</h1>
        {hasGames && (
          <button onClick={() => { setGames([]); setUsername(""); }} className="flex items-center gap-2 rounded-lg bg-raised px-3 py-2 text-xs font-semibold hover:bg-line">
            <Icon name="swap" className="size-4" />
            <span className="hidden sm:inline">Cambia utente / piattaforma</span>
            <span className="sm:hidden">Cambia</span>
          </button>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 pb-32 pt-5 sm:px-5">
        {!hasGames ? (
          <section className="mx-auto mt-6 max-w-md text-center animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">La tua libreria, in galleria</h2>
            <p className="mb-6 mt-3 text-sm text-muted">Importa i tuoi giochi GOG o Steam e sfogliali con copertine e screenshot.</p>

            <div className="mb-3 flex rounded-xl border border-line/60 bg-panel p-1">
              {tab("gog", "GOG", "bg-gog text-ink")}
              {tab("steam", "Steam", "bg-steam text-ink")}
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-line/60 bg-panel p-3">
              {isGog ? (
                <>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (username || mock) && handleImport()}
                    placeholder={mock ? "Modalità mock attiva" : "Il tuo username GOG"}
                    disabled={mock}
                    className="rounded-lg border border-line/60 bg-ink p-3 text-sm outline-none placeholder:text-muted focus:border-gog"
                  />
                  <button onClick={handleImport} disabled={loading || (!username && !mock)} className="rounded-lg bg-gog py-3 text-sm font-bold text-ink transition hover:brightness-110 disabled:bg-raised disabled:text-muted">
                    {loading ? "Importazione…" : "Importa libreria GOG"}
                  </button>
                </>
              ) : (
                <>
                  <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 rounded-lg bg-steam py-3 text-sm font-bold text-ink transition hover:brightness-110">
                    <Icon name="upload" className="size-5" /> Carica steam_games.json
                  </button>
                  <p className="px-1 text-xs text-muted">Il file si crea con uno script da eseguire nel browser sulla tua libreria Steam.</p>
                </>
              )}
            </div>

            {errorMsg && <div role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-950/60 p-3 text-left text-xs text-red-200">{errorMsg}</div>}

            <button onClick={() => setShowHelp(true)} className="mt-4 text-sm text-spark underline-offset-4 hover:underline">
              {isGog ? "Come rendere pubblica la libreria GOG" : "Come creare steam_games.json"}
            </button>

            {import.meta.env.DEV && (
              <div className="mt-8"><button onClick={() => setMock(!mock)} className="rounded-full border border-line px-3 py-1 text-[11px] text-muted">Mock: {mock ? "attivo" : "spento"}</button></div>
            )}
          </section>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">{games.length} giochi · {platform.toUpperCase()}</p>
            {viewMode === "strip" ? <GameStrip games={games} onSelect={setSelectedGame} /> : <GameGrid games={games} onSelect={setSelectedGame} />}
          </>
        )}
      </main>

      {hasGames && <Dock mode={viewMode} onMode={setViewMode} onList={downloadList} onRandom={pickRandomGame} />}
      <GameIndex games={games} isOpen={indexOpen} onClose={() => setIndexOpen(false)} />
      <GameModal key={selectedGame?.id} game={selectedGame} onClose={() => setSelectedGame(null)} />
      <PublicProfileHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} platform={platform} />
    </div>
  );
}
