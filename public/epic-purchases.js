// YGG · lettura dell'elenco giochi dalla pagina Acquisti di Epic Games.
// Si esegue nel TUO browser, sulla pagina https://accounts.epicgames.com/account/transactions/purchases
// Legge SOLO i titoli (non prezzi, date o numeri d'ordine), scorre da solo le pagine con il pulsante «avanti»
// e scarica il file epic_games.json sul tuo computer. Non invia nulla a nessuno.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const titles = new Map();
  const rowsOf = () => [...document.querySelectorAll("table tbody tr")].filter((tr) => tr.querySelectorAll("td").length >= 5);
  const snapshot = () => rowsOf().map((r) => r.textContent).join("|");

  function readPage() {
    for (const tr of rowsOf()) {
      // La terza cella contiene lo stato («Purchased») e poi il titolo: prendiamo i testi "foglia".
      const parts = [...tr.querySelectorAll("td")[2].querySelectorAll("span")]
        .filter((s) => !s.querySelector("span"))
        .map((s) => s.textContent.trim())
        .filter(Boolean);
      if (parts.length < 2) continue;
      if (/refund|rimbors|reembols|rembours|erstatt/i.test(parts[0])) continue; // acquisti rimborsati
      const title = parts[parts.length - 1];
      titles.set(title.toLowerCase(), title);
    }
  }

  console.log("YGG: leggo la pagina Acquisti di Epic…");
  for (let page = 1; page <= 500; page++) {
    readPage();
    console.log(`YGG: pagina ${page}, ${titles.size} titoli finora`);
    const next = document.querySelector("#next-btn");
    if (!next || next.disabled) break;
    const before = snapshot();
    next.click();
    for (let i = 0; i < 40 && snapshot() === before; i++) await sleep(250); // attende la pagina successiva
  }

  if (!titles.size) { console.error("YGG: nessun titolo trovato. Sei sulla pagina Acquisti di Epic?"); return; }
  const list = [...titles.values()].map((title) => ({ app_title: title }));
  const link = document.createElement("a");
  link.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(list, null, 2));
  link.download = "epic_games.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  console.log(`YGG: fatto! ${list.length} giochi nel file epic_games.json. Caricalo su YGG.`);
})();
