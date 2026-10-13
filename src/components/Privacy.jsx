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
  if (!window.confirm("Cancellare librerie, screenshot e dati salvati su questo dispositivo?")) return;
  Object.keys(localStorage).filter((k) => k.startsWith("ygg:")).forEach((k) => localStorage.removeItem(k));
  if ("caches" in window) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  window.location.hash = "";
  window.location.reload();
}

export default function Privacy() {
  const { controllerName, contactEmail, hosting, lastUpdate } = PRIVACY;
  const incomplete = !controllerName || !contactEmail;
  useEffect(() => window.scrollTo(0, 0), []);
  const mail = contactEmail && <a className="text-spark underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>;

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
            <li>Non salviamo dati personali sui nostri server: la tua libreria resta sul tuo dispositivo.</li>
            <li>Per mostrare copertine e screenshot, il tuo browser contatta i server di Steam e GOG.</li>
            <li>Questo sito non è affiliato a Valve né a GOG.</li>
          </ul>
        </Section>

        <Section title="Chi è il titolare">
          <p>{controllerName || "—"}{mail && <> · {mail}</>}</p>
        </Section>

        <Section title="Cosa succede ai tuoi dati">
          <h3 className="font-semibold text-fog">Sul tuo dispositivo</h3>
          <p>Il browser conserva le librerie importate (con l'username GOG o il profilo Steam usati, per riaprirle e aggiornarle), i dettagli già scaricati (screenshot, anno, generi, multiplayer) e i file dell'app, per aprirla anche senza rete. Servono a far funzionare il servizio che richiedi e non vengono inviati a nessuno. Puoi cancellarli in ogni momento con il pulsante in fondo.</p>
          <h3 className="pt-1 font-semibold text-fog">Importazione da GOG</h3>
          <p>L'username che inserisci viene inviato alla nostra funzione, che lo inoltra a gog.com per leggere la tua libreria (deve essere pubblica). Non lo salviamo sui nostri server. Compare però nell'indirizzo della richiesta, quindi può restare nei registri tecnici dell'hosting.</p>
          <h3 className="pt-1 font-semibold text-fog">Importazione da Steam</h3>
          <p>Il link del profilo, il nome profilo o lo SteamID che scrivi viene inviato (nel corpo della richiesta, non nell'indirizzo) alla nostra funzione, che lo inoltra a Steam per leggere i tuoi giochi: funziona solo se i «Dettagli dei giochi» sono pubblici. Non lo salviamo sui nostri server. Dopo l'importazione puoi rimettere il profilo privato.</p>
          <h3 className="pt-1 font-semibold text-fog">Anno, generi, screenshot e multiplayer</h3>
          <p>Per queste informazioni inviamo ai nostri server gli ID dei giochi, che li chiedono a Steam, GOG e PCGamingWiki. L'analisi di anno e generi parte in automatico dopo l'importazione e invia, a gruppi (fino a 50 giochi per volta), gli ID di tutti i giochi della libreria. Gli ID compaiono nell'indirizzo delle richieste e quindi nei registri tecnici dell'hosting. I risultati restano sul tuo dispositivo.</p>
          <h3 className="pt-1 font-semibold text-fog">Registri tecnici dell'hosting</h3>
          <p>{hosting} registra dati tecnici di ogni richiesta (indirizzo IP, data e ora, indirizzo richiesto, browser) per garantire sicurezza e funzionamento. Li gestisce con i propri tempi di conservazione.</p>
          <h3 className="pt-1 font-semibold text-fog">Servizi di terzi</h3>
          <p>Copertine e screenshot sono scaricati direttamente dai server di Steam (Valve) e GOG, che quindi vedono il tuo indirizzo IP. I font e le icone sono inclusi nel sito. Il pulsante «Support me on Ko-fi» è un semplice collegamento: Ko-fi riceve dati solo se lo apri.</p>
        </Section>

        <Section title="Finalità e basi giuridiche">
          <p>Far funzionare il servizio che richiedi (art. 6, par. 1, lett. b, GDPR) e garantire sicurezza e funzionamento del sito tramite i registri tecnici (lett. f, legittimo interesse). La memoria locale del browser è uno strumento tecnico legato al servizio richiesto.</p>
        </Section>

        <Section title="Per quanto tempo">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Sul dispositivo:</strong> finché non li cancelli.</li>
            <li><strong>Sui nostri server:</strong> nessun dato personale viene conservato.</li>
            <li><strong>Registri tecnici:</strong> secondo il fornitore di hosting.</li>
          </ul>
        </Section>

        <Section title="Destinatari e trasferimenti">
          <p>{hosting} ospita il sito e le funzioni per nostro conto. Steam, GOG e PCGamingWiki ricevono le richieste necessarie a fornire immagini e dati. Il fornitore può trattare dati anche fuori dallo Spazio Economico Europeo: in tal caso si applicano le garanzie previste dal GDPR (artt. 44 e seguenti).</p>
        </Section>

        <Section title="I tuoi diritti">
          <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilità (artt. 15–22 GDPR){mail ? <> scrivendo a {mail}</> : ""}. Rispondiamo entro un mese. Puoi anche presentare reclamo al <a className="text-spark underline" href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">Garante per la protezione dei dati personali</a>.</p>
        </Section>

        <Section title="Sicurezza">
          <p>La connessione al sito è cifrata (HTTPS), non ci sono password da custodire e raccogliamo il minimo indispensabile.</p>
        </Section>

        <Section title="Fonti dei dati e marchi">
          <p>Informazioni sui giochi: Steam, GOG e PCGamingWiki (multiplayer locale e online). Steam è un marchio di Valve Corporation e GOG un marchio di GOG sp. z o.o. Questo sito non è affiliato né approvato da loro.</p>
        </Section>

        <button onClick={clearLocalData} className="rounded-xl border border-red-500/40 bg-red-950/40 py-3 text-sm font-bold text-red-200 hover:bg-red-950/70">
          Cancella i dati salvati su questo dispositivo
        </button>
        <p className="text-center text-xs text-muted">Ultimo aggiornamento: {lastUpdate}</p>
      </main>
    </div>
  );
}
