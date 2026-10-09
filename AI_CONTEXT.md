# Your Games Gallery — contesto per assistenti AI

Leggi questo file **prima** di toccare il codice. Riassume cosa fa l'app, com'è fatta, cosa è già stato risolto (e perché), cosa NON è stato verificato e le regole per lavorarci.

- **Sito online:** https://yourgamesgallery.netlify.app/
- **Lingua:** l'utente parla italiano. Rispondi in italiano; il codice (nomi, commenti brevi) può restare in inglese/italiano come ora.
- **Cos'è:** galleria web delle proprie librerie **GOG** e **Steam**: copertine, screenshot, ore giocate, filtri per genere. Pensata anche per **mobile**.

## 1. Stack e comandi

React 19 · Vite 8 · Tailwind CSS v4 (`@tailwindcss/vite`) · ESLint 10 (`eslint-plugin-react-hooks` 7, `react-refresh`) · Netlify (hosting + Functions ESM, `"type": "module"`) · `@netlify/blobs`.

```
npm run dev      # sito + funzioni IN LOCALE (plugin in vite.config.js): niente Netlify, niente crediti
npm run build    # vite build
npm start        # dopo il build: server Node autonomo (sito + funzioni) su http://localhost:8888 (PORT, DATA_DIR)
npm run lint     # eslint . (copre anche public/, netlify/, server/, lib/). Attualmente PULITO
```
Per provare dal telefono sulla stessa rete Wi-Fi: `npm run dev -- --host` (oppure `npm start`, che ascolta su tutte le interfacce).

Test usato finora: Playwright (Chromium) con viewport mobile 390×844, giochi finti in `localStorage`, funzioni Netlify intercettate con `page.route`.

## 2. Struttura (solo file in uso)

```
index.html                       font Google (Chakra Petch + DM Sans), preconnect a steamstatic
public/steam-export.js           script da incollare nella console di Steam (genera steam_games.json)
public/favicon.svg
src/main.jsx · src/index.css     index.css = Tailwind + token colore + keyframes (vedi §5)
src/App.jsx                      stato globale, landing, header, filtri, rendering progressivo
src/components/
  GameStrip.jsx                  modalità Strip (righe con banner + accordion screenshot)
  GameGrid.jsx                   modalità Cards (copertine verticali 2:3)
  GameModal.jsx                  "Info": solo titolo, piattaforma, ore, screenshot (NIENTE copertina)
  Lightbox.jsx                   ingrandimento screenshot (usa la versione `full`)
  GameIndex.jsx                  drawer hamburger: lista in ORDINE ALFABETICO + ricerca
  GenreBar.jsx                   chip dei generi (sticky sotto l'header)
  SyncModal.jsx                  trasferimento libreria con codice (invia / ricevi)
  Dock.jsx                       4 tasti quadrati fissi in basso: Strip, Cards, Scarica Lista, Casual
  Cover.jsx                      <img> con lazy/async e fallback copertina
  Sentinel.jsx                   IntersectionObserver per il caricamento progressivo
  Icons.jsx                      icone SVG inline
  PublicProfileHelpModal.jsx     guida GOG / guida Steam (script + codice)
src/services/
  gogApi.js                      chiama la function `gog`, normalizza i giochi GOG
  screenshots.js                 UNICO punto di caricamento screenshot + helper (isSteam, coverUrl, hoursPlayed, normalizeSteamGame)
  genres.js                      hook useGenres: scarica i generi in background con cache
  sync.js                        client del trasferimento con codice
  scroll.js                      scrollToGame (scroll + flash di evidenziazione)
lib/store.js                     archivio chiave-valore per `sync`: Netlify Blobs su Netlify, file JSON in `.data/` altrove (YGG_STORAGE=file)
server/functions.js              esegue netlify/functions/*.js fuori da Netlify (usato da Vite e da server/index.js)
server/index.js                  server Node autonomo: serve dist/ + funzioni (utilizzabile su Render/Railway/Fly/VPS/locale)
vite.config.js                   include il plugin `localFunctions` (monta le funzioni in `npm run dev` e `npm run preview`)
netlify/functions/               TUTTE nella forma standard `export default async (Request) => Response`
  gog.js                         proxy di gog.com/u/{user}/games/stats?page=
  gameDetails.js                 GOG: ?id=<id numerico> → { screenshots: [{thumb, full}] }
  fetchSteamDetails.js           Steam: ?appId= → { screenshots: [{thumb, full}] }
  fetchGenres.js                 ?ids=steam-620,730,... (max 8) → { genres: { id: string[]|null }, rateLimited }
  sync.js                        POST {platform, games} → {code}; GET ?code= → {platform, games} (archivio: lib/store.js)
```

