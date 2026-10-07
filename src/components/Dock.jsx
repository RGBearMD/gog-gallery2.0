import { Icon } from "./Icons";

const KEYS = [
  ["strip", "Strip", "strip"],
  ["grid", "Cards", "grid"],
  ["list", "Scarica Lista", "download"],
  ["random", "Casual", "dice"],
];

export default function Dock({ mode, onMode, onList, onRandom }) {
  const actions = { strip: () => onMode("strip"), grid: () => onMode("grid"), list: onList, random: onRandom };
  const hints = { list: "Scarica l'elenco dei titoli in un file .txt", random: "Apri un gioco a caso" };

  return (
    <nav aria-label="Vista e azioni" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex gap-2 rounded-2xl border border-line/70 bg-ink/95 p-2 shadow-2xl">
        {KEYS.map(([id, label, icon]) => {
          const active = mode === id;
          return (
            <button
              key={id}
              onClick={actions[id]}
              title={hints[id] || label}
              aria-pressed={id === "strip" || id === "grid" ? active : undefined}
              className={`flex size-16 flex-col items-center justify-center gap-1 rounded-xl px-1 font-display text-[11px] font-semibold leading-[1.05] transition-colors ${
                active ? "bg-spark text-ink" : "bg-panel text-muted hover:bg-raised hover:text-fog"
              }`}
            >
              <Icon name={icon} className="size-6 shrink-0" />
              <span className="text-center">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
