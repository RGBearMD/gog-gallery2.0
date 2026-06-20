export default function GameCard({ game }) {
    return (
        <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-800 rounded-lg overflow-hidden block hover:scale-[1.02] transition h-full border border-zinc-700/50"
        >
            {/* Contenitore con aspect ratio fisso e object-contain per non tagliare la cover */}
            <div className="w-full aspect-[3/4] bg-zinc-950 flex items-center justify-center overflow-hidden">
                <img
                    src={game.cover}
                    alt={game.title}
                    loading="lazy"
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="p-2">
                <h3 className="text-sm font-semibold truncate">
                    {game.title}
                </h3>

                <p className="text-xs text-zinc-400">
                    {game.playtime} min
                </p>
            </div>
        </a>
    );
}