# YGG · Your Games Gallery — contesto per assistenti AI

Leggi questo file **prima** di toccare il codice: descrive cosa fa l'app, com'è fatta, cosa è già stato risolto (e perché), cosa NON è stato verificato e le regole per lavorarci.

- **Sito online:** https://yourgamesgallery.netlify.app/ · **Lingua:** l'utente parla italiano, rispondi in italiano.
- **Scopo (parole dell'autore):** dare una **panoramica immediata dei giochi mostrando già anche gli screenshot**, così una persona si fa un'idea di com'è ogni gioco. Le librerie di solito mostrano solo le copertine, ed è limitante. Tono: «un bellissimo museo digitale della propria collezione». Pensata per **mobile**, installabile (PWA, Android).
- **Creatore:** Massimo D'Ambrogio (titolare nella pagina privacy; manca ancora l'email in `src/privacyConfig.js`).
- **Logo:** `public/logo.webp` (home, con animazione di fluttuazione), `logo-sm.webp` (header), icone app/favicon/og derivate dal file originale dell'utente (`YGGLogoDef1_0.png`, ripulito dalle sbavature).

## 1. Stack e comandi

React 19 · Vite 8 · Tailwind CSS v4 · ESLint 10 (react-hooks 7, react-refresh) · Netlify (hosting + Functions ESM) · font locali `@fontsource` (Chakra Petch + DM Sans, OFL). **Nessun database e nessun archivio sul server.**

```
npm run dev      # sito + funzioni IN LOCALE (plugin in vite.config.js): niente Netlify, niente crediti
npm run build    # vite build (genera anche l'ID di versione del service worker)
npm start        # dopo il build: server Node autonomo (sito + funzioni) su http://localhost:8888 (PORT)
npm run lint     # eslint . (copre anche public/, netlify/, server/). Attualmente PULITO
npm audit        # attualmente 0 vulnerabilità
```
Per provare dal telefono sulla stessa Wi-Fi: `npm run dev -- --host`. **Chiave Steam in locale:** copia `.env.example` in `.env` (stessa cartella di `package.json`, nome esatto `.env`, NON `.env.txt`), scrivi `STEAM_API_KEY=la_chiave` senza spazi e RIAVVIA `npm run dev`: all'avvio il terminale stampa «Steam: chiave API trovata/NON trovata/VUOTA» (legge `.env.local` e `.env`; `.env.example` ha la chiave vuota apposta). Su Netlify la chiave sta in Environment variables e vale dopo un nuovo deploy. Per i test si possono puntare le API a un finto server con `STEAM_API_BASE` e `STEAM_STORE_BASE`, e si può consentire un host di immagini di prova a `img` con `IMG_ALLOW_HOSTS`.

## 2. Struttura (solo file in uso)

