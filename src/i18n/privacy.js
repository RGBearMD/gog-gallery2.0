// Testo della pagina «Privacy e trasparenza» in italiano e inglese.
// Segnaposto: {hosting}, {controller}; [[mail]], [[mailTo]] e [[garante]] diventano collegamenti.
export default {
  it: {
    back: "Galleria",
    title: "Privacy e trasparenza",
    incomplete: "Dati del titolare incompleti: manca {missing}. Apri src/privacyConfig.js prima di pubblicare.",
    missingName: "il nome",
    missingEmail: "l'email di contatto",
    and: " e ",
    clear: "Cancella i dati salvati su questo dispositivo",
    confirmClear: "Cancellare librerie, screenshot e dati salvati su questo dispositivo?",
    updated: "Ultimo aggiornamento: {date}",
    sections: [
      { title: "In breve", blocks: [{ ul: [
        "Nessun account, nessuna registrazione, nessun cookie, nessuna statistica, nessuna pubblicità.",
        "Non salviamo dati personali sui nostri server: la tua libreria resta sul tuo dispositivo.",
        "Gli screenshot arrivano direttamente da Steam e GOG; le copertine passano dal nostro server, che le ridimensiona per renderle più leggere.",
        "Questo sito non è affiliato a Valve, GOG né a Epic Games."] }] },
      { title: "Chi è il titolare", blocks: [{ p: "{controller}[[mail]]" }] },
      { title: "Cosa succede ai tuoi dati", blocks: [
        { h: "Sul tuo dispositivo" }, { p: "Il browser conserva le librerie importate (con l'username GOG o il profilo Steam usati, per riaprirle e aggiornarle), i dettagli già scaricati (screenshot, anno, generi, sviluppatore ed editore), la lingua scelta e i file dell'app, per aprirla anche senza rete. Servono a far funzionare il servizio che richiedi e non vengono inviati a nessuno. Puoi cancellarli in ogni momento con il pulsante in fondo." },
        { h: "Importazione da GOG" }, { p: "L'username che inserisci viene inviato alla nostra funzione, che lo inoltra a gog.com per leggere la tua libreria (deve essere pubblica). Non lo salviamo sui nostri server. Compare però nell'indirizzo della richiesta, quindi può restare nei registri tecnici dell'hosting." },
        { h: "Importazione da Steam" }, { p: "Il link del profilo, il nome profilo o lo SteamID che scrivi viene inviato (nel corpo della richiesta, non nell'indirizzo) alla nostra funzione, che lo inoltra a Steam per leggere i tuoi giochi: funziona solo se i «Dettagli dei giochi» sono pubblici. Non lo salviamo sui nostri server. Dopo l'importazione puoi rimettere il profilo privato." },
        { h: "Importazione da Epic Games" }, { p: "Epic non offre un accesso pubblico alla libreria e YGG non vede mai le tue credenziali Epic. Il file che carichi (creato da te con lo script sulla pagina Acquisti di Epic, con Legendary o Heroic, oppure un elenco di titoli) viene letto dal tuo browser. Lo script legge solo i titoli: non prezzi, date o numeri d'ordine. I titoli sono inviati alla nostra funzione, che li cerca nel catalogo Steam per recuperare copertine, screenshot e anno. Non li salviamo sui nostri server." },
        { h: "Giochi doppi" }, { p: "Il confronto tra le tue librerie (per esempio lo stesso gioco su Steam e su GOG) avviene solo sul tuo dispositivo." },
        { h: "Anno, generi, screenshot, sviluppatore ed editore" }, { p: "Per queste informazioni inviamo ai nostri server gli ID dei giochi, che li chiedono a Steam e GOG. L'analisi di anno e generi parte in automatico dopo l'importazione e invia, a gruppi (fino a 50 giochi per volta), gli ID di tutti i giochi della libreria; per Steam chiediamo anche i tag della community, da cui ricaviamo i generi. Gli ID compaiono nell'indirizzo delle richieste e quindi nei registri tecnici dell'hosting. I risultati restano sul tuo dispositivo." },
        { h: "Registri tecnici dell'hosting" }, { p: "{hosting} registra dati tecnici di ogni richiesta (indirizzo IP, data e ora, indirizzo richiesto, browser) per garantire sicurezza e funzionamento. Li gestisce con i propri tempi di conservazione." },
        { h: "Servizi di terzi" }, { p: "Gli screenshot sono scaricati direttamente dai server di Steam (Valve) e GOG, che quindi vedono il tuo indirizzo IP. Le copertine nelle liste passano invece dal nostro server, che le scarica, le ridimensiona e non le salva: in quel caso Steam e GOG vedono solo il server. I font e le icone sono inclusi nel sito. Il pulsante «Support me on Ko-fi» è un semplice collegamento: Ko-fi riceve dati solo se lo apri." }] },
      { title: "Finalità e basi giuridiche", blocks: [{ p: "Far funzionare il servizio che richiedi (art. 6, par. 1, lett. b, GDPR) e garantire sicurezza e funzionamento del sito tramite i registri tecnici (lett. f, legittimo interesse). La memoria locale del browser è uno strumento tecnico legato al servizio richiesto." }] },
      { title: "Per quanto tempo", blocks: [{ ul: [
        "<b>Sul dispositivo:</b> finché non li cancelli.",
        "<b>Sui nostri server:</b> nessun dato personale viene conservato.",
        "<b>Registri tecnici:</b> secondo il fornitore di hosting."] }] },
      { title: "Destinatari e trasferimenti", blocks: [{ p: "{hosting} ospita il sito e le funzioni per nostro conto. Steam e GOG ricevono le richieste necessarie a fornire immagini e dati. Il fornitore può trattare dati anche fuori dallo Spazio Economico Europeo: in tal caso si applicano le garanzie previste dal GDPR (artt. 44 e seguenti)." }] },
      { title: "I tuoi diritti", blocks: [{ p: "Puoi chiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilità (artt. 15–22 GDPR)[[mailTo]]. Rispondiamo entro un mese. Puoi anche presentare reclamo al [[garante]]." }] },
      { title: "Sicurezza", blocks: [{ p: "La connessione al sito è cifrata (HTTPS), non ci sono password da custodire e raccogliamo il minimo indispensabile." }] },
      { title: "Fonti dei dati e marchi", blocks: [{ p: "Informazioni sui giochi: Steam e GOG. Steam è un marchio di Valve Corporation, GOG un marchio di GOG sp. z o.o. ed Epic Games un marchio di Epic Games, Inc. Questo sito non è affiliato né approvato da loro." }] }
    ],
    mailTo: " scrivendo a {mail}",
    garante: "Garante per la protezione dei dati personali"
  },
  en: {
    back: "Gallery",
    title: "Privacy & transparency",
    incomplete: "Controller details are incomplete: {missing} is missing. Open src/privacyConfig.js before publishing.",
    missingName: "the name",
    missingEmail: "the contact email",
    and: " and ",
    clear: "Delete the data saved on this device",
    confirmClear: "Delete libraries, screenshots and data saved on this device?",
    updated: "Last updated: {date}",
    sections: [
      { title: "In short", blocks: [{ ul: [
        "No accounts, no sign-up, no cookies, no analytics, no ads.",
        "We don't store personal data on our servers: your library stays on your device.",
        "Screenshots come straight from Steam and GOG; covers go through our server, which resizes them to make them lighter.",
        "This site is not affiliated with Valve, GOG or Epic Games."] }] },
      { title: "Who is responsible", blocks: [{ p: "{controller}[[mail]]" }] },
      { title: "What happens to your data", blocks: [
        { h: "On your device" }, { p: "Your browser keeps the libraries you imported (with the GOG username or Steam profile used, so you can reopen and refresh them), the details already downloaded (screenshots, year, genres, developer and publisher), your chosen language, and the app files so it can open even offline. They make the service you requested work and are not sent to anyone. You can delete them at any time with the button at the bottom." },
        { h: "Importing from GOG" }, { p: "The username you enter is sent to our function, which forwards it to gog.com to read your library (it must be public). We don't store it on our servers. It does appear in the request address, so it may remain in the hosting provider's technical logs." },
        { h: "Importing from Steam" }, { p: "The profile link, profile name or SteamID you enter is sent (in the request body, not in the address) to our function, which forwards it to Steam to read your games: this only works if “Game details” are public. We don't store it on our servers. After importing you can make your profile private again." },
        { h: "Importing from Epic Games" }, { p: "Epic doesn't offer public access to your library and YGG never sees your Epic credentials. The file you upload (created by you with the script on Epic's Purchases page, with Legendary or Heroic, or a list of titles) is read by your browser. The script only reads titles: not prices, dates or order numbers. The titles are sent to our function, which looks them up in the Steam catalog to get covers, screenshots and year. We don't store them on our servers." },
        { h: "Duplicate games" }, { p: "The comparison between your libraries (for example the same game on Steam and GOG) happens only on your device." },
        { h: "Year, genres, screenshots, developer and publisher" }, { p: "For this information we send game IDs to our servers, which ask Steam and GOG for them. The year and genre analysis starts automatically after the import and sends, in groups (up to 50 games at a time), the IDs of all the games in your library; for Steam we also ask for community tags, from which we derive genres. IDs appear in the request address and therefore in the hosting provider's technical logs. The results stay on your device." },
        { h: "Hosting technical logs" }, { p: "{hosting} records technical data for every request (IP address, date and time, requested address, browser) to ensure security and operation. It handles them under its own retention periods." },
        { h: "Third parties" }, { p: "Screenshots are downloaded straight from the servers of Steam (Valve) and GOG, which therefore see your IP address. Covers in the lists go through our server instead, which downloads and resizes them and doesn't save them: in that case Steam and GOG only see the server. Fonts and icons are included in the site. The “Support me on Ko-fi” button is a simple link: Ko-fi only receives data if you open it." }] },
      { title: "Purposes and legal bases", blocks: [{ p: "To make the service you request work (Art. 6(1)(b) GDPR) and to ensure the site's security and operation through technical logs (point (f), legitimate interest). The browser's local storage is a technical tool tied to the requested service." }] },
      { title: "How long", blocks: [{ ul: [
        "<b>On the device:</b> until you delete it.",
        "<b>On our servers:</b> no personal data is kept.",
        "<b>Technical logs:</b> according to the hosting provider."] }] },
      { title: "Recipients and transfers", blocks: [{ p: "{hosting} hosts the site and the functions on our behalf. Steam and GOG receive the requests needed to provide images and data. The provider may process data outside the European Economic Area: in that case the safeguards provided by the GDPR apply (Art. 44 et seq.)." }] },
      { title: "Your rights", blocks: [{ p: "You can request access, rectification, erasure, restriction, objection and portability (Arts. 15–22 GDPR)[[mailTo]]. We reply within one month. You can also lodge a complaint with the [[garante]]." }] },
      { title: "Security", blocks: [{ p: "The connection to the site is encrypted (HTTPS), there are no passwords to keep and we collect the bare minimum." }] },
      { title: "Data sources and trademarks", blocks: [{ p: "Game information: Steam and GOG. Steam is a trademark of Valve Corporation, GOG a trademark of GOG sp. z o.o. and Epic Games a trademark of Epic Games, Inc. This site is not affiliated with or endorsed by them." }] }
    ],
    mailTo: " by writing to {mail}",
    garante: "Italian Data Protection Authority (Garante per la protezione dei dati personali)"
  }
};
