import { useId, useState } from "react"
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../../components/dialog/Dialog"
import { useI18n } from "../../../../i18n/i18nContext"
import styles from "./ReadableRotationDialog.module.scss"

interface Props {
  title: string
  readableText: string
  onClose: () => void
}

export function ReadableRotationDialog({ title, readableText, onClose }: Props) {
  const { t } = useI18n()
  const titleId = useId()
  const [copyStatus, setCopyStatus] = useState("")

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(readableText)
      } else {
        const temp = document.createElement("textarea")
        temp.value = readableText
        temp.style.position = "fixed"
        temp.style.opacity = "0"
        document.body.appendChild(temp)
        temp.select()
        document.execCommand("copy")
        document.body.removeChild(temp)
      }
      setCopyStatus(t("rotation.editor.copied"))
      setTimeout(() => setCopyStatus(""), 3000)
    } catch {
      // Ignored
    }
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose} surfaceClassName={styles.surface}>
      <DialogHeader>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.kicker}>{t("rotation.editor.readableFormatKicker")}</span>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <p className={styles.subtitle}>{t("rotation.editor.readableFormatSubtitle")}</p>
          </div>
          <button
            type="button"
            className={styles.closeIconButton}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            ×
          </button>
        </div>
      </DialogHeader>
      <DialogBody className={styles.body}>
        <textarea
          readOnly
          value={readableText}
          className={styles.textarea}
          aria-label={t("rotation.editor.readableFormat")}
        />
      </DialogBody>
      <DialogFooter>
        {copyStatus && <span className={styles.statusMessage}>{copyStatus}</span>}
        <button type="button" className="btn" onClick={onClose}>
          {t("common.close")}
        </button>
        <button type="button" className="btn primary" onClick={handleCopy}>
          {t("common.copy")}
        </button>
      </DialogFooter>
    </Dialog>
  )
}
