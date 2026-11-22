import type { TrainerKeyMap, TrainerStep } from "./types"
import type { ParsedRotationToken } from "../readableRotation"
import type { RotationCast } from "../../../../engine/types"
import { resolveSkillTiming } from "./skillTimings"

/**
 * Maps Russian keyboard layout keys (ЙЦУКЕН) to standard English physical keys (QWERTY).
 */
export const RU_TO_EN_KEY_MAP: Record<string, string> = {
  й: "q",
  ц: "w",
  у: "e",
  к: "r",
  е: "t",
  н: "y",
  г: "u",
  ш: "i",
  щ: "o",
  з: "p",
  х: "[",
  ъ: "]",
  ф: "a",
  ы: "s",
  в: "d",
  а: "f",
  п: "g",
  р: "h",
  о: "j",
  л: "k",
  д: "l",
  ж: ";",
  э: "'",
  я: "z",
  ч: "x",
  с: "c",
  м: "v",
  и: "b",
  т: "n",
  ь: "m",
  б: ",",
  ю: ".",
  ё: "~",
  "`": "~",
}

export function normalizeKeyInput(key: string): string {
  if (!key) return ""
  if (key === " ") return "space"
  const lower = key.toLowerCase().trim()
  if (lower === "space") return "space"
  if (lower === "`" || lower === "~" || lower === "ё" || lower === "grave" || lower === "tilde") {
    return "~"
  }
  if (lower === "xbutton1" || lower === "mouse4" || lower === "m4") return "mouse4"
  if (lower === "xbutton2" || lower === "mouse5" || lower === "m5") return "mouse5"
  if (lower === "wheeldown" || lower === "wheel_down" || lower === "mwheeldown") return "wheeldown"
  if (lower === "wheelup" || lower === "wheel_up" || lower === "mwheelup") return "wheelup"
  return RU_TO_EN_KEY_MAP[lower] ?? lower
}

export function formatKeyDisplay(key: string, isRuLocale = false): string {
  const norm = normalizeKeyInput(key)
  if (norm === "lclick") return isRuLocale ? "ЛКМ" : "LClick"
  if (norm === "rclick") return isRuLocale ? "ПКМ" : "RClick"
  if (norm === "wheeldown") return isRuLocale ? "Колесико вниз" : "Wheel Down"
  if (norm === "wheelup") return isRuLocale ? "Колесико вверх" : "Wheel Up"
  if (norm === "mclick") return isRuLocale ? "Клик колесика" : "Wheel Click"
  if (norm === "mouse4") return isRuLocale ? "Боковая 1" : "Mouse 4"
  if (norm === "mouse5") return isRuLocale ? "Боковая 2" : "Mouse 5"
  if (norm === "~") return isRuLocale ? "~ (Ё)" : "~"
  if (norm === "space") return isRuLocale ? "Пробел" : "Space"
  if (norm === "shift") return "Shift"
  if (norm === "tab") return "Tab"
  if (norm === "ctrl" || norm === "control") return "Ctrl"
  if (norm === "alt") return "Alt"
  if (norm === "caps" || norm === "capslock") return "Caps"

  const EN_TO_RU: Record<string, string> = {
    q: "Й",
    w: "Ц",
    e: "У",
    r: "К",
    t: "Е",
    a: "Ф",
    s: "Ы",
    d: "В",
    f: "А",
    z: "Я",
    x: "Ч",
    c: "С",
    v: "М",
  }

  const upper = norm.toUpperCase()
  if (isRuLocale && EN_TO_RU[norm]) {
    return `${upper} (${EN_TO_RU[norm]})`
  }
  return upper
}

