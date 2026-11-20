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
  const lower = key.toLowerCase().trim()
  if (lower === "`" || lower === "~" || lower === "ё" || lower === "grave" || lower === "tilde") {
    return "~"
  }
  return RU_TO_EN_KEY_MAP[lower] ?? lower
}

export function formatKeyDisplay(key: string, isRuLocale = false): string {
  const norm = normalizeKeyInput(key)
  if (norm === "lclick") return isRuLocale ? "ЛКМ" : "LClick"
  if (norm === "rclick") return isRuLocale ? "ПКМ" : "RClick"
  if (norm === "mclick") return isRuLocale ? "Колесико" : "Wheel (MMB)"
  if (norm === "~") return isRuLocale ? "~ (Ё)" : "~"
  if (norm === "space") return isRuLocale ? "Пробел" : "Space"
  if (norm === "shift") return "Shift"
  if (norm === "tab") return "Tab"

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

  // 1. Dual weapon attack / switch without tab (e.g. Heng Dual, Mo Dual, Dual Blade)
  if (norm.includes("dual") || norm.includes("парн")) {
    const key = keyMap.dual ?? "mclick"
    return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
  }

  // 2. Weapon swap (e.g. Tab, Swap) - do NOT match "Stab" (e.g. Heng Q Stab)
  if (/\b(tab|swap)\b/i.test(cleanName)) {
    // Legacy support for "Heng Tab" and "Mo Tab" which are actually Dual skills
    if (norm.includes("heng") || norm.includes("mo")) {
      const key = keyMap.dual ?? "mclick"
      return { key, label: formatKeyDisplay(key, isRuLocale), isHold: false }
    }
    return { key: keyMap.swap, label: formatKeyDisplay(keyMap.swap, isRuLocale), isHold: false }
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

  // 6. Mystic / Flute skills
  if (
    norm.includes("flute") ||
    norm.includes("bursting") ||
    norm.includes("mystic") ||
    norm.includes("cancel")
  ) {
    return { key: keyMap.mystic, label: formatKeyDisplay(keyMap.mystic, isRuLocale), isHold: false }
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
