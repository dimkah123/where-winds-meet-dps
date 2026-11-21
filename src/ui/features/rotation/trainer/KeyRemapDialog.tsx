import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useI18n } from "../../../../i18n/i18nContext"
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../../components/dialog/Dialog"
import { DEFAULT_KEY_MAP } from "./trainerStorage"
import { formatKeyDisplay, normalizeKeyInput } from "./keyResolution"
import {
  ArchiveIcon,
  DocumentIcon,
  DownloadIcon,
  GearIcon,
  KeyboardIcon,
  PlugIcon,
  PopoutIcon,
} from "./TrainerIcons"
import { copyStylesheetsToWindow } from "./useDocumentPictureInPicture"
import type { TrainerKeyMap } from "./types"
import styles from "./KeyRemapDialog.module.scss"

interface Props {
  keyMap: TrainerKeyMap
  onChange: (next: TrainerKeyMap) => void
  onClose: () => void
  isConnected?: boolean
  recordedKey?: { key: string; time: number } | null
}

type KeyAction = keyof TrainerKeyMap

interface ActionDef {
  key: KeyAction
  labelKey: string
  defaultLabel: string
  desc: string
}

const ACTIONS: ActionDef[] = [
  {
    key: "skill1",
    labelKey: "trainer.keys.skill1",
    defaultLabel: "Special / Stance Skill (~)",
    desc: "Mo Special, Heng Special 6 Hit",
  },
  {
    key: "skill2",
    labelKey: "trainer.keys.skill2",
    defaultLabel: "Primary Skill (Q)",
    desc: "Heng Q, Mo QQ, Heng Q Stab",
  },
  {
    key: "heavy",
    labelKey: "trainer.keys.heavy",
    defaultLabel: "Heavy / Charged Attack (R Hold)",
    desc: "Mo Charged (x4/x5), Heavy attacks",
  },
  {
    key: "dual",
    labelKey: "trainer.keys.dual",
    defaultLabel: "Weapon Switch (Wheel Down)",
    desc: "Mo Swap, Heng Swap (Смена оружия колесиком)",
  },
  {
    key: "swap",
    labelKey: "trainer.keys.swap",
    defaultLabel: "Dual Skill / Tab Swap (Tab)",
    desc: "Heng Dual, Mo Dual (Навык парного оружия / Tab)",
  },
  {
    key: "light",
    labelKey: "trainer.keys.light",
    defaultLabel: "Light Attack / Varied Combo (LClick)",
    desc: "Heng VC, Mo VC, LC (Лёгкая атака / Вариативное комбо)",
  },
  {
    key: "deflect",
    labelKey: "trainer.keys.deflect",
    defaultLabel: "Deflect / Parry (E)",
    desc: "Deflect, Deflect Cancel (Отражение / Парирование)",
  },
  {
    key: "mystic1",
    labelKey: "trainer.keys.mystic1",
    defaultLabel: "Mystic 1 — Flute (F)",
    desc: "Flute Cancel, Flute Full (Флейта приливов)",
  },
  {
    key: "mystic2",
    labelKey: "trainer.keys.mystic2",
    defaultLabel: "Mystic 2 — Toad / Bursting (G)",
    desc: "Bursting Nine, Toad (Жаба / Взрыв девяти / Боковая мыши)",
  },
  {
    key: "dodge",
    labelKey: "trainer.keys.dodge",
    defaultLabel: "Dodge / Roll (Shift)",
    desc: "Slide, Dash, Evade",
  },
]

