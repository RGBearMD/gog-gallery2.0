import { useState } from "react";
import GameGrid from "./components/GameGrid";
import { getAllGames } from "./services/gogApi";
import GameModal from "./components/GameModal";
import GameIndex from "./components/GameIndex";

// Spostato fuori dal componente per evitare che venga ricreato ad ogni render
const mockGames = [
  {
    id: "1",
    title: "Cyberpunk Mock",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg",
    url: "/en/game/cyberpunk",
  },
  {
    id: "2",
    title: "Witcher Mock",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg",
    url: "/en/game/witcher",
  },
  {
    id: "3",
    title: "Deus Ex Mock",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r77.jpg",
    url: "/en/game/deus_ex",
  },
  {
    id: "4",
    title: "Hades Mock",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2g7a.jpg",
    url: "/en/game/hades",
  },
];

function App() {
  const [username, setUsername] = useState("");
  const [games, setGames] = useState([]);
  const hasGames = games.length > 0;
  const [loading, setLoading] = useState(false);
  const DEV_MOCK = true;

  const [selectedGame, setSelectedGame] = useState(null);

  // Spostato dentro il componente dove lo stato "games" è accessibile
  console.log("GAMES:", games);

  function pickRandomGame() {
    if (!games.length) return;
    const random = games[Math.floor(Math.random() * games.length)];
    setSelectedGame(random);
  }

  async function handleImport() {
    setLoading(true);

    try {
      const data = DEV_MOCK ? mockGames : await getAllGames(username);
      setGames(data);
    } catch (e) {
      console.error(e);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-zinc-900 border-b border-zinc-800">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">GOG Gallery</h1>
        </div>
      </div>

      {hasGames && (
        <div className="fixed top-20 left-4 z-50">
          <GameIndex games={games} onSelect={setSelectedGame} />
        </div>
      )}

      <div className="relative overflow-hidden border-b border-zinc-800">
        {/* MOCK CARDS BACKGROUND */}
        <div className="absolute top-0 right-0 opacity-10 grid grid-cols-6 gap-2 p-6">
          {games.slice(0, 6).map((g) => (
            <img
              key={g.id}
              src={g.cover}
              className="w-20 h-12 object-cover rounded"
              alt={g.title}
            />
          ))}
        </div>
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

        <GameModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      </div>

      {hasGames && (
        <>
          {/* RANDOM */}
          <div className="flex justify-center my-4">
            <button
              onClick={pickRandomGame}
              className="bg-purple-600 px-6 py-2 rounded"
            >
              🎲 Random Game
            </button>
          </div>

          {/* GRID */}
          <GameGrid games={games} onSelect={setSelectedGame} />
        </>
      )}
    </div>
  );
}

export default App;