```
index.html                       favicon, manifest, anteprima social (og:image con URL ASSOLUTO del sito), preconnect steamstatic
public/                          logo*.webp, og.jpg, favicon-32/48.png, apple-touch-icon.png, icons/ (192, 512, maskable),
                                 manifest.webmanifest, sw.js (service worker), screens/ (3 immagini d'esempio per «Cos'è YGG»)
src/main.jsx · src/index.css     font locali; token colore, keyframes (float, scaleUp, slideUp…), reduced-motion
src/privacyConfig.js             DATI DEL TITOLARE da compilare prima di pubblicare (nome, email, hosting)
src/App.jsx                      stato globale, home, header, filtri, rendering progressivo, modalità vista
src/components/
  GameStrip.jsx                  Lista. **GOG** (copertina ORIZZONTALE): riga in alto = copertina (112px) + «Titolo - anno», sotto 3 screenshot a tutta larghezza. **Steam** (copertina verticale): copertina piccola (56px) a sinistra; accanto «Titolo - anno» e sotto 2 screenshot. Miniature = formato MEDIO (Steam 600x338, GOG ggvgm). TUTTA la scheda apre «Info»
  GameGrid.jsx                   Cards (usata anche dalla Timeline). **Steam/Epic:** copertina 2:3 con titolo/anno/ore in sovraimpressione (2–6 colonne). **GOG:** copertina ORIZZONTALE (460/215) con titolo e anno SOTTO (2–5 colonne, mai verticale). Con il filtro «giochi doppi» mostra «Anche su …»
  GameModal.jsx                  «Info»: titolo «Titolo - anno», badge piattaforma cliccabile (→ pagina Steam/GOG), ore giocate e **6 screenshot** (2 colonne×3 righe su mobile, 3×2 su desktop); NESSUN riquadro di dettagli (multiplayer ecc. rimossi); click su uno screenshot → Lightbox
  Timeline.jsx                   modalità Timeline: istogramma + slider anno min→max + giochi di quell'anno, ← →
  FilterSheet.jsx                pannello «Filtra» (bottom sheet): generi con conteggi + avanzamento analisi
  GameIndex.jsx                  drawer ☰: lista ALFABETICA con ricerca, Scarica lista, Installa, Ko-fi, Privacy e, IN FONDO, «Torna alla home» (logo)
  LibrarySwitch.jsx              finestra «Le tue librerie»: passa da una libreria salvata all'altra (si apre dal pulsante in header, visibile solo con 2+ librerie) + «Aggiungi o gestisci librerie» (→ home)
  Dock.jsx                       5 tasti quadrati fissi in basso: Strip, Cards, Filtra, Timeline, Casual
  About.jsx                      «Cos'è YGG» con 3 screenshot d'esempio (GIOCHI FITTIZI con arte originale: nessuna immagine di giochi reali)
  KofiButton.jsx                 pulsante Ko-fi con icona SVG incorporata (nessuna richiesta esterna finché non lo tocchi)
  Thumb.jsx · Lightbox.jsx       miniatura con dissolvenza al caricamento; ingrandimento
  Cover.jsx                      copertina con catena di ripiego: versione ridimensionata (`img`, se `width`) → originale → immagine orizzontale → nascosta
  Icons.jsx · Sentinel.jsx
  PublicProfileHelpModal.jsx     guida: come rendere pubblici GOG / «Dettagli dei giochi» di Steam
  Privacy.jsx                    pagina «Privacy e trasparenza» (route `#privacy`, senza router) + «Cancella i dati salvati»
src/services/
  gameData.js                    helper (isSteam, coverUrl, storeUrl, hoursPlayed, normalizeSteamGame) + fetchDetails/useGameDetails (screenshot+anno): cache, coda max 3 chiamate, richieste UNITE (6 giochi Steam / 4 GOG per chiamata), un secondo tentativo, `failed` se il server non risponde
  meta.js                        useMeta: anno + generi di tutta la libreria in background (50 giochi Steam per richiesta)
  steamProfile.js · gogApi.js    import libreria Steam (da profilo) / GOG (username)
  epicImport.js                  Epic: parseEpicFile (JSON Legendary/Heroic, CSV/TSV, elenco di titoli), matchEpicTitles (chiama `epicMatch`), buildEpicGames
  titles.js                      normalizeTitle: UNICA chiave di confronto tra titoli (client e funzioni): senza maiuscole/accenti/™®/punteggiatura/apostrofi, senza «The» e diciture di edizione, numero romano finale → cifra
  viewport.js · install.js · scroll.js
netlify/functions/               TUTTE nella forma standard `export default async (Request) => Response`
  gog.js                         proxy di gog.com/u/{user}/games/stats
  steamLibrary.js                POST {profile} → libreria Steam (GetOwnedGames, serve STEAM_API_KEY e «Dettagli dei giochi» pubblici). Codici: no_key 501, invalid 400, not_found 404, private 403
  fetchSteamDetails.js           ?appIds=620,730 (max 8) → { items: { id: {screenshots[≤6 {thumb,full}], year}|null }, rateLimited } (appdetails: screenshots, release_date)
  gameDetails.js                 ?ids=… (GOG, max 6) → { items: { id: {screenshots[≤6 {thumb,full}], year: null}|null } }. thumb=ggvgm (lista e Info), full=ggvgl (solo ingrandimento). L'ANNO NON si legge qui (vedi «Anno» sotto)
  img.js                         ?u=<url>&w=<px> → WebP ridimensionato (sharp) delle copertine; accetta solo host GOG/Steam (+ `IMG_ALLOW_HOSTS` nei test), max 12 MB, larghezza 64–800, cache lunga. Se fallisce il client ripiega sull'originale
netlify.toml                     solo `[functions]`: `external_node_modules = ["sharp"]`
  fetchMeta.js                   ?ids=steam-620,… → { meta: { id: {g: generi, y: anno}|null }, rateLimited, mode }. Steam: IStoreBrowseService (batch, tag community, data uscita) con ripiego su appdetails; GOG: v2 per gioco
  epicMatch.js                   POST {titles ≤10} → { matches: {titolo: appId|null} } cercando nel catalogo Steam (`storesearch`) con corrispondenza ESATTA dopo normalizzazione (meglio nessuna scheda che una sbagliata)
