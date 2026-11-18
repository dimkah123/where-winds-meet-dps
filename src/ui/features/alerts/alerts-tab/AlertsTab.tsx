import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import type { Inputs, QiEdgeWarning, Result } from "../../../../engine/types"
import { useI18n } from "../../../../i18n/i18nContext"
import { getGeneralWarningKey, getGearSetAlerts, getQiEdgeWarningKey } from "../alertKeys"
import { gearSlotLabelKey } from "../../gear/shared/gearSlotKeys"
import { setKey } from "../../../../i18n/contentKeys"
import { SET_BY_ID } from "../../../../definitions/sets/registry"
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
  inputs,
  isDnd,
  onToggleDnd,
  acknowledgedAlerts = new Set(),
  onToggleAcknowledge,
  onAcknowledgeAll,
}: {
  result: Result
  inputs?: Inputs
  isDnd: boolean
  onToggleDnd: () => void
  acknowledgedAlerts?: Set<string>
  onToggleAcknowledge?: (key: string) => void
  onAcknowledgeAll?: () => void
}) {
  const { t } = useI18n()
  const navigate = useNavigate()

  const warnings = result.warnings
  const qiEdgeWarnings = result.qiEdgeWarnings ?? []
  const gearSetAlerts = useMemo(() => (inputs ? getGearSetAlerts(inputs) : []), [inputs])
  const uniqueWarnings = useMemo(() => {
    const seen = new Set<string>()
    return warnings.filter((w) => {
      const key = w.includes("calculated damage is too low for rotation timing")
        ? "fallback-damage-low"
        : w
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [warnings])
  const totalAlerts = uniqueWarnings.length + qiEdgeWarnings.length + gearSetAlerts.length
  const fallbackCount = result.fallbackStepIds?.length ?? 0

  const unacknowledgedCount = useMemo(() => {
    let count = 0
    for (const w of uniqueWarnings) {
      if (!acknowledgedAlerts.has(getGeneralWarningKey(w))) count++
    }
    for (const q of qiEdgeWarnings) {
      if (!acknowledgedAlerts.has(getQiEdgeWarningKey(q))) count++
    }
    for (const g of gearSetAlerts) {
      if (!acknowledgedAlerts.has(g.key)) count++
    }
    return count
  }, [uniqueWarnings, qiEdgeWarnings, gearSetAlerts, acknowledgedAlerts])

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>
            {t("alerts.title")}
            {totalAlerts > 0 && (
              <span className={styles.badge}>
                {unacknowledgedCount > 0 ? unacknowledgedCount : "✓"}
              </span>
            )}
          </h2>
          <p className={styles.description}>
            {isDnd ? t("alerts.dndEnabled") : t("alerts.description")}
          </p>
        </div>
        <div className={styles.headerActions}>
          {unacknowledgedCount > 0 && onAcknowledgeAll && (
            <button
              type="button"
              className={styles.acknowledgeAllButton}
              onClick={onAcknowledgeAll}
              title={t("alerts.acknowledgeAll")}
            >
              ✓ {t("alerts.acknowledgeAll")}
            </button>
          )}
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
                const alertKey = getQiEdgeWarningKey(warning)
                const isAck = acknowledgedAlerts.has(alertKey)
                const key = QI_EDGE_WARNING_KEYS[warning.edge][warning.side]
                const text = t(key)
                  .replace("{skill}", warning.skillName)
                  .replace("{seconds}", warning.offsetSec.toFixed(2))
                  .replace("{edge}", warning.edgeSec.toFixed(2))
                  .replace("{share}", (warning.shareOfTotal * 100).toFixed(1))

                return (
                  <div
                    key={index}
                    className={`${styles.alertCard} ${isAck ? styles.alertCardAcknowledged : ""}`}
                  >
                    <div className={styles.alertHeader}>
                      <span className={styles.skillName}>
                        <span>⚔</span>
                        <span>{warning.skillName}</span>
                      </span>
                      <div className={styles.headerTags}>
                        {isAck && (
                          <span className={styles.acknowledgedTag}>
                            ✓ {t("alerts.acknowledged")}
                          </span>
                        )}
                        <span className={styles.timingTag}>
                          {t("alerts.fragileTiming")} • {(warning.shareOfTotal * 100).toFixed(1)}%{" "}
                          {t("alerts.shareOfDamage")}
                        </span>
                      </div>
                    </div>
                    <div className={styles.alertBody}>{text}</div>
                    <div className={styles.alertFooter}>
                      <span className={styles.recommendation}>{t("alerts.recommendation")}</span>
                      <div className={styles.footerActions}>
                        {onToggleAcknowledge && (
                          <button
                            type="button"
                            className={isAck ? styles.acknowledgedButton : styles.acknowledgeButton}
                            onClick={() => onToggleAcknowledge(alertKey)}
                          >
                            {isAck ? `✓ ${t("alerts.acknowledged")}` : t("alerts.acknowledge")}
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => navigate("/rotation-editor")}
                        >
                          {t("alerts.openRotationEditor")} →
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {gearSetAlerts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span>🛡️</span>
                <span>{t("alerts.gearSetWarningsTitle")}</span>
              </h3>
              {gearSetAlerts.map((alert) => {
                const isAck = acknowledgedAlerts.has(alert.key)
                const slotLabel = alert.slot
                  ? t(gearSlotLabelKey(alert.slot, inputs?.classId ?? "stonesplitStrength"))
                  : ""
                const setName = alert.setName
                  ? t(setKey(alert.setName), SET_BY_ID[alert.setName]?.name ?? alert.setName)
                  : ""
                return (
                  <div
                    key={alert.key}
                    className={`${styles.alertCard} ${isAck ? styles.alertCardAcknowledged : ""}`}
                  >
                    <div className={styles.alertHeader}>
                      <span className={styles.skillName}>
                        <span>⚠️</span>
                        <span>
                          {alert.kind === "noSet"
                            ? t("alerts.gearSetNoSetTitle").replace("{slot}", slotLabel)
                            : t("alerts.gearSetIncompleteTitle")
                                .replace("{set}", setName)
                                .replace("{count}", `${alert.count}/4`)}
                        </span>
                      </span>
                      <div className={styles.headerTags}>
                        {isAck && (
                          <span className={styles.acknowledgedTag}>
                            ✓ {t("alerts.acknowledged")}
                          </span>
                        )}
                        <span className={styles.timingTag}>
                          {alert.kind === "noSet" ? t("common.noSet") : `${alert.count}/4`}
                        </span>
                      </div>
                    </div>
                    <div className={styles.alertBody}>
                      {alert.kind === "noSet"
                        ? t("alerts.gearSetNoSetBody").replace("{slot}", slotLabel)
                        : t("alerts.gearSetIncompleteBody")
                            .replace("{set}", setName)
                            .replace("{count}", `${alert.count}/4`)}
                    </div>
                    <div className={styles.alertFooter}>
                      <span className={styles.recommendation}>
                        {t("alerts.gearSetRecommendation")}
                      </span>
                      <div className={styles.footerActions}>
                        <button
                          type="button"
                          className={styles.rotationButton}
                          onClick={() => navigate("/gear")}
                        >
                          {t("gear.buildSummary.equippedTab")} →
                        </button>
                        {onToggleAcknowledge && (
                          <button
                            type="button"
                            className={isAck ? styles.acknowledgedButton : styles.acknowledgeButton}
                            onClick={() => onToggleAcknowledge(alert.key)}
                          >
                            {isAck ? `✓ ${t("alerts.acknowledged")}` : t("alerts.acknowledge")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {uniqueWarnings.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span>⚠️</span>
                <span>{t("alerts.generalWarningsTitle")}</span>
              </h3>
              {uniqueWarnings.map((warning: string, index: number) => {
                const alertKey = getGeneralWarningKey(warning)
                const isAck = acknowledgedAlerts.has(alertKey)
                if (warning.includes("calculated damage is too low for rotation timing")) {
                  return (
                    <div
                      key={index}
                      className={`${styles.alertCard} ${isAck ? styles.alertCardAcknowledged : ""}`}
                    >
                      <div className={styles.alertHeader}>
                        <span className={styles.skillName}>
                          <span>⚔</span>
                          <span>SnowpartingCharged[Forgetfulness]</span>
                        </span>
                        <div className={styles.headerTags}>
                          {isAck && (
                            <span className={styles.acknowledgedTag}>
                              ✓ {t("alerts.acknowledged")}
                            </span>
                          )}
                          <span className={styles.timingTag}>
                            {t("alerts.damageLowTag")}
                            {fallbackCount > 1 ? ` (${fallbackCount}×)` : ""}
                          </span>
                        </div>
                      </div>
                      <div className={styles.alertBody}>{t("alerts.damageLowBody")}</div>
                      <div className={styles.alertFooter}>
                        <span className={styles.recommendation}>
                          {t("alerts.damageLowRecommendation")}
                        </span>
                        <div className={styles.footerActions}>
                          {onToggleAcknowledge && (
                            <button
                              type="button"
                              className={
                                isAck ? styles.acknowledgedButton : styles.acknowledgeButton
                              }
                              onClick={() => onToggleAcknowledge(alertKey)}
                            >
                              {isAck ? `✓ ${t("alerts.acknowledged")}` : t("alerts.acknowledge")}
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => navigate("/rotation-editor")}
                          >
                            {t("alerts.openRotationEditor")} →
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={index}
                    className={`${styles.alertCard} ${isAck ? styles.alertCardAcknowledged : ""}`}
                  >
                    <div className={styles.alertHeader}>
                      <span className={styles.skillName}>
                        <span>⚠️</span>
                        <span>{t("alerts.generalWarningsTitle")}</span>
                      </span>
                      {isAck && (
                        <span className={styles.acknowledgedTag}>✓ {t("alerts.acknowledged")}</span>
                      )}
                    </div>
                    <div className={styles.alertBody}>⚠️ {warning}</div>
                    {onToggleAcknowledge && (
                      <div className={styles.alertFooter}>
                        <div className={styles.footerActions}>
                          <button
                            type="button"
                            className={isAck ? styles.acknowledgedButton : styles.acknowledgeButton}
                            onClick={() => onToggleAcknowledge(alertKey)}
                          >
                            {isAck ? `✓ ${t("alerts.acknowledged")}` : t("alerts.acknowledge")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
