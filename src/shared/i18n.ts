import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zhTW from "../locales/zh-TW.json";
import en from "../locales/en.json";
import type { Locale } from "./types";

export function detectInitialLocale(stored?: Locale): Locale {
  if (stored === "zh-TW" || stored === "en") return stored;
  try {
    const ui = chrome.i18n?.getUILanguage?.() ?? "en";
    return ui.toLowerCase().startsWith("zh") ? "zh-TW" : "en";
  } catch {
    return "en";
  }
}

export async function initI18n(initial: Locale) {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: initial,
      fallbackLng: "en",
      resources: {
        "zh-TW": { translation: zhTW },
        en: { translation: en },
      },
      interpolation: { escapeValue: false },
    });
  } else if (i18n.language !== initial) {
    await i18n.changeLanguage(initial);
  }
  return i18n;
}

export default i18n;
