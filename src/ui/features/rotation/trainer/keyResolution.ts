import type { TrainerKeyMap, TrainerStep } from "./types"
import type { ParsedRotationToken } from "../readableRotation"
import type { RotationCast } from "../../../../engine/types"

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

  // 3. Stance / Special skill (e.g. Mo Special, Heng Special) -> '~'
  if (norm.includes("special") || norm.includes("stance")) {
    return { key: keyMap.skill1, label: formatKeyDisplay(keyMap.skill1, isRuLocale), isHold: false }
  }

  // 4. Varied combo (e.g. Heng VC, Mo VC)
  if (norm.includes("vc") || norm.includes("varied")) {
    return { key: keyMap.varied, label: formatKeyDisplay(keyMap.varied, isRuLocale), isHold: false }
  }

  // 5. Light combo / attack (e.g. Heng LC, Mo LC)
  if (norm.includes("lc") || norm.includes("light") || norm.includes("slash")) {
    return { key: keyMap.light, label: formatKeyDisplay(keyMap.light, isRuLocale), isHold: false }
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

export function buildTrainerSteps(
  tokens: ParsedRotationToken[],
  keyMap: TrainerKeyMap,
  casts?: RotationCast[],
  isRuLocale = false,
): TrainerStep[] {
  return tokens.map((token, index) => {
    const keyInfo = resolveSkillKey(token.cleanName, keyMap, isRuLocale)
    const matchingCast = casts ? casts.find((c) => c.stepIndex === index || c.skillName === token.skillName) : undefined
    const isHold = keyInfo.isHold ?? false
    // Hold / Charged skills (e.g. Mo Charged x4) are held as 1 action, not tapped repeatedly
    const count = isHold ? 1 : Math.max(1, token.multiplier || 1)
    return {
      id: `${index}-${token.cleanName}`,
      rawName: token.raw,
      cleanName: token.cleanName,
      expectedKey: normalizeKeyInput(keyInfo.key),
      expectedKeyLabel: keyInfo.label,
      multiplier: count,
      remainingCount: count,
      targetTimeSec: matchingCast?.timeSec,
      durationSec: 1.0,
    }
  })
}
