import { useEffect } from "react";
import { Icon } from "./Icons";
import LangToggle from "./LangToggle";
import { PRIVACY } from "../privacyConfig";
import { useI18n } from "../i18n/context";
import TEXTS from "../i18n/privacy";

// Testo con <b>…</b>
const bold = (text, key) => text.split(/(<b>.*?<\/b>)/).map((p, i) => (p.startsWith("<b>") ? <strong key={`${key}-${i}`}>{p.slice(3, -4)}</strong> : p));

function clearLocalData(message) {
  if (!window.confirm(message)) return;
  Object.keys(localStorage).filter((k) => k.startsWith("ygg:")).forEach((k) => localStorage.removeItem(k));
  if ("caches" in window) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  window.location.hash = "";
  window.location.reload();
}

export default function Privacy() {
  const { lang, locale } = useI18n();
  const d = TEXTS[lang];
  const { controllerName, contactEmail, hosting, lastUpdate } = PRIVACY;
  const missing = [!controllerName && d.missingName, !contactEmail && d.missingEmail].filter(Boolean).join(d.and);
  useEffect(() => window.scrollTo(0, 0), []);
  const mail = contactEmail && <a className="text-spark underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>;
  const garante = <a className="text-spark underline" href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">{d.garante}</a>;

  // Sostituisce segnaposto e collegamenti nel testo
  function rich(text, key) {
    return text.replace("{hosting}", hosting).replace("{controller}", controllerName || "—").split(/(\[\[\w+\]\])/).map((part, i) => {
      const token = part.match(/^\[\[(\w+)\]\]$/)?.[1];
      const k = `${key}-${i}`;
      if (token === "mail") return mail ? <span key={k}> · {mail}</span> : null;
      if (token === "mailTo") { if (!mail) return null; const [a, b] = d.mailTo.split("{mail}"); return <span key={k}>{a}{mail}{b}</span>; }
      if (token === "garante") return <span key={k}>{garante}</span>;
      return bold(part, k);
    });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line/60 bg-ink px-3">
        <a href="#" className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-raised"><Icon name="prev" className="size-4" /> {d.back}</a>
        <h1 className="flex-1 truncate font-display text-lg font-bold tracking-tight">{d.title}</h1>
        <LangToggle />
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-3 pb-16 pt-5">
        {missing && <p role="alert" className="rounded-xl border border-spark/50 bg-spark/10 p-3 text-sm text-spark">{d.incomplete.replace("{missing}", missing)}</p>}

        {d.sections.map((s, si) => (
          <section key={si} className="rounded-2xl border border-line/60 bg-panel p-5">
            <h2 className="mb-2 text-lg font-bold">{s.title}</h2>
            <div className="space-y-2 text-sm leading-relaxed text-fog/90">
              {s.blocks.map((b, bi) => b.h ? <h3 key={bi} className="pt-1 font-semibold text-fog">{b.h}</h3>
                : b.ul ? <ul key={bi} className="list-disc space-y-1 pl-5">{b.ul.map((li, i) => <li key={i}>{rich(li, `${si}${bi}${i}`)}</li>)}</ul>
                : <p key={bi}>{rich(b.p, `${si}${bi}`)}</p>)}
            </div>
          </section>
        ))}

        <button onClick={() => clearLocalData(d.confirmClear)} className="rounded-xl border border-red-500/40 bg-red-950/40 py-3 text-sm font-bold text-red-200 hover:bg-red-950/70">{d.clear}</button>
        <p className="text-center text-xs text-muted">{d.updated.replace("{date}", new Date(lastUpdate).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }))}</p>
      </main>
    </div>
  );
}
