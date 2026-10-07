import { useState } from "react";
import { Icon } from "./Icons";

function scrollToGame(id) {
  const el = document.getElementById(`game-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 1700);
}

export default function GameIndex({ games, isOpen, onClose }) {
  const [q, setQ] = useState("");
  if (!isOpen) return null;
  const list = games.filter((g) => g.title.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-80 max-w-[88vw] flex-col border-r border-line/70 bg-ink animate-slide-right">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="font-semibold">I tuoi giochi ({games.length})</h2>
          <button onClick={onClose} aria-label="Chiudi menu" className="rounded-full p-1.5 text-muted hover:text-fog"><Icon name="close" /></button>
        </div>
        <div className="px-4 pb-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca un gioco…" className="w-full rounded-lg border border-line/60 bg-panel px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-spark" />
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto px-2 pb-4">
          {list.map((g) => (
            <button key={g.id} onClick={() => { scrollToGame(g.id); onClose(); }} className="block w-full truncate rounded-md px-3 py-2 text-left text-sm text-fog/90 hover:bg-raised hover:text-spark">
              {g.title}
            </button>
          ))}
          {list.length === 0 && <p className="px-3 py-4 text-sm text-muted">Nessun gioco trovato.</p>}
        </div>
      </aside>
    </div>
  );
}
