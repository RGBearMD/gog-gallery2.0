import { useI18n } from "../i18n/context";

// Selettore di lingua IT | EN
export default function LangToggle({ className = "" }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t("lang.switch")} className={`flex shrink-0 overflow-hidden rounded-lg border border-line/70 text-xs font-bold ${className}`}>
      {["it", "en"].map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} lang={l}
          className={`px-2.5 py-1.5 transition-colors ${lang === l ? "bg-spark text-ink" : "bg-panel text-muted hover:text-fog"}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
