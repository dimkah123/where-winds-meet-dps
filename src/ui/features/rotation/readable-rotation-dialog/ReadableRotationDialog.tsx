import { useEffect, useId, useRef, useState } from "react"
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copyStatus, setCopyStatus] = useState("")

  useEffect(() => {
    textareaRef.current?.focus()
    textareaRef.current?.select()
  }, [])

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(readableText)
      } else {
        textareaRef.current?.select()
        document.execCommand("copy")
      }
      setCopyStatus(t("rotation.editor.copied"))
      setTimeout(() => setCopyStatus(""), 3000)
    } catch {
      textareaRef.current?.select()
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
          ref={textareaRef}
          readOnly
          value={readableText}
          className={styles.textarea}
          aria-label={t("rotation.editor.readableFormat")}
          onFocus={(e) => e.currentTarget.select()}
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
