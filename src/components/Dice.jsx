import { useI18n } from "../i18n/context";

// Dado neon (solo CSS, vedi .dice-* in index.css) che gira al centro mentre si sceglie un gioco a caso.
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

export default function Dice() {
  const { t } = useI18n();
  return (
    <div role="status" className="fixed inset-0 z-[55] grid place-items-center bg-black/75 animate-fade-in">
      <span className="sr-only">{t("dice.rolling")}</span>
      <div className="dice-scene" aria-hidden="true">
        <div className="dice-cube">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className={`dice-face dice-f${n}`}>
              {Array.from({ length: 9 }, (_, i) => (PIPS[n].includes(i) ? <span key={i} className="dice-pip" /> : <span key={i} />))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
