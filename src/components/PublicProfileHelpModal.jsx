export default function PublicProfileHelpModal({
    isOpen,
    onClose,
    platform = "gog"
}) {
    if (!isOpen) return null;

    const isGog = platform === "gog";

    return (
        <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 mb-6">
                    <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                        <span>{isGog ? "🟣" : "🔵"}</span>
                        Non trovi la tua libreria {isGog ? "GOG" : "Steam"}?
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white text-xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-5 text-zinc-300">
                    <div className={`border rounded-2xl p-5 ${
                        isGog 
                            ? "bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-purple-500/20" 
                            : "bg-gradient-to-br from-sky-600/20 to-blue-600/20 border-sky-500/20"
                    }`}>
                        <p className="text-white font-semibold text-lg">
                            Your Games Gallery utilizza esclusivamente i dati pubblici del tuo profilo {isGog ? "GOG" : "Steam"}.
                        </p>

                        <p className="mt-3 text-zinc-300 text-sm">
                            Se la tua libreria è impostata su Privata, non possiamo leggere la lista dei tuoi giochi e la galleria non potrà essere generata.
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

                    {/* STEPS DINAMICI */}
                    {isGog ? (
                        <>
                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    1. Accedi a GOG
                                </h3>
                                <p className="text-sm">Effettua il login sul sito ufficiale GOG.com.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    2. Apri le impostazioni
                                </h3>
                                <p className="text-sm">
                                    Clicca sul tuo avatar in alto a destra e seleziona:
                                </p>
                                <div className="mt-2 bg-zinc-800 rounded-lg p-3 text-sm font-mono text-purple-300">
                                    Settings / Orders & Settings
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    3. Vai alla sezione Privacy
                                </h3>
                                <p className="text-sm">Apri la scheda Privacy dal menu laterale.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    4. Rendi visibile la libreria
                                </h3>
                                <p className="text-sm">
                                    Nella sezione dedicata ai giochi seleziona:
                                </p>
                                <div className="mt-2 bg-zinc-800 rounded-lg p-3 text-sm font-mono text-purple-300">
                                    Everyone (Tutti)
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    1. Apri Steam
                                </h3>
                                <p className="text-sm">Accedi a Steam dal client o via browser.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    2. Modifica il Profilo
                                </h3>
                                <p className="text-sm">
                                    Clicca sul tuo Username in alto, vai su <strong>Profilo</strong> e poi clicca sul pulsante:
                                </p>
                                <div className="mt-2 bg-zinc-800 rounded-lg p-3 text-sm font-mono text-sky-300">
                                    Modifica Profilo
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    3. Impostazioni Privacy
                                </h3>
                                <p className="text-sm">
                                    Seleziona la scheda <strong>Impostazioni privacy</strong> nel menu a sinistra.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    4. Imposta "Mio profilo" e "Dettagli giochi"
                                </h3>
                                <p className="text-sm">
                                    Assicurati di impostare su <strong>Pubblico</strong> le seguenti voci:
                                </p>
                                <div className="mt-2 bg-zinc-800 rounded-lg p-3 text-sm font-mono text-sky-300">
                                    Mio profilo: Pubblico<br />
                                    Dettagli giochi: Pubblico
                                </div>
                            </div>
                        </>
                    )}

                    {/* BOX AVVISO */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                        <h3 className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                            ⚠️ Importante
                        </h3>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                            Questa configurazione renderà visibile pubblicamente l'elenco dei giochi posseduti sul tuo account {isGog ? "GOG" : "Steam"}.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all"
                    >
                        Ho capito
                    </button>
                </div>
            </div>
        </div>
    );
}