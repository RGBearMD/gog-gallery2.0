export default function GameIndex({ games, onSelect, isOpen, onClose }) {
    return (
        <>

            {/* DRAWER MOBILE (A comparsa tramite stato del parent) */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex animate-fade-in">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

                    {/* Pannello Drawer */}
                    <div className="relative w-80 max-w-[85vw] h-full bg-zinc-950 border-r border-zinc-800 flex flex-col z-10 animate-slide-right">
                        <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-200">Giochi Disponibili ({games.length})</span>
                            <button onClick={onClose} className="text-zinc-400 p-1 hover:text-white">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                            <GameList xml={games} onSelect={onSelect} closeDrawer={onClose} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Sub-componente interno per evitare duplicazione di logica di rendering
function GameList({ xml: games, closeDrawer }) {
    return games.map((g, i) => (
        <button
            key={g.id}
            onClick={() => {

    // Cerca la card o strip del gioco
    const element = document.getElementById(`game-${g.id}`);

    if (element) {
        element.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    if (closeDrawer) closeDrawer();
}}
            className="w-full text-left text-sm px-3 py-2.5 rounded-md hover:bg-zinc-800/60 text-zinc-300 hover:text-white cursor-pointer flex items-center gap-3 transition group border border-transparent hover:border-zinc-800"
        >
            <span className="text-zinc-600 font-mono text-xs w-5 text-right group-hover:text-purple-400 transition">
                {String(i + 1).padStart(2, '0')}
            </span>
            <span className="truncate font-medium">{g.title}</span>
        </button>
    ));
}