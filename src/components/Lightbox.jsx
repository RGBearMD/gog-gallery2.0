import { useEffect } from "react";
import { Icon } from "./Icons";
import { useI18n } from "../i18n/context";

export default function Lightbox({ shots, index, onIndex, onClose }) {
  const { t } = useI18n();
  const n = shots.length;
  const go = (d) => onIndex((index + d + n) % n);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const btn = "absolute top-1/2 -translate-y-1/2 rounded-full bg-panel/90 p-3 text-fog hover:bg-spark hover:text-ink";
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-3 animate-fade-in" onClick={onClose}>
      <button onClick={onClose} aria-label={t("aria.close")} className="absolute right-3 top-3 rounded-full bg-panel/90 p-3 hover:bg-raised"><Icon name="close" /></button>
      {n > 1 && <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label={t("aria.prev")} className={`${btn} left-3`}><Icon name="prev" /></button>}
      <img src={shots[index].full} alt={t("aria.lightbox", { i: index + 1, n })} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl animate-scale-up" />
      {n > 1 && <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label={t("aria.next")} className={`${btn} right-3`}><Icon name="next" /></button>}
    </div>
  );
}
