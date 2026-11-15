import { useEffect, useState, type ReactNode } from "react"
import { isLocale, translate, type Locale } from "./translations"
import { kvStore } from "../kvStore"
import { I18nContext, type I18nValue } from "./i18nContext"

const STORAGE_KEY = "wwm.locale"

function detectInitialLocale(): Locale {
  const saved = kvStore.get(STORAGE_KEY)
  if (isLocale(saved)) return saved
  if (typeof navigator !== "undefined" && navigator.language) {
    const lang = navigator.language.toLowerCase()
    if (lang.startsWith("ru")) return "ru"
    if (lang.startsWith("zh")) return "zh"
    if (lang.startsWith("ko")) return "ko"
  }
  return "en"
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale)
  useEffect(() => {
    kvStore.set(STORAGE_KEY, locale)
  }, [locale])
  const value: I18nValue = {
    locale,
    setLocale: setLocaleState,
    t: (key, fallback) => translate(key, locale, fallback),
  }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
