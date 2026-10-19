// Chiave per confrontare i titoli tra librerie e cataloghi: ignora maiuscole, accenti, simboli (™ ®),
// punteggiatura, "The" iniziale e le diciture di edizione («Special Edition», «Game of the Year»…).
// Usata sia dal browser sia dalle funzioni del server.
const EDITION = /\b(game of the year|goty|special|enhanced|complete|definitive|deluxe|ultimate|gold|anniversary|remastered|collector s|directors? cut|standard)( edition)?\b|\bedition\b/g;

const ROMAN = { ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10 };

export function normalizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[™®©]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’`´]/g, "") // Baldur's -> baldurs
    .replace(/[^a-z0-9]+/g, " ")
    .replace(EDITION, " ")
    .replace(/\bthe\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/ (ii|iii|iv|v|vi|vii|viii|ix|x)$/, (_, r) => ` ${ROMAN[r]}`); // «Gate II» = «Gate 2» (solo come ultima parola)
}
