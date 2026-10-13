import { useEffect, useState } from "react";
import { isSteam } from "./screenshots";

const KEY = "ygg:genres:v2"; // v2: ora comprende anche i tag (FPS, Shooter, Horror, …)
const STEAM_BATCH = 50;      // giochi Steam per richiesta (il server li chiede a Steam in un colpo solo)
const GOG_BATCH = 6;
const PAUSE_MS = 1200;
const SLOW_PAUSE_MS = 5000;  // se il server ripiega sul metodo lento
const BACKOFF_MS = 90000;    // attesa se Steam limita le richieste
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let cache = null; // { [id]: string[] } — persistente in localStorage
const getCache = () => {
  if (!cache) {
    try { cache = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { cache = {}; }
    try { localStorage.removeItem("ygg:genres:v1"); } catch { /* storage non disponibile */ }
  }
  return cache;
};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(getCache())); } catch { /* quota */ } };

// Scarica i generi in background e li ricorda per sempre.
export function useGenres(games) {
  const [map, setMap] = useState(() => ({ ...getCache() }));

  useEffect(() => {
    if (!games.length) return;
    let dead = false;
    const tries = {};

    (async () => {
      let steamBatch = STEAM_BATCH, pause = PAUSE_MS, limited = 0, guard = games.length * 2 + 10;
      while (!dead && guard-- > 0) {
        const pending = games.filter((g) => !(String(g.id) in getCache()) && (tries[g.id] || 0) < 2);
        if (!pending.length) break;
        const steam = isSteam(pending[0]);
        const todo = pending.filter((g) => isSteam(g) === steam).slice(0, steam ? steamBatch : GOG_BATCH);
        try {
          const r = await fetch(`/.netlify/functions/fetchGenres?ids=${todo.map((g) => g.id).join(",")}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const { genres, rateLimited, mode } = await r.json();
          if (dead) return;
          if (rateLimited) { if (++limited > 5) break; await sleep(BACKOFF_MS); continue; }
          if (mode === "single") { steamBatch = 4; pause = SLOW_PAUSE_MS; }
          for (const g of todo) {
            const list = genres?.[g.id];
            if (Array.isArray(list)) getCache()[String(g.id)] = list;
            else if (list === null) tries[g.id] = (tries[g.id] || 0) + 1; // assente = da rifare, non è un errore
          }
          save();
          setMap({ ...getCache() });
        } catch {
          todo.forEach((g) => { tries[g.id] = (tries[g.id] || 0) + 1; });
        }
        await sleep(pause);
      }
    })();

    return () => { dead = true; };
  }, [games]);

  return map;
}
