import { Icon } from "./Icons";

const Step = ({ n, title, children }) => (
  <li className="flex gap-3">
    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-bold">{n}</span>
    <div><h3 className="font-semibold text-fog">{title}</h3><div className="mt-1 text-sm text-muted">{children}</div></div>
  </li>
);

export default function PublicProfileHelpModal({ isOpen, onClose, platform = "gog" }) {
  if (!isOpen) return null;
  const isGog = platform === "gog";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={onClose}>
      <div className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line/70 bg-panel p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold md:text-2xl">{isGog ? "Importare la libreria GOG" : "Importare la libreria Steam"}</h2>
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
            <ol className="space-y-4">
              <Step n="1" title="Apri le impostazioni di privacy di Steam">Su Steam vai in <strong>Profilo → Modifica profilo → Impostazioni privacy</strong>.</Step>
              <Step n="2" title="Rendi pubblici i giochi">Imposta <strong>Dettagli dei giochi</strong> su <strong>Pubblico</strong>.</Step>
              <Step n="3" title="Incolla il tuo profilo">Qui scrivi il link del profilo, il nome profilo o lo SteamID e tocca <strong>Mostra la mia libreria</strong>. Funziona anche da telefono.</Step>
            </ol>
            <p className="mt-5 rounded-xl border border-spark/30 bg-spark/10 p-3 text-xs text-muted">
              Dopo l'importazione puoi rimettere il profilo privato: la libreria resta salvata sul tuo dispositivo. Ti servirà pubblico solo per «Aggiorna».
            </p>
          </>
        )}

        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-raised py-3 text-sm font-bold hover:bg-line">Ho capito</button>
      </div>
    </div>
  );
}
