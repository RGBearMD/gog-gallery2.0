export default function GameModal({ game, onClose }) {
    if (!game) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-zinc-900 p-6 rounded max-w-4xl w-full">

                <button onClick={onClose} className="float-right">✕</button>

                <h2 className="text-xl mb-4">{game.title}</h2>

                {/* COVER + SCREENSHOTS MOCK */}
                <img src={game.cover} className="rounded mb-4" />

                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-zinc-800 h-24 rounded"></div>
                    ))}
                </div>

            </div>
        </div>
    );
}