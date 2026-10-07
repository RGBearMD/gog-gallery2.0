// Scorre fino a un gioco e lo evidenzia per un istante.
export function scrollToGame(id) {
  const el = document.getElementById(`game-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 1700);
}
