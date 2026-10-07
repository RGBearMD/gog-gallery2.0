import { useEffect, useState } from "react";

const KEY = "ygg:genres:v1";
const BATCH = 4;          // giochi per richiesta
const PAUSE_MS = 5000;    // pausa tra le richieste, per non farsi limitare da Steam
const BACKOFF_MS = 90000; // attesa se Steam limita le richieste
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let cache = null; // { [id]: string[] } — persistente in localStorage
const getCache = () => {
  if (!cache) { try { cache = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { cache = {}; } }
  return cache;
};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(getCache())); } catch { /* quota */ } };

// Scarica i generi in background, pochi giochi alla volta, e li ricorda per sempre.
export function useGenres(games) {
  const [map, setMap] = useState(() => ({ ...getCache() }));

  useEffect(() => {
    if (!games.length) return;
    let dead = false;
    const tries = {};

    (async () => {
      let limited = 0;
      while (!dead) {
        const todo = games.filter((g) => !(String(g.id) in getCache()) && (tries[g.id] || 0) < 2).slice(0, BATCH);
        if (!todo.length) break;
        try {
          const r = await fetch(`/.netlify/functions/fetchGenres?ids=${todo.map((g) => g.id).join(",")}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const { genres, rateLimited } = await r.json();
          if (dead) return;
          for (const g of todo) {
            const list = genres?.[g.id];
            if (Array.isArray(list)) getCache()[String(g.id)] = list;
            else tries[g.id] = (tries[g.id] || 0) + 1;
          }
          save();
          setMap({ ...getCache() });
          if (rateLimited) {
            if (++limited > 5) break;
            await sleep(BACKOFF_MS);
          }
        } catch {
          todo.forEach((g) => { tries[g.id] = (tries[g.id] || 0) + 1; });
        }
        await sleep(PAUSE_MS);
      }
    })();

    return () => { dead = true; };
  }, [games]);

  return map;
}
