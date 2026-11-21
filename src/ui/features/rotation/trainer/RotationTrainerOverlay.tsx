import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useI18n } from "../../../../i18n/i18nContext"
import type { RotationCast } from "../../../../engine/types"
import type { ParsedRotationToken } from "../readableRotation"
import { buildTrainerSteps, formatKeyDisplay, normalizeKeyInput } from "./keyResolution"
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
  const { t, locale } = useI18n()
  const isRuLocale = locale === "ru"
  const [settings, setSettings] = useState(() => loadTrainerSettings())
  const [stepIndex, setStepIndex] = useState(0)
  const [remainingCount, setRemainingCount] = useState(1)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [showRemap, setShowRemap] = useState(false)
  const [remapRecordedKey, setRemapRecordedKey] = useState<{ key: string; time: number } | null>(null)
  const prevWindowSizeRef = useRef<{ width: number; height: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const openRemapSettings = useCallback(() => {
    const currentWin = rootRef.current?.ownerDocument?.defaultView || window
    try {
      const currentW = currentWin.outerWidth || currentWin.innerWidth || 960
      const currentH = currentWin.outerHeight || currentWin.innerHeight || 320
      prevWindowSizeRef.current = { width: currentW, height: currentH }

      // Automatically expand window height if compact (< 500px) so settings fit cleanly
      if (currentH < 500 && typeof currentWin.resizeTo === "function") {
        const targetW = Math.max(currentW, 960)
        currentWin.resizeTo(targetW, 540)
      }
    } catch (err) {
      console.warn("Could not auto-expand trainer window", err)
    }
    setShowRemap(true)
  }, [])

  const closeRemapSettings = useCallback(() => {
    setShowRemap(false)
    setRemapRecordedKey(null)

    const currentWin = rootRef.current?.ownerDocument?.defaultView || window
    try {
      if (prevWindowSizeRef.current && typeof currentWin.resizeTo === "function") {
        const { width, height } = prevWindowSizeRef.current
        currentWin.resizeTo(width, height)
      }
    } catch (err) {
      console.warn("Could not restore trainer window size", err)
    }
  }, [])
  const [timingProgress, setTimingProgress] = useState(0)
  const [feedback, setFeedback] = useState<{
    text: string
    tone: "perfect" | "good" | "wrong" | "hit"
    id: number
  } | null>(null)

  const steps: TrainerStep[] = useMemo(
    () => buildTrainerSteps(tokens, settings.keyMap, casts, isRuLocale),
    [tokens, settings.keyMap, casts, isRuLocale],
  )

  const currentStep = steps[stepIndex] ?? steps[0]

  // Sync remainingCount when stepIndex changes
  useEffect(() => {
    if (currentStep) {
      setRemainingCount(currentStep.multiplier)
    }
  }, [stepIndex, currentStep])

  const lastPressTimeRef = useRef<Record<string, number>>({})
  const lastWrongTimeRef = useRef<{ key: string; time: number }>({ key: "", time: 0 })
  const lastHoldKeyRef = useRef<{ key: string; expiresAt: number }>({ key: "", expiresAt: 0 })
  const lastHitKeyRef = useRef<{ key: string; time: number }>({ key: "", time: 0 })

  const triggerFeedback = useCallback((text: string, tone: "perfect" | "good" | "wrong" | "hit") => {
    setFeedback({ text, tone, id: Date.now() })
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev))
    }, 700)
  }, [])

  const handleKeyHit = useCallback(
    (pressedKey: string) => {
      if (!isPlaying || !currentStep) return

      const expected = normalizeKeyInput(currentStep.expectedKey)
      const pressed = normalizeKeyInput(pressedKey)

      const isMatch =
        pressed === expected ||
        (expected === "lclick" && pressed === "lclick") ||
        (expected === "rclick" && pressed === "rclick") ||
        (expected === "mclick" && (pressed === "mclick" || pressed === "mouse3")) ||
        (expected === "mouse4" && (pressed === "mouse4" || pressed === "xbutton1")) ||
        (expected === "mouse5" && (pressed === "mouse5" || pressed === "xbutton2"))

      // 1. Rotation has not started yet -> wait for the FIRST skill!
      // Silently ignore any other keys (WASD, jumps, etc.) before the first skill is pressed.
      if (!hasStarted) {
        if (isMatch) {
          setHasStarted(true)
          setHits(1)
          setCombo(1)
          setMaxCombo((m) => Math.max(m, 1))
          triggerFeedback("START!", "perfect")
          if (settings.sound) playSynthTone(880, "triangle", 0.09) // A5
          lastHitKeyRef.current = { key: expected, time: Date.now() }
          setStepIndex(1)
          setTimingProgress(0)
        }
        return
      }

      // 2. Active rotation:
      if (isMatch) {
        // If this skill was a charge/hold attack, allow a 500ms grace window for releasing the key
        const skillLower = currentStep.cleanName.toLowerCase()
        if (
          skillLower.includes("charged") ||
          skillLower.includes("hold") ||
          skillLower.includes("heavy")
        ) {
          lastHoldKeyRef.current = { key: expected, expiresAt: Date.now() + 500 }
        }
        lastHitKeyRef.current = { key: expected, time: Date.now() }

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
          setStepIndex((idx) => {
            if (idx + 1 < steps.length) {
              return idx + 1
            }
            setHasStarted(false)
            return 0
          })
          setTimingProgress(0)
        }
      } else {
        // NON-MATCHING INPUT:
        // A. Movement and utility keys -> NEVER penalize or drop combo!
        const NON_COMBAT_KEYS = new Set([
          "w", "a", "s", "d", "shift", "space", "ctrl", "alt", "escape", "caps",
          "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
        ])
        if (NON_COMBAT_KEYS.has(pressed)) {
          return
        }

        const now = Date.now()

        // B. Extra/buffer press of the key that was just hit -> SILENTLY IGNORE (game buffers it)
        if (lastHitKeyRef.current.key === pressed && now - lastHitKeyRef.current.time < 500) {
          return
        }

        // C. Grace window for releasing hold key -> SILENTLY IGNORE
        if (lastHoldKeyRef.current.key === pressed && now < lastHoldKeyRef.current.expiresAt) {
          return
        }

        // D. In "strict" mode:
        // User requested: "не регай лишние импуты, в целом то кнопка нажата значит игра её запишет"
        // In Strict Order mode, extra key mashing or buffer inputs should NOT reduce accuracy or cause misses.
        if (settings.mode === "strict") {
          return
        }

        // E. In "timing" mode:
        if (lastWrongTimeRef.current.key === pressed && now - lastWrongTimeRef.current.time < 450) {
          return
        }
        lastWrongTimeRef.current = { key: pressed, time: now }

        setMisses((m) => m + 1)
        setCombo(0)
        triggerFeedback(`✕ ${formatKeyDisplay(pressed, isRuLocale)}`, "wrong")
        if (settings.sound) playSynthTone(220, "sawtooth", 0.12) // A3 buzz

        // NOTE: We do NOT advance stepIndex on wrong key!
      }
    },
    [isPlaying, hasStarted, currentStep, remainingCount, steps.length, settings.sound, settings.mode, isRuLocale, triggerFeedback],
  )

  // Listen to companion WebSocket events
  const handleCompanionInput = useCallback(
    (e: TrainerInputEvent) => {
      if (e.action !== "down") return

      const norm = normalizeKeyInput(e.key)
      if (!norm) return

      if (showRemap) {
        setRemapRecordedKey({ key: norm, time: Date.now() })
        return
      }

      const now = Date.now()
      const last = lastPressTimeRef.current[norm] || 0
      // Drop rapid OS repeats under 80ms
      if (now - last < 80) {
        return
      }
      lastPressTimeRef.current[norm] = now

      handleKeyHit(norm)
    },
    [handleKeyHit, showRemap],
  )

  const { isConnected, isAdmin } = useCompanionSocket({
    onInput: handleCompanionInput,
    enabled: true,
  })

  // Direct keyboard/mouse listeners inside the window (works in PiP & main window)
  useEffect(() => {
    function getButtonName(button: number): string {
      if (button === 2) return "rclick"
      if (button === 1) return "mclick"
      if (button === 3) return "mouse4"
      if (button === 4) return "mouse5"
      return "lclick"
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return
      const norm = normalizeKeyInput(e.key === " " ? "space" : e.key)
      if (!norm) return

      if (showRemap) {
        return
      }

      const now = Date.now()
      const last = lastPressTimeRef.current[norm] || 0
      if (now - last < 80) return
      lastPressTimeRef.current[norm] = now

      handleKeyHit(norm)
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button === 3 || e.button === 4) {
        e.preventDefault()
      }

      const btn = getButtonName(e.button)

      if (showRemap) {
        return
      }

      const now = Date.now()
      const last = lastPressTimeRef.current[btn] || 0
      if (now - last < 80) return
      lastPressTimeRef.current[btn] = now

      handleKeyHit(btn)
    }

    function onAuxClick(e: MouseEvent) {
      if (e.button === 3 || e.button === 4) {
        e.preventDefault()
      }
    }

    const doc = rootRef.current?.ownerDocument || document
    const win = doc.defaultView || window

    const targets: (EventTarget | null)[] = [doc, win, document, window]
    const cleanTargets = targets.filter((t, i, arr): t is EventTarget => Boolean(t) && arr.indexOf(t) === i)

    for (const target of cleanTargets) {
      target.addEventListener("keydown", onKeyDown as EventListener)
      target.addEventListener("mousedown", onMouseDown as EventListener)
      target.addEventListener("auxclick", onAuxClick as EventListener)
    }

    return () => {
      for (const target of cleanTargets) {
        target.removeEventListener("keydown", onKeyDown as EventListener)
        target.removeEventListener("mousedown", onMouseDown as EventListener)
        target.removeEventListener("auxclick", onAuxClick as EventListener)
      }
    }
  }, [handleKeyHit, showRemap])

  // Timing mode animation loop (only runs after rotation has started)
  useEffect(() => {
    if (!isPlaying || !hasStarted || settings.mode !== "timing" || steps.length === 0) return

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
  }, [isPlaying, hasStarted, settings.mode, settings.speed, settings.sound, steps.length, triggerFeedback])

  function resetTrainer() {
    setHasStarted(false)
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
    for (let r = -1; r <= 14; r++) {
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
    <div ref={rootRef} className={styles.overlayRoot}>
      {/* Top Header Bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div
            className={`${styles.companionBadge} ${
              !isConnected ? styles.offline : isAdmin === false ? styles.warning : styles.connected
            }`}
            title={
              !isConnected
                ? t(
                    "trainer.companionOffline",
                    "Companion offline: Run WWM-Companion.exe or start-companion.bat for in-game capture.",
                  )
                : isAdmin === false
                  ? t(
                      "trainer.companionNoAdmin",
                      "Companion running without Administrator rights: Windows UIPI blocks input from elevated game windows. Run WWM-Companion as Administrator!",
                    )
                  : t("trainer.companionConnected", "Companion connected: Global game input active!")
            }
          >
            <span className={styles.dot} />
            <span className={styles.badgeText}>
              {!isConnected
                ? t("trainer.companionOfflineShort", "LOCAL COMPANION OFF")
                : isAdmin === false
                  ? t("trainer.companionNoAdminShort", "NEED ADMIN")
                  : t("trainer.inGameHook", "IN-GAME HOOK")}
            </span>
          </div>

          {!isConnected && (
            <a
              href="/downloads/WWM-Companion.exe"
              download="WWM-Companion.exe"
              className={styles.companionDownloadCta}
              title={t(
                "trainer.downloadExeTooltip",
                "Download WWM-Companion.exe to track keys in-game",
              )}
            >
              📥 {t("trainer.downloadExeShort", "Download .exe")}
            </a>
          )}

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
            onClick={openRemapSettings}
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
                {isTarget && !hasStarted && (
                  <span className={styles.startBadge}>{isRuLocale ? "СТАРТ" : "START"}</span>
                )}
                {isTarget && hasStarted && remainingCount > 1 && (
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
          onClose={closeRemapSettings}
          isConnected={isConnected}
          recordedKey={remapRecordedKey}
        />
      )}
    </div>
  )
}
