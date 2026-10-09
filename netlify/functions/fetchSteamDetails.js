// Steam: restituisce screenshot come { thumb, full } (stesso formato di gameDetails).
const json = (status, body, cache = "no-store") =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": cache } });

export default async (req) => {
  const appId = new URL(req.url).searchParams.get("appId");
  if (!/^\d+$/.test(appId || "")) return json(400, { error: "Parametro 'appId' mancante o non valido." });

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=screenshots`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" } }
    );
    if (!res.ok) return json(res.status, { error: `Steam ha risposto con HTTP ${res.status}.` });

    const data = await res.json();
    const screenshots = (data?.[appId]?.data?.screenshots || [])
      .slice(0, 9)
      .map((s) => ({ thumb: s.path_thumbnail, full: s.path_full }))
      .filter((s) => s.thumb);

    return json(200, { screenshots }, "public, max-age=86400, s-maxage=86400");
  } catch (err) {
    console.error("fetchSteamDetails:", err);
    return json(500, { error: "Errore nel recupero dei dettagli Steam." });
  }
};
