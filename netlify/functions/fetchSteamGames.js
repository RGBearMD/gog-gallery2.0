// netlify/functions/fetchSteamGames.js
export async function handler(event) {
  try {
    const user = (event.queryStringParameters?.user || "").trim().replace(/\/$/, "");
    const apiKey = (event.queryStringParameters?.key || "").trim();

    if (!user || !apiKey) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Inserisci sia la Steam Web API Key che l'username o SteamID.",
        }),
      };
    }

    // ── 1. Risolvi vanity URL → SteamID64 ──────────────────────
    let steamId64 = "";

    // Se è già un SteamID64 puro (17 cifre)
    if (/^\d{17}$/.test(user)) {
      steamId64 = user;
    } else {
      // Estrai il vanity name da URL completi o usa l'input diretto
      let vanity = user;
      if (user.includes("steamcommunity.com/id/")) {
        vanity = user.split("steamcommunity.com/id/")[1].split("/")[0];
      } else if (user.includes("steamcommunity.com/profiles/")) {
        steamId64 = user.split("steamcommunity.com/profiles/")[1].split("/")[0];
      }

      // Se non abbiamo ancora lo SteamID64, risolviamo il vanity
      if (!steamId64) {
        const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${encodeURIComponent(apiKey)}&vanityurl=${encodeURIComponent(vanity)}`;
        const resolveRes = await fetch(resolveUrl);

        if (!resolveRes.ok) {
          return {
            statusCode: 502,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              error: `Errore risoluzione SteamID (HTTP ${resolveRes.status}). Verifica la API Key.`,
            }),
          };
        }

        const resolveData = await resolveRes.json();
        if (resolveData.response?.success === 1) {
          steamId64 = resolveData.response.steamid;
        }
      }
    }

    if (!steamId64 || !/^\d{17}$/.test(steamId64)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error:
            "Impossibile risolvere lo SteamID64. Verifica l'username Steam o inserisci direttamente lo SteamID64 numerico (17 cifre).",
        }),
      };
    }

    // ── 2. Recupera i giochi posseduti ─────────────────────────
    const gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${encodeURIComponent(apiKey)}&steamid=${steamId64}&include_appinfo=true&include_played_free_games=true&format=json`;
    const gamesRes = await fetch(gamesUrl);

    if (!gamesRes.ok) {
      if (gamesRes.status === 403) {
        return {
          statusCode: 403,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "API Key non valida o revocata. Rigenera la chiave su steamcommunity.com/dev/apikey",
          }),
        };
      }
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: `Steam API ha risposto con HTTP ${gamesRes.status}.`,
        }),
      };
    }

    const contentType = gamesRes.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const raw = await gamesRes.text();
      console.error("Risposta non-JSON da Steam API:", raw);
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Steam API ha restituito una risposta non valida." }),
      };
    }

    const gamesData = await gamesRes.json();
    const rawGames = gamesData.response?.games || [];

    if (rawGames.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error:
            "Nessun gioco trovato. Verifica che lo SteamID sia corretto e che l'account possieda giochi.",
        }),
      };
    }

    // ── 3. Mappa i giochi nel formato dell'app ─────────────────
    const games = rawGames.map((g) => ({
      id: `steam-${g.appid}`,
      appId: g.appid,
      title: g.name || `App ${g.appid}`,
      playtime: g.playtime_forever || 0, // già in minuti
      hoursOnRecord: Math.round(((g.playtime_forever || 0) / 60) * 10) / 10,
      cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      screenshots: [],
      platform: "Steam",
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalGames: games.length, games }),
    };
  } catch (error) {
    console.error("Steam Import Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.message || "Errore imprevisto durante l'importazione Steam.",
      }),
    };
  }
}