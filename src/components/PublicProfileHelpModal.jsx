import { useState } from "react";
import { Icon } from "./Icons";
import { useI18n } from "../i18n/context";

const PURCHASES_URL = "https://accounts.epicgames.com/account/transactions/purchases?productName=epicgames";
const code = "rounded bg-raised px-1.5";

const Step = ({ n, title, children }) => (
  <li className="flex gap-3">
    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-bold">{n}</span>
    <div><h3 className="font-semibold text-fog">{title}</h3><div className="mt-1 text-sm text-muted">{children}</div></div>
  </li>
);

export default function PublicProfileHelpModal({ isOpen, onClose, platform = "gog" }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  async function copyScript() {
    try {
      const text = await (await fetch("/epic-purchases.js")).text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { window.open("/epic-purchases.js", "_blank"); }
  }

  const title = { gog: "helpModal.gogTitle", steam: "helpModal.steamTitle", epic: "helpModal.epicTitle" }[platform];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={onClose}>
      <div className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line/70 bg-panel p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold md:text-2xl">{t(title)}</h2>
          <button onClick={onClose} aria-label={t("aria.close")} className="text-muted hover:text-fog"><Icon name="close" /></button>
        </div>

        {platform === "gog" && (
          <ol className="space-y-4">
            {[1, 2, 3].map((n) => <Step key={n} n={n} title={t(`helpModal.gog${n}.t`)}>{t(`helpModal.gog${n}.d`)}</Step>)}
          </ol>
        )}

        {platform === "steam" && (
          <>
            <ol className="space-y-4">
              {[1, 2, 3].map((n) => <Step key={n} n={n} title={t(`helpModal.steam${n}.t`)}>{t(`helpModal.steam${n}.d`)}</Step>)}
            </ol>
            <p className="mt-5 rounded-xl border border-spark/30 bg-spark/10 p-3 text-xs text-muted">{t("helpModal.steamNote")}</p>
          </>
        )}

        {platform === "epic" && (
          <>
            <p className="mb-5 text-sm text-muted">{t("helpModal.epicIntro")}</p>
            <h3 className="mb-3 font-display text-base font-bold text-spark">{t("helpModal.epicA")}</h3>
            <ol className="space-y-4">
              <Step n="1" title={t("helpModal.epicA1.t")}>
                {t("helpModal.epicA1.d")}{" "}
                <a href={PURCHASES_URL} target="_blank" rel="noopener noreferrer" className="break-all text-spark underline">{PURCHASES_URL}</a>
              </Step>
              <Step n="2" title={t("helpModal.epicA2.t")}>{t("helpModal.epicA2.d")}</Step>
              <Step n="3" title={t("helpModal.epicA3.t")}>
                <button onClick={copyScript} className="mb-2 inline-flex items-center gap-2 rounded-lg bg-epic px-3 py-2 text-xs font-bold text-ink hover:brightness-110">
                  <Icon name="copy" className="size-4" /> {copied ? t("helpModal.copied") : t("helpModal.copy")}
                </button>
                <br />{t("helpModal.epicA3.d")}
              </Step>
              <Step n="4" title={t("helpModal.epicA4.t")}>{t("helpModal.epicA4.d")}</Step>
            </ol>
            <p className="mt-4 rounded-xl border border-spark/30 bg-spark/10 p-3 text-xs text-muted">
              {t("helpModal.epicWarn")} <a href="/epic-purchases.js" target="_blank" rel="noopener noreferrer" className="text-spark underline">/epic-purchases.js</a>.
            </p>

            <h3 className="mb-2 mt-7 font-display text-base font-bold text-spark">{t("helpModal.epicB")}</h3>
            <p className="text-sm text-muted">
              {t("helpModal.epicB1")} <code className={code}>legendary auth</code>. {t("helpModal.epicB2")} <code className={code}>legendary list --json &gt; epic.json</code> {t("helpModal.epicB3")}
            </p>
            <p className="mt-4 text-xs text-muted">{t("helpModal.epicNote")}</p>
          </>
        )}

        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-raised py-3 text-sm font-bold hover:bg-line">{t("helpModal.ok")}</button>
      </div>
    </div>
  );
}
