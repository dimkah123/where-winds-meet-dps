import { useState } from "react"
import { useI18n } from "../../../i18n/i18nContext"
import { kvStore } from "../../../kvStore"
import styles from "./QiBreakToast.module.scss"

export const QI_BREAK_TOAST_HIDDEN_UNTIL_KEY = "wwm.qiBreakToastHiddenUntil"

function readHiddenUntil(): number {
  const raw = kvStore.get(QI_BREAK_TOAST_HIDDEN_UNTIL_KEY)
  if (raw === "forever") return Number.MAX_SAFE_INTEGER
  const hiddenUntil = Number(raw)
  return Number.isFinite(hiddenUntil) ? hiddenUntil : 0
}

export function QiBreakToast({
  onCheckRotation,
  now = Date.now,
}: {
  onCheckRotation: () => void
  now?: () => number
}) {
  const { t } = useI18n()
  const [hiddenUntil, setHiddenUntil] = useState(readHiddenUntil)
  const [isClosed, setIsClosed] = useState(false)
  const [checkRotationBefore = "", checkRotationAfter = ""] = t(
    "layout.outputPanel.qiBreakNoticeCheck",
  ).split("{link}")

  if (isClosed || now() < hiddenUntil) return null

  function close(): void {
    setIsClosed(true)
  }

  function dismissForever(): void {
    kvStore.set(QI_BREAK_TOAST_HIDDEN_UNTIL_KEY, "forever")
    setHiddenUntil(Number.MAX_SAFE_INTEGER)
    setIsClosed(true)
  }

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">
        !
      </span>
      <div className={styles.body}>
        <strong className={styles.title}>{t("layout.outputPanel.qiBreakNoticeTitle")}</strong>
        <span className={styles.text}>
          {t("layout.outputPanel.qiBreakNoticeBody")} {checkRotationBefore}
          <span className={styles.linkGroup}>
            <button type="button" className={styles.link} onClick={onCheckRotation}>
              {t("layout.outputPanel.qiBreakNoticeCheckLink")}
            </button>
            {checkRotationAfter}
          </span>
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.dontShowAgainButton}
            onClick={dismissForever}
          >
            {t("layout.qiBreakToast.dontShowAgain")}
          </button>
        </div>
      </div>
      <button
        type="button"
        className={styles.closeButton}
        aria-label={t("layout.outputPanel.qiBreakNoticeDismiss")}
        title={t("layout.outputPanel.qiBreakNoticeDismiss")}
        onClick={close}
      >
        ×
      </button>
    </div>
  )
}
