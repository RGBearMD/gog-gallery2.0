// Ridimensiona le copertine: /.netlify/functions/img?u=<indirizzo immagine>&w=<larghezza in pixel>
// Scarica l'originale (spesso molto grande) e restituisce una versione WebP leggera. Non salva nulla.
// Accetta solo immagini di GOG e Steam (non è un proxy aperto).
import sharp from "sharp";

const ALLOWED = [/(^|\.)gog\.com$/i, /(^|\.)gog-statics\.com$/i, /(^|\.)steamstatic\.com$/i];
const extraHosts = () => (process.env.IMG_ALLOW_HOSTS || "").split(",").map((s) => s.trim()).filter(Boolean); // solo per i test in locale
const allowed = (host) => ALLOWED.some((re) => re.test(host)) || extraHosts().includes(host);
const MAX_INPUT = 12 * 1024 * 1024;

const fail = (status, error) =>
  new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export default async (req) => {
  const q = new URL(req.url).searchParams;
  let src;
  try { src = new URL(q.get("u")); } catch { return fail(400, "Indirizzo non valido."); }
  if (!allowed(src.hostname) || (src.protocol !== "https:" && !extraHosts().includes(src.hostname))) return fail(400, "Indirizzo non consentito.");
  const width = Math.min(Math.max(parseInt(q.get("w"), 10) || 320, 64), 800);

  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "YourGamesGallery/1.0" } });
    if (!res.ok) return fail(502, `Origine: HTTP ${res.status}`);
    if (!allowed(new URL(res.url).hostname)) return fail(400, "Reindirizzamento non consentito.");
    if (Number(res.headers.get("content-length")) > MAX_INPUT) return fail(413, "Immagine troppo grande.");
    const input = Buffer.from(await res.arrayBuffer());
    if (input.length > MAX_INPUT) return fail(413, "Immagine troppo grande.");

    const out = await sharp(input, { failOn: "none" }).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer();
    return new Response(out, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Netlify-CDN-Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (e) {
    console.error("img:", e.message);
    return fail(502, "Impossibile elaborare l'immagine.");
  }
};
