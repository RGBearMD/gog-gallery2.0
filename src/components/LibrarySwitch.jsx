import { useEffect } from "react";
import { Icon } from "./Icons";

const DOT = { gog: "bg-gog", steam: "bg-steam", epic: "bg-epic" };

// Finestra per passare a un'altra libreria salvata.
export default function LibrarySwitch({ open, onClose, libraries, current, onPick, onManage }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={onClose}>
      <div role="dialog" aria-label="Le tue librerie" className="w-full max-w-sm animate-scale-up rounded-2xl border border-line/70 bg-panel p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Le tue librerie</h2>
          <button onClick={onClose} aria-label="Chiudi" className="text-muted hover:text-fog"><Icon name="close" /></button>
        </div>
        <ul className="space-y-2">
          {libraries.map((l) => (
            <li key={l.platform}>
              <button onClick={() => onPick(l.platform)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${l.platform === current ? "bg-raised ring-1 ring-spark" : "bg-ink hover:bg-raised"}`}>
                <span className={`size-2.5 shrink-0 rounded-full ${DOT[l.platform]}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{l.label}</span>
                  <span className="block text-xs text-muted">{l.count} giochi</span>
                </span>
                <span className={`text-xs font-semibold ${l.platform === current ? "text-spark" : "text-muted"}`}>{l.platform === current ? "In uso" : "Apri"}</span>
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onManage} className="mt-3 w-full rounded-xl border border-line py-2.5 text-sm font-semibold hover:bg-raised">Aggiungi o gestisci librerie</button>
      </div>
    </div>
  );
}
