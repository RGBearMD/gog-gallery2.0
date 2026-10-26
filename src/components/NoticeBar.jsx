import { useState } from "react";
import { useI18n } from "../i18n/context";

// Avviso informativo (una volta sola): YGG non usa cookie né tracciamento, quindi non serve chiedere un consenso.
const KEY = "ygg:notice:v1";

export default function NoticeBar() {
  const { t } = useI18n();
  const [open, setOpen] = useState(() => { try { return !localStorage.getItem(KEY); } catch { return false; } });
  if (!open) return null;
  const close = () => { try { localStorage.setItem(KEY, "1"); } catch { /* storage non disponibile */ } setOpen(false); };
  return (
    <div role="region" aria-label={t("notice.title")} className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl animate-fade-in rounded-2xl border border-line/70 bg-panel p-4 shadow-2xl sm:bottom-4">
      <p className="text-sm text-fog/90"><strong>{t("notice.title")}</strong> {t("notice.text")}{" "}
        <a href="#privacy" onClick={close} className="font-semibold text-spark underline">{t("notice.more")}</a></p>
      <button onClick={close} className="mt-3 w-full rounded-lg bg-spark py-2 text-sm font-bold text-ink hover:brightness-110">{t("notice.ok")}</button>
    </div>
  );
}
