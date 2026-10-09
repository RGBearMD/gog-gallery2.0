// Archivio chiave-valore usato dal trasferimento con codice (netlify/functions/sync.js).
//  - su Netlify (default): Netlify Blobs
//  - in locale / su un server tuo (YGG_STORAGE=file): file JSON in DATA_DIR (default ".data")
import fs from "node:fs/promises";
import path from "node:path";

function fileStore(name) {
  const dir = path.resolve(process.env.DATA_DIR || ".data", name);
  const file = (key) => path.join(dir, `${String(key).replace(/[^A-Za-z0-9_-]/g, "")}.json`);
  return {
    async setJSON(key, value) {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(file(key), JSON.stringify(value));
    },
    async get(key) {
      try { return JSON.parse(await fs.readFile(file(key), "utf8")); } catch { return null; }
    },
    async delete(key) {
      await fs.rm(file(key), { force: true });
    },
  };
}

export async function getStore(name) {
  if (process.env.YGG_STORAGE === "file") return fileStore(name);
  const blobs = await import("@netlify/blobs");
  return blobs.getStore(name);
}
