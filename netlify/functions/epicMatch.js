// Per la libreria Epic: cerca i titoli nel catalogo Steam. POST { titles: [max 10] } -> { matches: { titolo: appId | null }, rateLimited }
// Un titolo è "trovato" solo se coincide esattamente (dopo la normalizzazione) con quello di Steam: meglio nessuna scheda che una sbagliata.
import { normalizeTitle } from "../../src/services/titles.js";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const STORE = () => process.env.STEAM_STORE_BASE || "https://store.steampowered.com";

async function find(title) {
  const res = await fetch(`${STORE()}/api/storesearch/?term=${encodeURIComponent(title)}&l=english&cc=US`, { headers: { "User-Agent": "YourGamesGallery/1.0" } });
  if (res.status === 429 || res.status === 403) throw Object.assign(new Error("rate"), { rate: true });
  if (!res.ok) throw new Error(`Steam ${res.status}`);
  const key = normalizeTitle(title);
  const hit = ((await res.json())?.items || []).find((i) => i.type === "app" && normalizeTitle(i.name) === key);
  return hit ? Number(hit.id) : null;
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Metodo non consentito." });
  let titles;
  try { titles = (await req.json()).titles; } catch { /* corpo non valido */ }
  if (!Array.isArray(titles) || !titles.length || titles.length > 10 || titles.some((t) => typeof t !== "string" || !t || t.length > 200)) return json(400, { error: "Elenco di titoli non valido (massimo 10)." });

  const matches = {};
  let rateLimited = false;
  await Promise.all(titles.map(async (t) => {
    try { matches[t] = await find(t); } catch (e) { if (e.rate) rateLimited = true; matches[t] = null; }
  }));
  return json(200, { matches, rateLimited });
};
