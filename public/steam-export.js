(async function exportSteamGames() {
  console.log("🚀 Avvio scansione della libreria Steam...");

  const gamesMap = new Map();
  let lastScrollTop = -1;
  let samePositionCount = 0;

  // Funzione per estrarre i giochi attualmente visibili nel DOM
  function collectVisibleGames() {
    const gameLinks = document.querySelectorAll('a[href*="store.steampowered.com/app/"]');
    gameLinks.forEach(link => {
      const match = link.getAttribute('href').match(/\/app\/(\d+)/);
      if (!match) return;
      
      const appId = match[1];
      if (gamesMap.has(appId)) return;

      // Trova la card genitore
      const card = link.closest('.qaT2YvwApZE-') || link.parentElement?.parentElement;
      if (!card) return;

      const img = card.querySelector('img[alt]');
      const title = img ? img.getAttribute('alt').trim() : link.innerText.trim();
      
      let hours = 0;
      const hoursMatch = card.innerText.match(/(?:TOTAL PLAYED\s*)?([\d.,]+)\s*hours?/i);
      if (hoursMatch) {
        hours = parseFloat(hoursMatch[1].replace(',', '.'));
      }

      if (title && !title.includes('\n')) {
        gamesMap.set(appId, {
          id: `steam-${appId}`,
          appId: parseInt(appId, 10),
          title: title,
          playtime: Math.round(hours * 60),
          hoursOnRecord: hours,
          cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
          screenshots: [],
          platform: "Steam"
        });
      }
    });
  }

  // Scroll automatico continuo
  while (samePositionCount < 5) {
    collectVisibleGames();
    
    window.scrollBy(0, 1000);
    await new Promise(r => setTimeout(r, 400)); // Pausa per permettere il rendering

    const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
    if (currentScrollTop === lastScrollTop) {
      samePositionCount++;
    } else {
      samePositionCount = 0;
      lastScrollTop = currentScrollTop;
    }
  }

  // Estrazione finale
  collectVisibleGames();
  const resultList = Array.from(gamesMap.values());

  if (resultList.length === 0) {
    console.error("❌ Nessun gioco trovato. Assicurati di essere nella pagina 'Tutti i giochi'.");
    return;
  }

  // Generazione e Download automatico del file .json
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resultList, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "steam_games.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  console.log(`✅ COMPLETATO! Esportati ${resultList.length} giochi nel file steam_games.json`);
})();
