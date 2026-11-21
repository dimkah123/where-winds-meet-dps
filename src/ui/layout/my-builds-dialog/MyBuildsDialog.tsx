import { useEffect, useId, useState } from "react"
import { deleteBuildFromCloud, fetchMyBuilds } from "../../../cloud/cloudBuilds"
import type { CloudBuildSummary } from "../../../cloud/types"
import { useI18n } from "../../../i18n/i18nContext"
import { Dialog } from "../../components/dialog/Dialog"
import styles from "./MyBuildsDialog.module.scss"

interface Props {
  onClose: () => void
  onSelectBuild: (shortId: string, asNewProfile?: boolean) => void
}

export function MyBuildsDialog({ onClose, onSelectBuild }: Props) {
  const { t, locale } = useI18n()
  const titleId = useId()
  const [builds, setBuilds] = useState<CloudBuildSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchMyBuilds()
      .then((data) => {
        setBuilds(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load builds")
        setIsLoading(false)
      })
  }, [])

  async function handleDelete(shortId: string) {
    const confirmMsg = t("share.cloud.confirmDelete", "Удалить эту сборку из облака?")
    if (!window.confirm(confirmMsg)) return

    try {
      await deleteBuildFromCloud(shortId)
      setBuilds((prev) => prev.filter((b) => b.shortId !== shortId))
    } catch (err) {
      alert("Ошибка удаления: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  async function handleCopyLink(shortId: string) {
    const url = `${window.location.origin}${window.location.pathname}#/b/${shortId}`
    await navigator.clipboard.writeText(url)
    setCopiedId(shortId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose} surfaceClassName={styles.surface}>
      <div className={styles.header}>
        <h2 id={titleId}>{t("share.cloud.myBuildsTitle", "Мои сборки в облаке")}</h2>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
      </div>

      <div className={styles.body}>
        {isLoading && <div className={styles.loading}>{t("common.loading", "Загрузка...")}</div>}

        {error && <div className={styles.empty}>{error}</div>}

        {!isLoading && !error && builds.length === 0 && (
          <div className={styles.empty}>
            {t(
              "share.cloud.noBuildsYet",
              "У вас пока нет сохранённых сборок. Откройте окно 'Поделиться' и нажмите 'Сохранить в облако'.",
            )}
          </div>
        )}

        {!isLoading && builds.length > 0 && (
          <div className={styles.buildList}>
            {builds.map((b) => {
              const formattedDate = new Date(b.lastUpdated).toLocaleDateString(
                locale === "ru" ? "ru-RU" : "en-US",
                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
              )
              return (
                <div key={b.shortId} className={styles.buildCard}>
                  <div className={styles.buildInfo}>
                    <div className={styles.buildTitle}>{b.title || "Untitled Build"}</div>
                    <div className={styles.buildMeta}>
                      {b.dps > 0 && (
                        <span className={styles.buildDps}>
                          {Math.round(b.dps).toLocaleString()} DPS
                        </span>
                      )}
                      <span>{formattedDate}</span>
                      <span>ID: {b.shortId}</span>
                    </div>
                  </div>

                  <div className={styles.buildActions}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.openBtn}`}
                      onClick={() => {
                        onSelectBuild(b.shortId, false)
                        onClose()
                      }}
                      title={t("share.cloud.openOverwriteTooltip", "Открыть и перезаписать текущий профиль")}
                    >
                      {t("common.open", "Открыть")}
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        onSelectBuild(b.shortId, true)
                        onClose()
                      }}
                      title={t("share.cloud.openAsNewTooltip", "Открыть и добавить как новый профиль")}
                    >
                      + {t("share.cloud.asNewProfile", "В новый")}
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => handleCopyLink(b.shortId)}
                    >
                      {copiedId === b.shortId ? "✓" : t("common.copyLink", "Ссылка")}
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDelete(b.shortId)}
                      title={t("common.delete", "Удалить")}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Dialog>
  )
}
