# YGG · Your Games Gallery — contesto per assistenti AI

Leggi questo file **prima** di toccare il codice: descrive cosa fa l'app, com'è fatta, cosa è già stato risolto (e perché), cosa NON è stato verificato e le regole per lavorarci.

- **Sito online:** https://yourgamesgallery.netlify.app/ · **Lingua:** l'utente parla italiano, rispondi in italiano.
- **Idea:** «Trasforma la tua libreria GOG e Steam in una gallery elegante e portatile»: l'esperienza deve sembrare *un bellissimo museo digitale della propria collezione* (schede con titolo+anno come targhette, copertine, screenshot, timeline). Pensata per **mobile** e installabile (PWA, Android).
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
Per provare dal telefono sulla stessa Wi-Fi: `npm run dev -- --host`. Variabili d'ambiente: vedi `.env.example` (`STEAM_API_KEY`; in locale in `.env`, su Netlify nelle Environment variables; vale solo dopo un nuovo deploy). Per i test si possono puntare le API a un finto server con `STEAM_API_BASE`, `STEAM_STORE_BASE`, `PCGW_BASE`.

## 2. Struttura (solo file in uso)

```
index.html                       favicon, manifest, anteprima social (og:image con URL ASSOLUTO del sito), preconnect steamstatic
public/                          logo*.webp, og.jpg, favicon-32/48.png, apple-touch-icon.png, icons/ (192, 512, maskable),
                                 manifest.webmanifest, sw.js (service worker), screens/ (3 immagini d'esempio per «Cos'è YGG»)
src/main.jsx · src/index.css     font locali; token colore, keyframes (float, scaleUp, slideUp…), reduced-motion
src/privacyConfig.js             DATI DEL TITOLARE da compilare prima di pubblicare (nome, email, hosting)
src/App.jsx                      stato globale, home, header, filtri, rendering progressivo, modalità vista
src/components/
  GameStrip.jsx                  Strip: scheda = copertina 2:3 a sinistra; accanto titolo+anno (in alto) e 2 screenshot sotto. TUTTA la scheda apre «Info»
  GameGrid.jsx                   Cards: copertina 2:3 con titolo, anno e ore in sovraimpressione
  GameModal.jsx                  «Info»: griglia 2×3 (md) / 2 colonne (mobile): 1° riquadro = targhetta (anno, multiplayer locale N giocatori/Sì/No, online Sì/No, «Vedi su Steam/GOG») + max 5 screenshot; click → Lightbox
  Timeline.jsx                   modalità Timeline: istogramma + slider anno min→max + giochi di quell'anno, ← →
  FilterSheet.jsx                pannello «Filtra» (bottom sheet): generi con conteggi + avanzamento analisi
  GameIndex.jsx                  drawer ☰: lista ALFABETICA con ricerca, Scarica lista, Installa, Ko-fi, Privacy
  Dock.jsx                       5 tasti quadrati fissi in basso: Strip, Cards, Filtra, Timeline, Casual
  About.jsx                      «Cos'è YGG» con 3 screenshot d'esempio (GIOCHI FITTIZI con arte originale: nessuna immagine di giochi reali)
  KofiButton.jsx                 pulsante Ko-fi con icona SVG incorporata (nessuna richiesta esterna finché non lo tocchi)
  Thumb.jsx · Lightbox.jsx       miniatura con dissolvenza al caricamento; ingrandimento
  Cover.jsx · Icons.jsx · Sentinel.jsx
  PublicProfileHelpModal.jsx     guida: come rendere pubblici GOG / «Dettagli dei giochi» di Steam
  Privacy.jsx                    pagina «Privacy e trasparenza» (route `#privacy`, senza router) + «Cancella i dati salvati»
src/services/
  gameData.js                    helper (isSteam, coverUrl, storeUrl, hoursPlayed, normalizeSteamGame), fetchDetails/useGameDetails (screenshot+anno+multiplayer, cache, coda max 3 richieste), fetchPlayers/usePlayers
  meta.js                        useMeta: anno + generi di tutta la libreria in background (50 giochi Steam per richiesta)
  steamProfile.js · gogApi.js    import libreria Steam (da profilo) / GOG (username)
  viewport.js · install.js · scroll.js
netlify/functions/               TUTTE nella forma standard `export default async (Request) => Response`
  gog.js                         proxy di gog.com/u/{user}/games/stats
  steamLibrary.js                POST {profile} → libreria Steam (GetOwnedGames, serve STEAM_API_KEY e «Dettagli dei giochi» pubblici). Codici: no_key 501, invalid 400, not_found 404, private 403
  fetchSteamDetails.js           ?appId= → { screenshots[≤5 {thumb,full}], year, local, online } (appdetails: screenshots, release_date, categories)
  gameDetails.js                 ?id= (GOG) → { screenshots[≤5], year, local:null, online:null }
  fetchMeta.js                   ?ids=steam-620,… → { meta: { id: {g: generi, y: anno}|null }, rateLimited, mode }. Steam: IStoreBrowseService (batch, tag community, data uscita) con ripiego su appdetails; GOG: v2 per gioco
  gamePlayers.js                 ?platform=steam|gog&id= → { local, players, online } da PCGamingWiki (Cargo)
