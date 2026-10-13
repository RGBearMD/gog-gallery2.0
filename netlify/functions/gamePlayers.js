// Multiplayer locale (numero di giocatori) e online da PCGamingWiki: ?platform=steam|gog&id=<id numerico>
// -> { local: true|false|null, players: numero|null, online: true|false|null }
const json = (status, body, cache = "no-store") =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": cache } });
const PCGW = () => process.env.PCGW_BASE || "https://www.pcgamingwiki.com";
const yesNo = (v) => (/^true/i.test(String(v ?? "")) ? true : /^false/i.test(String(v ?? "")) ? false : null);

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const platform = q.get("platform");
  const id = q.get("id");
  if (!["steam", "gog"].includes(platform) || !/^\d+$/.test(id || "")) return json(400, { error: "Parametri non validi." });

  try {
    const params = new URLSearchParams({
      action: "cargoquery", format: "json", limit: "1",
      tables: "Infobox_game,Multiplayer",
      join_on: "Infobox_game._pageName=Multiplayer._pageName",
      fields: "Multiplayer.Local=local,Multiplayer.Local_players=players,Multiplayer.Online=online",
      where: `Infobox_game.${platform === "steam" ? "Steam_AppID" : "GOGcom_ID"} HOLDS "${id}"`,
    });
    const res = await fetch(`${PCGW()}/w/api.php?${params}`, { headers: { "User-Agent": "YourGamesGallery/1.0" } });
    if (!res.ok) return json(200, { local: null, players: null, online: null });
    const row = (await res.json())?.cargoquery?.[0]?.title;
    if (!row) return json(200, { local: null, players: null, online: null }, "public, max-age=86400");

    const nums = (String(row.players || "").match(/\d+/g) || []).map(Number);
    const players = nums.length && Math.max(...nums) >= 2 ? Math.max(...nums) : null;
    return json(200, { local: yesNo(row.local), players, online: yesNo(row.online) }, "public, max-age=604800");
  } catch (e) {
    console.error("gamePlayers:", e.message);
    return json(200, { local: null, players: null, online: null });
  }
};
