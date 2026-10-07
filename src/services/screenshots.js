import { useEffect, useState } from "react";

// ── Utility comuni ───────────────────────────────────────────
export const isSteam = (g) => g?.platform === "Steam" || g?.appId != null || String(g?.id).startsWith("steam-");
const steamAppId = (g) => g.appId ?? parseInt(String(g.id).replace("steam-", ""), 10);

export const coverUrl = (g) =>
  isSteam(g) && steamAppId(g)
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId(g)}/library_600x900.jpg`
    : g.cover;

export const hoursPlayed = (g) => Math.round(((g.playtime || 0) / 60) * 10) / 10;

// Normalizza i giochi letti da steam_games.json
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

// ── Caricamento screenshot: UN solo punto per Strip, Cards e Modal ──
const mem = new Map();
const inflight = new Map();
const LS = "ygg:shots:v1:";
const norm = (s) => (typeof s === "string" ? { thumb: s, full: s } : s);

export async function fetchScreenshots(game) {
  const key = String(game.id);
  if (mem.has(key)) return mem.get(key);
  try {
    const cached = localStorage.getItem(LS + key);
    if (cached) { const v = JSON.parse(cached); mem.set(key, v); return v; }
  } catch { /* storage non disponibile */ }
  if (inflight.has(key)) return inflight.get(key);

  const url = isSteam(game)
    ? `/.netlify/functions/fetchSteamDetails?appId=${steamAppId(game)}`
    : `/.netlify/functions/gameDetails?id=${game.id}`;

  const p = fetch(url)
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return ((await r.json()).screenshots || []).map(norm).slice(0, 9);
    })
    .then((list) => {
      if (list.length) { // non memorizzo i vuoti: potrebbe essere un errore temporaneo
        mem.set(key, list);
        try { localStorage.setItem(LS + key, JSON.stringify(list)); } catch { /* quota */ }
      }
      return list;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, p);
  return p;
}

export function useGameShots(game, enabled = true) {
  const id = game ? String(game.id) : null;
  const [res, setRes] = useState({ id: null, shots: [] });

  useEffect(() => {
    if (!game || !enabled) return;
    let dead = false;
    fetchScreenshots(game)
      .then((shots) => !dead && setRes({ id, shots }))
      .catch(() => !dead && setRes({ id, shots: [] }));
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, enabled]);

  // "loading" è derivato: attivo finché non ho un risultato per questo gioco.
  const ready = res.id === id;
  return { shots: ready ? res.shots : [], loading: !!(game && enabled) && !ready };
}
