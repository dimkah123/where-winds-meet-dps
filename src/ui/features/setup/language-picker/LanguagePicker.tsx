import { LOCALES, LOCALE_LABELS, type Locale } from "../../../../i18n/translations"
import styles from "./LanguagePicker.module.scss"

interface Props {
  value: Locale
  onChange(locale: Locale): void
}

const LANGUAGE_DETAILS: Record<Locale, { subname: string; flag: string }> = {
  ru: { subname: "Русский язык", flag: "🇷🇺" },
  en: { subname: "English language", flag: "🇬🇧" },
  zh: { subname: "简体中文", flag: "🇨🇳" },
  ko: { subname: "한국어", flag: "🇰🇷" },
}

export function LanguagePicker({ value, onChange }: Props) {
  return (
    <div className={styles.pickerRoot}>
      <div className={styles.languageGrid}>
        {LOCALES.map((localeKey) => {
          const isSelected = localeKey === value
          const meta = LANGUAGE_DETAILS[localeKey]
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
                  {meta.flag}
                </span>
                <div className={styles.text}>
                  <span className={styles.name}>{LOCALE_LABELS[localeKey]}</span>
                  <span className={styles.subname}>{meta.subname}</span>
                </div>
              </div>
              <span className={styles.radioDot} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