## 3. Modello dati e flussi

**Oggetto gioco:** `{ id, title, cover, playtime (MINUTI), platform: "GOG"|"Steam", appId?, url?, rawGame? }`. Id Steam = `"steam-<appId>"`; id GOG = numero. `rawGame` (solo GOG) non viene mai salvato (`slim()` in App.jsx).

**Chiavi localStorage:** `ygg:library:v1` (libreria importata, riaperta alla visita successiva) · `ygg:shots:v1:<id>` (screenshot) · `ygg:genres:v1` (generi).

**GOG:** username → `getAllGames` → function `gog` (paginata, 3 richieste in parallelo). Richiede libreria GOG pubblica.

**Steam:** l'utente esegue `public/steam-export.js` nella console del browser sulla pagina "Tutti i giochi" → scarica `steam_games.json` → lo carica nell'app → `normalizeSteamGame`. Il vecchio metodo "profilo pubblico" è stato RIMOSSO (la function `fetchSteamGames` non esiste più). Non è chiaro se Steam lo abbia davvero disattivato: il vecchio frontend non inviava mai la API key richiesta, quindi potrebbe non aver mai funzionato.

**Screenshot:** `fetchScreenshots(game)` sceglie la function giusta da `isSteam(game)`; cache in memoria + localStorage; richieste in corso deduplicate; i risultati vuoti NON vengono messi in cache. Hook `useGameShots(game, enabled)` (usato da Strip e Modal): `loading` è derivato, mai impostato con setState dentro un effect. Ogni screenshot è `{thumb, full}`: **`thumb` per le griglie, `full` solo nel Lightbox** (peso immagini).

**Copertine:** Steam usa `library_600x900.jpg` (verticale), con fallback a `game.cover` (`header.jpg`). Il banner della Strip usa `cover` orizzontale (`<Cover wide />`).

