export default function GenreBar({ counts, active, onPick, done, total }) {
  const chip = (on) =>
    `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "bg-spark text-ink" : "bg-panel text-muted hover:text-fog"}`;
  return (
    <div className="sticky top-14 z-30 -mx-3 border-b border-line/40 bg-ink px-3 py-2 sm:-mx-5 sm:px-5">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button onClick={() => onPick(null)} className={chip(!active)}>Tutti</button>
        {counts.map(([name, n]) => (
          <button key={name} onClick={() => onPick(name)} className={chip(active === name)}>
            {name} <span className="opacity-60">{n}</span>
          </button>
        ))}
      </div>
      {done < total && <p className="mt-1.5 text-[11px] text-muted">Analisi dei generi: {done}/{total}. Prosegue in background.</p>}
    </div>
  );
}
