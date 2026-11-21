import rawSkillData from "./skillTimingsData.json"

export interface SkillTimingInfo {
  castDurationSec: number
  cooldownSec?: number
  cooldownGroup?: string
  isHold?: boolean
}

interface RawSkillEntry {
  name: string
  shortName: string
  castTime: number
  cooldown: number | null
  cooldownGroup: string
}

const skillsDict = rawSkillData as Record<string, RawSkillEntry>

// Fast indexes built from Actual data
const byShortName = new Map<string, RawSkillEntry>()
const byFullName = new Map<string, RawSkillEntry>()

for (const entry of Object.values(skillsDict)) {
  if (entry.shortName) {
    byShortName.set(entry.shortName.toLowerCase().trim(), entry)
  }
  if (entry.name) {
    byFullName.set(entry.name.toLowerCase().trim(), entry)
  }
}

// Canonical timings directly verified from Actual data/skill/*.json
const CANONICAL_TIMING_RULES: Array<{
  match: RegExp
  castTime: number
  cooldown?: number
  group?: string
  isCharged?: boolean
}> = [
  // Mo Dao
  { match: /\bmo\s*special\b/i, castTime: 1.167, cooldown: 20.0, group: "MoSpecial" },
  { match: /\bmo\s*qq\b/i, castTime: 0.7, cooldown: 15.0, group: "MoQQ" },
  { match: /\bmo\s*charged\b/i, castTime: 0.85, isCharged: true, group: "MoCharged" },
  { match: /\bmo\s*dual\b/i, castTime: 0.6, cooldown: 3.0, group: "WeaponDual" },
  { match: /\bmo\s*swap\b/i, castTime: 0, cooldown: 0.6, group: "WeaponSwap" },
  { match: /\bmo\s*vc\b/i, castTime: 0.8, group: "MoVC" },
  { match: /\bmo\s*lc\b|\bmo\s*a1\b/i, castTime: 0.936, cooldown: 0.1, group: "MoLC" },

  // Heng Dao
  { match: /\bheng\s*special\b/i, castTime: 2.066, cooldown: 20.0, group: "HengSpecial" },
  { match: /\bheng\s*q\s*stab\b/i, castTime: 1.15, cooldown: 12.0, group: "HengQ" },
  { match: /\bheng\s*q2\b/i, castTime: 0.708, cooldown: 12.0, group: "HengQ" },
  { match: /\bheng\s*q\b/i, castTime: 0.615, cooldown: 12.0, group: "HengQ" },
  { match: /\bheng\s*dual\b|\bheng\s*tab\b/i, castTime: 0.56, cooldown: 3.0, group: "WeaponDual" },
  { match: /\bheng\s*swap\b/i, castTime: 0, cooldown: 0.6, group: "WeaponSwap" },
  { match: /\bheng\s*vc\b/i, castTime: 0.857, group: "HengVC" },
  { match: /\bheng\s*lc\b/i, castTime: 1.605, group: "HengLC" },

  // Mystics
  { match: /\bflute\s*cancel\b/i, castTime: 0.8, cooldown: 25.0, group: "FluteOfTheTides" },
  { match: /\bflute\s*full\b|\bflute\b/i, castTime: 3.3, cooldown: 25.0, group: "FluteOfTheTides" },
  { match: /\bbursting\s*nine\b/i, castTime: 1.4, cooldown: 30.0, group: "BurstingNine" },
  { match: /\btoad\b|\bleaping\s*toad\b/i, castTime: 1.15, cooldown: 8.0, group: "LeapingToad" },
  { match: /\bgolden\s*body\b/i, castTime: 0.5, cooldown: 20.0, group: "GoldenBody" },
  { match: /\bsoaring\s*spin\s*1\b|\bsoaring\s*1\b/i, castTime: 1.182, cooldown: 12.0, group: "SoaringSpin" },
  { match: /\bsoaring\s*spin\b|\bsoaring\b/i, castTime: 2.025, cooldown: 12.0, group: "SoaringSpin" },
  { match: /\bbreath\s*1\b|\bsmolder\s*1\b/i, castTime: 1.273, cooldown: 6.0, group: "DragonsBreath" },
  { match: /\bbreath\b|\bsmolder\b/i, castTime: 2.728, cooldown: 6.0, group: "DragonsBreath" },
  { match: /\bdrink\b|\bdrunken\s*poet\b/i, castTime: 0.626, group: "DrunkenPoet" },
  { match: /\bpoet\b/i, castTime: 0.58, group: "DrunkenPoet" },
  { match: /\bghostly\s*steps\b/i, castTime: 0.1, cooldown: 60.0, group: "GhostlySteps" },

  // General & Utility
  { match: /\bdeflect\b/i, castTime: 0.25, group: "Deflect" },
  { match: /\bslide\b|\bdash\b|\bdodge\b|\bshift\b/i, castTime: 0.4, group: "Dodge" },
  { match: /\b(weapon\s*)?(swap|switch)\b/i, castTime: 0, cooldown: 0.6, group: "WeaponSwap" },
]

/**
 * Resolves accurate cast time and cooldown for a skill from Actual data/skill database.
 */
export function resolveSkillTiming(
  cleanName: string,
  rawName?: string,
  multiplier = 1,
  simulatedDurationSec?: number,
): SkillTimingInfo {
  const normClean = cleanName.toLowerCase().trim()
  const cleanWithoutMultiplier = normClean.replace(/\s*x\d+$/i, "").trim()

  // 1. Check Canonical Rules
  for (const rule of CANONICAL_TIMING_RULES) {
    if (rule.match.test(normClean) || rule.match.test(cleanWithoutMultiplier)) {
      const isCharged = rule.isCharged ?? false
      let finalCast = rule.castTime

      // If simulation engine provided a precise simulated duration between casts, prefer it for execution
      // Note: for instant actions (rule.castTime === 0, e.g. weapon swap), keep 0s cast time
      if (rule.castTime > 0 && simulatedDurationSec && simulatedDurationSec > 0.1 && simulatedDurationSec < 15) {
        finalCast = simulatedDurationSec
      }

      return {
        castDurationSec: Math.round(finalCast * 100) / 100,
        cooldownSec: rule.cooldown,
        cooldownGroup: rule.group ?? cleanWithoutMultiplier,
        isHold: isCharged,
      }
    }
  }

  // 2. Check Database by Short Name or Full Name
  const matchEntry =
    byShortName.get(cleanWithoutMultiplier) ||
    byFullName.get(cleanWithoutMultiplier) ||
    (rawName ? skillsDict[rawName] : undefined)

  if (matchEntry) {
    let finalCast = matchEntry.castTime || 0.5
    if (multiplier > 1 && !matchEntry.cooldown) {
      finalCast *= multiplier
    }
    if (simulatedDurationSec && simulatedDurationSec > 0.1 && simulatedDurationSec < 15) {
      finalCast = simulatedDurationSec
    }

    return {
      castDurationSec: Math.round(finalCast * 100) / 100,
      cooldownSec: matchEntry.cooldown ?? undefined,
      cooldownGroup: matchEntry.cooldownGroup || matchEntry.name,
      isHold: /charged|hold|heavy/i.test(cleanName),
    }
  }

  // 3. Fallback duration
  const fallbackDuration =
    simulatedDurationSec && simulatedDurationSec > 0.1 && simulatedDurationSec < 15
      ? simulatedDurationSec
      : 0.6

  return {
    castDurationSec: Math.round(fallbackDuration * 100) / 100,
    cooldownSec: undefined,
    cooldownGroup: cleanWithoutMultiplier,
    isHold: /charged|hold|heavy/i.test(cleanName),
  }
}
