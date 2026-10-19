import { normalizeSteamGame } from "./gameData.js";
import { normalizeTitle } from "./titles.js";

// Epic non ha un'API pubblica per la libreria: si importa il file esportato da Legendary/Heroic
// (JSON, CSV/TSV) oppure un semplice elenco di titoli, uno per riga. YGG non vede mai le credenziali Epic.
const IMAGE_TYPES = ["DieselGameBoxTall", "OfferImageTall", "DieselGameBox", "Thumbnail", "OfferImageWide"];
const httpsUrl = (u) => (typeof u === "string" && /^https:\/\//.test(u) ? u : null);

function coverOf(item) {
  const direct = httpsUrl(item.art_cover) || httpsUrl(item.art_square) || httpsUrl(item.image) || httpsUrl(item.cover);
  if (direct) return direct;
  const images = item.metadata?.keyImages || item.keyImages || [];
  for (const type of IMAGE_TYPES) { const hit = images.find((i) => i.type === type && httpsUrl(i.url)); if (hit) return hit.url; }
  return null;
}

function fromJson(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.library) ? data.library : Array.isArray(data?.games) ? data.games : data && typeof data === "object" ? Object.values(data) : [];
  return list
    .filter((it) => it && typeof it === "object" && !it.is_dlc && !it.isDlc && !/addons|digitalextras/.test(JSON.stringify(it.metadata?.categories || "")))
    .map((it) => ({ name: it.app_name ?? it.appName ?? it.id ?? null, title: it.app_title ?? it.title ?? it.name ?? it.metadata?.title, cover: coverOf(it) }));
}

function fromText(text) {
  const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sep = rows[0]?.includes("\t") ? "\t" : rows[0]?.includes(",") ? "," : null;
  const cells = (row) => (sep ? row.split(sep).map((c) => c.replace(/^"|"$/g, "").trim()) : [row]);
  const head = sep ? cells(rows[0]).map((c) => c.toLowerCase()) : [];
  const titleCol = head.findIndex((c) => /title|name/.test(c) && !/app name/.test(c));
  const dlcCol = head.findIndex((c) => /dlc/.test(c));
  const body = titleCol >= 0 ? rows.slice(1) : rows; // con intestazione si usa la colonna del titolo; senza, la riga intera
  return body
    .map(cells)
    .filter((c) => !(dlcCol >= 0 && /^(true|yes|1)$/i.test(c[dlcCol] || "")))
    .map((c) => ({ name: null, title: titleCol >= 0 ? c[titleCol] : c[0], cover: null }));
}

// Restituisce [{ name, title, cover }] senza doppioni.
export function parseEpicFile(text) {
  let items;
  try { items = fromJson(JSON.parse(text)); } catch { items = fromText(String(text)); }
  const seen = new Set();
  return items.filter((i) => {
    const key = normalizeTitle(i.title);
    if (!i.title || !key || /^unreal engine/i.test(i.title) || seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, 5000);
}

// Cerca i titoli nel catalogo Steam (per copertine, screenshot, anno e generi). Restituisce { titolo: appId | null }.
export async function matchEpicTitles(titles, onProgress) {
  const out = {};
  for (let i = 0; i < titles.length; i += 10) {
    const group = titles.slice(i, i + 10);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = await fetch("/.netlify/functions/epicMatch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titles: group }) });
        const d = await r.json();
        if (r.ok && !d.rateLimited) { Object.assign(out, d.matches); break; }
      } catch { /* si riprova */ }
      await new Promise((res) => setTimeout(res, 2000));
    }
    onProgress?.(Math.min(i + 10, titles.length), titles.length);
  }
  return out;
}

// Costruisce i giochi della libreria Epic.
export function buildEpicGames(items, matches) {
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return items.map((it) => {
    const appId = matches[it.title];
    if (appId) return { ...normalizeSteamGame({ id: `steam-${appId}`, appId, title: it.title, playtime: 0 }), platform: "Epic" };
    return { id: `epic-${slug(it.name || it.title)}`, title: it.title, playtime: 0, platform: "Epic", cover: it.cover };
  });
}
