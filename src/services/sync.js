import { isSteam } from "./screenshots";

async function call(url, init) {
  const r = await fetch(url, init);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Servizio di trasferimento non raggiungibile.");
  return d;
}

export async function uploadLibrary(platform, games) {
  const slim = games.map((g) => ({
    id: g.id, appId: g.appId, title: g.title, playtime: g.playtime, platform: g.platform,
    cover: isSteam(g) ? undefined : g.cover, // la copertina Steam si ricostruisce dall'appId
  }));
  const d = await call("/.netlify/functions/sync", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform, games: slim }),
  });
  return d.code;
}

export const downloadLibrary = (code) =>
  call(`/.netlify/functions/sync?code=${encodeURIComponent(code)}`);
