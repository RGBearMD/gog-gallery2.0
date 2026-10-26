import { Icon } from "./Icons";
import { useI18n } from "../i18n/context";

const KEYS = [
  ["strip", "dock.strip", "strip"],
  ["grid", "dock.cards", "grid"],
  ["filter", "dock.filter", "filter"],
  ["timeline", "dock.timeline", "timeline"],
  ["random", "dock.random", "dice"],
];

export default function Dock({ mode, filterActive, rolling, onMode, onFilter, onRandom }) {
  const { t } = useI18n();
  const actions = { strip: () => onMode("strip"), grid: () => onMode("grid"), timeline: () => onMode("timeline"), filter: onFilter, random: onRandom };
  const hints = { filter: t("dock.filterHint"), timeline: t("dock.timelineHint"), random: t("dock.randomHint") };

  return (
    <nav aria-label={t("dock.aria")} className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex gap-1.5 rounded-2xl border border-line/70 bg-ink/95 p-1.5 shadow-2xl sm:gap-2 sm:p-2">
        {KEYS.map(([id, label, icon]) => {
          const active = id === "filter" ? filterActive : id === "random" ? rolling : mode === id;
          return (
            <button
              key={id}
              onClick={actions[id]}
              title={hints[id] || t(label)}
              aria-pressed={id === "strip" || id === "grid" || id === "timeline" ? active : undefined}
              className={`flex size-14 flex-col items-center justify-center gap-1 rounded-xl px-0.5 font-display text-[10px] font-semibold leading-[1.05] transition-colors sm:size-16 sm:text-[11px] ${
                active ? "bg-spark text-ink" : "bg-panel text-muted hover:bg-raised hover:text-fog"
              }`}
            >
              <Icon name={icon} className="size-5 shrink-0 sm:size-6" />
              <span className="text-center">{t(label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
