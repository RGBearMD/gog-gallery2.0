// Steam: restituisce screenshot come { thumb, full } (stesso formato di gameDetails).
const reply = (statusCode, body, cache = "no-store") => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": cache },
  body: JSON.stringify(body),
});

export async function handler(event) {
  const appId = event.queryStringParameters?.appId;
  if (!/^\d+$/.test(appId || "")) return reply(400, { error: "Parametro 'appId' mancante o non valido." });

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=screenshots`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" } }
    );
    if (!res.ok) return reply(res.status, { error: `Steam ha risposto con HTTP ${res.status}.` });

    const data = await res.json();
    const shots = data?.[appId]?.data?.screenshots || [];
    const screenshots = shots
      .slice(0, 9)
      .map((s) => ({ thumb: s.path_thumbnail, full: s.path_full }))
      .filter((s) => s.thumb);

    return reply(200, { screenshots }, "public, max-age=86400, s-maxage=86400");
  } catch (err) {
    console.error("fetchSteamDetails:", err);
    return reply(500, { error: "Errore nel recupero dei dettagli Steam." });
  }
}
