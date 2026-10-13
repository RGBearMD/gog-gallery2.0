import { useEffect, useState } from "react";

// ── Utility comuni ───────────────────────────────────────────
export const isSteam = (g) => g?.platform === "Steam" || g?.appId != null || String(g?.id).startsWith("steam-");
const steamAppId = (g) => g.appId ?? parseInt(String(g.id).replace("steam-", ""), 10);

export const coverUrl = (g) =>
  isSteam(g) && steamAppId(g)
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId(g)}/library_600x900.jpg`
    : g.cover;

export const hoursPlayed = (g) => (Math.round(((g.playtime || 0) / 60) * 10) / 10).toLocaleString("it-IT");

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

// URL della pagina del gioco sullo store
export const storeUrl = (g) => (isSteam(g) ? `https://store.steampowered.com/app/${steamAppId(g)}` : g.url || null);

// ── Dettagli del gioco (screenshot, anno, multiplayer): UN solo punto per Strip, Cards e Modal ──
const mem = new Map();
const inflight = new Map();
const LS = "ygg:details:v2:";
const PLAYERS_LS = "ygg:players:v1:";
const norm = (s) => (typeof s === "string" ? { thumb: s, full: s } : s);
try { Object.keys(localStorage).filter((k) => k.startsWith("ygg:shots:v1:")).forEach((k) => localStorage.removeItem(k)); } catch { /* storage non disponibile */ }

// Coda: al massimo 3 richieste insieme, così scorrendo la lista non si "martella" Steam.
let active = 0;
const waiting = [];
const queued = (task) => new Promise((resolve, reject) => {
  const go = () => { active++; task().then(resolve, reject).finally(() => { active--; waiting.shift()?.(); }); };
  if (active < 3) go(); else waiting.push(go);
});

function cached(prefix, key) {
  if (mem.has(prefix + key)) return mem.get(prefix + key);
  try {
    const raw = localStorage.getItem(prefix + key);
    if (raw) { const v = JSON.parse(raw); mem.set(prefix + key, v); return v; }
  } catch { /* storage non disponibile */ }
  return null;
}
function remember(prefix, key, value) {
  mem.set(prefix + key, value);
  try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch { /* quota */ }
}

export async function fetchDetails(game) {
  const key = String(game.id);
  const hit = cached(LS, key);
  if (hit) return hit;
  if (inflight.has(key)) return inflight.get(key);

  const url = isSteam(game)
    ? `/.netlify/functions/fetchSteamDetails?appId=${steamAppId(game)}`
    : `/.netlify/functions/gameDetails?id=${game.id}`;

  const p = queued(() => fetch(url))
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      return { shots: (d.screenshots || []).map(norm).slice(0, 5), year: d.year ?? null, local: d.local ?? null, online: d.online ?? null };
    })
    .then((details) => {
      if (details.shots.length || details.year) remember(LS, key, details); // non memorizzo i vuoti: potrebbe essere un errore temporaneo
      return details;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, p);
  return p;
}

// Avvia il caricamento in anticipo (es. al tocco), così quando si apre il Modal i dati sono già pronti.
export const prefetchDetails = (game) => { fetchDetails(game).catch(() => {}); };

const NO_DETAILS = { shots: [], year: null, local: null, online: null };

export function useGameDetails(game, enabled = true) {
  const id = game ? String(game.id) : null;
  const [res, setRes] = useState({ id: null, details: NO_DETAILS });

  useEffect(() => {
    if (!game || !enabled) return;
    let dead = false;
    fetchDetails(game)
      .then((details) => !dead && setRes({ id, details }))
      .catch(() => !dead && setRes({ id, details: NO_DETAILS }));
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, enabled]);

  // "loading" è derivato: attivo finché non ho un risultato per questo gioco.
  const ready = res.id === id;
  return { ...(ready ? res.details : NO_DETAILS), loading: !!(game && enabled) && !ready };
}

// Multiplayer locale (n. giocatori) da PCGamingWiki: richiesto solo quando si apre «Info».
export async function fetchPlayers(game) {
  const key = String(game.id);
  const hit = cached(PLAYERS_LS, key);
  if (hit) return hit;
  const id = isSteam(game) ? steamAppId(game) : game.id;
  const r = await fetch(`/.netlify/functions/gamePlayers?platform=${isSteam(game) ? "steam" : "gog"}&id=${id}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const d = await r.json();
  if (d.local !== null || d.online !== null) remember(PLAYERS_LS, key, d);
  return d;
}

export function usePlayers(game, enabled) {
  const id = game ? String(game.id) : null;
  const [res, setRes] = useState({ id: null, data: null });

  useEffect(() => {
    if (!game || !enabled) return;
    let dead = false;
    fetchPlayers(game)
      .then((data) => !dead && setRes({ id, data }))
      .catch(() => !dead && setRes({ id, data: null }));
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, enabled]);

  return res.id === id ? res.data : null;
}
