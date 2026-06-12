import { useState } from "react";

export default function GameIndex({ games, onSelect }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* BUTTON */}
            <button
                onClick={() => setOpen(true)}
                className="bg-zinc-800 px-3 py-2 rounded hover:bg-zinc-700 transition"
            >
                ☰ Index ({games.length})
            </button>

            {/* OVERLAY */}
            {open && (
                <div className="fixed inset-0 z-50 bg-black/70 flex">

                    {/* SIDEBAR */}
                    <div className="w-80 max-w-[85vw] bg-zinc-900 border-r border-zinc-800 p-4 overflow-y-auto">

                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-zinc-300">
                                Your Games
                            </h2>

                            <button
                                onClick={() => setOpen(false)}
                                className="text-zinc-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* LIST */}
                        <div className="space-y-1">
                            {games.map((g, i) => (
                                <div
                                    key={g.id}
                                    onClick={() => {
                                        onSelect(g);
                                        setOpen(false);
                                    }}
                                    className="text-sm px-2 py-2 rounded hover:bg-zinc-800 cursor-pointer flex gap-2"
                                >
                                    <span className="text-zinc-500 w-6">
                                        {i + 1}
                                    </span>
                                    <span className="truncate">
                                        {g.title}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* BACKDROP */}
                    <div
                        className="flex-1"
                        onClick={() => setOpen(false)}
                    />
                </div>
            )}
        </>
    );
}