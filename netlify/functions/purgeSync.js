// Funzione pianificata (ogni giorno): elimina i codici di trasferimento scaduti.
import { getStore, purgeExpired } from "../../lib/store.js";

export default async () => {
  const purged = await purgeExpired(await getStore("library-sync"));
  return new Response(JSON.stringify({ purged }), { headers: { "Content-Type": "application/json" } });
};

export const config = { schedule: "@daily" };
