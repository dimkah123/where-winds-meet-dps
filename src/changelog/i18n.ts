import type { Locale } from "../i18n/translations"
import type { ChangelogSectionLabel } from "./types"
import en from "./locales/en.json"
import ko from "./locales/ko.json"
import ru from "./locales/ru.json"
import zh from "./locales/zh.json"

interface ChangelogLocaleData {
  sections: Record<string, string>
  headlines: Record<string, string>
  items: Record<string, string>
}

const LOCALES: Record<Locale, ChangelogLocaleData> = {
  en,
  ru,
  zh,
  ko,
}

export function translateHeadline(version: string, fallback: string, locale: Locale): string {
  return LOCALES[locale]?.headlines[version] || fallback
}

export function translateSectionLabel(label: ChangelogSectionLabel, locale: Locale): string {
  return (LOCALES[locale]?.sections[label] as ChangelogSectionLabel) || label
}

export function translateItemText(englishText: string, locale: Locale): string {
  if (locale === "en") return englishText
  return LOCALES[locale]?.items[englishText] || englishText
}
