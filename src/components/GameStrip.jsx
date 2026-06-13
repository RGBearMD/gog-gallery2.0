import GamePreview from "./GamePreview";
export default function GameStrip({ games, onSelect }) {

    {/*
      games.slice(0, 3).forEach((g) => {
        console.log(g.title, g.screenshots);
    });
    */}

    return (
        <div className="flex flex-col gap-3">
            {games.map((game) => (
                <div
    id={`game-${game.id}`}
    key={game.id}
    onClick={() => onSelect(game)}
    className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 cursor-pointer hover:border-purple-500/50 transition-all"
>

    {/* Layout cover + preview */}
    <div className="flex gap-4 items-center">

        {/* Cover */}
        <div className="w-28 h-36 bg-zinc-950 rounded overflow-hidden flex-shrink-0">
            <img
                src={game.cover}
                alt={game.title}
                className="w-full h-full object-contain p-2"
            />
        </div>

        {/* Preview */}
        <div className="flex-1">

            {/* Titolo */}
            <h3 className="font-bold text-zinc-100 text-left mb-2">
                {game.title}
            </h3>

            {/* Screenshot placeholder finché non implementiamo il caricamento */}
            <GamePreview game={game} />

        </div>

    </div>

</div>
            ))}
        </div>
    );
}