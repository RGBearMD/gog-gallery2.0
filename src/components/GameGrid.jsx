export default function GameGrid({ games, onSelect }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {games.map((g) => (
                <div
                    key={g.id}
                    onClick={() => onSelect?.(g)}
                    className="cursor-pointer hover:scale-[1.02] transition-transform"
                >
                    <img
                        src={g.cover}
                        loading="lazy"
                        decoding="async"
                        className="rounded shadow-lg aspect-[3/4] object-cover bg-zinc-800"
                    />
                    <p className="text-xs mt-1 truncate">{g.title}</p>
                </div>
            ))}
        </div>
    );
}