// Libreria Steam da un profilo, senza file JSON. POST { profile } -> { games: [...] }
// Richiede la variabile d'ambiente STEAM_API_KEY (gratuita: steamcommunity.com/dev/apikey)
// e che su Steam «Dettagli dei giochi» sia impostato su Pubblico.
const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

const API = () => process.env.STEAM_API_BASE || "https://api.steampowered.com";

// Accetta SteamID64, link del profilo (/profiles/… o /id/…) o nome profilo.
function parseProfile(input) {
  if (/^\d{17}$/.test(input)) return { steamid: input };
  const byId = input.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (byId) return { steamid: byId[1] };
  const byName = input.match(/steamcommunity\.com\/id\/([A-Za-z0-9_-]{2,64})/i) || input.match(/^([A-Za-z0-9_-]{2,64})$/);
  return byName ? { vanity: byName[1] } : null;
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Metodo non consentito." });
  const key = process.env.STEAM_API_KEY;
  if (!key) return json(501, { code: "no_key", error: "Questo sito non ha una chiave Steam configurata." });

  let input = "";
  try { input = String((await req.json()).profile || "").trim(); } catch { /* corpo non valido */ }
  const parsed = parseProfile(input);
  if (!parsed) return json(400, { code: "invalid", error: "Inserisci il link del profilo, il nome profilo o lo SteamID." });

  try {
    let steamid = parsed.steamid;
    if (!steamid) {
      const r = await fetch(`${API()}/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${encodeURIComponent(parsed.vanity)}`);
      if (!r.ok) return json(502, { code: "steam", error: `Steam ha risposto con HTTP ${r.status}.` });
      const v = (await r.json())?.response;
      if (v?.success !== 1) return json(404, { code: "not_found", error: "Profilo non trovato." });
      steamid = v.steamid;
    }

    const r = await fetch(`${API()}/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamid}&include_appinfo=1&include_played_free_games=1&format=json`);
    if (!r.ok) return json(502, { code: "steam", error: `Steam ha risposto con HTTP ${r.status}.` });
    const list = (await r.json())?.response?.games;
    if (!Array.isArray(list) || !list.length) {
      return json(403, { code: "private", error: "Nessun gioco visibile: la libreria è privata." });
    }

    const games = list.slice(0, 5000).filter((g) => g.appid && g.name).map((g) => ({
      id: `steam-${g.appid}`, appId: g.appid, title: g.name, playtime: g.playtime_forever || 0, platform: "Steam",
    }));
    return json(200, { games });
  } catch (e) {
    console.error("steamLibrary:", e.message); // niente chiave né profilo nei log
    return json(502, { code: "steam", error: "Impossibile contattare Steam." });
  }
};
