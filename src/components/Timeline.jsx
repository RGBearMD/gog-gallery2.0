import { useMemo, useState } from "react";
import GameGrid from "./GameGrid";

// Timeline: uno slider per anno + istogramma; sotto, i giochi usciti in quell'anno.
export default function Timeline({ games, meta, done, total, onSelect }) {
  const [sel, setSel] = useState(null);
  const { byYear, years, unknown } = useMemo(() => {
    const map = new Map();
    let missing = 0;
    for (const g of games) {
      const y = meta[g.id]?.y;
      if (Number.isFinite(y)) map.set(y, [...(map.get(y) || []), g]);
      else missing++;
    }
    return { byYear: map, years: [...map.keys()].sort((a, b) => a - b), unknown: missing };
  }, [games, meta]);

  if (!years.length) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-muted">
        {done < total ? `Sto leggendo gli anni di uscita: ${done}/${total}…` : "Gli anni di uscita non sono disponibili per questi giochi."}
      </div>
    );
  }

  const min = years[0], max = years[years.length - 1];
  const year = Math.min(Math.max(sel ?? max, min), max);
  const list = byYear.get(year) || [];
  const peak = Math.max(...[...byYear.values()].map((a) => a.length));
  const prev = [...years].reverse().find((v) => v < year);
  const next = years.find((v) => v > year);
  const step = "rounded-lg bg-panel px-3 py-2 text-xs font-semibold hover:bg-raised disabled:opacity-30";

  return (
    <div>
      <div className="mx-auto max-w-2xl rounded-2xl border border-line/60 bg-panel p-4">
        <div className="mb-3 flex items-end justify-between">
          <p className="font-display text-5xl font-bold leading-none text-spark">{year}</p>
          <p className="text-sm text-muted">{list.length} {list.length === 1 ? "gioco" : "giochi"}</p>
        </div>

        <div className="mb-1 flex h-14 items-end gap-px" role="group" aria-label="Giochi per anno">
          {Array.from({ length: max - min + 1 }, (_, i) => {
            const y = min + i, n = byYear.get(y)?.length || 0;
            return (
              <button key={y} onClick={() => setSel(y)} aria-label={`${y}: ${n} giochi`} title={`${y} · ${n}`} className="flex h-full flex-1 items-end">
                <span className={`block w-full rounded-sm ${y === year ? "bg-spark" : n ? "bg-gog/70" : "bg-line/40"}`} style={{ height: n ? `${Math.max((n / peak) * 100, 8)}%` : "3px" }} />
              </button>
            );
          })}
        </div>
        <input type="range" min={min} max={max} step={1} value={year} onChange={(e) => setSel(Number(e.target.value))} disabled={min === max} aria-label="Anno" className="w-full accent-spark" />
        <div className="flex justify-between text-xs text-muted"><span>{min}</span><span>{max}</span></div>

        <div className="mt-3 flex justify-between gap-2">
          <button onClick={() => setSel(prev)} disabled={prev === undefined} className={step}>← {prev ?? "—"}</button>
          <button onClick={() => setSel(next)} disabled={next === undefined} className={step}>{next ?? "—"} →</button>
        </div>
      </div>

      <div className="mt-4">
        {list.length ? <GameGrid games={list} meta={meta} onSelect={onSelect} /> : <p className="py-8 text-center text-sm text-muted">Nessun gioco del {year}.</p>}
      </div>
      {unknown > 0 && (
        <p className="mt-4 text-center text-xs text-muted">
          {done < total ? `Sto ancora leggendo gli anni (${done}/${total}). ` : ""}{unknown} {unknown === 1 ? "gioco" : "giochi"} senza anno di uscita non compaiono nella timeline.
        </p>
      )}
    </div>
  );
}
