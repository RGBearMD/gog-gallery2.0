// Trasferimento libreria tra dispositivi con un codice di 8 caratteri.
// POST {platform, games} -> {code}   |   GET ?code=XXXXXXXX -> {platform, games}
import { getStore } from "@netlify/blobs";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // senza caratteri ambigui (0/O, 1/I/L)
const TTL_MS = 30 * 24 * 3600 * 1000;

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => ALPHABET[b % ALPHABET.length]).join("");

// Salvo solo i campi che servono all'app, con limiti di lunghezza.
const clean = (g) => ({
  id: typeof g.id === "number" ? g.id : String(g.id ?? "").slice(0, 40),
  appId: Number.isFinite(g.appId) ? g.appId : undefined,
  title: String(g.title ?? "").slice(0, 200),
  playtime: Number.isFinite(g.playtime) ? g.playtime : 0,
  cover: typeof g.cover === "string" ? g.cover.slice(0, 300) : undefined,
  platform: g.platform === "Steam" ? "Steam" : g.platform === "GOG" ? "GOG" : undefined,
});

export default async (req) => {
  try {
    const store = getStore("library-sync");

    if (req.method === "POST") {
      const text = await req.text();
      if (text.length > 2_000_000) return json(413, { error: "Libreria troppo grande." });
      const { platform, games } = JSON.parse(text);
      if (!Array.isArray(games) || !games.length || games.length > 5000) return json(400, { error: "Libreria non valida." });
      const code = newCode();
      await store.setJSON(code, {
        platform: platform === "steam" ? "steam" : "gog",
        games: games.map(clean).filter((g) => g.title && g.id !== ""),
        createdAt: Date.now(),
      });
      return json(200, { code });
    }

    const code = (new URL(req.url).searchParams.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== 8) return json(400, { error: "Il codice deve avere 8 caratteri." });
    const data = await store.get(code, { type: "json" });
    if (!data || Date.now() - data.createdAt > TTL_MS) {
      if (data) await store.delete(code);
      return json(404, { error: "Codice non trovato o scaduto." });
    }
    return json(200, { platform: data.platform, games: data.games });
  } catch (e) {
    console.error("sync:", e);
    return json(500, { error: "Errore del servizio di trasferimento." });
  }
};
