import { LOCALES, LOCALE_LABELS, type Locale } from "../../../../i18n/translations"
import styles from "./LanguagePicker.module.scss"

interface Props {
  value: Locale
  onChange(locale: Locale): void
}

const LANGUAGE_FLAGS: Record<Locale, string> = {
  ru: "🇷🇺",
  en: "🇬🇧",
  zh: "🇨🇳",
  ko: "🇰🇷",
}

export function LanguagePicker({ value, onChange }: Props) {
  return (
    <div className={styles.pickerRoot}>
      <div className={styles.languageGrid}>
        {LOCALES.map((localeKey) => {
          const isSelected = localeKey === value
          const flag = LANGUAGE_FLAGS[localeKey]
          return (
            <button
              type="button"
              key={localeKey}
              className={`${styles.tile} ${isSelected ? styles.selected : ""}`}
              aria-current={isSelected}
              onClick={() => onChange(localeKey)}
            >
              <div className={styles.left}>
                <span className={styles.flag} aria-hidden="true">
                  {flag}
                </span>
                <span className={styles.name}>{LOCALE_LABELS[localeKey]}</span>
              </div>
              <span className={styles.radioDot} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
