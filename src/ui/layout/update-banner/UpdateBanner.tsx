import { useI18n } from "../../../i18n/i18nContext"
import styles from "./UpdateBanner.module.scss"

interface Props {
  version: string | null
  onReload: () => void
  onDismiss: () => void
}

export function UpdateBanner({ version, onReload, onDismiss }: Props) {
  const { t } = useI18n()

  const title = version
    ? t(
        "layout.updateBanner.updateDetectedWithVersion",
        "На сервере обнаружено обновление ({version})!",
      ).replace("{version}", version)
    : t("layout.updateBanner.updateDetected", "На сервере обнаружено обновление!")

  const prompt = t("layout.updateBanner.refreshPrompt", "Обновите страницу, чтобы применить его.")

  return (
    <div className={styles.banner} role="status">
      <div className={styles.info}>
        <span className={styles.icon} aria-hidden="true">
          🚀
        </span>
        <span className={styles.text}>
          <strong className={styles.title}>{title}</strong>{" "}
          <span className={styles.prompt}>{prompt}</span>
        </span>
      </div>
      <div className={styles.actions}>
        <button type="button" className={`btn primary ${styles.refreshBtn}`} onClick={onReload}>
          🔄 {t("layout.updateBanner.refreshButton", "Обновить страницу")}
        </button>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onDismiss}
          title={t("layout.updateBanner.dismissTooltip", "Скрыть уведомление")}
          aria-label={t("common.close", "Закрыть")}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
