// Netlify Serverless Function per importare la libreria pubblica di Steam senza API Key
export async function handler(event) {
  try {
    let input = event.queryStringParameters?.user || "";

    if (!input) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Parametro 'user' mancante." }),
      };
    }

    // Pulizia dell'input: estrae l'username o lo ID se l'utente incolla l'URL completo
    input = input.trim().replace(/\/$/, ""); // Rimuove eventuali slash finali
    let steamIdOrVanity = input;
    let isFullId = false;

    if (input.includes("steamcommunity.com/id/")) {
      steamIdOrVanity = input.split("steamcommunity.com/id/")[1].split("/")[0];
    } else if (input.includes("steamcommunity.com/profiles/")) {
      steamIdOrVanity = input.split("steamcommunity.com/profiles/")[1].split("/")[0];
      isFullId = true;
    } else if (/^\d{17}$/.test(input)) {
      // Se inserisce direttamente uno SteamID64 a 17 cifre
      isFullId = true;
    }

    // Endpoint XML pubblico offerto nativamente da Steam
    const targetUrl = isFullId
      ? `https://steamcommunity.com/profiles/${steamIdOrVanity}/games?xml=1`
      : `https://steamcommunity.com/id/${steamIdOrVanity}/games?xml=1`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Steam risponde con status: ${response.status}`);
    }

    const xmlText = await response.text();

    // Verifichiamo se il profilo è privato o non trovato
    if (xmlText.includes("<error>") || xmlText.includes("is private")) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "Il profilo Steam è privato o non esiste. Assicurati che 'Dettagli Giochi' sia impostato su Pubblico nelle impostazioni di Steam.",
        }),
      };
    }

    // Estrazione dei dati dei giochi tramite Regex dall'XML di Steam
    const games = [];
    const gameBlocks = xmlText.match(/<game>([\s\S]*?)<\/game>/g) || [];

    gameBlocks.forEach((block) => {
      const appIDMatch = block.match(/<appID>(.*?)<\/appID>/);
      const nameMatch = block.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/) || block.match(/<name>(.*?)<\/name>/);
      const hoursMatch = block.match(/<hoursOnRecord>(.*?)<\/hoursOnRecord>/);

      if (appIDMatch && nameMatch) {
        const appId = appIDMatch[1].trim();
        const title = nameMatch[1].trim();
        const hoursPlayed = hoursMatch ? parseFloat(hoursMatch[1].replace(",", "")) : 0;

        games.push({
          id: `steam-${appId}`,
          appId: appId,
          title: title,
          playtime: Math.round(hoursPlayed * 60), // Convertiamo in minuti per consistenza
          hoursOnRecord: hoursPlayed,
          // CDN ad alta risoluzione nativa di Steam per le copertine
          cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
          screenshots: [
            `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/ss_1.jpg`,
            `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/ss_2.jpg`,
          ],
          platform: "Steam",
        });
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalGames: games.length,
        games: games,
      }),
    };
  } catch (error) {
    console.error("Steam Import Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Impossibile recuperare la libreria Steam." }),
    };
  }
}