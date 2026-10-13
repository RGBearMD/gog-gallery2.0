// Service worker minimale: rende l'app installabile e apribile anche offline.
// Conserva SOLO i file dell'app. Non tocca le chiamate alle funzioni (/.netlify/*) né le immagini di Steam/GOG.
const CACHE = "ygg-__BUILD_ID__"; // il numero cambia a ogni build (vedi vite.config.js)

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/manifest.webmanifest", "/favicon-48.png"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/.netlify/")) return;

  if (req.mode === "navigate") {
    // Pagina: prima la rete (così gli aggiornamenti arrivano subito), se offline la copia salvata.
    e.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("/", copy)); } return res; })
        .catch(() => caches.match("/"))
    );
  } else if (url.pathname.startsWith("/assets/")) {
    // File con l'hash nel nome: non cambiano mai, quindi prima la copia salvata.
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; }))
    );
  }
});
