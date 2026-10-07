import { useState } from "react";
import { Icon } from "./Icons";
import { uploadLibrary, downloadLibrary } from "../services/sync";

export default function SyncModal({ mode, platform, games, onReceive, onClose }) {
  const send = mode === "send";
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      if (send) setCode(await uploadLibrary(platform, games));
      else { const lib = await downloadLibrary(code); onReceive(lib.platform, lib.games); onClose(); }
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  const pretty = code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
  async function copy() {
    try { await navigator.clipboard.writeText(pretty); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard non disponibile */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-line/70 bg-panel p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold">{send ? "Usa la libreria su un altro dispositivo" : "Ho un codice"}</h2>
          <button onClick={onClose} aria-label="Chiudi" className="text-muted hover:text-fog"><Icon name="close" /></button>
        </div>

        {send ? (
          code ? (
            <>
              <p className="mb-3 text-sm text-muted">Sull'altro dispositivo apri questo sito e scegli «Ho un codice».</p>
              <div className="rounded-xl bg-ink py-4 text-center font-display text-3xl font-bold tracking-widest text-spark">{pretty}</div>
              <button onClick={copy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-raised py-2.5 text-sm font-semibold hover:bg-line">
                <Icon name="copy" className="size-4" /> {copied ? "Copiato!" : "Copia il codice"}
              </button>
              <p className="mt-3 text-xs text-muted">Il codice vale 30 giorni. Chi lo conosce può vedere i titoli della tua libreria, non il tuo account.</p>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted">Crea un codice temporaneo: sul telefono basterà inserirlo per ritrovare i tuoi {games.length} giochi.</p>
              <button onClick={run} disabled={busy} className="w-full rounded-lg bg-spark py-3 text-sm font-bold text-ink hover:brightness-110 disabled:opacity-60">{busy ? "Creo il codice…" : "Genera codice"}</button>
            </>
          )
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">Inserisci il codice generato dall'altro dispositivo.</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && code && run()}
              maxLength={9}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="ABCD-EFGH"
              className="w-full rounded-lg border border-line/60 bg-ink p-3 text-center font-display text-xl tracking-widest outline-none placeholder:text-muted focus:border-spark"
            />
            <button onClick={run} disabled={busy || code.replace(/[^A-Z0-9]/g, "").length < 8} className="mt-3 w-full rounded-lg bg-spark py-3 text-sm font-bold text-ink hover:brightness-110 disabled:bg-raised disabled:text-muted">
              {busy ? "Importo…" : "Importa libreria"}
            </button>
          </>
        )}
        {err && <p role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-950/60 p-2.5 text-xs text-red-200">{err}</p>}
      </div>
    </div>
  );
}