export function resolveSkillKey(
  cleanName: string,
  keyMap: TrainerKeyMap,
  isRuLocale = false,
): { key: string; label: string; isHold?: boolean } {
  const norm = cleanName.toLowerCase()

  // 1. Dual weapon attack / Tab swap (e.g. Heng Dual, Mo Dual, Dual Blade, Tab)
  if (norm.includes("dual") || norm.includes("парн") || /\btab\b/i.test(cleanName)) {
    const key = keyMap.swap ?? "tab"
    return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
  }

  // 2. Direct weapon swap / switch via wheel (e.g. Mo Swap, Heng Swap, Weapon Swap, Switch) - do NOT match "Stab" (e.g. Heng Q Stab)
  if (/\b(swap|switch)\b/i.test(cleanName) || norm.includes("смен") || norm.includes("переключ") || norm.includes("wheel")) {
    const key = keyMap.dual ?? "wheeldown"
    return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
  }

  // 2. Heavy / Charged attack
  if (norm.includes("charged") || norm.includes("heavy") || norm.includes("hold")) {
    return {
      key: keyMap.heavy,
      label: `${formatKeyDisplay(keyMap.heavy, isRuLocale)} ${isRuLocale ? "(Удерж.)" : "(Hold)"}`,
      isHold: true,
    }
  }

  // 2b. Varied Combo (VC) -> R (tap)
  if (norm.includes("vc") || norm.includes("varied") || norm.includes("вариатив")) {
    const key = keyMap.heavy ?? "r"
    return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
  }

  // 3. Stance / Special skill (e.g. Mo Special, Heng Special) -> '~'
  if (norm.includes("special") || norm.includes("stance")) {
    return { key: keyMap.skill1, label: formatKeyDisplay(keyMap.skill1, isRuLocale), isHold: false }
  }

  // 4. Light Attack / Light Combo (e.g. Heng LC, Mo LC, Light attacks)
  if (
    norm.includes("lc") ||
    norm.includes("light") ||
    norm.includes("slash") ||
    norm.includes("лайт")
  ) {
    const key = keyMap.light ?? "lclick"
    return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
  }

  // 5. Deflect / Parry (Default: "e")
  if (
    norm.includes("deflect") ||
    norm.includes("дефлект") ||
    norm.includes("отражен") ||
    norm.includes("парир") ||
    norm.includes("parry")
  ) {
    const key = keyMap.deflect ?? "e"
    return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
  }

  // 6. Mystic skills
  // 6a. Flute / Флейта -> mystic1 (Default: "f")
  if (norm.includes("flute") || norm.includes("флейт")) {
    const key = keyMap.mystic1 ?? keyMap.mystic ?? "f"
    return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
  }

  // 6b. Toad / Bursting Nine / Жаба -> mystic2 (Default: "g")
  if (
    norm.includes("bursting") ||
    norm.includes("toad") ||
    norm.includes("жаб") ||
    norm.includes("nine")
  ) {
    const key = keyMap.mystic2 ?? "g"
    return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
  }

  // 6c. Other mystics
  if (
    norm.includes("mystic") ||
    norm.includes("cancel") ||
    norm.includes("drink") ||
    norm.includes("poet") ||
    norm.includes("dragon") ||
    norm.includes("soaring") ||
    norm.includes("breath") ||
    norm.includes("smolder")
  ) {
    const key = keyMap.mystic1 ?? keyMap.mystic ?? "f"
    return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
  }

  // 7. Q skills (e.g. Heng Q, Heng Q2, Heng Q Stab, Mo QQ)
  if (norm.includes("q")) {
    return { key: keyMap.skill2, label: formatKeyDisplay(keyMap.skill2, isRuLocale), isHold: false }
  }

  // Default fallback to skill 2 (Q)
  return { key: keyMap.skill2, label: formatKeyDisplay(keyMap.skill2, isRuLocale), isHold: false }
}

export function isDeflectToken(token?: ParsedRotationToken): boolean {
  if (!token) return false
  const normClean = (token.cleanName || "").toLowerCase()
  const normId = (token.skillId || "").toLowerCase()
  return (
    normClean.includes("deflect") ||
    normClean.includes("дефлект") ||
    normClean.includes("parry") ||
    normClean.includes("парир") ||
    normClean.includes("отражен") ||
    normId.includes("deflect")
  )
}

export function isCancelSkillToken(token: ParsedRotationToken): boolean {
  if (!token || isDeflectToken(token)) return false

  const normClean = (token.cleanName || "").toLowerCase()
  const normRaw = (token.raw || "").toLowerCase()
  const normId = (token.skillId || "").toLowerCase()

  if (
    normClean.includes("cancel") ||
    normClean.includes("кенсл") ||
    normClean.includes("отмен") ||
    normRaw.includes("cancel") ||
    normRaw.includes("кенсл") ||
    normRaw.includes("отмен")
  ) {
    return true
  }

  // Known cancel mystics / skills that cancel recovery via deflect
  if (
    normId === "mystic-flute-of-the-tides-cancel" ||
    normId === "mystic-flute-of-the-tides-prepull" ||
    normId === "mystic-toad-cancel" ||
    normId === "mystic-leaping-toad-cancel" ||
    normId === "mystic-drunken-poet-drink-cancel" ||
    normId === "universal-golden-body-cancel"
  ) {
    return true
  }

  return false
}

