// Server autonomo: serve il sito compilato (dist/) e le funzioni. Nessuna dipendenza da Netlify.
//   npm run build && npm start        (variabili: PORT, DATA_DIR)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { handleFunction } from "./functions.js";

process.env.YGG_STORAGE ??= "file";

const DIST = path.resolve("dist");
const PORT = Number(process.env.PORT) || 8888;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".json": "application/json", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("Cartella dist/ mancante: esegui prima `npm run build`.");
  process.exit(1);
}

http.createServer(async (req, res) => {
  if (await handleFunction(req, res)) return;

  let pathname = "/";
  try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); } catch { /* indirizzo malformato: pagina iniziale */ }

  let file = path.join(DIST, pathname);
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html");

  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  if (pathname.startsWith("/assets/")) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Your Games Gallery in ascolto su http://localhost:${PORT}`));
