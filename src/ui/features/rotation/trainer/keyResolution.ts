import type { TrainerKeyMap, TrainerStep } from "./types"
import type { ParsedRotationToken } from "../readableRotation"
import type { RotationCast } from "../../../../engine/types"

export function formatKeyDisplay(key: string): string {
  const norm = key.toLowerCase()
  if (norm === "lclick") return "LClick"
  if (norm === "rclick") return "RClick"
  if (norm === "mclick") return "MClick"
  if (norm === "~" || norm === "`") return "~"
  if (norm === "space") return "Space"
  if (norm === "shift") return "Shift"
  if (norm === "tab") return "Tab"
  return norm.toUpperCase()
}

export function resolveSkillKey(
  cleanName: string,
  keyMap: TrainerKeyMap,
): { key: string; label: string } {
  const norm = cleanName.toLowerCase()

  // 1. Weapon swap
  if (norm.includes("tab") || norm.includes("swap")) {
    return { key: keyMap.swap, label: formatKeyDisplay(keyMap.swap) }
  }

  // 2. Heavy / Charged attack
  if (norm.includes("charged") || norm.includes("heavy") || norm.includes("hold")) {
    return { key: keyMap.heavy, label: `${formatKeyDisplay(keyMap.heavy)} (Hold)` }
  }

  // 3. Stance / Special skill (e.g. Mo Special, Heng Special) -> '~'
  if (norm.includes("special") || norm.includes("stance")) {
    return { key: keyMap.skill1, label: formatKeyDisplay(keyMap.skill1) }
  }

  // 4. Varied combo (e.g. Heng VC, Mo VC)
  if (norm.includes("vc") || norm.includes("varied")) {
    return { key: keyMap.varied, label: formatKeyDisplay(keyMap.varied) }
  }

  // 5. Light combo / attack (e.g. Heng LC, Mo LC)
  if (norm.includes("lc") || norm.includes("light") || norm.includes("slash")) {
    return { key: keyMap.light, label: formatKeyDisplay(keyMap.light) }
  }

  // 6. Mystic / Flute skills
  if (
    norm.includes("flute") ||
    norm.includes("bursting") ||
    norm.includes("mystic") ||
    norm.includes("cancel")
  ) {
    return { key: keyMap.mystic, label: formatKeyDisplay(keyMap.mystic) }
  }

  // 7. Q skills (e.g. Heng Q, Heng Q2, Heng Q Stab, Mo QQ)
  if (norm.includes("q")) {
    return { key: keyMap.skill2, label: formatKeyDisplay(keyMap.skill2) }
  }

  // Default fallback to skill 2 (Q)
  return { key: keyMap.skill2, label: formatKeyDisplay(keyMap.skill2) }
}

export function buildTrainerSteps(
  tokens: ParsedRotationToken[],
  keyMap: TrainerKeyMap,
  casts?: RotationCast[],
): TrainerStep[] {
  return tokens.map((token, index) => {
    const keyInfo = resolveSkillKey(token.cleanName, keyMap)
    const matchingCast = casts ? casts.find((c) => c.stepIndex === index || c.skillName === token.skillName) : undefined
    return {
      id: `${index}-${token.cleanName}`,
      rawName: token.raw,
      cleanName: token.cleanName,
      expectedKey: keyInfo.key.toLowerCase(),
      expectedKeyLabel: keyInfo.label,
      multiplier: Math.max(1, token.multiplier || 1),
      remainingCount: Math.max(1, token.multiplier || 1),
      targetTimeSec: matchingCast?.timeSec,
      durationSec: 1.0,
    }
  })
}
