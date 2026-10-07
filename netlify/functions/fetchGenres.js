// Restituisce i generi per un piccolo gruppo di giochi: ?ids=steam-620,730,1207658930
// Steam = API store ufficiale (campo "genres"). GOG = tag del prodotto (best effort).
const json = (status, body, cache = "no-store") =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": cache } });

const rate = () => Object.assign(new Error("rate"), { rate: true });

async function steamGenres(appId) {
  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&filters=genres&l=english`);
  if (res.status === 429 || res.status === 403) throw rate();
  if (!res.ok) throw new Error(`Steam ${res.status}`);
  const data = await res.json();
  if (data == null) throw rate(); // Steam risponde "null" quando limita le richieste
  const entry = data[appId];
  if (!entry) throw new Error("risposta vuota");
  return entry.success ? (entry.data?.genres || []).map((g) => g.description).filter(Boolean) : [];
}

async function gogGenres(id) {
  const res = await fetch(`https://api.gog.com/v2/games/${id}?locale=en-US`);
  if (res.status === 429) throw rate();
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GOG ${res.status}`);
  const data = await res.json();
  const tags = data?._embedded?.tags || data?.genres || [];
  return tags.map((t) => (typeof t === "string" ? t : t.name)).filter(Boolean);
}

export default async (req) => {
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8);
  if (!ids.length || ids.some((i) => !/^(steam-)?\d+$/.test(i))) return json(400, { error: "Parametro 'ids' non valido." });

  const genres = {};
  let rateLimited = false;
  await Promise.all(ids.map(async (id) => {
    try {
      genres[id] = id.startsWith("steam-") ? await steamGenres(id.slice(6)) : await gogGenres(id);
    } catch (e) {
      if (e.rate) rateLimited = true;
      genres[id] = null; // il client riproverà più tardi
    }
  }));
  return json(200, { genres, rateLimited }, rateLimited ? "no-store" : "public, max-age=86400");
};
