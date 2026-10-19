// Metadati per un gruppo di giochi: ?ids=steam-620,steam-730,1207658930  ->  { meta: { id: { g: generi, y: anno } | null } }
//  - Steam: UNA richiesta per fino a 60 giochi (IStoreBrowseService: tag della community + data di uscita).
//           Se non risponde, ripiego su appdetails (un gioco alla volta, max 8).
//  - GOG:   un gioco alla volta (max 8), best effort.
const json = (status, body, cache = "no-store") =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": cache } });

const rate = () => Object.assign(new Error("rate"), { rate: true });
const STORE = () => process.env.STEAM_STORE_BASE || "https://store.steampowered.com";
const WEBAPI = () => process.env.STEAM_API_BASE || "https://api.steampowered.com";
const yearOf = (text) => { const m = String(text || "").match(/\b(19[89]\d|20\d\d)\b/); return m ? Number(m[1]) : null; };

// Dei tanti tag di Steam teniamo solo quelli che sono davvero generi.
const GENRE_TAGS = new Set([
  "Action", "Adventure", "RPG", "Strategy", "Simulation", "Casual", "Indie", "Sports", "Racing", "Massively Multiplayer",
  "FPS", "Shooter", "Puzzle", "Platformer", "Horror", "Survival", "Open World", "Roguelike", "Roguelite", "Metroidvania",
  "Fighting", "Stealth", "Tower Defense", "Turn-Based", "Card Game", "City Builder", "Souls-like", "Visual Novel", "Sandbox", "Rhythm",
]);

let tagNames = null; // id tag -> nome (resta in memoria finché la funzione è "calda")
async function loadTagNames() {
  if (tagNames) return tagNames;
  const res = await fetch(`${STORE()}/tagdata/populartags/english`);
  if (!res.ok) throw new Error(`tag ${res.status}`);
  tagNames = new Map((await res.json()).map((t) => [Number(t.tagid), t.name]));
  return tagNames;
}

async function steamBatch(appIds) {
  const names = await loadTagNames();
  const input = {
    ids: appIds.map((appid) => ({ appid: Number(appid) })),
    context: { language: "english", country_code: "IT", steam_realm: 1 },
    data_request: { include_tag_count: 20, include_release: true },
  };
  const res = await fetch(`${WEBAPI()}/IStoreBrowseService/GetItems/v1?input_json=${encodeURIComponent(JSON.stringify(input))}`);
  if (res.status === 429 || res.status === 403) throw rate();
  if (!res.ok) throw new Error(`Steam ${res.status}`);
  const items = (await res.json())?.response?.store_items;
  if (!Array.isArray(items)) throw new Error("risposta inattesa");

  const out = Object.fromEntries(appIds.map((id) => [id, { g: [], y: null }])); // giochi non restituiti = non disponibili
  let withTags = 0;
  for (const it of items) {
    const tags = it.tags?.length ? [...it.tags].sort((a, b) => (b.weight || 0) - (a.weight || 0)).map((t) => t.tagid) : it.tagids || [];
    if (tags.length) withTags++;
    const ts = it.release?.original_release_date || it.release?.steam_release_date;
    out[String(it.appid ?? it.id)] = {
      g: [...new Set(tags.map((t) => names.get(Number(t))).filter((n) => GENRE_TAGS.has(n)))].slice(0, 6),
      y: ts ? yearOf(new Date(ts * 1000).getUTCFullYear()) : null,
    };
  }
  if (items.length && !withTags) throw new Error("nessun tag nella risposta"); // meglio ripiegare che salvare elenchi vuoti
  return out;
}

async function steamSingle(appId) {
  const res = await fetch(`${STORE()}/api/appdetails?appids=${appId}&filters=genres,release_date&l=english`);
  if (res.status === 429 || res.status === 403) throw rate();
  if (!res.ok) throw new Error(`Steam ${res.status}`);
  const data = await res.json();
  if (data == null) throw rate(); // Steam risponde "null" quando limita le richieste
  const entry = data[appId];
  if (!entry) throw new Error("risposta vuota");
  if (!entry.success) return { g: [], y: null };
  return { g: (entry.data?.genres || []).map((g) => g.description).filter(Boolean), y: yearOf(entry.data?.release_date?.date) };
}

async function gogSingle(id) {
  const res = await fetch(`https://api.gog.com/v2/games/${id}?locale=en-US`);
  if (res.status === 429) throw rate();
  if (res.status === 404) return { g: [], y: null };
  if (!res.ok) throw new Error(`GOG ${res.status}`);
  const data = await res.json();
  const p = data?._embedded?.product;
  return {
    g: (data?._embedded?.tags || data?.genres || []).map((t) => (typeof t === "string" ? t : t.name)).filter(Boolean),
    y: yearOf(p?.globalReleaseDate || p?.releaseDate || data?.releaseDate || data?.release_date),
  };
}

export default async (req) => {
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length || ids.some((i) => !/^(steam-)?\d+$/.test(i))) return json(400, { error: "Parametro 'ids' non valido." });
  const steamIds = ids.filter((i) => i.startsWith("steam-")).map((i) => i.slice(6));
  const gogIds = ids.filter((i) => !i.startsWith("steam-"));
  if (steamIds.length > 60 || gogIds.length > 8) return json(400, { error: "Troppi giochi in una richiesta." });

  const meta = {};
  let rateLimited = false;
  let mode = "batch";

  if (steamIds.length) {
    try {
      const out = await steamBatch(steamIds);
      for (const id of steamIds) meta[`steam-${id}`] = out[id];
    } catch (e) {
      if (e.rate) rateLimited = true;
      else {
        mode = "single"; // ripiego: vecchio metodo, solo i primi 8 (gli altri restano da fare)
        await Promise.all(steamIds.slice(0, 8).map(async (id) => {
          try { meta[`steam-${id}`] = await steamSingle(id); }
          catch (err) { if (err.rate) rateLimited = true; meta[`steam-${id}`] = null; }
        }));
      }
    }
  }
  await Promise.all(gogIds.map(async (id) => {
    try { meta[id] = await gogSingle(id); }
    catch (e) { if (e.rate) rateLimited = true; meta[id] = null; }
  }));

  return json(200, { meta, rateLimited, mode }, rateLimited ? "no-store" : "public, max-age=86400");
};
