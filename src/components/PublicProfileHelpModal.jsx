import { useState } from "react";
import { Icon } from "./Icons";

const Step = ({ n, title, children }) => (
  <li className="flex gap-3">
    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-bold">{n}</span>
    <div><h3 className="font-semibold text-fog">{title}</h3><div className="mt-1 text-sm text-muted">{children}</div></div>
  </li>
);

export default function PublicProfileHelpModal({ isOpen, onClose, platform = "gog" }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;
  const isGog = platform === "gog";

  async function copyScript() {
    try {
      const text = await (await fetch("/steam-export.js")).text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { window.open("/steam-export.js", "_blank"); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in" onClick={onClose}>
      <div className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line/70 bg-panel p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold md:text-2xl">{isGog ? "Importare la libreria GOG" : "Creare il file steam_games.json"}</h2>
          <button onClick={onClose} aria-label="Chiudi" className="text-muted hover:text-fog"><Icon name="close" /></button>
        </div>

        {isGog ? (
          <ol className="space-y-4">
            <Step n="1" title="Accedi a GOG">Entra su GOG.com con il tuo account.</Step>
            <Step n="2" title="Apri la privacy">Dalle impostazioni dell'account vai nella scheda <strong>Privacy</strong>.</Step>
            <Step n="3" title="Rendi visibile la libreria">Imposta i giochi su <strong>Everyone</strong>, poi torna qui e inserisci il tuo username.</Step>
          </ol>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">
              Si crea un file con un piccolo script che gira nel tuo browser, poi lo carichi qui. Lo script non è un file da caricare: va incollato nella console del browser (da PC).
            </p>
            <ol className="space-y-4">
              <Step n="1" title="Apri la tua libreria Steam">Dal browser su PC, vai alla pagina <strong>Tutti i giochi</strong> della libreria, con il login fatto.</Step>
              <Step n="2" title="Apri la console">Premi <kbd className="rounded bg-raised px-1.5">F12</kbd> e scegli la scheda <strong>Console</strong>. Se Chrome blocca l'incolla, scrivi <code className="rounded bg-raised px-1.5">allow pasting</code> e premi Invio.</Step>
              <Step n="3" title="Incolla lo script ed esegui">
                <button onClick={copyScript} className="mb-2 inline-flex items-center gap-2 rounded-lg bg-steam px-3 py-2 text-xs font-bold text-ink hover:brightness-110">
                  <Icon name="copy" className="size-4" /> {copied ? "Copiato!" : "Copia lo script"}
                </button>
                <br />Incolla nella console e premi Invio. La pagina scorre da sola: attendi che finisca.
              </Step>
              <Step n="4" title="Carica il file">Il browser scarica <strong>steam_games.json</strong>. Torna qui e usa il pulsante <strong>Carica steam_games.json</strong>.</Step>
              <Step n="5" title="Usalo anche sul cellulare">Questi passaggi si fanno <strong>una sola volta, da PC</strong>. Poi apri il menu ☰ e scegli <strong>Usa su un altro dispositivo</strong>: ottieni un codice. Sul telefono, nella schermata iniziale, tocca <strong>Ho un codice</strong> e inseriscilo.</Step>
            </ol>
            <p className="mt-5 rounded-xl border border-spark/30 bg-spark/10 p-3 text-xs text-muted">
              Incolla nella console solo codice di cui ti fidi: puoi leggere questo script prima di usarlo su <a href="/steam-export.js" target="_blank" rel="noreferrer" className="text-spark underline">/steam-export.js</a>. Il file resta nel tuo browser; al server arrivano solo gli ID dei giochi di cui apri gli screenshot.
            </p>
          </>
        )}

        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-raised py-3 text-sm font-bold hover:bg-line">Ho capito</button>
      </div>
    </div>
  );
}
