import { useI18n } from "../../../i18n/i18nContext"
import { LOCALES, LOCALE_LABELS, type Locale } from "../../../i18n/translations"
import { Select } from "../../components/select/Select"
import styles from "./LanguageSelect.module.scss"

interface Props {
  inline?: boolean
}

export function LanguageSelect({ inline }: Props = {}) {
  const { locale, setLocale, t } = useI18n()
  return (
    <span className={styles.languageSelect + (inline ? ` ${styles.inline}` : "")}>
      <Select<Locale>
        compact
        ariaLabel={t("layout.languageSelect.language")}
        value={locale}
        options={LOCALES.map((option) => ({ value: option, label: LOCALE_LABELS[option] }))}
        onChange={setLocale}
      />
    </span>
  )
}
