// Esegue le funzioni di netlify/functions/ fuori da Netlify (Vite in sviluppo, server Node).
// Tutte le funzioni hanno la forma standard: export default async (Request) => Response.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PREFIX = "/.netlify/functions/";
const MAX_BODY = 3_000_000;
const FORWARD = ["content-type", "accept", "user-agent"];

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error("Richiesta troppo grande")); req.destroy(); } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

// Restituisce true se la richiesta era per una funzione (e l'ha gestita).
export async function handleFunction(req, res, { fresh = false } = {}) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (!url.pathname.startsWith(PREFIX)) return false;

  const name = url.pathname.slice(PREFIX.length);
  const file = path.resolve("netlify/functions", `${name}.js`);
  if (!/^[A-Za-z0-9_-]+$/.test(name) || !fs.existsSync(file)) {
    send(res, 404, { error: "Funzione non trovata." });
    return true;
  }

  try {
    const mod = await import(pathToFileURL(file).href + (fresh ? `?t=${Date.now()}` : ""));
    const headers = Object.fromEntries(FORWARD.filter((h) => req.headers[h]).map((h) => [h, req.headers[h]]));
    const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
    const response = await mod.default(new Request(url, { method: req.method, headers, body }));

    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (e) {
    console.error(`[funzione ${name}]`, e);
    send(res, 500, { error: "Errore interno della funzione." });
  }
  return true;
}
