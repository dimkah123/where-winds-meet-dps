import { useNavigate } from "react-router-dom"
import type { QiEdgeWarning, Result } from "../../../../engine/types"
import { useI18n } from "../../../../i18n/i18nContext"
import styles from "./AlertsTab.module.scss"

const QI_EDGE_WARNING_KEYS = {
  start: {
    before: "layout.outputPanel.qiEdgeBeforeStart",
    after: "layout.outputPanel.qiEdgeAfterStart",
  },
  end: {
    before: "layout.outputPanel.qiEdgeBeforeEnd",
    after: "layout.outputPanel.qiEdgeAfterEnd",
  },
} as const

export function AlertsTab({
  result,
  isDnd,
  onToggleDnd,
}: {
  result: Result
  isDnd: boolean
  onToggleDnd: () => void
}) {
  const { t } = useI18n()
  const navigate = useNavigate()

  const warnings = result.warnings
  const qiEdgeWarnings = result.qiEdgeWarnings ?? []
  const totalAlerts = warnings.length + qiEdgeWarnings.length

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>
            {t("alerts.title")}
            {totalAlerts > 0 && <span className={styles.badge}>{totalAlerts}</span>}
          </h2>
          <p className={styles.description}>
            {isDnd ? t("alerts.dndEnabled") : t("alerts.description")}
          </p>
        </div>
        <button
          type="button"
          className={isDnd ? styles.dndButtonActive : styles.dndButton}
          onClick={onToggleDnd}
          title={isDnd ? t("alerts.clickToToggle") : t("alerts.dndButton")}
        >
          <span className={styles.dndIcon}>{isDnd ? "🔕" : "🔔"}</span>
          <span>{isDnd ? t("alerts.dndActive") : t("alerts.dndButton")}</span>
        </button>
      </div>

      {totalAlerts === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✓</div>
          <h3 className={styles.emptyTitle}>{t("alerts.noAlertsTitle")}</h3>
          <p className={styles.emptyDescription}>{t("alerts.noAlertsDescription")}</p>
        </div>
      ) : (
        <>
          {qiEdgeWarnings.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span>⚠️</span>
                <span>{t("alerts.qiEdgeTitle")}</span>
              </h3>
              {qiEdgeWarnings.map((warning: QiEdgeWarning, index: number) => {
                const key = QI_EDGE_WARNING_KEYS[warning.edge][warning.side]
                const text = t(key)
                  .replace("{skill}", warning.skillName)
                  .replace("{seconds}", warning.offsetSec.toFixed(2))
                  .replace("{edge}", warning.edgeSec.toFixed(2))
                  .replace("{share}", (warning.shareOfTotal * 100).toFixed(1))

                return (
                  <div key={index} className={styles.alertCard}>
                    <div className={styles.alertHeader}>
                      <span className={styles.skillName}>
                        <span>⚔</span>
                        <span>{warning.skillName}</span>
                      </span>
                      <span className={styles.timingTag}>
                        {t("alerts.fragileTiming")} • {(warning.shareOfTotal * 100).toFixed(1)}%{" "}
                        {t("alerts.shareOfDamage")}
                      </span>
                    </div>
                    <div className={styles.alertBody}>{text}</div>
                    <div className={styles.alertFooter}>
                      <span className={styles.recommendation}>{t("alerts.recommendation")}</span>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => navigate("/rotation-editor")}
                      >
                        {t("alerts.openRotationEditor")} →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {warnings.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span>⚠️</span>
                <span>{t("alerts.generalWarningsTitle")}</span>
              </h3>
              {warnings.map((warning: string, index: number) => (
                <div key={index} className={styles.alertCard}>
                  <div className={styles.alertBody}>⚠️ {warning}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
