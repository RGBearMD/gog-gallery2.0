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
    async list() {
      try {
        const names = await fs.readdir(dir);
        return { blobs: names.filter((n) => n.endsWith(".json")).map((n) => ({ key: n.slice(0, -5) })) };
      } catch { return { blobs: [] }; }
    },
    async getMetadata() { return null; }, // la data di creazione è dentro al file
  };
}

export async function getStore(name) {
  if (process.env.YGG_STORAGE === "file") return fileStore(name);
  const blobs = await import("@netlify/blobs");
  return blobs.getStore(name);
}

// I codici di trasferimento valgono 30 giorni, poi i dati vengono cancellati.
export const SYNC_TTL_MS = 30 * 24 * 3600 * 1000;

// Elimina dall'archivio tutto ciò che è più vecchio di ttlMs. Restituisce quanti elementi ha cancellato.
export async function purgeExpired(store, ttlMs = SYNC_TTL_MS) {
  const { blobs } = await store.list();
  let purged = 0;
  for (const { key } of blobs) {
    const created = (await store.getMetadata?.(key))?.metadata?.createdAt ?? (await store.get(key, { type: "json" }))?.createdAt;
    if (!created || Date.now() - created > ttlMs) { await store.delete(key); purged++; }
  }
  return purged;
}
