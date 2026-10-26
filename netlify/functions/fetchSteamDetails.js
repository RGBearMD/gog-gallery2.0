// Steam: screenshot (max 6), anno, sviluppatori ed editori per UNO o PIÙ giochi in una sola chiamata: ?appIds=620,730
// -> { items: { "620": { screenshots: [{thumb, full}], year, developers: [], publishers: [] } | null }, rateLimited }
const json = (status, body, cache = "no-store") =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": cache } });
const STORE = () => process.env.STEAM_STORE_BASE || "https://store.steampowered.com";
const names = (v) => (Array.isArray(v) ? v.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim()).slice(0, 4) : []);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";

async function one(appId) {
  const res = await fetch(`${STORE()}/api/appdetails?appids=${appId}&filters=screenshots,release_date,developers,publishers&l=english`, { headers: { "User-Agent": UA } });
  if (res.status === 429 || res.status === 403) throw Object.assign(new Error("rate"), { rate: true });
  if (!res.ok) throw new Error(`Steam ${res.status}`);
  const data = await res.json();
  if (data == null) throw Object.assign(new Error("rate"), { rate: true }); // Steam risponde "null" quando limita le richieste
  const d = data[appId]?.data || {};
  return {
    screenshots: (d.screenshots || []).slice(0, 6).map((s) => ({ thumb: s.path_thumbnail, full: s.path_full })).filter((s) => s.thumb),
    year: Number((String(d.release_date?.date || "").match(/\b(19[89]\d|20\d\d)\b/) || [])[1]) || null,
    developers: names(d.developers),
    publishers: names(d.publishers),
  };
}

export default async (req) => {
  const ids = (new URL(req.url).searchParams.get("appIds") || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length || ids.length > 8 || ids.some((i) => !/^\d+$/.test(i))) return json(400, { error: "Parametro 'appIds' mancante o non valido (massimo 8 numeri)." });

  const items = {};
  let rateLimited = false;
  await Promise.all(ids.map(async (id) => {
    try { items[id] = await one(id); }
    catch (e) { if (e.rate) rateLimited = true; else console.error("fetchSteamDetails:", id, e.message); items[id] = null; }
  }));
  return json(200, { items, rateLimited }, rateLimited ? "no-store" : "public, max-age=86400");
};
