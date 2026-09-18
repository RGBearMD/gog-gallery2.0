// netlify/functions/fetchSteamGames.js
import * as cheerio from "cheerio";

export async function handler(event) {
  try {
    let input = (event.queryStringParameters?.user || "").trim().replace(/\/$/, "");

    if (!input) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Inserisci un ID o username Steam." }),
      };
    }

    // --- Risoluzione vanity URL / SteamID a 64 bit ---
    let steamIdOrVanity = input;
    let isFullId = false;

    if (input.includes("steamcommunity.com/id/")) {
      steamIdOrVanity = input.split("steamcommunity.com/id/")[1].split("/")[0];
    } else if (input.includes("steamcommunity.com/profiles/")) {
      steamIdOrVanity = input.split("steamcommunity.com/profiles/")[1].split("/")[0];
      isFullId = true;
    } else if (/^\d{17}$/.test(input)) {
      isFullId = true;
    } else if (/^\d+$/.test(input)) {
      // SteamID a 64 bit anche senza padding
      isFullId = true;
    }

    const targetUrl = isFullId
      ? `https://steamcommunity.com/profiles/${steamIdOrVanity}/games?xml=1`
      : `https://steamcommunity.com/id/${steamIdOrVanity}/games?xml=1`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status === 404 ? 404 : 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: `Steam ha risposto con status HTTP ${response.status}. Verifica l'username o l'ID.`,
        }),
      };
    }

    const xmlText = await response.text();

    if (!xmlText || xmlText.trim().length === 0) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Risposta vuota da Steam. Riprova più tardi." }),
      };
    }

    // --- Parsing robusto con cheerio ---
    const $ = cheerio.load(xmlText, { xmlMode: true });

    // ✅ CHECK PRIVACY PRECISO (solo tag <error> o assenza di <games>)
    const errorTag = $("error").text().trim();
    const hasGamesTag = $("games game").length > 0;
    
    const isPrivate = 
      errorTag.length > 0 || 
      !hasGamesTag;

    if (isPrivate) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error:
            "Profilo o lista giochi PRIVATA. Su Steam vai in Modifica Profilo → Impostazioni Privacy e imposta 'Dettagli dei giochi' su PUBBLICO.",
        }),
      };
    }

    // --- Estrazione giochi ---
    const games = [];
    $("game").each((_, el) => {
      const $game = $(el);
      const appId = $game.find("appID").text().trim();
      const name =
        $game.find("name").text().trim() ||
        $game.find("name").html()?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() ||
        "";
      const hoursRaw = $game.find("hoursOnRecord").text().trim().replace(",", ".");
      const hoursPlayed = hoursRaw ? parseFloat(hoursRaw) : 0;

      if (!appId || !name) return;

      games.push({
        id: `steam-${appId}`,
        appId,
        title: name,
        playtime: Math.round(hoursPlayed * 60),
        hoursOnRecord: hoursPlayed,
        cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
        screenshots: [
          `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/ss_1.jpg`,
          `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/ss_2.jpg`,
        ],
        platform: "Steam",
      });
    });

    if (games.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error:
            "Nessun gioco trovato per questo utente. Verifica l'ID/username e che la lista giochi sia PUBBLICA su Steam.",
        }),
      };
    }

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
        error: error.message || "Impossibile recuperare la libreria Steam.",
      }),
    };
  }
}