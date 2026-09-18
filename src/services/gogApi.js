export async function getAllGames(username) {
  if (!username) throw new Error("Inserisci un username valido.");

  const response = await fetch(`https://api.gog.com/users/${encodeURIComponent(username)}/games?limit=1000`);

  // Se l'API restituisce HTML o errore HTTP
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Utente GOG non trovato o profilo privato.");
    }
    throw new Error(`Errore GOG API (HTTP ${response.status})`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const rawText = await response.text();
    console.error("Risposta non JSON ricevuta:", rawText);
    throw new Error("L'API non ha restituito un JSON valido.");
  }

  const data = await response.json();
  const rawList = data._embedded?.items || data.items || [];

  return rawList.map((item) => ({
    id: `gog-${item.id}`,
    title: item.title,
    cover: item.image ? `https:${item.image}_product_card_v2_mobile_slider_639.jpg` : "",
    playtime: item.stats?.playtime || 0,
    screenshots: [],
    platform: "GOG",
  }));
}