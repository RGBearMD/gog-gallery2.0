import { useState } from "react";
import GameGrid from "./components/GameGrid";
import { getAllGames } from "./services/gogApi";
import GameModal from "./components/GameModal";
import GameIndex from "./components/GameIndex";

function App() {
  const [username, setUsername] = useState("");
  const [games, setGames] = useState([]);
  const hasGames = games.length > 0;
  const [loading, setLoading] = useState(false);

  const [selectedGame, setSelectedGame] = useState(null);

  function pickRandomGame() {
    if (!games.length) return;
    const random = games[Math.floor(Math.random() * games.length)];
    setSelectedGame(random);
  }

  async function handleImport() {
    setLoading(true);

    try {
      const data = await getAllGames(username);
      setGames(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold">GOG Gallery</h1>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-2">
            Create your personal gallery
          </h1>

          <p className="text-zinc-400 mb-6">
            Import your GOG library and explore your games
          </p>

          <div className="flex flex-col md:flex-row gap-2 max-w-md mx-auto">
            <input
              className="p-3 rounded bg-zinc-800 text-white border border-zinc-700"
              placeholder="GOG username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <button
              onClick={handleImport}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              {loading ? "Loading..." : "Import"}
            </button>
          </div>
        </div>

        {hasGames && (
          <>
            <div className="flex items-center justify-between mb-4">
              <GameIndex games={games} onSelect={setSelectedGame} />

              <button
                onClick={pickRandomGame}
                className="bg-purple-600 px-4 py-2 rounded"
              >
                🎲 Random Game
              </button>
            </div>

            <GameGrid games={games} onSelect={setSelectedGame} />
          </>
        )}

        <GameModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      </div>
    </div>
  );
}

export default App;