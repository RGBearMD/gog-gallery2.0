import { Icon } from "./Icons";

// Pannello «Filtra»: scorre dal basso, con i generi e quanti giochi ha ciascuno.
export default function FilterSheet({ open, onClose, counts, active, onPick, done, total }) {
  if (!open) return null;
  const chip = (on) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${on ? "bg-spark text-ink" : "bg-panel text-fog hover:bg-raised"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 flex max-h-[75vh] w-full max-w-xl flex-col rounded-t-2xl border border-line/70 bg-ink p-4 pb-[max(1rem,env(safe-area-inset-bottom))] animate-slide-up">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Filtra per genere</h2>
          <button onClick={onClose} aria-label="Chiudi" className="rounded-full p-1.5 text-muted hover:text-fog"><Icon name="close" /></button>
        </div>

        {done < total && (
          <div className="mb-3">
            <p className="mb-1 text-xs text-muted">Analisi dei generi: {done}/{total}</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-panel"><div className="h-full bg-spark transition-all duration-500" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
          </div>
        )}

        <div className="custom-scrollbar flex flex-wrap gap-2 overflow-y-auto">
          <button onClick={() => onPick(null)} className={chip(!active)}>Tutti i giochi <span className="opacity-60">{total}</span></button>
          {counts.map(([name, n]) => (
            <button key={name} onClick={() => onPick(name)} className={chip(active === name)}>
              {name} <span className="opacity-60">{n}</span>
            </button>
          ))}
        </div>
        {counts.length === 0 && <p className="mt-3 text-sm text-muted">I generi compaiono man mano che vengono letti.</p>}
      </div>
    </div>
  );
}
