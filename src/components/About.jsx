// «Cos'è YGG»: breve presentazione con 3 immagini d'esempio (giochi fittizi, in public/screens/: sostituibili con le tue).
const SHOTS = [
  ["/screens/strip.webp", "La lista: copertina, titolo, anno e screenshot"],
  ["/screens/info.webp", "La scheda del gioco: anno, multiplayer, link allo store"],
  ["/screens/timeline.webp", "La timeline: i giochi anno per anno"],
];

export default function About() {
  return (
    <section className="mt-14 text-left" aria-labelledby="about-title">
      <h3 id="about-title" className="text-xl font-bold tracking-tight">Cos'è YGG</h3>
      <p className="mt-2 text-sm leading-relaxed text-fog/90">
        YGG, Your Games Gallery, trasforma la tua libreria GOG o Steam in una gallery elegante e portatile: guardi i giochi che possiedi come le opere di un museo digitale.
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-muted">
        <li>• Ogni gioco ha la sua scheda: copertina, screenshot, anno di uscita e multiplayer.</li>
        <li>• Sfoglia come vuoi: lista, cards, filtri per genere e una timeline anno per anno.</li>
        <li>• Installala come app: nessun account, la libreria resta sul tuo dispositivo e si riapre anche senza rete (le immagini richiedono la connessione).</li>
      </ul>
      <div className="no-scrollbar -mx-3 mt-5 flex snap-x gap-3 overflow-x-auto px-3 pb-2">
        {SHOTS.map(([src, caption]) => (
          <figure key={src} className="w-44 shrink-0 snap-center">
            <img src={src} alt={caption} width="390" height="844" loading="lazy" decoding="async" className="h-auto w-full rounded-xl border-2 border-line bg-panel shadow-lg" />
            <figcaption className="mt-1.5 text-xs leading-snug text-muted">{caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
