import GamePreview from "./GamePreview";
import { useState } from "react";
export default function GameStrip({ games, onSelect }) {
    const [expanded, setExpanded] =
        useState(null);

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
    const open = expanded === game.id;

    {/* Layout cover + preview */}
<div className="flex gap-3 items-center">

    {!open ? (
        <div
            className="w-28 h-36 bg-zinc-950 rounded overflow-hidden"
            onClick={() => setExpanded(game.id)}
        >
            <img
                src={game.cover}
                alt={game.title}
                className="w-full h-full object-contain p-2"
            />

            <div className="bg-black/70 text-xs p-1 text-center">
                {game.title}
            </div>
        </div>
    ) : (
        <div
            className="flex gap-2 w-full"
            onClick={() => setExpanded(null)}
        >
            <GamePreview
                game={game}
                count={2}
            />
        </div>
    )}
</div>

</div>
            ))}
        </div>
    );
}