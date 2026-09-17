export default function PublicProfileHelpModal({
    isOpen,
    onClose
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                <div className="flex items-start justify-between gap-4 mb-6">
    <h2 className="text-2xl md:text-3xl font-black text-white">
        Non trovi la tua libreria?
    </h2>

    <button
        onClick={onClose}
        className="text-zinc-400 hover:text-white text-xl"
    >
        ✕
    </button>
</div>

                <div className="space-y-5 text-zinc-300">
                    <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 rounded-2xl p-5">
                        <p className="text-white font-semibold text-lg">
    Your Games Gallery utilizza esclusivamente
    i dati pubblici del tuo profilo GOG.
</p>

<p className="mt-3 text-zinc-300">
    Se la tua libreria è privata non possiamo
    leggere i giochi e la Gallery non potrà
    essere generata.
</p>

<div className="mt-4 flex flex-wrap gap-2">
    <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs">
        ✓ Nessuna password
    </span>

    <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs">
        ✓ Solo dati pubblici
    </span>

    <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs">
        ✓ Nessun accesso all'account
    </span>
</div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-1">
                            1. Accedi a GOG
                        </h3>

                        <p>
                            Effettua il login sul
                            sito ufficiale GOG.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-1">
                            2. Apri le impostazioni
                        </h3>

                        <p>
                            Clicca sul tuo avatar
                            in alto a destra e
                            seleziona:
                        </p>

                        <div className="mt-2 bg-zinc-800 rounded-lg p-3 text-sm">
                            Settings
                            <br />
                            oppure
                            <br />
                            Orders & Settings
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-1">
                            3. Vai alla sezione Privacy
                        </h3>

                        <p>
                            Apri la scheda Privacy.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-1">
                            4. Rendi visibile la libreria
                        </h3>

                        <p>
                            Nella sezione dedicata
                            ai giochi seleziona:
                        </p>

                        <div className="mt-2 bg-zinc-800 rounded-lg p-3 text-sm">
                            Everyone
                            <br />
                            oppure
                            <br />
                            Friends
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-1">
                            5. Verifica il profilo
                        </h3>

                        <p>
                            Assicurati che anche
                            l'opzione principale
                            del profilo
                            ("Your Profile Page")
                            sia visibile.
                        </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                        <h3 className="font-semibold text-amber-300 mb-2">
                            ⚠️ Importante
                        </h3>

                        <p className="text-sm">
                            Questa impostazione
                            renderà visibile
                            l'elenco dei giochi
                            acquistati sul tuo
                            account GOG.
                        </p>

                        <p className="text-sm mt-3">
                            Your Games Gallery
                            utilizza esclusivamente
                            dati pubblici e non
                            richiede password né
                            accesso al tuo account.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}