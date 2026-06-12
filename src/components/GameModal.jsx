import { useEffect, useState } from "react";
import { getGameScreenshots } from "../services/gogApi";

export default function GameModal({ game, onClose }) {
    const [shots, setShots] = useState([]);

    useEffect(() => {
        if (!game) return;

        getGameScreenshots(game.url).then((d) => {
            setShots(d.screenshots || []);
        });
    }, [game]);

    if (!game) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

            <div className="bg-zinc-900 p-4 max-w-5xl w-full rounded overflow-y-auto max-h-[90vh]">

                <button onClick={onClose} className="mb-2">✕</button>

                <img src={game.cover} className="rounded mb-4" />

                {/* LIGHTBOX GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {shots.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            className="rounded cursor-pointer hover:scale-105 transition"
                            onClick={() => window.open(src, "_blank")}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}