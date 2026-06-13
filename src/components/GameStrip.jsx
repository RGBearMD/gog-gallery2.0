export default function GameStrip({ games, onSelect }) {
    return (
        <div className="flex flex-col gap-3">
            {games.map((game) => (
                <div
                    key={game.id}
                    onClick={() => onSelect(game)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 cursor-pointer hover:border-purple-500/50 transition-all"
                >
                    <h3 className="font-bold text-zinc-100 mb-3">
                        {game.title}
                    </h3>

                    <div className="flex gap-2 overflow-x-auto">
                        <img
                            src={game.cover}
                            alt={game.title}
                            className="w-40 h-24 object-contain bg-zinc-950"
                        />

                        {(game.screenshots || [])
                            .slice(0, 6)
                            .map((shot, index) => (
                                <img
                                    key={index}
                                    src={shot}
                                    alt=""
                                    className="w-40 h-20 object-cover rounded flex-shrink-0"
                                />
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}