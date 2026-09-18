import { useState } from "react";

export default function SteamImporter({ onGamesImported }) {
  const [steamUser, setSteamUser] = useState("Shuren-aihi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!steamUser.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/.netlify/functions/fetchSteamGames?user=${encodeURIComponent(steamUser)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore durante l'importazione.");
      }

      if (data.games && data.games.length > 0) {
        setSuccessMsg(`Trovati e importati ${data.games.length} giochi da Steam!`);
        onGamesImported(data.games);
      } else {
        setError("Nessun gioco trovato per questo profilo.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5 mb-6 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎮</span>
        <h3 className="font-bold text-white text-sm md:text-base">
          Sincronizza Libreria Steam
        </h3>
      </div>

      <form onSubmit={handleImport} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={steamUser}
          onChange={(e) => setSteamUser(e.target.value)}
          placeholder="Username Steam, SteamID o URL profilo..."
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 flex-grow"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold px-5 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Caricamento...
            </>
          ) : (
            "Importa Giochi"
          )}
        </button>
      </form>

      {error && (
        <div className="mt-3 p-2.5 bg-red-950/60 border border-red-800/60 rounded-lg text-xs text-red-300">
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-3 p-2.5 bg-green-950/60 border border-green-800/60 rounded-lg text-xs text-green-300">
          ✅ {successMsg}
        </div>
      )}
    </div>
  );
}