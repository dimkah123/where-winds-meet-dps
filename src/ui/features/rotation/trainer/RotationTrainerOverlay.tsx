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
import {
  CloseIcon,
  DownloadIcon,
  FlameIcon,
  GearIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  StopwatchIcon,
  TargetIcon,
} from "./TrainerIcons"
import { playSwitchSound } from "./trainerAudio"
import { getSavedPipDimensions } from "./useDocumentPictureInPicture"
import type { TrainerInputEvent, TrainerKeyMap, TrainerMode, TrainerStep } from "./types"
import { useCompanionSocket } from "./useCompanionSocket"
import styles from "./RotationTrainerOverlay.module.scss"

interface Props {
  tokens: ParsedRotationToken[]
  casts?: RotationCast[]
  rotationTitle?: string
  onClose?: () => void
}

export function RotationTrainerOverlay({ tokens, casts, rotationTitle, onClose }: Props) {
  const { t, locale } = useI18n()
  const isRuLocale = locale === "ru"
  const [settings, setSettings] = useState(() => loadTrainerSettings())
  const [stepIndex, setStepIndex] = useState(0)
  const stepIndexRef = useRef(0)
  stepIndexRef.current = stepIndex

  const [remainingCount, setRemainingCount] = useState(1)
  const remainingCountRef = useRef(1)
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

  // Ensure sleek compact height on mount in floating PiP / popup overlay
  useEffect(() => {
    const currentWin = rootRef.current?.ownerDocument?.defaultView
    if (!currentWin || currentWin === window) return
    try {
      const curH = currentWin.innerHeight || currentWin.outerHeight
      const curW = currentWin.innerWidth || currentWin.outerWidth
      const savedDims = getSavedPipDimensions()
      // If window was left oversized (e.g. from previous sessions or settings dialog), shrink to compact height & width
      if ((curH > 220 || curW > 880) && typeof currentWin.resizeTo === "function") {
        currentWin.resizeTo(savedDims.width, savedDims.height)
      }
    } catch {}
  }, [])

  const openRemapSettings = useCallback(() => {
    const currentWin = rootRef.current?.ownerDocument?.defaultView || window
    try {
      const currentW = currentWin.outerWidth || currentWin.innerWidth || 760
      const currentH = currentWin.outerHeight || currentWin.innerHeight || 165
      prevWindowSizeRef.current = { width: currentW, height: currentH }

      // Automatically expand window height if compact (< 500px) so settings fit cleanly
      if (currentH < 500 && typeof currentWin.resizeTo === "function") {
        const targetW = Math.max(currentW, 880)
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
      if (typeof currentWin.resizeTo === "function") {
        const savedDims = getSavedPipDimensions()
        currentWin.resizeTo(savedDims.width, savedDims.height)
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

  // Real Cast Time & Cooldown State from Actual database
  const [castStartTime, setCastStartTime] = useState<number>(0)
  const [castDurationMs, setCastDurationMs] = useState<number>(0)
  const [isCasting, setIsCasting] = useState<boolean>(false)
  const [castProgress, setCastProgress] = useState<number>(0)
  const [activeCooldowns, setActiveCooldowns] = useState<Record<string, number>>({})
  const bufferedInputRef = useRef<{ key: string; time: number } | null>(null)
  const [clockTick, setClockTick] = useState<number>(() => Date.now())

  const steps: TrainerStep[] = useMemo(
    () => buildTrainerSteps(tokens, settings.keyMap, casts, isRuLocale),
    [tokens, settings.keyMap, casts, isRuLocale],
  )

  const currentStep = steps[stepIndex] ?? steps[0]

  // Sync remainingCount when steps change
  useEffect(() => {
    const step = steps[stepIndexRef.current] ?? steps[0]
    if (step) {
      const count = step.remainingCount ?? step.multiplier ?? 1
      remainingCountRef.current = count
      setRemainingCount(count)
    }
  }, [steps])

  const lastPressTimeRef = useRef<Record<string, number>>({})
  const lastWrongTimeRef = useRef<{ key: string; time: number }>({ key: "", time: 0 })
  const lastHoldKeyRef = useRef<{ key: string; expiresAt: number }>({ key: "", expiresAt: 0 })
  const lastHitKeyRef = useRef<{ key: string; time: number }>({ key: "", time: 0 })
  const altHeldRef = useRef(false)

  const triggerFeedback = useCallback((text: string, tone: "perfect" | "good" | "wrong" | "hit") => {
    setFeedback({ text, tone, id: Date.now() })
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev))
    }, 700)
  }, [])

  const startSkillCast = useCallback(
    (step: TrainerStep) => {
      const now = Date.now()
      if (step.durationSec > 0) {
        const durMs = Math.max(100, (step.durationSec * 1000) / settings.speed)
        setCastStartTime(now)
        setCastDurationMs(durMs)
        setIsCasting(true)
        setCastProgress(0)
      } else {
        setIsCasting(false)
        setCastDurationMs(0)
        setCastProgress(0)
      }

      // Put skill on cooldown if it has one
      if (step.cooldownSec && step.cooldownGroup) {
        const cdDurationMs = (step.cooldownSec * 1000) / settings.speed
        setActiveCooldowns((prev) => ({
          ...prev,
          [step.cooldownGroup!]: now + cdDurationMs,
        }))
      }
    },
    [settings.speed],
  )

  const resetTrainer = useCallback(() => {
    setHasStarted(false)
    stepIndexRef.current = 0
    setStepIndex(0)
    setCombo(0)
    setHits(0)
    setMisses(0)
    setTimingProgress(0)
    setFeedback(null)
    setIsCasting(false)
    setCastProgress(0)
    setCastStartTime(0)
    setActiveCooldowns({})
    bufferedInputRef.current = null
    triggerFeedback(t("trainer.feedback.reset", isRuLocale ? "СБРОС" : "RESET"), "perfect")
    if (settings.sound) playSwitchSound("reset")
    const firstCount = steps[0]?.remainingCount ?? steps[0]?.multiplier ?? 1
    remainingCountRef.current = firstCount
    setRemainingCount(firstCount)
  }, [settings.sound, steps, triggerFeedback, t, isRuLocale])

  const handleKeyHit = useCallback(
    (pressedKey: string, fromBuffer = false) => {
      if (!isPlaying || !currentStep) return

      if (pressedKey.toLowerCase() === "f5") {
        resetTrainer()
        return
      }

      const expected = normalizeKeyInput(currentStep.expectedKey)
      const pressed = normalizeKeyInput(pressedKey)

      const isMatch =
        pressed === expected ||
        (expected === "lclick" && pressed === "lclick") ||
        (expected === "rclick" && pressed === "rclick") ||
        (expected === "wheeldown" &&
          (pressed === "wheeldown" ||
            pressed === "wheelup" ||
            pressed === "wheel" ||
            pressed === "mclick" ||
            pressed === "mouse3")) ||
        (expected === "wheelup" &&
          (pressed === "wheelup" ||
            pressed === "wheeldown" ||
            pressed === "wheel" ||
            pressed === "mclick" ||
            pressed === "mouse3")) ||
        (expected === "mclick" &&
          (pressed === "mclick" ||
            pressed === "mouse3" ||
            pressed === "wheeldown" ||
            pressed === "wheelup" ||
            pressed === "wheel")) ||
        (expected === "mouse4" && (pressed === "mouse4" || pressed === "xbutton1")) ||
        (expected === "mouse5" && (pressed === "mouse5" || pressed === "xbutton2"))

      // 1. Rotation has not started yet -> wait for the FIRST skill!
      // Silently ignore any other keys (WASD, jumps, etc.) before the first skill is pressed.
      if (!hasStarted) {
        if (isMatch) {
          startSkillCast(currentStep)
          setHasStarted(true)
          setHits(1)
          setCombo(1)
          setMaxCombo((m) => Math.max(m, 1))
          triggerFeedback(t("trainer.feedback.start", isRuLocale ? "СТАРТ!" : "START!"), "perfect")
          if (settings.sound) playSwitchSound("start")
          lastHitKeyRef.current = { key: expected, time: Date.now() }
          const nextStep = steps[1]
          const nextCount = nextStep?.remainingCount ?? nextStep?.multiplier ?? 1
          remainingCountRef.current = nextCount
          setRemainingCount(nextCount)
          stepIndexRef.current = 1
          setStepIndex(1)
          setTimingProgress(0)
        }
        return
      }

      // 2. Active rotation:
      // Account for Cast Time: check if previous skill is currently casting
      const now = Date.now()
      const elapsed = now - castStartTime
      const remainingCastMs = castDurationMs - elapsed

      // Only buffer when transitioning from a previous casting skill to a new one.
      // For multi-hit repetitions of the CURRENT skill (e.g. Mo Charged x4), every hit registers immediately!
      const isMultiHitRepetition = remainingCountRef.current > 1

      if (!fromBuffer && isCasting && remainingCastMs > 350 && !isMultiHitRepetition) {
        if (isMatch) {
          // User pressed the correct next key, but the character is still mid-cast!
          // Buffer it so it fires right when the cancel window opens!
          bufferedInputRef.current = { key: pressedKey, time: now }
          triggerFeedback(t("trainer.feedback.casting", isRuLocale ? "⌛ КАСТ..." : "⌛ CASTING..."), "hit")
          return
        }
      }

      if (isMatch) {
        bufferedInputRef.current = null

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

        // Start cast timer & cooldown for the newly executed skill
        startSkillCast(currentStep)

        // Success: check synchronous remaining count
        if (remainingCountRef.current > 1) {
          remainingCountRef.current -= 1
          const left = remainingCountRef.current
          setRemainingCount(left)
          triggerFeedback(`${left} ${t("trainer.feedback.left", isRuLocale ? "ост." : "left")}`, "hit")
          if (settings.sound) playSwitchSound("subhit")
        } else {
          setHits((h) => h + 1)
          setCombo((c) => {
            const next = c + 1
            setMaxCombo((m) => Math.max(m, next))
            return next
          })
          triggerFeedback(t("trainer.feedback.perfect", isRuLocale ? "ОТЛИЧНО" : "PERFECT"), "perfect")
          if (settings.sound) playSwitchSound("perfect")

          // Advance step synchronously
          const currentIdx = stepIndexRef.current
          const nextIdx = currentIdx + 1
          if (nextIdx < steps.length) {
            const nextStep = steps[nextIdx]
            const nextCount = nextStep?.remainingCount ?? nextStep?.multiplier ?? 1
            remainingCountRef.current = nextCount
            setRemainingCount(nextCount)
            stepIndexRef.current = nextIdx
            setStepIndex(nextIdx)
          } else {
            setHasStarted(false)
            const firstCount = steps[0]?.remainingCount ?? steps[0]?.multiplier ?? 1
            remainingCountRef.current = firstCount
            setRemainingCount(firstCount)
            stepIndexRef.current = 0
            setStepIndex(0)
          }
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

        // B. Extra/buffer press of the key that was just hit -> SILENTLY IGNORE (game buffers it)
        if (lastHitKeyRef.current.key === pressed && now - lastHitKeyRef.current.time < 500) {
          return
        }

        // C. Grace window for releasing hold key -> SILENTLY IGNORE
        if (lastHoldKeyRef.current.key === pressed && now < lastHoldKeyRef.current.expiresAt) {
          return
        }

        // D. In "strict" mode:
        // Extra key mashing or buffer inputs should NOT reduce accuracy or cause misses.
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
        if (settings.sound) playSwitchSound("miss")

        // NOTE: We do NOT advance stepIndex on wrong key!
      }
    },
    [
      isPlaying,
      hasStarted,
      currentStep,
      remainingCount,
      steps.length,
      settings.sound,
      settings.mode,
      settings.speed,
      isRuLocale,
      triggerFeedback,
      isCasting,
      castDurationMs,
      castStartTime,
      startSkillCast,
      t,
    ],
  )

  // Live ticker for cast progress, cooldown countdowns, and buffered input release
  useEffect(() => {
    if (!isPlaying || !hasStarted) {
      if (isCasting) {
        setIsCasting(false)
        setCastProgress(0)
      }
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      setClockTick(now)

      if (isCasting && castDurationMs > 0) {
        const elapsed = now - castStartTime
        const pct = Math.min(100, (elapsed / castDurationMs) * 100)
        setCastProgress(pct)

        const remainingMs = castDurationMs - elapsed
        if (remainingMs <= 0) {
          setIsCasting(false)
          setCastProgress(100)

          if (bufferedInputRef.current && now - bufferedInputRef.current.time < 1200) {
            const bufferedKey = bufferedInputRef.current.key
            bufferedInputRef.current = null
            handleKeyHit(bufferedKey, true)
          }
        } else if (remainingMs <= 350 && bufferedInputRef.current && now - bufferedInputRef.current.time < 1200) {
          setIsCasting(false)
          setCastProgress(100)
          const bufferedKey = bufferedInputRef.current.key
          bufferedInputRef.current = null
          handleKeyHit(bufferedKey, true)
        }
      }
    }, 25)

    return () => clearInterval(interval)
  }, [isPlaying, hasStarted, isCasting, castDurationMs, castStartTime, handleKeyHit])

  // Listen to companion WebSocket events
  const handleCompanionInput = useCallback(
    (e: TrainerInputEvent) => {
      if (e.key === "alt") {
        altHeldRef.current = e.action === "down"
        return
      }

      if (e.action !== "down") return

      // F5 or Alt+R hotkey to reset combo to beginning
      if (
        e.key.toLowerCase() === "f5" ||
        e.key === "alt+r" ||
        e.key === "reset" ||
        ((e.key === "r" || e.key === "к") && altHeldRef.current)
      ) {
        if (!showRemap) {
          resetTrainer()
          return
        }
      }

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
    [handleKeyHit, resetTrainer, showRemap],
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

      // F5 to reset combo (matches in-game trial reset prompt, prevent browser refresh)
      if (e.key === "F5" || e.code === "F5") {
        e.preventDefault()
        if (!showRemap) {
          resetTrainer()
          return
        }
      }

      // Alt+R hotkey to reset combo to beginning
      if (
        !showRemap &&
        e.altKey &&
        (e.code === "KeyR" || e.key.toLowerCase() === "r" || e.key.toLowerCase() === "к")
      ) {
        e.preventDefault()
        resetTrainer()
        return
      }

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

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const direction = e.deltaY > 0 ? "wheeldown" : "wheelup"
      if (showRemap) {
        setRemapRecordedKey({ key: direction, time: Date.now() })
        return
      }
      const now = Date.now()
      const last = lastPressTimeRef.current[direction] || 0
      if (now - last < 80) return
      lastPressTimeRef.current[direction] = now

      handleKeyHit(direction)
    }

    const doc = rootRef.current?.ownerDocument || document
    const win = doc.defaultView || window

    const targets: (EventTarget | null)[] = [doc, win, document, window]
    const cleanTargets = targets.filter((t, i, arr): t is EventTarget => Boolean(t) && arr.indexOf(t) === i)

    for (const target of cleanTargets) {
      target.addEventListener("keydown", onKeyDown as EventListener)
      target.addEventListener("mousedown", onMouseDown as EventListener)
      target.addEventListener("auxclick", onAuxClick as EventListener)
      target.addEventListener("wheel", onWheel as EventListener, { passive: false })
    }

    return () => {
      for (const target of cleanTargets) {
        target.removeEventListener("keydown", onKeyDown as EventListener)
        target.removeEventListener("mousedown", onMouseDown as EventListener)
        target.removeEventListener("auxclick", onAuxClick as EventListener)
        target.removeEventListener("wheel", onWheel as EventListener)
      }
    }
  }, [handleKeyHit, showRemap])

  // Timing mode animation loop (uses actual step cast time)
  useEffect(() => {
    if (!isPlaying || !hasStarted || settings.mode !== "timing" || steps.length === 0 || !currentStep) return

    const stepDurationMs = Math.max(250, (currentStep.durationSec * 1000) / settings.speed)
    const interval = 25
    const stepIncrement = (interval / stepDurationMs) * 100

    const timer = setInterval(() => {
      setTimingProgress((prev) => {
        const next = prev + stepIncrement
        if (next >= 100) {
          // Missed timing window!
          setMisses((m) => m + 1)
          setCombo(0)
          triggerFeedback(t("trainer.feedback.miss", isRuLocale ? "ПРОМАХ" : "MISS"), "wrong")
          if (settings.sound) playSwitchSound("miss")
          setStepIndex((idx) => {
            const nextIdx = idx + 1 < steps.length ? idx + 1 : 0
            stepIndexRef.current = nextIdx
            const count = steps[nextIdx]?.remainingCount ?? steps[nextIdx]?.multiplier ?? 1
            remainingCountRef.current = count
            setRemainingCount(count)
            return nextIdx
          })
          return 0
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isPlaying, hasStarted, settings.mode, settings.speed, settings.sound, steps.length, currentStep, triggerFeedback, t, isRuLocale])

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
              href="/downloads/WWM-Companion.exe?v=1.3.5"
              download="WWM-Companion.exe"
              className={styles.companionDownloadCta}
              title={t(
                "trainer.downloadExeTooltip",
                "Download WWM-Companion.exe to track keys in-game",
              )}
            >
              <DownloadIcon className={styles.btnIcon} />
              <span>{t("trainer.downloadExeShort", "Download .exe")}</span>
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
              <TargetIcon className={styles.btnIcon} />
              <span>{t("trainer.strict", "Strict")}</span>
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${settings.mode === "timing" ? styles.modeActive : ""}`}
              onClick={() => handleModeChange("timing")}
              title={t("trainer.timingDesc", "Timing Window: Cast rhythm with prompter")}
            >
              <StopwatchIcon className={styles.btnIcon} />
              <span>{t("trainer.timing", "Timing")}</span>
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

          {/* Action Group */}
          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={openRemapSettings}
              title={t("trainer.remapTitle", "Key Remap & Settings")}
            >
              <GearIcon className={styles.btnIcon} />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={resetTrainer}
              title={`${t("common.reset", "Reset")} (F5 / Alt+R)`}
            >
              <ResetIcon className={styles.btnIcon} />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setIsPlaying((p) => !p)}
              title={isPlaying ? t("common.pause", "Pause") : t("common.play", "Play")}
            >
              {isPlaying ? (
                <PauseIcon className={styles.btnIcon} />
              ) : (
                <PlayIcon className={styles.btnIcon} />
              )}
            </button>
            {onClose && (
              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
                title={t("common.close", "Close")}
              >
                <CloseIcon className={styles.btnIcon} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Prompter Track */}
      <div className={styles.trackContainer}>
        {visibleSteps.map(({ step, relativeIdx }) => {
          const isTarget = relativeIdx === 0
          const cooldownExpiresAt = step.cooldownGroup ? activeCooldowns[step.cooldownGroup] : undefined
          const remainingCdSec = cooldownExpiresAt ? Math.max(0, Math.ceil((cooldownExpiresAt - clockTick) / 1000)) : 0

          return (
            <div
              key={`${step.id}-${relativeIdx}`}
              className={`${styles.skillCard} ${isTarget ? styles.targetCard : styles.queueCard} ${
                relativeIdx < 0 ? styles.pastCard : ""
              }`}
            >
              <div className={styles.cardHeader}>
                <span
                  className={styles.skillName}
                  title={step.multiplier > 1 ? `${step.cleanName} ×${step.multiplier}` : step.cleanName}
                >
                  {step.cleanName}
                </span>

                <div className={styles.cardBadges}>
                  {isTarget && !hasStarted && (
                    <span className={styles.startBadge}>{t("trainer.startBadge", isRuLocale ? "СТАРТ" : "START")}</span>
                  )}
                  {isTarget && step.multiplier > 1 && (
                    <span className={styles.counterBadge}>
                      ×{hasStarted ? remainingCount : step.multiplier}
                    </span>
                  )}
                  {!isTarget && step.multiplier > 1 && (
                    <span className={styles.multiplierBadge}>×{step.multiplier}</span>
                  )}
                </div>
              </div>

              <div className={styles.keyPrompt}>
                <span className={styles.keyTag}>{step.expectedKeyLabel}</span>
              </div>

              {/* Bottom Timings Row: Cooldown & Cast Time */}
              <div className={styles.cardTimings}>
                {step.cooldownSec && (
                  <span
                    className={remainingCdSec > 0 ? styles.cdActiveBadge : styles.cdBadge}
                    title={
                      remainingCdSec > 0
                        ? t("trainer.cooldownRemaining", isRuLocale ? "Откат: {count} сек" : "Cooldown: {count}s").replace("{count}", String(remainingCdSec))
                        : t("trainer.cooldownBase", isRuLocale ? "Кулдаун: {count} сек" : "Base CD: {count}s").replace("{count}", String(step.cooldownSec))
                    }
                  >
                    {remainingCdSec > 0 ? `⏳ ${remainingCdSec}s` : `CD ${step.cooldownSec}s`}
                  </span>
                )}

                {step.durationSec > 0 && (
                  <span
                    className={isTarget && isCasting ? styles.castActiveBadge : styles.castTimeBadge}
                    title={
                      t("trainer.castDuration", isRuLocale ? "Время каста: {count} сек" : "Cast duration: {count}s").replace("{count}", String(step.durationSec))
                    }
                  >
                    ⏱ {isTarget && isCasting
                      ? `${(Math.max(0, (castDurationMs - (clockTick - castStartTime)) / 1000) || 0).toFixed(1)}s`
                      : `${step.durationSec}s`}
                  </span>
                )}
              </div>

              {/* Timing mode prompter bar */}
              {isTarget && settings.mode === "timing" && (
                <div className={styles.timingBarTrack}>
                  <div className={styles.timingBarFill} style={{ width: `${timingProgress}%` }} />
                </div>
              )}

              {/* Active Cast Progress Bar */}
              {isTarget && isCasting && (
                <div className={styles.castBarTrack}>
                  <div className={styles.castBarFill} style={{ width: `${castProgress}%` }} />
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
            <FlameIcon className={styles.statIcon} />
            <span>{combo}</span> <small>COMBO</small>{" "}
            {maxCombo > 0 && <small>({maxCombo} max)</small>}
          </span>
          <span className={styles.accStat}>
            <TargetIcon className={styles.statIcon} />
            <span>{accuracy}%</span> <small>ACC</small>
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
