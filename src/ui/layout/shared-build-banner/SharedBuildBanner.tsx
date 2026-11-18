import styles from "./SharedBuildBanner.module.scss"

interface Props {
  author: string
  title: string
  onSave: () => void
  onDismiss: () => void
}

export function SharedBuildBanner({ author, title, onSave, onDismiss }: Props) {
  const displayAuthor = author.trim() || "Игрок"
  const displayTitle = title.trim() ? `«${title.trim()}»` : ""

  return (
    <div className={styles.banner} role="status">
      <div className={styles.info}>
        <span className={styles.icon} aria-hidden="true">
          ⚔️
        </span>
        <span>
          Загружена сборка игрока <span className={styles.author}>{displayAuthor}</span>
          {displayTitle ? <>: <span className={styles.title}>{displayTitle}</span></> : null}
        </span>
      </div>
      <div className={styles.actions}>
        <button type="button" className="btn primary" onClick={onSave}>
          📥 Сохранить в мои профили
        </button>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onDismiss}
          title="Скрыть уведомление"
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