server/functions.js · index.js   adattatore che esegue le funzioni fuori da Netlify; server Node autonomo (carica .env)
```

## 3. Modello dati e flussi

**Gioco:** `{ id, title, cover, playtime (MINUTI), platform: "GOG"|"Steam", appId?, url? }`. Id Steam = `"steam-<appId>"`; id GOG = numero; `url` GOG = pagina dello store.

**localStorage:** `ygg:accounts:v1` (librerie salvate: `{ last, gog:{id,games,savedAt,source}, steam:{…} }`; l'app si riapre su `last`; «Cambia» NON cancella nulla; `navigator.storage.persist()` richiesto) · `ygg:details:v2:<id>` (screenshot, anno, multiplayer) · `ygg:players:v1:<id>` · `ygg:meta:v1` (anno+generi di tutta la libreria). Il vecchio `ygg:library:v1` viene migrato.

**Import:** GOG = username (libreria pubblica). Steam = link/nome/SteamID → `steamLibrary` (l'utente imposta «Dettagli dei giochi» su Pubblico; dopo l'import può rimetterli privati, serve pubblico solo per «Aggiorna»). **Rimossi nel giro 7:** script JS `steam-export.js`, caricamento di `steam_games.json`, codice di trasferimento (`sync`, `purgeSync`, Netlify Blobs): ora non c'è alcun dato personale sul server. Chi ha un profilo Steam che deve restare privato non può importare (compromesso accettato).

**Dettagli di un gioco:** `fetchDetails` (una sola implementazione, in `gameData.js`): coda a max 3 richieste, cache in memoria + localStorage, risultati vuoti non memorizzati. Strip: richiesta solo per le righe vicine allo schermo (`useNearViewport`). Il Modal usa gli stessi dati (già in cache) e cerca il numero di giocatori su PCGamingWiki solo se il locale non è escluso da Steam.

**Anno e generi (`useMeta`):** 50 giochi Steam per richiesta (GOG 6), pausa 1,2 s; se `mode:"single"` (ripiego lento) scende a 4 ogni 5 s; backoff 90 s se Steam limita. Misurato col mock: 332 giochi in ~8 s. `GENRE_TAGS` in `fetchMeta.js` tiene solo i tag che sono generi. L'anno alimenta Strip/Cards/Timeline.

**Multiplayer locale:** Steam dice solo se esiste (categoria Shared/Split Screen), NON quanti giocatori → il numero viene da PCGamingWiki; se manca si mostra «Sì»/«No»/«—». Attenzione: i contenuti di PCGamingWiki sono (mi risulta) CC BY-NC-SA: attribuzione presente in Privacy, ma l'uso con pulsante di donazione va valutato.

**Rendering:** progressivo (`STEP = 24`, `Sentinel`); `jumpTo` (menu ☰) allarga la lista con `flushSync`. Strip/Cards in modalità Timeline mostrano solo i giochi dell'anno.

**PWA:** manifest + icone (anche maskable) + `sw.js` (solo pagina e `/assets/*`; non tocca `/.netlify/*` né immagini Steam/GOG; ID di versione sostituito a ogni build in `vite.config.js`). Pulsante «Installa l'app» da `beforeinstallprompt`.

## 4. Cronologia (sintesi)

- **Giri 1–2:** UI da zero (palette ink/spark, Chakra Petch+DM Sans), un solo servizio per gli screenshot (prima 3 implementazioni, il Modal ignorava i dati scaricati perché `[]` è truthy), immagini leggere (thumb/full), rendering progressivo, hamburger alfabetico, Dock fisso, privacy di base.
- **Giro 3–4:** rimossi file inutili e `cheerio`; funzioni eseguibili in locale e su server Node (`npm run dev`/`npm start`) per non dipendere da Netlify (crediti: piano gratuito 300/mese, 15 per deploy di produzione → sviluppare in locale, un deploy per lotto).
- **Giro 5:** font locali, pagina privacy, PWA.
- **Giro 6:** analisi generi da minuti a ~8 s (batch Steam + tag), pannello «Filtra», multi-account salvati, Steam da profilo.
- **Giro 7:** `npm audit fix` (0 vulnerabilità; il `package-lock.json` consegnato è già corretto: copiarlo sul progetto evita che gli avvisi tornino); rimossi codice temporaneo e script JS; Strip ridisegnata (copertina a sinistra, titolo+anno, 2 screenshot, tutta la scheda cliccabile); Info con targhetta (anno, multiplayer, «Vedi su…») e max 5 screenshot; **Timeline**; copy da «museo digitale»; sezione «Cos'è YGG» con screenshot d'esempio; pulsante **Ko-fi** (menu ☰ e home) con la promessa «se le donazioni superano 1 €, metà a un'associazione»; rimosso il toggle «Mock» (era solo in sviluppo); nuovo logo (home con fluttuazione, header, icone, favicon, og:image).

## 5. Convenzioni di design

- **Token** (`index.css`, `@theme`): `ink #13111d`, `panel`, `raised`, `line`, `fog`, `muted`, `gog #a78bfa`, `steam #38bdf8`, `spark #ffb547` (accento). Font display Chakra Petch, testo DM Sans.
- **Trappola Tailwind v4:** il CSS non «in layer» batte le utility → stili globali SOLO in `@layer base`.
- **Niente `backdrop-blur`** su elementi persistenti (pesa su mobile). Animazioni solo `transform`/`opacity`. `prefers-reduced-motion` gestito in `index.css` (le animazioni infinite come `animate-float` sono disattivate).
- **Lint React 19:** niente `setState` sincrono nel corpo di un effect (derivare lo stato o usare `key`); i file di componenti esportano solo componenti.
- Targhetta museo: titolo + anno in `text-spark`; schede cliccabili per intero (`role="button"`, tastiera ok, nessun pulsante annidato).

## 6. Verificato e NON verificato

**Verificato** (Playwright/Chromium mobile e desktop, contro un FINTO server Steam/PCGamingWiki): build, lint, audit; home (logo animato, About con 3 immagini, Ko-fi, nessun mock/codice/JSON); import Steam da profilo; Strip (copertina a sinistra, titolo+anno, 2 screenshot sotto, click ovunque → Info); Info (targhetta in alto a sinistra, 4 giocatori, «Vedi su Steam», max 5 screenshot, Lightbox); Timeline; Dock a 5 tasti; menu ☰ alfabetico con Ko-fi; produzione: installabilità (CDP `getInstallabilityErrors` vuoto), icone raggiungibili, nessuna richiesta esterna al caricamento, riapertura offline.

**NON verificato con i servizi reali** (nessun accesso di rete dal sandbox): formato di `IStoreBrowseService/GetItems` (`tags`, `release.original_release_date`), `/tagdata/populartags/english`, `appdetails` con `filters=screenshots,release_date,categories`, `GetOwnedGames`, i nomi dei campi Cargo di PCGamingWiki (`Multiplayer.Local`, `Local_players`, `Online`, `Infobox_game.Steam_AppID/GOGcom_ID` con `HOLDS`), anno e tag GOG (`api.gog.com/v2/games/{id}`), URL `game.url` di GOG; installazione su un telefono Android vero; testo privacy (revisione legale). Se l'anno non compare per tutti i giochi, il primo sospetto è `release` in `fetchMeta.js`.

## 7. Limiti noti e backlog

- Steam limita le richieste (~200/5 min, non ufficiale); l'anno/genere di un gioco che non risponde resta vuoto (la Timeline mostra quanti giochi sono senza anno).
- Importazione Steam impossibile con «Dettagli dei giochi» privati.
- Offline: la libreria si riapre ma copertine e screenshot (Steam/GOG) richiedono la rete.
- La frase «condivisibile e offline» NON è ancora vera: condividere (link/esportazione) e salvare le immagini offline non esistono.
- Backlog: virtualizzazione per librerie enormi, ordinamenti, sfondo del Modal dal colore dominante, tema chiaro, conferma su «Cambia», `netlify.toml` con cache lunga su `/assets/*`, indicare per nome l'associazione beneficiaria delle donazioni, sostituire il `README.md` (è il testo del template Vite).

## 8. Regole di lavoro

1. Leggi i file coinvolti; non riscrivere ciò che funziona. Una sola implementazione per cosa (dettagli solo in `gameData.js`).
2. Formato risposta delle funzioni di dettaglio: `{ screenshots:[{thumb,full}], year, local, online }`. Non cambiarlo senza aggiornare `gameData.js`.
3. Dopo ogni modifica: `npm run lint`, `npm run build`, `npm audit`. Prova in locale (`npm run dev`) con viewport mobile; niente deploy di produzione per ogni prova.
4. Non reintrodurre `backdrop-blur` persistente, immagini `full` nelle griglie, liste intere nel DOM, richieste a servizi esterni dal browser (font, icone) senza aggiornare la pagina privacy.
5. Se cambi cosa viene raccolto/inviato, aggiorna `Privacy.jsx` e questo file. Compila `src/privacyConfig.js` prima di pubblicare.
6. Dichiara cosa non hai potuto testare (API reali).
7. **Consegna:** zip con i file **alla radice** (niente cartella contenitore), senza `node_modules`, `dist`, `.env`, file `*.zip`, backup o file inutilizzati. Includi sempre il `package-lock.json` aggiornato.
8. Test: chiudere i server per PORTA (`fuser` non esiste nel sandbox: i server restano accesi tra un comando e l'altro) e fare un warm-up della prima chiamata a una funzione.
9. Avvisi Git «LF will be replaced by CRLF» su Windows: innocui.
