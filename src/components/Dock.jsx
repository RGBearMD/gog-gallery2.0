import { Icon } from "./Icons";

const KEYS = [
  ["strip", "Strip", "strip"],
  ["grid", "Cards", "grid"],
  ["filter", "Filtra", "filter"],
  ["timeline", "Timeline", "timeline"],
  ["random", "Casual", "dice"],
];

export default function Dock({ mode, filterActive, onMode, onFilter, onRandom }) {
  const actions = { strip: () => onMode("strip"), grid: () => onMode("grid"), timeline: () => onMode("timeline"), filter: onFilter, random: onRandom };
  const hints = { filter: "Filtra i giochi per genere", timeline: "Sfoglia i giochi anno per anno", random: "Apri un gioco a caso" };

  return (
    <nav aria-label="Vista e azioni" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex gap-1.5 rounded-2xl border border-line/70 bg-ink/95 p-1.5 shadow-2xl sm:gap-2 sm:p-2">
        {KEYS.map(([id, label, icon]) => {
          const active = id === "filter" ? filterActive : mode === id;
          return (
            <button
              key={id}
              onClick={actions[id]}
              title={hints[id] || label}
              aria-pressed={id === "strip" || id === "grid" || id === "timeline" ? active : undefined}
              className={`flex size-14 flex-col items-center justify-center gap-1 rounded-xl font-display text-[10px] font-semibold leading-[1.05] transition-colors sm:size-16 sm:text-[11px] ${
                active ? "bg-spark text-ink" : "bg-panel text-muted hover:bg-raised hover:text-fog"
              }`}
            >
              <Icon name={icon} className="size-5 shrink-0 sm:size-6" />
              <span className="text-center">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