server/functions.js · index.js   adattatore che esegue le funzioni fuori da Netlify; server Node autonomo (carica .env)
```

## 3. Modello dati e flussi

**Gioco:** `{ id, title, cover, playtime (MINUTI), platform: "GOG"|"Steam", appId?, url? }`. Id Steam = `"steam-<appId>"`; id GOG = numero; `url` GOG = pagina dello store.

**localStorage:** `ygg:accounts:v1` (librerie salvate: `{ last, gog:{id,games,savedAt,source}, steam:{…}, epic:{…} }`; l'app si riapre su `last`; NON c'è più il pulsante «Cambia»: si cambia libreria dal pulsante in header (2+ librerie) o tornando alla home dal LOGO; `navigator.storage.persist()` richiesto) · `ygg:details:v3:<id>` (screenshot+anno) · `ygg:meta:v1` (anno+generi). Chiavi vecchie vengono migrate o rimosse da sole.

**Import:** GOG = username (libreria pubblica). Steam = link/nome/SteamID → `steamLibrary` (l'utente imposta «Dettagli dei giochi» su Pubblico; dopo l'import può rimetterli privati). **Epic = file**: Epic NON ha un'API pubblica per la libreria; YGG non gestisce MAI credenziali Epic. L'utente esporta con Legendary (`legendary list --json`/`--csv`) o Heroic, oppure scrive un elenco di titoli; `parseEpicFile` legge il file (DLC e Unreal Engine esclusi, copertine solo `https`), `epicMatch` cerca ogni titolo nel catalogo Steam: se coincide il gioco diventa `{id:"steam-<appId>", appId, platform:"Epic"}` (quindi dati, copertina verticale, screenshot e generi di Steam), altrimenti è «solo-Epic» (`id epic-<nome>`, scheda con iniziale, nessun dettaglio: `isEpicOnly`, escluso da `useMeta` e `fetchDetails`). Link «Epic ↗» = ricerca sullo store Epic. Rimossi nel giro 7: script JS, file `steam_games.json`, codice di trasferimento.

**Giochi doppi:** `dupOf` in `App.jsx` confronta (solo sul dispositivo) i titoli normalizzati della libreria aperta con quelle salvate; filtro nel pannello «Filtra» (richiede 2+ librerie), si combina col genere; il badge «Anche su …» si vede solo in quella vista. Limite: il confronto è per titolo, quindi edizioni molto diverse o titoli tradotti non coincidono.

**Dettagli di un gioco:** `fetchDetails` (una sola implementazione, in `gameData.js`). Le richieste di più giochi vicini nel tempo (40 ms) sono UNITE in una chiamata (gruppi da 6 Steam / 4 GOG), max 3 chiamate insieme, un secondo tentativo dopo 1,5 s; risultati vuoti non memorizzati. Strip: richiesta solo per le righe vicine allo schermo (`useNearViewport`, margine 900px). Le miniature sono formati medi (Steam `600x338`, GOG `ggvgm`: il formato piccolo `ggvgt` era TROPPO sfocato e non si usa); l'alta definizione (`full`) si scarica SOLO all'ingrandimento.

**Copertine:** nelle liste passano dalla funzione `img` (Strip: Steam 168px, GOG 336px; Cards/Timeline: 420px) perché gli originali sono grandi (GOG: indirizzo grezzo `item.game.image`, formato non verificato). Misurato col mock: 678 KB → 17 KB. Le copertine hanno `fetchPriority="low"` nella Strip per lasciare banda agli screenshot.

**Anno (REGOLA):** una sola fonte per gioco, `useMeta` (`fetchMeta`); i dettagli (`year`) valgono solo come ripiego quando manca (Strip: `meta ?? dettagli`; Modal: `metaYear ?? year`). Motivo: GOG `release_date` = uscita su GOG (es. 2009), non quella originale (1998): lista e Info mostravano anni diversi.

**Anno e generi (`useMeta`):** 50 giochi Steam per richiesta (GOG 6), pausa 1,2 s; se `mode:"single"` (ripiego lento) scende a 4 ogni 5 s; backoff 90 s se Steam limita. Misurato col mock: 332 giochi in ~8 s. `GENRE_TAGS` in `fetchMeta.js` tiene solo i tag che sono generi. L'anno alimenta Strip/Cards/Timeline.


**Rendering:** progressivo (`STEP = 24`, `Sentinel`); `jumpTo` (menu ☰) allarga la lista con `flushSync`. Strip/Cards in modalità Timeline mostrano solo i giochi dell'anno.

**PWA:** manifest + icone (anche maskable) + `sw.js` (solo pagina e `/assets/*`; non tocca `/.netlify/*` né immagini Steam/GOG; ID di versione sostituito a ogni build in `vite.config.js`). Pulsante «Installa l'app» da `beforeinstallprompt`.

## 4. Cronologia (sintesi)

- **Giri 1–2:** UI da zero (palette ink/spark, Chakra Petch+DM Sans), un solo servizio per gli screenshot (prima 3 implementazioni, il Modal ignorava i dati scaricati perché `[]` è truthy), immagini leggere (thumb/full), rendering progressivo, hamburger alfabetico, Dock fisso, privacy di base.
- **Giro 3–4:** rimossi file inutili e `cheerio`; funzioni eseguibili in locale e su server Node (`npm run dev`/`npm start`) per non dipendere da Netlify (crediti: piano gratuito 300/mese, 15 per deploy di produzione → sviluppare in locale, un deploy per lotto).
- **Giro 5:** font locali, pagina privacy, PWA.
- **Giro 6:** analisi generi da minuti a ~8 s (batch Steam + tag), pannello «Filtra», multi-account salvati, Steam da profilo.
- **Giro 7:** `npm audit fix` (0 vulnerabilità; il `package-lock.json` consegnato è già corretto: copiarlo sul progetto evita che gli avvisi tornino); rimossi codice temporaneo e script JS; Timeline; copy da «museo digitale»; sezione «Cos'è YGG» con screenshot d'esempio; pulsante **Ko-fi** (menu ☰ e home; la promessa sulle donazioni è stata RIMOSSA nel giro 10); rimosso il toggle «Mock»; nuovo logo (home con fluttuazione, header, icone, favicon, og:image).
- **Giro 8:** formato «Titolo - anno»; Info con 6 screenshot e senza scheda dettagli (multiplayer e `gamePlayers`/PCGamingWiki RIMOSSI); layout lista diverso per GOG (copertina orizzontale + 3 screenshot) e Steam (copertina più piccola + 2); velocità: richieste unite, anticipo 900px, retry, copertine a bassa priorità; testi sullo scopo di YGG; creatore nei crediti e nella privacy.
- **Giro 9:** miniature GOG di nuovo medie (`tiny` rimosso); Cards e Timeline GOG con copertine ORIZZONTALI; funzione `img` che ridimensiona le copertine (Steam e GOG); anno unico lista/Info (regola sopra); diagnostica della chiave Steam in locale (messaggio all'avvio, `.env.local`, avviso `.env.txt`, errore esplicito in sviluppo).
- **Giro 10:** home su PC: galleria «Cos'è YGG» in 3 colonne senza slider (resta slider sul telefono); header: titolo più piccolo, logo cliccabile = torna alla home, pulsante di cambio libreria con finestra delle opzioni (solo con 2+ librerie), rimosso il pulsante «Cambia»; «Torna alla home» in fondo al menu ☰; RIMOSSA la frase sulle donazioni (resta solo il pulsante Ko-fi: non promettere percentuali finché la gestione non è definita); filtro «Giochi doppi»; terza piattaforma **Epic** (import da file, vedi sopra); anni validi solo dal 1980 (un'epoca zero «1970» non deve comparire).

## 5. Convenzioni di design

- **Token** (`index.css`, `@theme`): `ink #13111d`, `panel`, `raised`, `line`, `fog`, `muted`, `gog #a78bfa`, `steam #38bdf8`, `spark #ffb547` (accento). Font display Chakra Petch, testo DM Sans.
- **Trappola Tailwind v4:** il CSS non «in layer» batte le utility → stili globali SOLO in `@layer base`.
- **Niente `backdrop-blur`** su elementi persistenti (pesa su mobile). Animazioni solo `transform`/`opacity`. `prefers-reduced-motion` gestito in `index.css` (le animazioni infinite come `animate-float` sono disattivate).
- **Lint React 19:** niente `setState` sincrono nel corpo di un effect (derivare lo stato o usare `key`); i file di componenti esportano solo componenti.
- Targhetta museo: titolo + anno in `text-spark`; schede cliccabili per intero (`role="button"`, tastiera ok, nessun pulsante annidato).

## 6. Verificato e NON verificato

**Verificato** (Playwright/Chromium mobile e desktop, contro un FINTO server Steam): build, lint, audit; home (logo animato, scopo, About con 3 immagini, Ko-fi, «creato da»); import Steam da profilo; lista Steam e GOG (posizioni di copertina, titolo, miniature; formato «Titolo - anno»); nessun file `1920x1080`/`ggvgl` scaricato nella lista, solo all'ingrandimento; Info (6 screenshot, griglia 2×3/3×2, badge verso lo store, Lightbox); richieste unite (12 giochi → 2 chiamate); messaggio d'errore; Timeline; Dock; menu ☰; produzione: installabilità, icone, nessuna richiesta esterna al caricamento, offline.

**NON verificato con i servizi reali** (nessun accesso di rete dal sandbox): formato di `IStoreBrowseService/GetItems`, `/tagdata/populartags/english`, `appdetails`, `GetOwnedGames`, anno e tag GOG, formati `ggvgm`/`ggvgl`, `game.url` di GOG, formato reale dell'indirizzo delle copertine GOG, `sharp` su Netlify, **l'API `storesearch` di Steam (Epic)** e **i formati reali dei file di Legendary/Heroic** (il parser è tollerante e provato su campioni sintetici dei 4 formati: JSON array, `{library:[…]}`, CSV/TSV, elenco semplice); **la velocità in produzione non è stata misurata**; installazione su un telefono Android vero; testo privacy (revisione legale). Se l'anno non compare per tutti i giochi, il primo sospetto è `release` in `fetchMeta.js`.

## 7. Limiti noti e backlog

- Steam limita le richieste (~200/5 min, non ufficiale); l'anno/genere di un gioco che non risponde resta vuoto (la Timeline mostra quanti giochi sono senza anno).
- Importazione Steam impossibile con «Dettagli dei giochi» privati.
- Epic: nessuna libreria diretta (serve un file esportato con Legendary/Heroic); i giochi che esistono solo su Epic non hanno copertina, screenshot, anno né generi (solo titolo), e non compaiono nella Timeline.
- Offline: la libreria si riapre ma copertine e screenshot (Steam/GOG) richiedono la rete.
- La frase «condivisibile e offline» NON è ancora vera: condividere (link/esportazione) e salvare le immagini offline non esistono.
- Backlog: virtualizzazione per librerie enormi, ordinamenti, sfondo del Modal dal colore dominante, tema chiaro, conferma su «Cambia», `netlify.toml` con cache lunga su `/assets/*`, sostituire il `README.md` (è il testo del template Vite).

## 8. Regole di lavoro

1. Leggi i file coinvolti; non riscrivere ciò che funziona. Una sola implementazione per cosa (dettagli solo in `gameData.js`).
2. Formato risposta delle funzioni di dettaglio: `{ screenshots:[{thumb,full}], year, local, online }`. Non cambiarlo senza aggiornare `gameData.js`.
3. Dopo ogni modifica: `npm run lint`, `npm run build`, `npm audit`. Prova in locale (`npm run dev`) con viewport mobile; niente deploy di produzione per ogni prova.
4. Non reintrodurre `backdrop-blur` persistente, immagini `full` o originali non ridimensionati nelle liste, liste intere nel DOM, copertine GOG verticali, un secondo calcolo dell'anno diverso da `useMeta`, un secondo modo di confrontare i titoli diverso da `normalizeTitle`, accesso alle credenziali Epic/Steam/GOG, richieste a servizi esterni dal browser (font, icone) senza aggiornare la pagina privacy.
5. Se cambi cosa viene raccolto/inviato, aggiorna `Privacy.jsx` e questo file. Compila `src/privacyConfig.js` prima di pubblicare.
6. Dichiara cosa non hai potuto testare (API reali).
7. **Consegna:** zip con i file **alla radice** (niente cartella contenitore), senza `node_modules`, `dist`, `.env`, file `*.zip`, backup o file inutilizzati. Includi sempre il `package-lock.json` aggiornato.
8. Test: chiudere i server per PORTA (`fuser` non esiste nel sandbox: i server restano accesi tra un comando e l'altro) e fare un warm-up della prima chiamata a una funzione.
9. Avvisi Git «LF will be replaced by CRLF» su Windows: innocui.
