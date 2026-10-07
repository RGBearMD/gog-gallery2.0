import { useEffect, useRef } from "react";

// Quando entra (quasi) nello schermo chiede di mostrare altri giochi.
export default function Sentinel({ onMore }) {
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onMore(), { rootMargin: "900px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [onMore]);
  return <div ref={ref} className="h-px" />;
}
