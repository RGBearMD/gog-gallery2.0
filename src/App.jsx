import { useState } from "react";
import GameGrid from "./components/GameGrid";
import { getAllGames } from "./services/gogApi";

function App() {
  const [username, setUsername] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

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
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 p-2 rounded text-black"
            placeholder="Username GOG"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button
            onClick={handleImport}
            className="bg-blue-600 px-4 rounded"
          >
            {loading ? "Carico..." : "Importa"}
          </button>
        </div>

        <GameGrid games={games} />
      </div>
    </div>
  );
}

export default App;