// GOG: screenshot (max 6) per UNO o PIÙ giochi in una sola chiamata: ?ids=1207658930,1207659026
// -> { items: { "<id>": { screenshots: [{ thumb, full }], year: null } | null } }
//   thumb = formato medio (lista e finestra Info) · full = grande (solo ingrandimento)
// L'anno NON si legge qui: la release_date di GOG è la data di uscita su GOG, non quella originale del gioco
// (es. 1998 → 2009). L'anno viene da fetchMeta, così lista e Info mostrano sempre lo stesso valore.
const THUMB = ["ggvgm", "ggvgt", "ggvgl"];
const FULL = ["ggvgl", "ggvgm_2x", "ggvgm"];

const pick = (shot, order) =>
  order.map((f) => shot.formatted_images?.find((i) => i.formatter_name === f)).find(Boolean)?.image_url;

const json = (status, body, cache = "no-store") =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": cache } });

async function one(id) {
  const res = await fetch(`https://api.gog.com/products/${id}?expand=screenshots`);
  if (!res.ok) throw new Error(`GOG ${res.status}`);
  const data = await res.json();
  const screenshots = (data.screenshots || [])
    .map((s) => ({ thumb: pick(s, THUMB), full: pick(s, FULL) }))
    .filter((s) => s.thumb)
    .map((s) => ({ thumb: s.thumb, full: s.full || s.thumb }))
    .slice(0, 6);
  return { screenshots, year: null };
}

export default async (req) => {
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length || ids.length > 6 || ids.some((i) => !/^\d+$/.test(i))) return json(400, { error: "Parametro 'ids' mancante o non valido (massimo 6 numeri)." });

  const items = {};
  await Promise.all(ids.map(async (id) => {
    try { items[id] = await one(id); } catch (e) { console.error("gameDetails:", id, e.message); items[id] = null; }
  }));
  return json(200, { items }, "public, max-age=86400");
};
