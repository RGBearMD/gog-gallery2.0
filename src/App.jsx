import { useState, useRef, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import GameGrid from "./components/GameGrid";
import GameStrip from "./components/GameStrip";
import GameModal from "./components/GameModal";
import GameIndex from "./components/GameIndex";
import FilterSheet from "./components/FilterSheet";
import LibrarySwitch from "./components/LibrarySwitch";
import Timeline from "./components/Timeline";
import About from "./components/About";
import KofiButton from "./components/KofiButton";
import LangToggle from "./components/LangToggle";
import Dice from "./components/Dice";
import NoticeBar from "./components/NoticeBar";
import Sentinel from "./components/Sentinel";
import Dock from "./components/Dock";
import Privacy from "./components/Privacy";
import { Icon } from "./components/Icons";
import PublicProfileHelpModal from "./components/PublicProfileHelpModal";
import { getAllGames } from "./services/gogApi";
import { normalizeSteamGame, isEpicOnly } from "./services/gameData";
import { fetchSteamProfile } from "./services/steamProfile";
import { i18nError } from "./services/errors";
import { parseEpicFile, matchEpicTitles, buildEpicGames } from "./services/epicImport";
import { normalizeTitle } from "./services/titles";
import { scrollToGame } from "./services/scroll";
import { useMeta } from "./services/meta";
import { useInstallPrompt } from "./services/install";
import { useI18n } from "./i18n/context";
import { PRIVACY } from "./privacyConfig";

const ACC_KEY = "ygg:accounts:v1"; // { last, gog: {id, games, savedAt, source}, steam: {...}, epic: {...} }
const OLD_KEY = "ygg:library:v1";  // formato precedente (una sola libreria): viene migrato
const STEP = 24; // giochi mostrati per volta (caricamento progressivo)
const EMPTY = [];
const PLATFORMS = ["gog", "steam", "epic"];
const NAME = { gog: "GOG", steam: "Steam", epic: "Epic" };
const DOT = { gog: "bg-gog", steam: "bg-steam", epic: "bg-epic" };
const TAB_ON = { gog: "bg-gog text-ink", steam: "bg-steam text-ink", epic: "bg-epic text-ink" };
const SKIP_GENRES = new Set(["Violent", "Gore", "Nudity", "Sexual Content", "Early Access", "Free To Play", "Free to Play"]);
const MAX_FILE = 5 * 1024 * 1024;

function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(ACC_KEY));
    if (s && typeof s === "object") return s;
  } catch { /* storage non leggibile */ }
  try {
    const old = JSON.parse(localStorage.getItem(OLD_KEY));
    if (old?.games?.length) {
      const plat = old.platform === "steam" ? "steam" : "gog";
      return { last: plat, [plat]: { id: null, games: old.games, savedAt: Date.now(), source: "migrated" } };
    }
  } catch { /* niente da migrare */ }
  return {};
}
const slim = (g) => { const c = { ...g }; delete c.rawGame; delete c.screenshots; return c; };
const dedupe = (list) => { const seen = new Set(); return list.filter((g) => !seen.has(g.id) && seen.add(g.id)); };
const subscribeHash = (cb) => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); };
const getHash = () => window.location.hash;
const accountLabel = (p, a) => (p === "gog" ? `GOG${a.id ? ` · ${a.id}` : ""}` : p === "epic" ? "Epic Games" : `Steam${a.source === "profile" && a.id ? ` · ${a.id}` : ""}`);
const canRefresh = (p, a) => (p === "gog" ? !!a.id : p === "steam" ? a.source === "profile" && !!a.id : false);