export function KeyRemapDialog({ keyMap, onChange, onClose, isConnected = false, recordedKey }: Props) {
  const { t, locale } = useI18n()
  const isRuLocale = locale === "ru"
  const [draft, setDraft] = useState<TrainerKeyMap>({ ...keyMap })
  const [recordingAction, setRecordingAction] = useState<KeyAction | null>(null)
  const [activeTab, setActiveTab] = useState<"keys" | "companion">("keys")
  const [popoutWindow, setPopoutWindow] = useState<Window | null>(null)
  const recordingStartTimeRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const justRecordedRef = useRef(0)

  const applyKey = useCallback(
    (actionKey: KeyAction, rawKey: string) => {
      let keyName = normalizeKeyInput(rawKey)
      if (!keyName) return
      if (keyName === " ") keyName = "space"
      if (keyName === "escape") {
        setRecordingAction(null)
        return
      }

      justRecordedRef.current = Date.now()
      setDraft((prev) => ({ ...prev, [actionKey]: keyName }))
      setRecordingAction(null)
    },
    [],
  )

  // 1. Companion / Global in-game inputs
  useEffect(() => {
    if (!recordingAction || !recordedKey) return
    // Only accept companion inputs that occurred AFTER recording started
    if (recordedKey.time < recordingStartTimeRef.current + 50) return
    applyKey(recordingAction, recordedKey.key)
  }, [recordingAction, recordedKey, applyKey])

  // 2. Direct DOM keyboard & mouse inputs inside the dialog (works in PiP, popout window & main window)
  useEffect(() => {
    if (!recordingAction) return

    function getButtonName(button: number): string {
      if (button === 2) return "rclick"
      if (button === 1) return "mclick"
      if (button === 3) return "mouse4"
      if (button === 4) return "mouse5"
      return "lclick"
    }

    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === "Escape") {
        setRecordingAction(null)
        return
      }

      applyKey(recordingAction!, e.key)
    }

    function handleMouseDown(e: MouseEvent) {
      // Ignore click that started recording
      if (Date.now() - recordingStartTimeRef.current < 200) return

      e.preventDefault()
      e.stopPropagation()
      const btn = getButtonName(e.button)
      applyKey(recordingAction!, btn)
    }

    function handleAuxClick(e: MouseEvent) {
      e.preventDefault()
      e.stopPropagation()
      if (Date.now() - recordingStartTimeRef.current < 200) return
      const btn = getButtonName(e.button)
      applyKey(recordingAction!, btn)
    }

    function handleWheel(e: WheelEvent) {
      if (Date.now() - recordingStartTimeRef.current < 150) return
      e.preventDefault()
      e.stopPropagation()
      const direction = e.deltaY > 0 ? "wheeldown" : "wheelup"
      applyKey(recordingAction!, direction)
    }

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault()
      e.stopPropagation()
    }

    const hostDoc = popoutWindow?.document || containerRef.current?.ownerDocument || document
    const hostWin = hostDoc.defaultView || popoutWindow || window

    const targets: (EventTarget | null)[] = [hostDoc, hostWin, document, window]
    if (popoutWindow) {
      targets.push(popoutWindow.document, popoutWindow)
    }
    const cleanTargets = targets.filter((t, i, arr): t is EventTarget => Boolean(t) && arr.indexOf(t) === i)

    for (const target of cleanTargets) {
      target.addEventListener("keydown", handleKeyDown as EventListener, { capture: true })
      target.addEventListener("mousedown", handleMouseDown as EventListener, { capture: true })
      target.addEventListener("auxclick", handleAuxClick as EventListener, { capture: true })
      target.addEventListener("wheel", handleWheel as EventListener, { capture: true, passive: false })
      target.addEventListener("contextmenu", handleContextMenu as EventListener, { capture: true })
    }

    return () => {
      for (const target of cleanTargets) {
        target.removeEventListener("keydown", handleKeyDown as EventListener, { capture: true })
        target.removeEventListener("mousedown", handleMouseDown as EventListener, { capture: true })
        target.removeEventListener("auxclick", handleAuxClick as EventListener, { capture: true })
        target.removeEventListener("wheel", handleWheel as EventListener, { capture: true })
        target.removeEventListener("contextmenu", handleContextMenu as EventListener, { capture: true })
      }
    }
  }, [recordingAction, applyKey, popoutWindow])

  // Open separate window popout
  const handlePopout = useCallback(() => {
    if (popoutWindow && !popoutWindow.closed) {
      popoutWindow.focus()
      return
    }

    const width = 800
    const height = 560
    const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2))
    const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2))

    const win = window.open(
      "",
      "wwm_keybindings_popup",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no`,
    )

    if (win) {
      copyStylesheetsToWindow(win, t("trainer.settings.title", "Trainer Keybindings & Remap"))
      win.addEventListener("beforeunload", () => {
        setPopoutWindow(null)
      })
      setPopoutWindow(win)
    }
  }, [popoutWindow, t])

  const handleClosePopout = useCallback(() => {
    if (popoutWindow && !popoutWindow.closed) {
      popoutWindow.close()
    }
    setPopoutWindow(null)
  }, [popoutWindow])

  function handleSave() {
    onChange(draft)
    handleClosePopout()
    onClose()
  }

  function handleReset() {
    setDraft({ ...DEFAULT_KEY_MAP })
  }

  const dialogContent = (
    <div className={styles.dialogInner}>
      <DialogHeader>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h2 id="trainer-keymap-title" className={styles.title}>
              <GearIcon className={styles.titleIcon} size={18} />
              <span>{t("trainer.settings.title", "Trainer Keybindings & Remap")}</span>
            </h2>

            <div className={styles.headerActions}>
              {!popoutWindow && (
                <button
                  type="button"
                  className={styles.popoutBtn}
                  onClick={handlePopout}
                  title={t("trainer.settings.popout", "Open in separate window")}
                >
                  <PopoutIcon className={styles.btnIcon} />
                  <span>{t("trainer.settings.popout", "В отдельном окне")}</span>
                </button>
              )}
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "keys" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("keys")}
            >
              <KeyboardIcon className={styles.tabIcon} />
              <span>{t("trainer.settings.tabKeys", "Назначение клавиш")} ({ACTIONS.length})</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "companion" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("companion")}
            >
              <PlugIcon className={styles.tabIcon} />
              <span>{t("trainer.settings.tabCompanion", "In-Game Компаньон")}</span>
              <span className={isConnected ? styles.tabBadgeActive : styles.tabBadgeOffline} />
            </button>
          </div>
        </div>
      </DialogHeader>

      <DialogBody className={styles.body}>
        {activeTab === "keys" ? (
          <>
            <div ref={containerRef} className={styles.grid}>
              {ACTIONS.map((action) => {
                const isRecording = recordingAction === action.key
                const currentValue = draft[action.key] ?? DEFAULT_KEY_MAP[action.key] ?? ""
                return (
                  <div key={action.key} className={styles.actionRow}>
                    <div className={styles.actionMeta}>
                      <span className={styles.actionName}>
                        {t(action.labelKey, action.defaultLabel)}
                      </span>
                      <span className={styles.actionDesc}>{action.desc}</span>
                    </div>

                    <button
                      type="button"
                      tabIndex={0}
                      className={`${styles.keyButton} ${isRecording ? styles.recording : ""}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (Date.now() - justRecordedRef.current < 250) return
                        setRecordingAction((prev) => {
                          if (prev === action.key) return null
                          recordingStartTimeRef.current = Date.now()
                          return action.key
                        })
                      }}
                    >
                      {isRecording ? (
                        <span className={styles.pressKeyHint}>
                          {t("trainer.settings.pressKey", "Press any key...")}
                        </span>
                      ) : (
                        <span className={styles.keyBadge}>{formatKeyDisplay(currentValue, isRuLocale)}</span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            <div className={styles.companionQuickBar}>
              <div className={styles.companionStatusPill}>
                <span className={isConnected ? styles.dotActive : styles.dotOffline} />
                <span>
                  {isConnected
                    ? t("trainer.companionRunning", "In-game hook active (Windows)")
                    : t("trainer.companionNotRunning", "Companion offline")}
                </span>
              </div>
              <button
                type="button"
                className={styles.companionLinkBtn}
                onClick={() => setActiveTab("companion")}
              >
                {isConnected ? "Настройки компаньона →" : "Скачать .exe для игры →"}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.companionSection}>
            <div className={styles.companionHeader}>
              <div className={styles.companionTitleGroup}>
                <span className={styles.companionIcon}>
                  <PlugIcon className={styles.sectionIcon} size={22} />
                </span>
                <div>
                  <div className={styles.companionTitle}>
                    {t("trainer.companionSectionTitle", "In-Game Companion (Windows)")}
                  </div>
                  <div className={styles.companionDesc}>
                    {t(
                      "trainer.companionSectionDesc",
                      "To capture keys while playing Where Winds Meet, run the companion on your PC:",
                    )}
                  </div>
                </div>
              </div>
              <div
                className={`${styles.companionStatus} ${
                  isConnected ? styles.statusActive : styles.statusOffline
                }`}
              >
                <span className={styles.statusDot} />
                <span>
                  {isConnected
                    ? t("trainer.companionRunning", "Companion active (In-game hook ready)")
                    : t("trainer.companionNotRunning", "Companion offline")}
                </span>
              </div>
            </div>

            <div className={styles.downloadGroup}>
              <a
                href="/downloads/WWM-Companion.exe"
                download="WWM-Companion.exe"
                className={styles.downloadBtnPrimary}
              >
                <DownloadIcon className={styles.btnIcon} size={16} />
                <span>{t("trainer.downloadExe", "Download WWM-Companion.exe (9 MB, no Python needed)")}</span>
              </a>
              <div className={styles.downloadSubGroup}>
                <a
                  href="/downloads/WWM-Companion.zip"
                  download="WWM-Companion.zip"
                  className={styles.downloadBtnSecondary}
                >
                  <ArchiveIcon className={styles.btnIcon} />
                  <span>{t("trainer.downloadZip", "Download ZIP archive")}</span>
                </a>
                <a
                  href="/downloads/start-companion.bat"
                  download="start-companion.bat"
                  className={styles.downloadBtnSecondary}
                >
                  <DocumentIcon className={styles.btnIcon} />
                  <span>{t("trainer.downloadBat", "Download start-companion.bat")}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <div className={styles.footer}>
          <button type="button" className="btn" onClick={handleReset}>
            {t("common.reset", "Reset Defaults")}
          </button>
          <div className={styles.actionBtns}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                handleClosePopout()
                onClose()
              }}
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button type="button" className="btn primary" onClick={handleSave}>
              {t("common.save", "Save Changes")}
            </button>
          </div>
        </div>
      </DialogFooter>
    </div>
  )

  // If popped out to a separate window:
  if (popoutWindow && !popoutWindow.closed) {
    return (
      <>
        {/* Notice in the overlay */}
        <Dialog labelledBy="trainer-keymap-title" onClose={onClose} surfaceClassName={styles.surfaceCompact}>
          <div className={styles.poppedOutNotice}>
            <div className={styles.poppedOutIcon}>
              <PopoutIcon size={36} />
            </div>
            <p>{t("trainer.settings.poppedOutHint", "Настройки открыты в отдельном окне.")}</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="btn primary" onClick={handleClosePopout}>
                {t("trainer.settings.restoreInline", "Вернуть в оверлей")}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  handleClosePopout()
                  onClose()
                }}
              >
                {t("common.close", "Закрыть")}
              </button>
            </div>
          </div>
        </Dialog>

        {/* Portal rendered directly in the separate window */}
        {createPortal(dialogContent, popoutWindow.document.body)}
      </>
    )
  }

  return (
    <Dialog
      labelledBy="trainer-keymap-title"
      onClose={onClose}
      surfaceClassName={styles.surface}
      overlayClassName={styles.dialogOverlay}
    >
      {dialogContent}
    </Dialog>
  )
}
