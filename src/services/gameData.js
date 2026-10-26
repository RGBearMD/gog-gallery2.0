import { useEffect, useState } from "react";

// ── Utility comuni ───────────────────────────────────────────
// Giochi Epic: se trovati nel catalogo Steam hanno id "steam-<appId>" (quindi dati e immagini di Steam) ma platform "Epic";
// gli altri (solo Epic) non hanno nessuna fonte di screenshot, anno o generi.
export const isEpic = (g) => g?.platform === "Epic";
export const isSteam = (g) => g?.platform === "Steam" || g?.appId != null || String(g?.id).startsWith("steam-");
const steamAppId = (g) => g.appId ?? parseInt(String(g.id).replace("steam-", ""), 10);

export const coverUrl = (g) =>
  isSteam(g) && steamAppId(g)
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId(g)}/library_600x900.jpg`
    : g.cover;

export const isEpicOnly = (g) => isEpic(g) && !isSteam(g);
export const isLandscape = (g) => !isSteam(g) && !isEpic(g); // copertina orizzontale: solo GOG
export const platformName = (g) => (isEpic(g) ? "Epic" : isSteam(g) ? "Steam" : "GOG");
export const platformClasses = (g) => (isEpic(g) ? "bg-epic/15 text-epic" : isSteam(g) ? "bg-steam/15 text-steam" : "bg-gog/15 text-gog");

export const hoursPlayed = (g, locale = "it-IT") => (Math.round(((g.playtime || 0) / 60) * 10) / 10).toLocaleString(locale);

// Normalizza i giochi Steam (da profilo o salvati in precedenza)
export function normalizeSteamGame(g) {
  const appId = g?.appId ?? parseInt(String(g?.id ?? "").replace("steam-", ""), 10);
  if (!g?.title || !Number.isFinite(appId)) return null;
  return {
    ...g,
    id: `steam-${appId}`,
    appId,
    platform: "Steam",
    screenshots: [],
    cover: g.cover || `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
  };
}

const absoluteUrl = (u) => (typeof u === "string" && u.startsWith("//") ? `https:${u}` : u);
// Versione leggera (WebP) di un'immagine, ridimensionata dalla funzione `img` (vedi netlify/functions/img.js)
export const resizedUrl = (url, width) => (url ? `/.netlify/functions/img?w=${width}&u=${encodeURIComponent(absoluteUrl(url))}` : url);

// URL della pagina del gioco sullo store
export const storeUrl = (g) =>
  isEpic(g) ? `https://store.epicgames.com/browse?q=${encodeURIComponent(g.title)}` : isSteam(g) ? `https://store.steampowered.com/app/${steamAppId(g)}` : g.url || null;

// ── Dettagli del gioco (screenshot + anno): UN solo punto per Strip, Cards e Modal ──
// Le richieste di più giochi vicini nel tempo vengono UNITE in una sola chiamata al server (6 Steam / 4 GOG).
const mem = new Map();
const inflight = new Map();
const LS = "ygg:details:v4:";
const norm = (s) => (typeof s === "string" ? { thumb: s, full: s } : s);
try {
  Object.keys(localStorage)
    .filter((k) => /^ygg:(shots:v1|details:v2|details:v3|players:v1):/.test(k))
    .forEach((k) => localStorage.removeItem(k));
} catch { /* storage non disponibile */ }

// Coda: al massimo 3 chiamate insieme, così scorrendo la lista non si "martella" Steam.
let active = 0;
const waiting = [];
const queued = (task) => new Promise((resolve, reject) => {
  const go = () => { active++; task().then(resolve, reject).finally(() => { active--; waiting.shift()?.(); }); };
  if (active < 3) go(); else waiting.push(go);
});

async function fetchWithRetry(url) {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await fetch(url);
      if (r.ok && !(await r.clone().json()).rateLimited) return r;
      if (attempt === 1) return r;
    } catch (e) { if (attempt === 1) throw e; }
    await new Promise((res) => setTimeout(res, 1500)); // un secondo tentativo, poi si arrende
  }
}

const pending = { steam: [], gog: [] };
let timer = null;
function flush() {
  timer = null;
  for (const kind of ["steam", "gog"]) {
    const list = pending[kind].splice(0);
    const size = kind === "steam" ? 6 : 4;
    for (let i = 0; i < list.length; i += size) sendBatch(kind, list.slice(i, i + size));
  }
}
function sendBatch(kind, group) {
  const ids = group.map((p) => (kind === "steam" ? steamAppId(p.game) : p.game.id));
  const url = kind === "steam" ? `/.netlify/functions/fetchSteamDetails?appIds=${ids.join(",")}` : `/.netlify/functions/gameDetails?ids=${ids.join(",")}`;
  queued(() => fetchWithRetry(url))
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const { items } = await r.json();
      group.forEach((p, i) => {
        const item = items?.[ids[i]];
        if (item) p.resolve({ shots: (item.screenshots || []).map(norm).slice(0, 6), year: item.year ?? null, dev: item.developers || [], pub: item.publishers || [] });
        else p.reject(new Error("dati non disponibili"));
      });
    })
    .catch((err) => group.forEach((p) => p.reject(err)));
}
const requestDetails = (game) => new Promise((resolve, reject) => {
  pending[isSteam(game) ? "steam" : "gog"].push({ game, resolve, reject });
  timer ??= setTimeout(flush, 40);
});

function cached(key) {
  if (mem.has(key)) return mem.get(key);
  try {
    const raw = localStorage.getItem(LS + key);
    if (raw) { const v = JSON.parse(raw); mem.set(key, v); return v; }
  } catch { /* storage non disponibile */ }
  return null;
}

export async function fetchDetails(game) {
  if (isEpicOnly(game)) return { shots: [], year: null, dev: [], pub: [], failed: false }; // nessuna fonte di dettagli per i giochi solo-Epic
  const key = String(game.id);
  const hit = cached(key);
  if (hit) return hit;
  if (inflight.has(key)) return inflight.get(key);

  const p = requestDetails(game)
    .then((details) => {
      if (details.shots.length || details.year || details.dev.length) { // non memorizzo i vuoti: potrebbe essere un errore temporaneo
        mem.set(key, details);
        try { localStorage.setItem(LS + key, JSON.stringify(details)); } catch { /* quota */ }
      }
      return details;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, p);
  return p;
}

// Avvia il caricamento in anticipo (es. al tocco), così quando si apre il Modal i dati sono già pronti.
export const prefetchDetails = (game) => { fetchDetails(game).catch(() => {}); };

const NO_DETAILS = { shots: [], year: null, dev: [], pub: [], failed: false };

export function useGameDetails(game, enabled = true) {
  const id = game ? String(game.id) : null;
  const [res, setRes] = useState({ id: null, details: NO_DETAILS });

  useEffect(() => {
    if (!game || !enabled) return;
    let dead = false;
    fetchDetails(game)
      .then((details) => !dead && setRes({ id, details }))
      .catch(() => !dead && setRes({ id, details: { ...NO_DETAILS, failed: true } }));
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, enabled]);

  // "loading" è derivato: attivo finché non ho un risultato per questo gioco.
  const ready = res.id === id;
  return { ...(ready ? res.details : NO_DETAILS), loading: !!(game && enabled) && !ready };
}
