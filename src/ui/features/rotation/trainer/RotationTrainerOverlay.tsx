import { useCallback, useEffect, useMemo, useState } from "react"
import { useI18n } from "../../../../i18n/i18nContext"
import type { RotationCast } from "../../../../engine/types"
import type { ParsedRotationToken } from "../readableRotation"
import { buildTrainerSteps, formatKeyDisplay } from "./keyResolution"
import { KeyRemapDialog } from "./KeyRemapDialog"
import {
  loadTrainerSettings,
  saveTrainerSettings,
} from "./trainerStorage"
import type { TrainerInputEvent, TrainerKeyMap, TrainerMode, TrainerStep } from "./types"
import { useCompanionSocket } from "./useCompanionSocket"
import styles from "./RotationTrainerOverlay.module.scss"

interface Props {
  tokens: ParsedRotationToken[]
  casts?: RotationCast[]
  rotationTitle?: string
  onClose?: () => void
}

function playSynthTone(freq: number, type: OscillatorType = "sine", duration = 0.08) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Audio unavailable or blocked
  }
}

export function RotationTrainerOverlay({ tokens, casts, rotationTitle, onClose }: Props) {
  const { t } = useI18n()
  const [settings, setSettings] = useState(() => loadTrainerSettings())
  const [stepIndex, setStepIndex] = useState(0)
  const [remainingCount, setRemainingCount] = useState(1)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showRemap, setShowRemap] = useState(false)
  const [timingProgress, setTimingProgress] = useState(0)
  const [feedback, setFeedback] = useState<{
    text: string
    tone: "perfect" | "good" | "wrong" | "hit"
    id: number
  } | null>(null)

  const steps: TrainerStep[] = useMemo(
    () => buildTrainerSteps(tokens, settings.keyMap, casts),
    [tokens, settings.keyMap, casts],
  )

  const currentStep = steps[stepIndex] ?? steps[0]

  // Sync remainingCount when stepIndex changes
  useEffect(() => {
    if (currentStep) {
      setRemainingCount(currentStep.multiplier)
    }
  }, [stepIndex, currentStep])

  const triggerFeedback = useCallback((text: string, tone: "perfect" | "good" | "wrong" | "hit") => {
    setFeedback({ text, tone, id: Date.now() })
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev))
    }, 700)
  }, [])

  const handleKeyHit = useCallback(
    (pressedKey: string) => {
      if (!isPlaying || !currentStep) return

      const expected = currentStep.expectedKey.toLowerCase()
      const pressed = pressedKey.toLowerCase()

      const isMatch =
        pressed === expected ||
        (expected === "~" && (pressed === "`" || pressed === "ё")) ||
        (expected === "lclick" && pressed === "lclick") ||
        (expected === "rclick" && pressed === "rclick")

      if (isMatch) {
        // Success
        if (remainingCount > 1) {
          setRemainingCount((prev) => prev - 1)
          triggerFeedback(`${remainingCount - 1} left`, "hit")
          if (settings.sound) playSynthTone(587.33, "sine", 0.05) // D5
        } else {
          setHits((h) => h + 1)
          setCombo((c) => {
            const next = c + 1
            setMaxCombo((m) => Math.max(m, next))
            return next
          })
          triggerFeedback("PERFECT", "perfect")
          if (settings.sound) playSynthTone(880, "triangle", 0.09) // A5

          // Advance step
          setStepIndex((idx) => (idx + 1 < steps.length ? idx + 1 : 0))
          setTimingProgress(0)
        }
      } else {
        // Wrong key
        setMisses((m) => m + 1)
        setCombo(0)
        triggerFeedback(`✕ ${formatKeyDisplay(pressed)}`, "wrong")
        if (settings.sound) playSynthTone(220, "sawtooth", 0.12) // A3 buzz

        // In timing mode, wrong key also pushes forward or penalizes
        if (settings.mode === "timing") {
          setStepIndex((idx) => (idx + 1 < steps.length ? idx + 1 : 0))
          setTimingProgress(0)
        }
      }
    },
    [isPlaying, currentStep, remainingCount, steps.length, settings.sound, settings.mode, triggerFeedback],
  )

  // Listen to companion WebSocket events
  const handleCompanionInput = useCallback(
    (e: TrainerInputEvent) => {
      if (e.action === "down") {
        handleKeyHit(e.key)
      }
    },
    [handleKeyHit],
  )

  const { isConnected } = useCompanionSocket({
    onInput: handleCompanionInput,
    enabled: true,
  })

  // Direct keyboard/mouse listeners inside the window (works when window has focus)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (showRemap) return
      let key = e.key.toLowerCase()
      if (key === "`" || key === "~" || key === "ё") key = "~"
      if (key === " ") key = "space"
      handleKeyHit(key)
    }

    function onMouseDown(e: MouseEvent) {
      if (showRemap) return
      let btn = "lclick"
      if (e.button === 2) btn = "rclick"
      else if (e.button === 1) btn = "mclick"
      handleKeyHit(btn)
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("mousedown", onMouseDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("mousedown", onMouseDown)
    }
  }, [handleKeyHit, showRemap])

  // Timing mode animation loop
  useEffect(() => {
    if (!isPlaying || settings.mode !== "timing" || steps.length === 0) return

    const stepDurationMs = 1200 / settings.speed
    const interval = 30
    const stepIncrement = (interval / stepDurationMs) * 100

    const timer = setInterval(() => {
      setTimingProgress((prev) => {
        const next = prev + stepIncrement
        if (next >= 100) {
          // Missed timing window!
          setMisses((m) => m + 1)
          setCombo(0)
          triggerFeedback("MISS", "wrong")
          if (settings.sound) playSynthTone(180, "sawtooth", 0.1)
          setStepIndex((idx) => (idx + 1 < steps.length ? idx + 1 : 0))
          return 0
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isPlaying, settings.mode, settings.speed, settings.sound, steps.length, triggerFeedback])

  function resetTrainer() {
    setStepIndex(0)
    setCombo(0)
    setHits(0)
    setMisses(0)
    setTimingProgress(0)
    setFeedback(null)
    if (steps[0]) setRemainingCount(steps[0].multiplier)
  }

  function handleModeChange(mode: TrainerMode) {
    const next = { ...settings, mode }
    setSettings(next)
    saveTrainerSettings(next)
    setTimingProgress(0)
  }

  function handleSpeedChange(speed: number) {
    const next = { ...settings, speed }
    setSettings(next)
    saveTrainerSettings(next)
  }

  function handleKeyMapChange(keyMap: TrainerKeyMap) {
    const next = { ...settings, keyMap }
    setSettings(next)
    saveTrainerSettings(next)
  }

  const totalActions = hits + misses
  const accuracy = totalActions > 0 ? Math.round((hits / totalActions) * 100) : 100

  // Window view range of upcoming skills (e.g. -1, 0, +1, +2, +3)
  const visibleSteps = useMemo(() => {
    if (!steps.length) return []
    const list: Array<{ step: TrainerStep; relativeIdx: number; realIdx: number }> = []
    for (let r = -1; r <= 3; r++) {
      const idx = stepIndex + r
      if (idx >= 0 && idx < steps.length) {
        list.push({ step: steps[idx], relativeIdx: r, realIdx: idx })
      }
    }
    return list
  }, [steps, stepIndex])

  if (!steps.length) {
    return (
      <div className={styles.emptyContainer}>
        <p>{t("rotation.empty", "No rotation sequence available.")}</p>
      </div>
    )
  }

  return (
    <div className={styles.overlayRoot}>
      {/* Top Header Bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div
            className={`${styles.companionBadge} ${isConnected ? styles.connected : styles.offline}`}
            title={
              isConnected
                ? t("trainer.companionConnected", "Companion connected: Global game input active!")
                : t(
                    "trainer.companionOffline",
                    "Companion offline: Run start-companion.bat for in-game capture, or focus window.",
                  )
            }
          >
            <span className={styles.dot} />
            <span className={styles.badgeText}>
              {isConnected
                ? t("trainer.inGameHook", "IN-GAME HOOK")
                : t("trainer.companionOfflineShort", "LOCAL COMPANION OFF")}
            </span>
          </div>

          <span className={styles.rotationTitle}>
            {rotationTitle ?? t("common.rotation", "Rotation")}
          </span>
        </div>

        <div className={styles.headerControls}>
          {/* Mode Switcher */}
          <div className={styles.modeGroup}>
            <button
              type="button"
              className={`${styles.modeBtn} ${settings.mode === "strict" ? styles.modeActive : ""}`}
              onClick={() => handleModeChange("strict")}
              title={t("trainer.strictDesc", "Strict Order: Waits for correct button to advance")}
            >
              🎯 {t("trainer.strict", "Strict")}
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${settings.mode === "timing" ? styles.modeActive : ""}`}
              onClick={() => handleModeChange("timing")}
              title={t("trainer.timingDesc", "Timing Window: Cast rhythm with prompter")}
            >
              ⏱ {t("trainer.timing", "Timing")}
            </button>
          </div>

          {/* Speed Selector */}
          <div className={styles.speedGroup}>
            {[0.5, 0.75, 1.0].map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.speedBtn} ${settings.speed === s ? styles.speedActive : ""}`}
                onClick={() => handleSpeedChange(s)}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Settings & Reset */}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setShowRemap(true)}
            title={t("trainer.remapTitle", "Key Remap & Settings")}
          >
            ⚙
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={resetTrainer}
            title={t("common.reset", "Reset")}
          >
            ↺
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setIsPlaying((p) => !p)}
            title={isPlaying ? t("common.pause", "Pause") : t("common.play", "Play")}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          {onClose && (
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              title={t("common.close", "Close")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Prompter Track */}
      <div className={styles.trackContainer}>
        {visibleSteps.map(({ step, relativeIdx }) => {
          const isTarget = relativeIdx === 0
          return (
            <div
              key={`${step.id}-${relativeIdx}`}
              className={`${styles.skillCard} ${isTarget ? styles.targetCard : styles.queueCard} ${
                relativeIdx < 0 ? styles.pastCard : ""
              }`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.skillName}>{step.cleanName}</span>
                {isTarget && remainingCount > 1 && (
                  <span className={styles.counterBadge}>×{remainingCount}</span>
                )}
                {!isTarget && step.multiplier > 1 && (
                  <span className={styles.multiplierBadge}>×{step.multiplier}</span>
                )}
              </div>

              <div className={styles.keyPrompt}>
                <span className={styles.keyTag}>{step.expectedKeyLabel}</span>
              </div>

              {isTarget && settings.mode === "timing" && (
                <div className={styles.timingBarTrack}>
                  <div className={styles.timingBarFill} style={{ width: `${timingProgress}%` }} />
                </div>
              )}
            </div>
          )
        })}

        {/* Transient Hit Feedback Badge */}
        {feedback && (
          <div className={`${styles.feedbackToast} ${styles[feedback.tone]}`}>
            {feedback.text}
          </div>
        )}
      </div>

      {/* Footer Stats Bar */}
      <div className={styles.footer}>
        <div className={styles.statsLeft}>
          <span className={styles.comboStat}>
            🔥 {combo} <small>COMBO</small> {maxCombo > 0 && <small>({maxCombo} max)</small>}
          </span>
          <span className={styles.accStat}>
            🎯 {accuracy}% <small>ACC</small>
          </span>
        </div>

        <div className={styles.statsRight}>
          <span className={styles.progressStat}>
            {stepIndex + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Key Remapping Modal */}
      {showRemap && (
        <KeyRemapDialog
          keyMap={settings.keyMap}
          onChange={handleKeyMapChange}
          onClose={() => setShowRemap(false)}
        />
      )}
    </div>
  )
}