**Generi:** `useGenres` scarica 4 giochi ogni 5 s via `fetchGenres` (Steam: campo `genres` dell'API store; GOG: tag di `api.gog.com/v2/games/{id}`, best effort), backoff 90 s se Steam limita. I risultati restano per sempre in localStorage. In `App.jsx` `SKIP_GENRES` nasconde descrittori non-genere (Violent, Gore, Early Access, …). Filtro a selezione singola.

**Trasferimento (per usare Steam da mobile):** da PC menu ☰ → "Usa su un altro dispositivo" → codice di 8 caratteri (alfabeto senza ambigui, scade dopo 30 giorni; i dati stanno in Netlify Blobs, store `library-sync`, oppure in `.data/library-sync/<codice>.json` fuori da Netlify; la cancellazione dei dati scaduti avviene solo alla lettura: manca una pulizia automatica); sul telefono, schermata iniziale → "Ho un codice". Per Steam la copertina non viene salvata (si ricostruisce dall'appId).

**Rendering progressivo:** `STEP = 24` in App.jsx; `Sentinel` (rootMargin 900px) aumenta `limit`. `jumpTo` (dal menu ☰) usa `flushSync` per estendere `limit` fino al gioco scelto prima di fare scroll.

**Strip:** una sola riga aperta (`openId` in `GameStrip`); apertura/chiusura animata con `grid-template-rows 0fr→1fr` + opacity (300 ms); gli screenshot restano nel DOM solo durante la chiusura (`mounted` + `onTransitionEnd`); miniature con `animate-scale-up` sfalsato.

## 4. Cronologia delle modifiche

**Giro 1 (12 punti).**
- Screenshot mancanti in Cards / Strip→Info / Strip su Steam: c'erano 3 implementazioni diverse; Strip e Modal chiamavano la function GOG anche per Steam, e il Modal mostrava `game.screenshots` (`[]`, truthy) ignorando quelli scaricati. → un solo servizio (`screenshots.js`).
- Immagini pesanti: GOG sceglieva per prima `ggvgl_2x` (la più grande), Steam usava `path_full` 1920×1080 per le miniature, la Strip caricava ogni copertina due volte. → thumb/full, cache 24 h sulle function, rimosso il fallback con screenshot di Cyberpunk.
- Estetica: `index.css` era ancora il template Vite (`#root` a 1126px; `h1`/`h2` non in layer che battevano le utility Tailwind). → CSS pulito, nuova identità (§5).
- Hamburger sempre visibile con ricerca; "Cambia utente / piattaforma" nell'header; Dock fisso in basso; tolta la scritta "Steam" dalle cards; tolto il metodo classico Steam e il "3" vagante; guida a 4 passi per creare `steam_games.json`; minuti mostrati come ore nel Modal (bug); libreria ricordata in localStorage; Mock Mode solo in sviluppo.

**Giro 2 (9 punti).**
- Mobile lento → caricamento progressivo (24 per volta), via `backdrop-blur` da header/dock/overlay. Misurato (emulazione mobile): all'apertura 24 righe su 300 e 18 immagini; dopo 10 schermate di scroll 96 righe e 87 immagini.
- Strip: una riga aperta alla volta + animazioni reintrodotte (solo transform/opacity).
- Info senza copertina; indice ☰ alfabetico (`Intl.Collator("it", {numeric: true})`) e coerente col filtro attivo.
- Steam su mobile → trasferimento con codice; "Lista" → "Scarica Lista" (scarica i giochi visibili, quindi filtrati); filtri per genere.

**Giro 4.** Sviluppo e uso senza Netlify (vedi §4b): funzioni eseguibili in locale e su un server Node, archivio del trasferimento su file, `fetchSteamDetails` nel formato standard, configurazione ESLint per il codice Node. Analisi privacy (GDPR) svolta ma NON ancora implementata: font da Google, dati negli URL, cancellazione dei codici scaduti, trasferimento cifrato, pagina privacy (in attesa di decisione dell'utente).

**Giro 3.** Rimossi tutti i file non usati (backup `*BAK*`, `gogApi - Copy.js`, `GameCard`, `GamePreview`, `SteamImporter`, `App.css`, asset del template Vite, `fetchSteamGames*`, `gog.html`, `test-gog.mjs`, `gog-gallery2.0.zip`) e la dipendenza `cheerio`. Corretto un `no-useless-escape` in `public/steam-export.js`. Aggiunto questo file.

## 4b. Hosting, crediti Netlify e portabilità

- **Giro 4:** il progetto non dipende più da Netlify per essere sviluppato/provato. `npm run dev` monta le funzioni in locale; `npm start` serve sito + funzioni su qualunque macchina Node (Render, Railway, Fly.io, VPS: serve un volume persistente per `.data`, oppure un database, perché il disco di molti servizi si azzera a ogni riavvio). `fetchSteamDetails` è stata convertita nel formato standard; `sync` usa `lib/store.js`. Verificato in sandbox: serie di richieste HTTP su `npm start` e su Vite, e test Playwright end-to-end del trasferimento (codice generato dall'interfaccia in un contesto, usato in un altro, libreria che persiste).
- **Crediti Netlify (piano gratuito, da documentazione Netlify: verifica i valori attuali):** 300 crediti/mese con limite fisso. Un deploy di produzione = 15 crediti (≈20 deploy al mese esauriscono tutto); banda 20 crediti/GB; richieste web 2 crediti/10.000 (incluse le chiamate alle funzioni); calcolo delle funzioni 10 crediti/GB-ora; deploy preview e branch deploy 0 crediti (secondo la documentazione ufficiale; una fonte terza dice altro).
- **Regola pratica:** sviluppa e prova in locale; fai un solo deploy di produzione quando un lotto di modifiche è finito; per provare online usa deploy preview/branch deploy.
- **Cloudflare Pages / Vercel / hosting condiviso:** non provati. Le funzioni sono ora in formato standard, quindi servono solo adattatori sottili; per `sync` serve uno storage adatto (KV/database).

## 5. Convenzioni di design (da rispettare)

- **Token** in `index.css` (`@theme`): `ink #13111d` (base), `panel`, `raised`, `line`, `fog` (testo), `muted`, `gog #a78bfa`, `steam #38bdf8`, `spark #ffb547` (accento ambra: tasto attivo, evidenziazioni). Font: **Chakra Petch** (titoli/etichette, `font-display`) + **DM Sans** (testo).
- Firma visiva: il Dock di 4 tasti quadrati in basso (attivo = ambra pieno). Cards = copertina 2:3 con titolo in sovraimpressione.
- **Trappola Tailwind v4:** il CSS non "in layer" batte le utility. Stili globali su elementi (`h1`, `body`, …) vanno SOLO dentro `@layer base`.
- **Niente `backdrop-blur`** su elementi persistenti (header, dock, overlay): su mobile pesa nello scroll.
- Animazioni solo su `transform`/`opacity` (o `grid-template-rows` per l'accordion); `prefers-reduced-motion` è gestito globalmente in `index.css`.
- Lint: regole React 19 attive → **niente `setState` sincrono nel corpo di un effect** (derivare lo stato o usare `key`); un file con componenti non deve esportare funzioni/costanti (`react-refresh/only-export-components` → mettile in `services/`).

## 6. Cosa è verificato e cosa NO

**Verificato:** build, `npm run lint` pulito, smoke test Playwright mobile (progressivo, accordion, Modal senza copertina, indice alfabetico, salto a un gioco lontano, filtri, etichette del Dock, nessun errore JS), sintassi delle function (`node --check`).

**NON verificato in produzione** (nessun accesso di rete a Steam/GOG/Blobs dal sandbox):
1. Risposta reale di `appdetails` con `filters=screenshots` / `filters=genres` (Steam).
2. Formato dei tag in `api.gog.com/v2/games/{id}`: se i chip GOG non compaiono, è il primo sospetto.
3. Formatter GOG scelti per le dimensioni: `ggvgm` (miniatura) e `ggvgl` (ingrandimento) → da controllare a vista.
4. `@netlify/blobs` in produzione (trasferimento con codice). Il deploy richiede `package.json` + `package-lock.json` aggiornati.
5. Selettore fragile in `steam-export.js`: classe generata da Steam `.qaT2YvwApZE-` (c'è un fallback sul genitore del link); può smettere di funzionare.

## 7. Limiti noti

- Steam limita le richieste (~200 ogni 5 min, valore non ufficiale): la prima analisi dei generi di 500 giochi richiede oltre 10 minuti in background.
- I generi Steam sono quelli ufficiali (Action, RPG, Strategy, Indie, …): **"FPS" è un tag, non un genere**, quindi non c'è per Steam. Opzione: SteamSpy (dipendenza esterna).
- "Cambia utente / piattaforma" svuota la libreria salvata; non c'è conferma.
- Chiunque conosca un codice di trasferimento (30 giorni) vede i titoli della libreria; non ci sono dati dell'account.
- Le copertine Steam verticali (600×900) pesano più di `header.jpg`; per più leggerezza passare a `wide` nelle Cards.

## 8. Backlog suggerito (non fatto)

Virtualizzazione vera per librerie molto grandi · Netlify Image CDN per ridimensionare/convertire le copertine (richiede `[images] remote_images` in `netlify.toml`) · `netlify.toml` con cache lunga su `/assets/*` · Netlify Blobs come cache lato server di screenshot/generi · ordinamenti (nome, ore) · home con mosaico di copertine · sfondo del Modal dal colore dominante · tema chiaro · conferma su "Cambia" · sostituire il `README.md` (è ancora il testo del template Vite).

## 9. Regole di lavoro per chi modifica il progetto

1. Leggi prima i file coinvolti; non riscrivere ciò che funziona. Una sola implementazione per ogni cosa (es. screenshot solo in `services/screenshots.js`).
2. Il formato di risposta delle function di screenshot è `{ screenshots: [{ thumb, full }] }`: non cambiarlo senza aggiornare `screenshots.js`.
3. Dopo ogni modifica: `npm run lint` e `npm run build` devono passare. Prova in locale (`npm run dev`), con viewport mobile per la UI. Non fare deploy di produzione per ogni prova (costano crediti Netlify).
4. Non reintrodurre `backdrop-blur` persistente, immagini `full` nelle griglie, o liste intere nel DOM.
5. Dichiara onestamente cosa non hai potuto testare (API reali, Blobs).
6. **Consegna:** zip con i file **alla radice** (niente cartella contenitore), senza `node_modules`, `dist` o file `*.zip`; senza file inutilizzati (niente `BAK`, copie, asset di template).
7. Avvisi Git "LF will be replaced by CRLF" su Windows: informativi e innocui (i file nuovi sono LF, il repo usa `core.autocrlf`). Nessuna azione necessaria.
