// Steam: screenshot (max 5), anno di uscita e se il multiplayer locale/online esiste.
// -> { screenshots: [{thumb, full}], year, local, online }   (local/online: true | false | null se sconosciuto)
const json = (status, body, cache = "no-store") =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": cache } });
const STORE = () => process.env.STEAM_STORE_BASE || "https://store.steampowered.com";

export default async (req) => {
  const appId = new URL(req.url).searchParams.get("appId");
  if (!/^\d+$/.test(appId || "")) return json(400, { error: "Parametro 'appId' mancante o non valido." });

  try {
    const res = await fetch(
      `${STORE()}/api/appdetails?appids=${appId}&filters=screenshots,release_date,categories&l=english`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" } }
    );
    if (!res.ok) return json(res.status, { error: `Steam ha risposto con HTTP ${res.status}.` });

    const d = (await res.json())?.[appId]?.data || {};
    const screenshots = (d.screenshots || []).slice(0, 5).map((s) => ({ thumb: s.path_thumbnail, full: s.path_full })).filter((s) => s.thumb);
    const year = Number((String(d.release_date?.date || "").match(/\b(19[7-9]\d|20\d\d)\b/) || [])[1]) || null;
    const cats = Array.isArray(d.categories) ? d.categories.map((c) => String(c.description)) : null;
    const local = cats ? cats.some((c) => /shared\/split screen|local/i.test(c)) : null;
    const online = cats ? cats.some((c) => /^online|mmo|cross-platform multiplayer/i.test(c)) : null;

    return json(200, { screenshots, year, local, online }, "public, max-age=86400, s-maxage=86400");
  } catch (err) {
    console.error("fetchSteamDetails:", err);
    return json(500, { error: "Errore nel recupero dei dettagli Steam." });
  }
};