export function buildTrainerSteps(
  tokens: ParsedRotationToken[],
  keyMap: TrainerKeyMap,
  casts?: RotationCast[],
  isRuLocale = false,
): TrainerStep[] {
  // Normalize token ordering: if a neutral mystic art (e.g. Bursting Nine / Toad) is immediately followed
  // by a direct weapon swap (e.g. Mo Swap, Heng Swap), move the weapon swap BEFORE the mystic art.
  const normalizedTokens: ParsedRotationToken[] = [...tokens]
  for (let i = 0; i < normalizedTokens.length - 1; i++) {
    const cur = normalizedTokens[i]
    const next = normalizedTokens[i + 1]
    const isNextSwap =
      /\b(swap|switch)\b/i.test(next.cleanName) ||
      next.cleanName.toLowerCase().includes("смен") ||
      next.cleanName.toLowerCase().includes("переключ")
    const isCurMystic =
      /bursting|nine|toad|жаб/i.test(cur.cleanName) ||
      cur.skillId?.startsWith("mystic-bursting") ||
      cur.skillId?.startsWith("mystic-toad")

    if (isCurMystic && isNextSwap) {
      normalizedTokens[i] = next
      normalizedTokens[i + 1] = cur
      i++
    }
  }

  let currentCastIdx = 0
  const steps: TrainerStep[] = []

  for (let index = 0; index < normalizedTokens.length; index++) {
    const token = normalizedTokens[index]
    const keyInfo = resolveSkillKey(token.cleanName, keyMap, isRuLocale)
    let simDuration: number | undefined
    let matchingCast: RotationCast | undefined

    const stepMultiplier = Math.max(1, token.multiplier || 1)

    if (casts && casts.length > 0) {
      // Find the next cast matching this token at or after currentCastIdx
      const foundIdx = casts.findIndex(
        (c, i) => i >= currentCastIdx && (c.stepIndex === index || c.skillName === token.skillName),
      )
      const castIdx =
        foundIdx >= 0 ? foundIdx : casts.findIndex((c) => c.skillName === token.skillName)

      if (castIdx >= 0) {
        matchingCast = casts[castIdx]
        const nextCast = casts[castIdx + 1]
        if (nextCast && matchingCast) {
          const delta = nextCast.timeSec - matchingCast.timeSec
          if (delta > 0.1 && delta < 15) {
            simDuration = delta
          }
        }
        currentCastIdx = castIdx + stepMultiplier
      }
    }

    const timingInfo = resolveSkillTiming(
      token.cleanName,
      token.skillName,
      stepMultiplier,
      simDuration,
    )

    const isHold = keyInfo.isHold ?? timingInfo.isHold ?? false
    const count = stepMultiplier

    steps.push({
      id: `${index}-${token.cleanName}`,
      rawName: token.raw,
      cleanName: token.cleanName,
      expectedKey: normalizeKeyInput(keyInfo.key),
      expectedKeyLabel: keyInfo.label,
      multiplier: stepMultiplier,
      remainingCount: count,
      targetTimeSec: matchingCast?.timeSec,
      durationSec: timingInfo.castDurationSec,
      cooldownSec: timingInfo.cooldownSec,
      cooldownGroup: timingInfo.cooldownGroup,
      isHold,
    })

    // If this skill has a cancel (e.g. Flute Cancel, Toad Cancel) and the next token is not already Deflect,
    // inject an explicit Deflect step into the button timeline so player is prompted to press Deflect (E).
    const nextToken = tokens[index + 1]
    if (isCancelSkillToken(token) && !isDeflectToken(nextToken)) {
      const deflectKey = keyMap.deflect ?? "e"
      const hasCyrillic = /[а-яА-ЯёЁ]/.test(token.cleanName)
      const deflectName = hasCyrillic || isRuLocale ? "Дефлект" : "Deflect"
      const deflectTargetTime =
        matchingCast?.timeSec !== undefined
          ? matchingCast.timeSec + timingInfo.castDurationSec
          : undefined

      steps.push({
        id: `${index}-${token.cleanName}-deflect-cancel`,
        rawName: `${token.raw} -> ${deflectName}`,
        cleanName: deflectName,
        expectedKey: normalizeKeyInput(deflectKey),
        expectedKeyLabel: formatKeyDisplay(deflectKey, isRuLocale),
        multiplier: 1,
        remainingCount: 1,
        targetTimeSec: deflectTargetTime,
        durationSec: 0.25,
        cooldownSec: undefined,
        cooldownGroup: "Deflect",
        isHold: false,
      })
    }
  }

  return steps
}
