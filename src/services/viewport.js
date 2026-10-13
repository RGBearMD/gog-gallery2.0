import { useEffect, useState } from "react";

// Diventa true (e resta true) quando l'elemento si avvicina allo schermo: serve a caricare i dati solo delle righe che si vedranno.
export function useNearViewport(ref, margin = "500px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}
