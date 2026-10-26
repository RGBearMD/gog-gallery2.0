// Libreria Steam da profilo (senza file JSON): vedi netlify/functions/steamLibrary.js
import { i18nError } from "./errors";

const CODES = ["private", "not_found", "invalid", "no_key"];

export async function fetchSteamProfile(profile) {
  let r;
  try {
    r = await fetch("/.netlify/functions/steamLibrary", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile }),
    });
  } catch { throw i18nError("err.unreachable"); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (d.code === "no_key") throw i18nError(import.meta.env.DEV ? "err.steam.no_key_dev" : "err.steam.no_key");
    throw i18nError(CODES.includes(d.code) ? `err.steam.${d.code}` : "err.steamGeneric");
  }
  return d.games;
}
