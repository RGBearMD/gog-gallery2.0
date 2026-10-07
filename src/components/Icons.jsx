const PATHS = {
  menu: "M4 6h16M4 12h16M4 18h16",
  strip: "M3 4h18v6H3zM3 14h18v6H3z",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  download: "M12 4v11m0 0l-4-4m4 4l4-4M5 20h14",
  dice: "M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01",
  swap: "M7 7h13m0 0l-3-3m3 3l-3 3M17 17H4m0 0l3-3m-3 3l3 3",
  close: "M6 6l12 12M18 6L6 18",
  prev: "M15 5l-7 7 7 7",
  next: "M9 5l7 7-7 7",
  upload: "M12 16V4m0 0L8 8m4-4l4 4M5 20h14",
  copy: "M9 9h10v10H9zM5 15V5h10",
};

export function Icon({ name, className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
