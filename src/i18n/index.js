import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import bg from "./locales/bg.json"

export const SUPPORTED_LOCALES = ["en", "bg"]
const STORAGE_KEY = "persey_locale"

const storedLocale = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return SUPPORTED_LOCALES.includes(saved) ? saved : null
  } catch { return null }
})()

i18next
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, bg: { translation: bg } },
    lng: storedLocale ?? "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  })

export function setAppLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return
  i18next.changeLanguage(locale)
  try { localStorage.setItem(STORAGE_KEY, locale) } catch { /* ignore */ }
}

export default i18next
