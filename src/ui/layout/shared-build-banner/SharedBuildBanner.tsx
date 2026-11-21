import { useI18n } from "../../../i18n/i18nContext"
import styles from "./SharedBuildBanner.module.scss"

interface Props {
  author: string
  title: string
  onSave?: () => void
  onSaveAsNew?: () => void
  onOverwrite?: () => void
  onDismiss: () => void
  onDiscard?: () => void
}

export function SharedBuildBanner({
  author,
  title,
  onSave,
  onSaveAsNew,
  onOverwrite,
  onDismiss,
  onDiscard,
}: Props) {
  const { t } = useI18n()
  const displayAuthor = author.trim() || t("share.defaultPlayerName", "Игрок")
  const displayTitle = title.trim() ? `«${title.trim()}»` : ""
  const handleSaveAsNew = onSaveAsNew || onSave

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
        {onOverwrite && (
          <button
            type="button"
            className={`btn ${styles.saveBtn} ${styles.overwriteBtn}`}
            onClick={onOverwrite}
            title={t("share.bannerOverwriteCurrentTooltip", "Перезаписать текущий профиль этой сборкой")}
          >
            💾 {t("share.bannerOverwriteCurrent", "Перезаписать профиль")}
          </button>
        )}
        {handleSaveAsNew && (
          <button
            type="button"
            className={`btn primary ${styles.saveBtn}`}
            onClick={handleSaveAsNew}
            title={t("share.bannerSaveToProfilesTooltip", "Сохранить как новый профиль")}
          >
            📥 {t("share.bannerSaveToProfiles", "Сохранить в мои профили")}
          </button>
        )}
        {onDiscard && (
          <button
            type="button"
            className={`btn danger ${styles.saveBtn}`}
            onClick={onDiscard}
            title={t("share.bannerDiscardTooltip", "Сбросить загруженную сборку и вернуть предыдущую")}
          >
            ↩ {t("share.bannerDiscard", "Отклонить")}
          </button>
        )}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onDismiss}
          title={t("share.bannerHideTooltip", "Скрыть уведомление (сборка останется в калькуляторе)")}
          aria-label={t("common.close", "Закрыть")}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
