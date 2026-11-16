import { useId, useMemo, useRef, useState } from "react"
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../../components/dialog/Dialog"
import { useI18n } from "../../../../i18n/i18nContext"
import type { Skill } from "../../../../engine/skill"
import type { RotationStep } from "../../../../engine/rotation"
import {
  getAvailableSkillSuggestions,
  parseReadableRotation,
  type SkillSuggestion,
} from "../readableRotation"
import styles from "./ReadableRotationDialog.module.scss"

interface Props {
  title: string
  readableText: string
  classId?: string
  skillsById?: Map<string, Skill>
  onApply?: (steps: RotationStep[]) => void
  onClose: () => void
}

export function ReadableRotationDialog({
  title,
  readableText,
  classId = "",
  skillsById = new Map(),
  onApply,
  onClose,
}: Props) {
  const { t } = useI18n()
  const titleId = useId()
  const [text, setText] = useState(readableText)
  const [copyStatus, setCopyStatus] = useState("")
  const [cursorPos, setCursorPos] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const availableSuggestions = useMemo(
    () => getAvailableSkillSuggestions(classId, skillsById),
    [classId, skillsById],
  )

  // Current token being typed before cursor
  const { currentToken, tokenStart } = useMemo(() => {
    const beforeCursor = text.slice(0, cursorPos)
    const lastSep = Math.max(
      beforeCursor.lastIndexOf(">"),
      beforeCursor.lastIndexOf("\n"),
      beforeCursor.lastIndexOf(","),
    )
    const start = lastSep >= 0 ? lastSep + 1 : 0
    const rawToken = beforeCursor.slice(start)
    return {
      currentToken: rawToken.trim(),
      tokenStart: start,
    }
  }, [text, cursorPos])

  const matchingSuggestions = useMemo(() => {
    if (!currentToken || currentToken.length < 1) return []
    const lower = currentToken.toLowerCase()
    return availableSuggestions
      .filter(
        (s) =>
          s.shortName.toLowerCase().includes(lower) || s.fullName.toLowerCase().includes(lower),
      )
      .sort((a, b) => {
        const aStart = a.shortName.toLowerCase().startsWith(lower)
        const bStart = b.shortName.toLowerCase().startsWith(lower)
        if (aStart && !bStart) return -1
        if (!aStart && bStart) return 1
        return a.shortName.localeCompare(b.shortName)
      })
      .slice(0, 8)
  }, [currentToken, availableSuggestions])

  const parsed = useMemo(
    () => parseReadableRotation(text, classId, skillsById),
    [text, classId, skillsById],
  )

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    setCursorPos(e.target.selectionStart ?? 0)
    setShowSuggestions(true)
    setActiveSuggestionIdx(0)
  }

  function handleSelectOrClick(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    const target = e.currentTarget
    setCursorPos(target.selectionStart ?? 0)
  }

  function selectSuggestion(suggestion: SkillSuggestion) {
    const beforeToken = text.slice(0, tokenStart)
    const afterCursor = text.slice(cursorPos)
    const cleanBefore =
      beforeToken.length > 0 && !beforeToken.endsWith(" ") ? `${beforeToken} ` : beforeToken
    const cleanAfter = afterCursor.replace(/^\s*>*\s*/, "")

    const inserted = `${cleanBefore}${suggestion.shortName} > `
    const newText = `${inserted}${cleanAfter}`
    setText(newText)
    setShowSuggestions(false)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newPos = inserted.length
        textareaRef.current.setSelectionRange(newPos, newPos)
        setCursorPos(newPos)
      }
    }, 0)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (showSuggestions && matchingSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveSuggestionIdx((i) => (i + 1) % matchingSuggestions.length)
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveSuggestionIdx(
          (i) => (i - 1 + matchingSuggestions.length) % matchingSuggestions.length,
        )
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        selectSuggestion(matchingSuggestions[activeSuggestionIdx])
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setShowSuggestions(false)
        return
      }
    }
  }

  function insertQuickSkill(skillName: string) {
    setText((prev) => {
      const trimmed = prev.trim()
      if (!trimmed) return `${skillName} > `
      if (trimmed.endsWith(">")) return `${trimmed} ${skillName} > `
      return `${trimmed} > ${skillName} > `
    })
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const len = textareaRef.current.value.length
        textareaRef.current.setSelectionRange(len, len)
        setCursorPos(len)
      }
    }, 0)
  }

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const temp = document.createElement("textarea")
        temp.value = text
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

  function handleApply() {
    if (!onApply || parsed.totalSteps === 0 || parsed.hasErrors) return
    onApply(parsed.steps)
    setCopyStatus(t("rotation.editor.applied"))
    setTimeout(() => {
      onClose()
    }, 600)
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
        <div className={styles.editorWrapper}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onSelect={handleSelectOrClick}
            onClick={handleSelectOrClick}
            onKeyDown={handleKeyDown}
            placeholder={t("rotation.editor.typeRotationPlaceholder")}
            className={styles.textarea}
            aria-label={t("rotation.editor.readableFormat")}
            spellCheck={false}
          />

          {showSuggestions && matchingSuggestions.length > 0 && (
            <div className={styles.autocompleteMenu} role="listbox">
              <div className={styles.autocompleteHeader}>
                <span>Т9 Autocomplete</span>
                <span className={styles.autocompleteHint}>Tab / ↵</span>
              </div>
              {matchingSuggestions.map((s, idx) => {
                const isActive = idx === activeSuggestionIdx
                return (
                  <button
                    key={`${s.skillId}-${s.shortName}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`${styles.autocompleteItem} ${isActive ? styles.autocompleteItemActive : ""}`}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selectSuggestion(s)
                    }}
                  >
                    <span className={styles.autocompleteShortName}>{s.shortName}</span>
                    <span className={styles.autocompleteFullName}>{s.fullName}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Add Palette */}
        {availableSuggestions.length > 0 && (
          <div className={styles.quickAddSection}>
            <span className={styles.quickAddLabel}>{t("rotation.editor.quickAdd")}:</span>
            <div className={styles.quickAddList}>
              {availableSuggestions.slice(0, 16).map((s) => (
                <button
                  key={`quick-${s.skillId}-${s.shortName}`}
                  type="button"
                  className={styles.quickAddButton}
                  onClick={() => insertQuickSkill(s.shortName)}
                >
                  +{s.shortName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Highlights Section */}
        <div className={styles.highlightsContainer}>
          <div className={styles.highlightsHeader}>
            <span className={styles.highlightsCount}>
              {t("rotation.editor.parsedCount").replace("{count}", String(parsed.totalSteps))}
            </span>
            {parsed.hasErrors && (
              <span className={styles.highlightsErrorBadge}>
                ⚠{" "}
                {t("rotation.editor.unknownSkillsCount").replace(
                  "{count}",
                  String(parsed.tokens.filter((tok) => !tok.valid).length),
                )}
              </span>
            )}
          </div>

          <div className={styles.highlightsList}>
            {parsed.tokens.length === 0 ? (
              <span className={styles.highlightsEmpty}>—</span>
            ) : (
              parsed.tokens.map((tok, idx) => (
                <span
                  key={`${idx}-${tok.raw}`}
                  className={`${styles.highlightChip} ${tok.valid ? styles.highlightChipValid : styles.highlightChipInvalid}`}
                  title={tok.error || tok.skillName}
                >
                  {!tok.valid && <span className={styles.errorIcon}>⚠ </span>}
                  {tok.cleanName}
                  {tok.multiplier > 1 && (
                    <span className={styles.multiplierBadge}>×{tok.multiplier}</span>
                  )}
                  {idx < parsed.tokens.length - 1 && (
                    <span className={styles.separatorArrow}>›</span>
                  )}
                </span>
              ))
            )}
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        {copyStatus && <span className={styles.statusMessage}>{copyStatus}</span>}
        <button type="button" className="btn" onClick={onClose}>
          {t("common.close")}
        </button>
        <button type="button" className="btn" onClick={handleCopy}>
          {t("common.copy")}
        </button>
        {onApply && (
          <button
            type="button"
            className="btn primary"
            disabled={parsed.totalSteps === 0 || parsed.hasErrors}
            onClick={handleApply}
          >
            {t("rotation.editor.applyToRotation")}
          </button>
        )}
      </DialogFooter>
    </Dialog>
  )
}
