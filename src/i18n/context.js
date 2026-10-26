import { createContext, useContext } from "react";

export const I18nContext = createContext(null);
export const useI18n = () => useContext(I18nContext);
