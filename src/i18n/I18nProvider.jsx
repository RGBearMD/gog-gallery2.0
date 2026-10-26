import { useCallback, useEffect, useMemo, useState } from "react";
import { I18nContext } from "./context";
import it from "./it";
import en from "./en";

const MESSAGES = { it, en };
const KEY = "ygg:lang";

// Lingua: quella scelta dall'utente; altrimenti italiano se il browser è in italiano, inglese in tutti gli altri casi.
function detect() {
  try { const saved = localStorage.getItem(KEY); if (saved in MESSAGES) return saved; } catch { /* storage non disponibile */ }
  return (navigator.language || "en").toLowerCase().startsWith("it") ? "it" : "en";
}

export default function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detect);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* storage non disponibile */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = MESSAGES[lang]["meta.title"];
    document.querySelector('meta[name="description"]')?.setAttribute("content", MESSAGES[lang]["meta.description"]);
  }, [lang]);

  const t = useCallback((key, vars) => {
    const dict = MESSAGES[lang];
    const k = vars?.n === 1 && `${key}.one` in dict ? `${key}.one` : key; // singolare: «1 gioco»
    let s = dict[k] ?? MESSAGES.en[k] ?? key;
    if (vars) for (const [name, value] of Object.entries(vars)) s = s.replaceAll(`{${name}}`, String(value));
    return s;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, locale: lang === "it" ? "it-IT" : "en-GB" }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
