import { useState } from "react"
import type { Result } from "../../../engine/types"
import { useI18n } from "../../../i18n/i18nContext"
import { WarningLines } from "../output-panel/OutputPanel"
import styles from "./WarningsToast.module.scss"

function warningsSignature(result: Result): string {
  const qiEdgeWarnings = result.qiEdgeWarnings ?? []
  if (!result.warnings.length && !qiEdgeWarnings.length) return ""
  return JSON.stringify([result.warnings, qiEdgeWarnings])
}

export function WarningsToast({
  result,
  isDnd = false,
  onToggleDnd,
}: {
  result: Result
  isDnd?: boolean
  onToggleDnd?: () => void
}) {
  const { t } = useI18n()
  const [dismissedSignature, setDismissedSignature] = useState("")
  const signature = warningsSignature(result)

  if (isDnd) return null
  if (signature === "" && dismissedSignature !== "") setDismissedSignature("")
  if (signature === "" || signature === dismissedSignature) return null

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <div className={styles.topRow}>
        <div className={styles.lines}>
          <WarningLines result={result} />
        </div>
        <button
          type="button"
          className={styles.closeButton}
          aria-label={t("common.close")}
          onClick={() => setDismissedSignature(signature)}
        >
          ×
        </button>
      </div>
      <div className={styles.actions}>
        <a href="#/alerts" className={styles.alertsLink}>
          {t("app.alerts")} →
        </a>
        {onToggleDnd && (
          <button
            type="button"
            className={styles.dndToastButton}
            onClick={onToggleDnd}
            title={t("alerts.dndButton")}
          >
            🔕 {t("alerts.dndButton")}
          </button>
        )}
      </div>
    </div>
  )
}
