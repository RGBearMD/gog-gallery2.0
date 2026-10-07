import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { flushSync } from "react-dom";
import GameGrid from "./components/GameGrid";
import GameStrip from "./components/GameStrip";
import GameModal from "./components/GameModal";
import GameIndex from "./components/GameIndex";
import { scrollToGame } from "./services/scroll";
import GenreBar from "./components/GenreBar";
import SyncModal from "./components/SyncModal";
import Sentinel from "./components/Sentinel";
import Dock from "./components/Dock";
import { Icon } from "./components/Icons";
import PublicProfileHelpModal from "./components/PublicProfileHelpModal";
import { getAllGames } from "./services/gogApi";
import { normalizeSteamGame } from "./services/screenshots";
import { useGenres } from "./services/genres";

const STORE_KEY = "ygg:library:v1";
const STEP = 24; // giochi mostrati per volta (caricamento progressivo)
const SKIP_GENRES = new Set(["Violent", "Gore", "Nudity", "Sexual Content", "Early Access", "Free To Play", "Free to Play"]);
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
  const [syncMode, setSyncMode] = useState(null); // "send" | "receive" | null
  const [mock, setMock] = useState(false);
  const [limit, setLimit] = useState(STEP);
  const [genre, setGenre] = useState(null);
  const fileInputRef = useRef(null);
  const hasGames = games.length > 0;
  const genreMap = useGenres(games);

  // Giochi visibili (dopo il filtro per genere) e conteggi per i chip
  const visible = useMemo(() => (genre ? games.filter((g) => genreMap[g.id]?.includes(genre)) : games), [games, genre, genreMap]);
  const genreCounts = useMemo(() => {
    const c = {};
    games.forEach((g) => (genreMap[g.id] || []).forEach((n) => { if (!SKIP_GENRES.has(n)) c[n] = (c[n] || 0) + 1; }));
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [games, genreMap]);
  const analyzed = useMemo(() => games.filter((g) => String(g.id) in genreMap).length, [games, genreMap]);

  useEffect(() => {
    try {
      if (games.length) localStorage.setItem(STORE_KEY, JSON.stringify({ platform, games: games.map(slim) }));
      else localStorage.removeItem(STORE_KEY);
    } catch { /* quota piena o storage disabilitato */ }
  }, [games, platform]);

  function loadGames(list, plat) {
    setPlatform(plat);
    setGames(list);
    setGenre(null);
    setLimit(STEP);
  }

  const more = useCallback(() => setLimit((l) => l + STEP), []);
  const pickGenre = (name) => { setGenre(name); setLimit(STEP); window.scrollTo({ top: 0 }); };

  // Dal menu: se il gioco non è ancora stato mostrato, allargo la lista fino a lui, poi scorro.
  function jumpTo(g) {
    const i = visible.findIndex((x) => x.id === g.id);
    if (i >= limit) flushSync(() => setLimit(i + STEP));
    scrollToGame(g.id);
  }

  const pickRandomGame = () => visible.length && setSelectedGame(visible[Math.floor(Math.random() * visible.length)]);

  function downloadList() {
    const url = URL.createObjectURL(new Blob([visible.map((g) => g.title).join("\n")], { type: "text/plain" }));
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
        loadGames(list, "steam");
      } catch {
        setErrorMsg("File non valido: carica il file steam_games.json creato dallo script (vedi la guida).");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // Libreria ricevuta con un codice di trasferimento
  function receive(plat, list) {
    const games = plat === "steam" ? list.map(normalizeSteamGame).filter(Boolean) : list.map((g) => ({ ...g, platform: "GOG", screenshots: [] }));
    loadGames(dedupe(games), plat);
  }

  async function handleImport() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = mock ? mockGames : await getAllGames(username.trim());
      const list = dedupe(Array.isArray(data) ? data : []);
      if (!list.length) throw new Error("Nessun gioco trovato: controlla l'username e che la libreria GOG sia pubblica.");
      loadGames(list, "gog");
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

  const shown = visible.slice(0, limit);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line/60 bg-ink px-3">
        {hasGames && (
          <button onClick={() => setIndexOpen(true)} aria-label="Apri la lista dei giochi" className="rounded-lg p-2 text-fog hover:bg-raised"><Icon name="menu" className="size-6" /></button>
        )}
        <h1 className="flex-1 truncate font-display text-lg font-bold tracking-tight">Your Games Gallery</h1>
        {hasGames && (
          <button onClick={() => { setGames([]); setUsername(""); setGenre(null); }} className="flex items-center gap-2 rounded-lg bg-raised px-3 py-2 text-xs font-semibold hover:bg-line">
            <Icon name="swap" className="size-4" />
            <span className="hidden sm:inline">Cambia utente / piattaforma</span>
            <span className="sm:hidden">Cambia</span>
          </button>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 pb-32 pt-3 sm:px-5">
        {!hasGames ? (
          <section className="mx-auto mt-8 max-w-md text-center animate-fade-in">
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
                  <p className="px-1 text-xs text-muted">Il file si crea una sola volta da PC. Poi, sul cellulare, usa «Ho un codice».</p>
                </>
              )}
            </div>

            {errorMsg && <div role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-950/60 p-3 text-left text-xs text-red-200">{errorMsg}</div>}

            <div className="mt-5 flex flex-col items-center gap-2">
              <button onClick={() => setSyncMode("receive")} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-panel">Ho un codice da un altro dispositivo</button>
              <button onClick={() => setShowHelp(true)} className="text-sm text-spark underline-offset-4 hover:underline">
                {isGog ? "Come rendere pubblica la libreria GOG" : "Come creare steam_games.json"}
              </button>
            </div>

            {import.meta.env.DEV && (
              <div className="mt-8"><button onClick={() => setMock(!mock)} className="rounded-full border border-line px-3 py-1 text-[11px] text-muted">Mock: {mock ? "attivo" : "spento"}</button></div>
            )}
          </section>
        ) : (
          <>
            {genreCounts.length > 0 && <GenreBar counts={genreCounts} active={genre} onPick={pickGenre} done={analyzed} total={games.length} />}
            <p className="mb-4 mt-3 text-sm text-muted">
              {genre ? `${visible.length} di ${games.length} giochi · ${genre}` : `${games.length} giochi · ${platform.toUpperCase()}`}
            </p>
            {viewMode === "strip" ? <GameStrip games={shown} onSelect={setSelectedGame} /> : <GameGrid games={shown} onSelect={setSelectedGame} />}
            {visible.length > limit && <Sentinel key={limit} onMore={more} />}
            {visible.length === 0 && <p className="py-10 text-center text-sm text-muted">Nessun gioco con questo genere.</p>}
          </>
        )}
      </main>

      {hasGames && <Dock mode={viewMode} onMode={setViewMode} onList={downloadList} onRandom={pickRandomGame} />}
      <GameIndex games={visible} isOpen={indexOpen} onClose={() => setIndexOpen(false)} onPick={jumpTo} onSync={() => { setIndexOpen(false); setSyncMode("send"); }} />
      <GameModal key={selectedGame?.id} game={selectedGame} onClose={() => setSelectedGame(null)} />
      <PublicProfileHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} platform={platform} />
      {syncMode && <SyncModal mode={syncMode} platform={platform} games={games} onReceive={receive} onClose={() => setSyncMode(null)} />}
    </div>
  );
}
