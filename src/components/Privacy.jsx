import { useEffect } from "react";
import { Icon } from "./Icons";
import { PRIVACY } from "../privacyConfig";

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-line/60 bg-panel p-5">
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-fog/90">{children}</div>
    </section>
  );
}

function clearLocalData() {
  if (!window.confirm("Cancellare libreria, screenshot e generi salvati su questo dispositivo?")) return;
  Object.keys(localStorage).filter((k) => k.startsWith("ygg:")).forEach((k) => localStorage.removeItem(k));
  if ("caches" in window) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  window.location.hash = "";
  window.location.reload();
}

export default function Privacy() {
  const { controllerName, contactEmail, hosting, lastUpdate } = PRIVACY;
  const incomplete = !controllerName || !contactEmail;
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line/60 bg-ink px-3">
        <a href="#" className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-raised"><Icon name="prev" className="size-4" /> Galleria</a>
        <h1 className="flex-1 truncate font-display text-lg font-bold tracking-tight">Privacy e trasparenza</h1>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-3 pb-16 pt-5">
        {incomplete && (
          <p role="alert" className="rounded-xl border border-spark/50 bg-spark/10 p-3 text-sm text-spark">
            Dati del titolare non ancora compilati: apri <code>src/privacyConfig.js</code> prima di pubblicare.
          </p>
        )}

        <Section title="In breve">
          <ul className="list-disc space-y-1 pl-5">
            <li>Nessun account, nessuna registrazione, nessun cookie, nessuna statistica, nessuna pubblicità.</li>
            <li>La tua libreria resta sul tuo dispositivo. Esce solo se scegli di generare un codice di trasferimento.</li>
            <li>Per mostrare copertine e screenshot, il tuo browser contatta i server di Steam e GOG.</li>
            <li>Questo sito non è affiliato a Valve né a GOG.</li>
          </ul>
        </Section>

        <Section title="Chi è il titolare">
          <p>{controllerName || "—"}{contactEmail && <> · <a className="text-spark underline" href={`mailto:${contactEmail}`}>{contactEmail}</a></>}</p>
        </Section>

        <Section title="Cosa succede ai tuoi dati">
          <h3 className="font-semibold text-fog">Sul tuo dispositivo</h3>
          <p>Il browser conserva la libreria importata, gli screenshot e i generi già scaricati e i file dell'app (per aprirla anche senza rete). Servono a far funzionare il servizio che richiedi e non vengono inviati a nessuno. Puoi cancellarli in ogni momento con il pulsante in fondo.</p>
          <h3 className="pt-1 font-semibold text-fog">Importazione da GOG</h3>
          <p>L'username che inserisci viene inviato alla nostra funzione, che lo inoltra a gog.com per leggere la tua libreria (deve essere pubblica). Non lo salviamo. Compare però nell'indirizzo della richiesta, quindi può restare nei registri tecnici dell'hosting.</p>
          <h3 className="pt-1 font-semibold text-fog">Importazione da Steam</h3>
          <p>Il file <code>steam_games.json</code> viene letto soltanto dal tuo browser: non lo carichiamo sui nostri server.</p>
          <h3 className="pt-1 font-semibold text-fog">Screenshot e generi</h3>
          <p>Per mostrare gli screenshot inviamo ai nostri server l'ID del gioco, che lo chiede a Steam o GOG. L'analisi dei generi parte in automatico dopo l'importazione e invia, a piccoli gruppi, gli ID di tutti i giochi della tua libreria. Gli ID compaiono nell'indirizzo delle richieste e quindi nei registri tecnici dell'hosting. I risultati restano sul tuo dispositivo.</p>
          <h3 className="pt-1 font-semibold text-fog">Trasferimento con codice (facoltativo)</h3>
          <p>Solo se premi «Genera codice» salviamo sui server di {hosting} la piattaforma e, per ogni gioco, ID, titolo, ore giocate (e indirizzo della copertina per GOG), insieme al codice e alla data. Non salviamo nome, email, username, ID dell'account né indirizzo IP nei nostri archivi. Chiunque conosca il codice può leggere quell'elenco, quindi trattalo come privato.</p>
          <h3 className="pt-1 font-semibold text-fog">Registri tecnici dell'hosting</h3>
          <p>{hosting} registra dati tecnici di ogni richiesta (indirizzo IP, data e ora, indirizzo richiesto, browser) per garantire sicurezza e funzionamento. Li gestisce con i propri tempi di conservazione.</p>
          <h3 className="pt-1 font-semibold text-fog">Servizi di terzi</h3>
          <p>Copertine e screenshot sono scaricati direttamente dai server di Steam (Valve) e GOG, che quindi vedono il tuo indirizzo IP. I font sono inclusi nel sito: nessuna richiesta a Google.</p>
        </Section>

        <Section title="Finalità e basi giuridiche">
          <p>Far funzionare il servizio che richiedi (art. 6, par. 1, lett. b, GDPR) e garantire sicurezza e funzionamento del sito tramite i registri tecnici (lett. f, legittimo interesse). La memoria locale del browser è uno strumento tecnico legato al servizio richiesto.</p>
        </Section>

        <Section title="Per quanto tempo">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Sul dispositivo:</strong> finché non li cancelli.</li>
            <li><strong>Codice di trasferimento:</strong> 30 giorni; poi i dati vengono eliminati da una pulizia automatica periodica (almeno una volta al giorno).</li>
            <li><strong>Registri tecnici:</strong> secondo il fornitore di hosting.</li>
            <li><strong>Username GOG e file Steam:</strong> non vengono conservati da noi.</li>
          </ul>
        </Section>

        <Section title="Destinatari e trasferimenti">
          <p>{hosting} ospita il sito e le funzioni per nostro conto. Steam e GOG ricevono le richieste necessarie a fornire immagini e dati. Il fornitore può trattare dati anche fuori dallo Spazio Economico Europeo: in tal caso si applicano le garanzie previste dal GDPR (artt. 44 e seguenti).</p>
        </Section>

        <Section title="I tuoi diritti">
          <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilità (artt. 15–22 GDPR){contactEmail ? <> scrivendo a <a className="text-spark underline" href={`mailto:${contactEmail}`}>{contactEmail}</a></> : ""}. Non essendoci account, per i dati di un codice di trasferimento indica il codice. Rispondiamo entro un mese. Puoi anche presentare reclamo al <a className="text-spark underline" href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">Garante per la protezione dei dati personali</a>.</p>
        </Section>

        <Section title="Sicurezza">
          <p>La connessione al sito è cifrata (HTTPS), non ci sono password da custodire e raccogliamo il minimo indispensabile. Il limite da conoscere: il codice di trasferimento non è cifrato, quindi non condividerlo.</p>
        </Section>

        <Section title="Marchi">
          <p>Steam è un marchio di Valve Corporation e GOG un marchio di GOG sp. z o.o. Questo sito non è affiliato né approvato da loro.</p>
        </Section>

        <button onClick={clearLocalData} className="rounded-xl border border-red-500/40 bg-red-950/40 py-3 text-sm font-bold text-red-200 hover:bg-red-950/70">
          Cancella i dati salvati su questo dispositivo
        </button>
        <p className="text-center text-xs text-muted">Ultimo aggiornamento: {lastUpdate}</p>
      </main>
    </div>
  );
}