export default function App() {
  const { t, locale } = useI18n();
  const [store, setStore] = useState(loadStore);
  const [inLibrary, setInLibrary] = useState(() => !!store[store.last]?.games?.length); // l'app si riapre sull'ultima libreria
  const [tab, setTab] = useState(store.last || "gog");
  const [username, setUsername] = useState(store.gog?.id || "");
  const [steamProfile, setSteamProfile] = useState(store.steam?.source === "profile" ? store.steam.id || "" : "");
  const [loading, setLoading] = useState(false);
  const [epicProgress, setEpicProgress] = useState(null);
  const [error, setError] = useState(null); // { key } (tradotto) oppure { text }
  const [selectedGame, setSelectedGame] = useState(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [viewMode, setViewMode] = useState("strip");
  const [showHelp, setShowHelp] = useState(false);
  const [limit, setLimit] = useState(STEP);
  const [genre, setGenre] = useState(null);
  const [dupOnly, setDupOnly] = useState(false);
  const [roll, setRoll] = useState(null); // gioco scelto dal dado mentre il dado gira
  const epicInput = useRef(null);

  const libPlatform = store.last;
  const rawGames = (inLibrary && store[libPlatform]?.games) || EMPTY;
  // Ordine alfabetico (ignora maiuscole, accenti, punteggiatura e «The» iniziale; numeri in ordine naturale)
  const games = useMemo(() => {
    if (rawGames === EMPTY) return EMPTY;
    const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true, ignorePunctuation: true });
    const key = (g) => g.title.replace(/^the\s+/i, "");
    return [...rawGames].sort((a, b) => collator.compare(key(a), key(b)));
  }, [rawGames, locale]);
  const hasGames = games.length > 0;
  const saved = PLATFORMS.filter((p) => store[p]);
  const metaGames = useMemo(() => games.filter((g) => !isEpicOnly(g)), [games]); // i giochi solo-Epic non hanno dati da leggere
  const meta = useMeta(metaGames);
  const hash = useSyncExternalStore(subscribeHash, getHash);
  const { canInstall, install } = useInstallPrompt();

  // Giochi presenti anche in un'altra libreria salvata (confronto per titolo, sul dispositivo)
  const dupOf = useMemo(() => {
    const result = new Map();
    const others = PLATFORMS.filter((p) => p !== libPlatform && store[p]);
    if (!others.length) return result;
    const keys = Object.fromEntries(others.map((p) => [p, new Set(store[p].games.map((g) => normalizeTitle(g.title)))]));
    for (const g of games) {
      const k = normalizeTitle(g.title);
      const where = others.filter((p) => k && keys[p].has(k)).map((p) => NAME[p]);
      if (where.length) result.set(g.id, where);
    }
    return result;
  }, [games, store, libPlatform]);

  // Giochi visibili (dopo i filtri per genere e «giochi doppi») e conteggi per il pannello «Filtra»
  const visible = useMemo(
    () => games.filter((g) => (!genre || meta[g.id]?.g?.includes(genre)) && (!dupOnly || dupOf.has(g.id))),
    [games, genre, dupOnly, meta, dupOf]
  );
  const genreCounts = useMemo(() => {
    const c = {};
    games.forEach((g) => (meta[g.id]?.g || []).forEach((n) => { if (!SKIP_GENRES.has(n)) c[n] = (c[n] || 0) + 1; }));
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [games, meta]);
  const analyzed = useMemo(() => metaGames.filter((g) => String(g.id) in meta).length, [metaGames, meta]);

  // Le librerie restano salvate sul dispositivo (anche per l'app installata); chiedo al browser di non cancellarle.
  useEffect(() => {
    try {
      const out = { last: store.last };
      for (const p of PLATFORMS) if (store[p]) out[p] = { ...store[p], games: store[p].games.map(slim) };
      if (PLATFORMS.some((p) => out[p])) {
        localStorage.setItem(ACC_KEY, JSON.stringify(out));
        navigator.storage?.persist?.().catch(() => {});
      } else localStorage.removeItem(ACC_KEY);
      localStorage.removeItem(OLD_KEY);
    } catch { /* quota piena o storage disabilitato */ }
  }, [store]);

  // Dado: gira circa un secondo (anche con «riduci animazioni»: è la risposta a un tocco), poi si apre il gioco scelto
  useEffect(() => {
    if (!roll) return;
    const id = setTimeout(() => { setSelectedGame(roll); setRoll(null); }, 1000);
    return () => clearTimeout(id);
  }, [roll]);

  function show(plat) {
    setStore((s) => ({ ...s, last: plat }));
    setInLibrary(true);
    setGenre(null);
    setDupOnly(false);
    setLimit(STEP);
    setSelectedGame(null);
    setError(null);
    setSwitchOpen(false);
    window.scrollTo({ top: 0 });
  }
  function openAccount(plat, entry) {
    setStore((s) => ({ ...s, last: plat, [plat]: entry }));
    show(plat);
  }
  function forget(plat) {
    if (!window.confirm(t("libs.confirmDelete"))) return;
    setStore((s) => {
      const n = { ...s };
      delete n[plat];
      n.last = PLATFORMS.find((p) => n[p]);
      return n;
    });
  }
  function goHome() {
    setInLibrary(false);
    setGenre(null);
    setDupOnly(false);
    setIndexOpen(false);
    setSwitchOpen(false);
    setTab(libPlatform || tab);
    window.scrollTo({ top: 0 });
  }

  const more = useCallback(() => setLimit((l) => l + STEP), []);
  const pickGenre = (name) => { setGenre(name); setLimit(STEP); setFilterOpen(false); window.scrollTo({ top: 0 }); };
  const toggleDup = () => { setDupOnly((d) => !d); setLimit(STEP); setFilterOpen(false); window.scrollTo({ top: 0 }); };

  // Dal menu: se il gioco non è ancora stato mostrato, allargo la lista fino a lui, poi scorro.
  function jumpTo(g) {
    const i = visible.findIndex((x) => x.id === g.id);
    flushSync(() => { if (viewMode === "timeline") setViewMode("strip"); if (i >= limit) setLimit(i + STEP); });
    scrollToGame(g.id);
  }

  const pickRandomGame = () => { if (!roll && visible.length) setRoll(visible[Math.floor(Math.random() * visible.length)]); };

  function downloadList() {
    const url = URL.createObjectURL(new Blob([visible.map((g) => g.title).join("\n")], { type: "text/plain" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${libPlatform}-games.txt` });
    a.click();
    URL.revokeObjectURL(url);
  }

  async function run(task) {
    setLoading(true);
    setError(null);
    try { await task(); } catch (err) { setError(err.i18n ? { key: err.i18n } : { text: err.message || "" }); } finally { setLoading(false); setEpicProgress(null); }
  }

  const importGog = (name = username.trim()) => run(async () => {
    const list = dedupe(await getAllGames(name) || []);
    if (!list.length) throw i18nError("err.gogNone");
    openAccount("gog", { id: name, games: list, savedAt: Date.now(), source: "profile" });
  });

  const importSteam = (profile = steamProfile.trim()) => run(async () => {
    const list = dedupe((await fetchSteamProfile(profile)).map(normalizeSteamGame).filter(Boolean));
    if (!list.length) throw i18nError("err.none");
    openAccount("steam", { id: profile, games: list, savedAt: Date.now(), source: "profile" });
  });

  // Epic: file creato dall'utente (script sulla pagina Acquisti, Legendary/Heroic) o elenco di titoli. I titoli si cercano nel catalogo Steam per le immagini.
  function handleEpicFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    run(async () => {
      if (file.size > MAX_FILE) throw i18nError("err.epicBig");
      const items = parseEpicFile(await file.text());
      if (!items.length) throw i18nError("err.epicNone");
      setEpicProgress({ done: 0, total: items.length });
      const matches = await matchEpicTitles(items.map((i) => i.title), (done, total) => setEpicProgress({ done, total }));
      openAccount("epic", { id: null, games: dedupe(buildEpicGames(items, matches)), savedAt: Date.now(), source: "file" });
    });
  }

  const refresh = (p) => (p === "gog" ? importGog(store.gog.id) : importSteam(store.steam.id));

  if (hash === "#privacy") return <Privacy />; // pagina «Privacy e trasparenza»

  const tabBtn = (id) => (
    <button type="button" onClick={() => { setTab(id); setError(null); }}
      className={`flex-1 rounded-lg py-2 font-display text-sm font-semibold transition-colors ${tab === id ? TAB_ON[id] : "text-muted hover:text-fog"}`}>
      {NAME[id]}
    </button>
  );
  const shown = visible.slice(0, limit);
  const dupProp = dupOnly ? dupOf : undefined; // il badge «Anche su …» si vede solo nella vista «giochi doppi»
  const pill = "flex items-center gap-1 rounded-full bg-spark px-2.5 py-1 text-xs font-bold text-ink";
  const stripView = hasGames && viewMode === "strip"; // nella Strip l'intestazione si allinea al contenitore da 4xl
  const sourceLabel = (a) => t(a.source === "profile" ? "src.profile" : a.source === "file" ? "src.file" : "src.saved");
  const errorText = error && (error.key ? t(error.key) : error.text || t("err.generic"));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 h-14 border-b border-line/60 bg-ink px-3 sm:px-5">
        <div className={`mx-auto flex h-full w-full items-center gap-2 ${stripView ? "max-w-4xl" : "max-w-[1560px]"}`}>
          {hasGames && (
            <button onClick={() => setIndexOpen(true)} aria-label={t("aria.menu")} className="rounded-lg p-2 text-fog hover:bg-raised"><Icon name="menu" className="size-6" /></button>
          )}
          <h1 className="min-w-0 flex-1">
            <button onClick={goHome} aria-label={t("aria.home")} className="flex max-w-full items-center gap-2 rounded-lg py-1 pr-2 text-left hover:bg-raised/60">
              <img src="/logo-sm.webp" alt="" width="38" height="33" className="h-8 w-auto shrink-0" />
              <span className="truncate font-display text-sm font-bold tracking-tight">Your Games Gallery</span>
            </button>
          </h1>
          {hasGames && saved.length >= 2 && (
            <button onClick={() => setSwitchOpen(true)} aria-label={t("aria.switchLib")} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-raised px-3 py-2 text-xs font-semibold hover:bg-line">
              <span className={`size-2 rounded-full ${DOT[libPlatform]}`} />
              {NAME[libPlatform]}
              <Icon name="chevron" className="size-3.5" />
            </button>
          )}
          {!hasGames && <LangToggle />}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 pb-32 pt-3 sm:px-5">
        {!hasGames ? (
          <div className="mx-auto max-w-3xl animate-fade-in">
            <section className="mx-auto mt-4 max-w-md text-center">
              <img src="/logo.webp" alt="YGG, Your Games Gallery" width="280" height="240" fetchPriority="high" decoding="async"
                className="animate-float mx-auto h-auto w-56 drop-shadow-[0_14px_28px_rgba(167,139,250,0.28)]" />
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{t("hero.h2")}</h2>
              <p className="mt-3 text-sm text-muted">{t("hero.p")}</p>
              <p className="mb-6 mt-2 text-sm font-semibold text-fog/90">{t("hero.tagline")}</p>

              {saved.length > 0 && (
                <div className="mb-6 text-left">
                  <h3 className="mb-2 text-sm font-semibold text-muted">{t("libs.title")}</h3>
                  <div className="flex flex-col gap-2">
                    {saved.map((p) => {
                      const a = store[p];
                      return (
                        <div key={p} className="flex items-center gap-3 rounded-xl border border-line/60 bg-panel p-3">
                          <span className={`size-2.5 shrink-0 rounded-full ${DOT[p]}`} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{accountLabel(p, a)}</p>
                            <p className="truncate text-xs text-muted">{t("libs.count", { n: a.games.length })} · {sourceLabel(a)} · {new Date(a.savedAt).toLocaleDateString(locale)}</p>
                          </div>
                          <button onClick={() => show(p)} className="rounded-lg bg-spark px-3 py-1.5 text-xs font-bold text-ink hover:brightness-110">{t("libs.open")}</button>
                          {canRefresh(p, a) && <button onClick={() => refresh(p)} disabled={loading} className="rounded-lg bg-raised px-3 py-1.5 text-xs font-semibold hover:bg-line disabled:opacity-50">{loading ? "…" : t("libs.refresh")}</button>}
                          <button onClick={() => forget(p)} aria-label={t("libs.delete", { name: accountLabel(p, a) })} className="rounded-lg p-1.5 text-muted hover:text-fog"><Icon name="close" className="size-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-3 flex rounded-xl border border-line/60 bg-panel p-1">{PLATFORMS.map(tabBtn)}</div>

              <div className="flex flex-col gap-2 rounded-xl border border-line/60 bg-panel p-3">
                {tab === "gog" && (
                  <>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && username.trim() && importGog()}
                      placeholder={t("gog.placeholder")} autoCapitalize="none" className="rounded-lg border border-line/60 bg-ink p-3 text-sm outline-none placeholder:text-muted focus:border-gog" />
                    <button onClick={() => importGog()} disabled={loading || !username.trim()} className="rounded-lg bg-gog py-3 text-sm font-bold text-ink transition hover:brightness-110 disabled:bg-raised disabled:text-muted">
                      {loading ? t("importing") : t("gog.import")}
                    </button>
                  </>
                )}
                {tab === "steam" && (
                  <>
                    <input value={steamProfile} onChange={(e) => setSteamProfile(e.target.value)} onKeyDown={(e) => e.key === "Enter" && steamProfile.trim() && importSteam()}
                      placeholder={t("steam.placeholder")} autoCapitalize="none" className="rounded-lg border border-line/60 bg-ink p-3 text-sm outline-none placeholder:text-muted focus:border-steam" />
                    <button onClick={() => importSteam()} disabled={loading || !steamProfile.trim()} className="rounded-lg bg-steam py-3 text-sm font-bold text-ink transition hover:brightness-110 disabled:bg-raised disabled:text-muted">
                      {loading ? t("steam.reading") : t("steam.show")}
                    </button>
                    <p className="px-1 text-xs text-muted">{t("steam.note")}</p>
                  </>
                )}
                {tab === "epic" && (
                  <>
                    <input ref={epicInput} type="file" accept=".json,.csv,.tsv,.txt,application/json,text/*" onChange={handleEpicFile} className="hidden" />
                    <button onClick={() => epicInput.current?.click()} disabled={loading} className="flex items-center justify-center gap-2 rounded-lg bg-epic py-3 text-sm font-bold text-ink transition hover:brightness-110 disabled:bg-raised disabled:text-muted">
                      <Icon name="upload" className="size-5" />
                      {epicProgress ? t("epic.progress", epicProgress) : t("epic.upload")}
                    </button>
                    <p className="px-1 text-xs text-muted">{t("epic.note")}</p>
                  </>
                )}
              </div>

              {errorText && <div role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-950/60 p-3 text-left text-xs text-red-200">{errorText}</div>}

              <div className="mt-5 flex flex-col items-center gap-2">
                <button onClick={() => setShowHelp(true)} className="text-sm text-spark underline-offset-4 hover:underline">{t(`help.${tab}`)}</button>
                {canInstall && <button onClick={install} className="rounded-lg bg-spark px-4 py-2 text-sm font-bold text-ink hover:brightness-110">{t("install")}</button>}
              </div>
            </section>

            <About />

            <div className="mt-12 flex flex-col items-center gap-2 text-center">
              <a href="#privacy" className="text-xs text-muted underline-offset-4 hover:text-fog hover:underline">{t("privacyLink")}</a>
              {PRIVACY.controllerName && <p className="text-[11px] text-muted">{t("createdBy", { name: PRIVACY.controllerName })}</p>}
            </div>
          </div>
        ) : (
          <div className={stripView ? "mx-auto w-full max-w-4xl" : ""}>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{(genre || dupOnly ? t("list.countOf", { n: visible.length, total: games.length }) : t("list.count", { n: games.length }))} · {libPlatform.toUpperCase()} · A–Z</span>
              {genre && <button onClick={() => pickGenre(null)} aria-label={t("list.removeGenre", { genre })} className={pill}>{genre} <Icon name="close" className="size-3" /></button>}
              {dupOnly && <button onClick={toggleDup} aria-label={t("list.removeDups")} className={pill}>{t("list.dups")} <Icon name="close" className="size-3" /></button>}
            </div>
            {viewMode === "timeline" ? (
              <Timeline games={visible} meta={meta} done={analyzed} total={metaGames.length} onSelect={setSelectedGame} />
            ) : (
              <>
                {viewMode === "strip" ? <GameStrip games={shown} meta={meta} dupOf={dupProp} onSelect={setSelectedGame} /> : <GameGrid games={shown} meta={meta} dupOf={dupProp} onSelect={setSelectedGame} />}
                {visible.length > limit && <Sentinel key={limit} onMore={more} />}
                {visible.length === 0 && <p className="py-10 text-center text-sm text-muted">{dupOnly ? t("list.emptyDups") : t("list.emptyGenre")}</p>}
              </>
            )}
          </div>
        )}
      </main>

      {!hasGames && <div className="fixed bottom-4 right-4 z-30 pb-[env(safe-area-inset-bottom)]"><KofiButton floating /></div>}
      {hasGames && <Dock mode={viewMode} filterActive={!!genre || dupOnly || filterOpen} rolling={!!roll} onMode={setViewMode} onFilter={() => setFilterOpen(true)} onRandom={pickRandomGame} />}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} counts={genreCounts} active={genre} onPick={pickGenre} done={analyzed} total={metaGames.length}
        dup={{ libraries: saved.length, count: dupOf.size, active: dupOnly, onToggle: toggleDup }} />
      <LibrarySwitch open={switchOpen} onClose={() => setSwitchOpen(false)} current={libPlatform} onPick={show} onManage={goHome}
        libraries={saved.map((p) => ({ platform: p, label: accountLabel(p, store[p]), count: store[p].games.length }))} />
      <GameIndex
        games={visible} isOpen={indexOpen} onClose={() => setIndexOpen(false)} onPick={jumpTo} onHome={goHome}
        onDownload={() => { downloadList(); setIndexOpen(false); }}
        onInstall={canInstall ? () => { setIndexOpen(false); install(); } : null}
      />
      <GameModal key={selectedGame?.id} game={selectedGame} metaYear={selectedGame ? meta[selectedGame.id]?.y : null} onClose={() => setSelectedGame(null)} />
      <PublicProfileHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} platform={tab} />
      {roll && <Dice />}
      <NoticeBar />
    </div>
  );
}
