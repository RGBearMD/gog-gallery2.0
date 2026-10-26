// Pulsante Ko-fi con icona incorporata: nessuna richiesta a servizi esterni finché non lo tocchi.
// floating = compatto, pensato per stare fisso in un angolo dello schermo.
export default function KofiButton({ compact = false, floating = false }) {
  const size = floating ? "px-4 py-3 text-sm shadow-2xl ring-1 ring-black/20" : compact ? "w-full px-4 py-2.5 text-xs shadow-lg" : "px-5 py-3 text-sm shadow-lg";
  return (
    <a
      href="https://ko-fi.com/X0W0206J65"
      target="_blank"
      rel="noopener noreferrer"
      title="Support me on ko-fi.com"
      aria-label="Support me on Ko-fi"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#72a4f2] font-bold text-ink transition hover:brightness-110 ${size}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={compact ? "size-4" : "size-5"} aria-hidden="true">
        <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9zM16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3v2m4-2v2" />
      </svg>
      <span>{floating ? <><span className="hidden sm:inline">Support me on </span>Ko-fi</> : "Support me on Ko-fi"}</span>
    </a>
  );
}
