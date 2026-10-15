// Libreria Steam da profilo (senza file JSON): vedi netlify/functions/steamLibrary.js
const MESSAGES = {
  private: "Non vedo giochi: su Steam imposta «Dettagli dei giochi» su Pubblico (Profilo → Modifica profilo → Impostazioni privacy) e riprova.",
  not_found: "Profilo non trovato: controlla il nome o il link.",
  invalid: "Inserisci il link del profilo, il nome profilo o lo SteamID.",
  no_key: import.meta.env.DEV
    ? "Chiave Steam non trovata. In locale: copia .env.example in .env (nella cartella del progetto), scrivi STEAM_API_KEY=la_tua_chiave e riavvia npm run dev. Il terminale indica cosa trova."
    : "Il collegamento a Steam non è ancora configurato su questo sito. Riprova più tardi.",
};

export async function fetchSteamProfile(profile) {
  let r;
  try {
    r = await fetch("/.netlify/functions/steamLibrary", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile }),
    });
  } catch { throw new Error("Servizio non raggiungibile."); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(MESSAGES[d.code] || d.error || "Impossibile leggere la libreria Steam.");
  return d.games;
}
