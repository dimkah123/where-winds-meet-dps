import { useEffect, useState } from "react"
import { useI18n } from "../../../../i18n/i18nContext"
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../../components/dialog/Dialog"
import { DEFAULT_KEY_MAP } from "./trainerStorage"
import { formatKeyDisplay, normalizeKeyInput } from "./keyResolution"
import type { TrainerKeyMap } from "./types"
import styles from "./KeyRemapDialog.module.scss"

interface Props {
  keyMap: TrainerKeyMap
  onChange: (next: TrainerKeyMap) => void
  onClose: () => void
  isConnected?: boolean
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
    defaultLabel: "Dual Weapon Attack (Wheel / MMB)",
    desc: "Heng Dual, Mo Dual (Парное оружие / Колесико)",
  },
  {
    key: "swap",
    labelKey: "trainer.keys.swap",
    defaultLabel: "Weapon Swap (Tab)",
    desc: "Weapon swap without attack",
  },
  {
    key: "light",
    labelKey: "trainer.keys.light",
    defaultLabel: "Light Attack (LClick)",
    desc: "LC, Basic attack combos",
  },
  {
    key: "varied",
    labelKey: "trainer.keys.varied",
    defaultLabel: "Varied Combo (E)",
    desc: "Heng VC, Mo VC",
  },
  {
    key: "mystic",
    labelKey: "trainer.keys.mystic",
    defaultLabel: "Mystic / Flute (F)",
    desc: "Flute Cancel, Bursting Nine",
  },
  {
    key: "dodge",
    labelKey: "trainer.keys.dodge",
    defaultLabel: "Dodge / Roll (Shift)",
    desc: "Slide, Dash, Evade",
  },
]

export function KeyRemapDialog({ keyMap, onChange, onClose, isConnected = false }: Props) {
  const { t, locale } = useI18n()
  const isRuLocale = locale === "ru"
  const [draft, setDraft] = useState<TrainerKeyMap>({ ...keyMap })
  const [recordingAction, setRecordingAction] = useState<KeyAction | null>(null)

  useEffect(() => {
    if (!recordingAction) return

    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === "Escape") {
        setRecordingAction(null)
        return
      }

      let keyName = e.key.toLowerCase()
      keyName = normalizeKeyInput(keyName)
      if (keyName === " ") keyName = "space"

      setDraft((prev) => ({ ...prev, [recordingAction!]: keyName }))
      setRecordingAction(null)
    }

    function handleMouseDown(e: MouseEvent) {
      e.preventDefault()
      e.stopPropagation()
      let btn = "lclick"
      if (e.button === 2) btn = "rclick"
      else if (e.button === 1) btn = "mclick"

      setDraft((prev) => ({ ...prev, [recordingAction!]: btn }))
      setRecordingAction(null)
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true })
    window.addEventListener("mousedown", handleMouseDown, { capture: true })
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true })
      window.removeEventListener("mousedown", handleMouseDown, { capture: true })
    }
  }, [recordingAction])

  function handleSave() {
    onChange(draft)
    onClose()
  }

  function handleReset() {
    setDraft({ ...DEFAULT_KEY_MAP })
  }

  return (
    <Dialog labelledBy="trainer-keymap-title" onClose={onClose} surfaceClassName={styles.surface}>
      <DialogHeader>
        <div className={styles.header}>
          <h2 id="trainer-keymap-title" className={styles.title}>
            ⚙ {t("trainer.settings.title", "Trainer Keybindings & Remap")}
          </h2>
          <p className={styles.subtitle}>
            {t(
              "trainer.settings.subtitle",
              "Click on any action to record your in-game key (supports keyboard and mouse).",
            )}
          </p>
        </div>
      </DialogHeader>

      <DialogBody className={styles.body}>
        <div className={styles.grid}>
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
                  className={`${styles.keyButton} ${isRecording ? styles.recording : ""}`}
                  onClick={() => setRecordingAction(action.key)}
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

        <div className={styles.companionSection}>
          <div className={styles.companionHeader}>
            <div className={styles.companionTitleGroup}>
              <span className={styles.companionIcon}>🔌</span>
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
              📥 {t("trainer.downloadExe", "Download WWM-Companion.exe (9 MB, no Python needed)")}
            </a>
            <div className={styles.downloadSubGroup}>
              <a
                href="/downloads/WWM-Companion.zip"
                download="WWM-Companion.zip"
                className={styles.downloadBtnSecondary}
              >
                📦 {t("trainer.downloadZip", "Download ZIP archive")}
              </a>
              <a
                href="/downloads/start-companion.bat"
                download="start-companion.bat"
                className={styles.downloadBtnSecondary}
              >
                📄 {t("trainer.downloadBat", "Download start-companion.bat")}
              </a>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <div className={styles.footer}>
          <button type="button" className="btn" onClick={handleReset}>
            {t("common.reset", "Reset Defaults")}
          </button>
          <div className={styles.actionBtns}>
            <button type="button" className="btn" onClick={onClose}>
              {t("common.cancel", "Cancel")}
            </button>
            <button type="button" className="btn primary" onClick={handleSave}>
              {t("common.save", "Save Changes")}
            </button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
