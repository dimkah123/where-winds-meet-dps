import { useI18n } from "../../../i18n/i18nContext"
import styles from "./SharedBuildBanner.module.scss"

interface Props {
  author: string
  title: string
  onSave: () => void
  onDismiss: () => void
}

export function SharedBuildBanner({ author, title, onSave, onDismiss }: Props) {
  const { t } = useI18n()
  const displayAuthor = author.trim() || t("share.defaultPlayerName", "Игрок")
  const displayTitle = title.trim() ? `«${title.trim()}»` : ""

  return (
    <div className={styles.banner} role="status">
      <div className={styles.info}>
        <span className={styles.icon} aria-hidden="true">
          ⚔️
        </span>
        <span>
          {t("share.bannerLoaded", "Загружена сборка игрока")}{" "}
          <span className={styles.author}>{displayAuthor}</span>
          {displayTitle ? (
            <>
              : <span className={styles.title}>{displayTitle}</span>
            </>
          ) : null}
        </span>
      </div>
      <div className={styles.actions}>
        <button type="button" className={`btn primary ${styles.saveBtn}`} onClick={onSave}>
          📥 {t("share.bannerSaveToProfiles", "Сохранить в мои профили")}
        </button>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onDismiss}
          title={t("share.bannerHideTooltip", "Скрыть уведомление")}
          aria-label={t("common.close", "Закрыть")}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
