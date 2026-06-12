export default function GameIndex({ games, onSelect }) {
    return (
        <div className="h-48 overflow-y-auto border border-zinc-700 p-2 mb-4">
            {games.map((g, i) => (
                <div
                    key={g.id}
                    onClick={() => onSelect(g)}
                    className="text-xs cursor-pointer hover:bg-zinc-800 p-1"
                >
                    {i + 1}. {g.title}
                </div>
            ))}
        </div>
    );
}