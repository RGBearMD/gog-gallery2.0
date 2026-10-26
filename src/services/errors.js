// Errore con una chiave di traduzione: l'interfaccia lo mostra nella lingua scelta (vedi src/i18n).
export const i18nError = (key) => Object.assign(new Error(key), { i18n: key });
