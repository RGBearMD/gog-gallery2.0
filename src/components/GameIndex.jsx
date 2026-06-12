import { useState } from "react";

export default function GameIndex({ games, onSelect }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* BUTTON HAMBURGER */}
            <button
                onClick={() => setOpen(true)}
                className="mb-3 bg-zinc-800 px-3 py-2 rounded"
            >
                ☰ Index ({games.length})
            </button>

            {/* SIDEBAR */}
            {open && (
                <div className="fixed inset-0 bg-black/70 z-50 flex">

                    <div className="w-80 bg-zinc-900 p-4 overflow-y-auto">

                        <button
                            onClick={() => setOpen(false)}
                            className="mb-4 text-white"
                        >
                            ✕ Close
                        </button>

                        {games.map((g, i) => (
                            <div
                                key={g.id}
                                onClick={() => {
                                    onSelect(g);
                                    setOpen(false);
                                }}
                                className="text-sm p-2 hover:bg-zinc-800 cursor-pointer"
                            >
                                {i + 1}. {g.title}
                            </div>
                        ))}

                    </div>

                    {/* overlay click close */}
                    <div
                        className="flex-1"
                        onClick={() => setOpen(false)}
                    />
                </div>
            )}
        </>
    );
}