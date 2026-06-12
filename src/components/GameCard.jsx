export default function GameCard({ game }) {
    return (
        <a
            href={game.url}
            target="_blank"
            className="bg-zinc-800 rounded-lg overflow-hidden block hover:scale-[1.02] transition"
        >
            <img
                src={game.cover}
                className="w-full aspect-[3/4] object-cover"
            />

            <div className="p-2">
                <h3 className="text-sm font-semibold">
                    {game.title}
                </h3>

                <p className="text-xs text-zinc-400">
                    {game.playtime} min
                </p>
            </div>
        </a>
    );
}