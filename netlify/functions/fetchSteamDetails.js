// netlify/functions/fetchSteamDetails.js
export async function handler(event) {
  const appId = event.queryStringParameters?.appId;

  if (!appId) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Parametro 'appId' mancante." }),
    };
  }

  try {
    const targetUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Steam API ha risposto con status HTTP ${res.status}.` }),
      };
    }

    // ★ Controllo di robustezza: verifica che la risposta sia effettivamente JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await res.text();
      console.error("Risposta non-JSON da Steam API:", rawText);
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Steam API ha restituito una risposta non valida (non JSON)." }),
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Buona pratica per le Netlify Functions
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Errore nel recupero dettagli Steam:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Errore interno del server durante il recupero dei dettagli." }),
    };
  }
}