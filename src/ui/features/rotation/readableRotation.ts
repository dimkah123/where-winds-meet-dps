import type { Result } from "../../../engine/types"
import { newStepId, type Rotation, type RotationStep } from "../../../engine/rotation"
import type { Skill } from "../../../engine/skill"
import { weaponTagOf } from "../../../engine/buffs/tags"

export function getWeaponSwapShortName(weapon: string): string {
  const w = weapon.toLowerCase()
  if (w.includes("mo") || w.includes("phalanx")) return "Mo Swap"
  if (w.includes("heng") || w.includes("snowparting")) return "Heng Swap"
  if (w.includes("sword")) return "Sword Swap"
  if (w.includes("spear")) return "Spear Swap"
  if (w.includes("umbrella")) return "Umbrella Swap"
  if (w.includes("fan")) return "Fan Swap"
  if (w.includes("gauntlet")) return "Gauntlet Swap"
  if (w.includes("gourd")) return "Gourd Swap"
  return `${w.charAt(0).toUpperCase() + w.slice(1)} Swap`
}

export const SKILL_SHORT_NAMES: Record<string, string> = {
  // Stonesplit Strength — Phalanx
  "stonesplitStrength-phalanxspecial": "Mo Special",
  "stonesplitStrength-phalanxspecial-prepull": "Mo Special",
  "stonesplitStrength-phalanxcharged-s1": "Mo Charged",
  "stonesplitStrength-phalanxcharged-s1-released": "Mo Charged",
  "stonesplitStrength-phalanxcharged-s2": "Mo Charged",
  "stonesplitStrength-phalanxcharged-s2-innerpassion": "Mo Charged",
  "stonesplitStrength-phalanxcharged-s3": "Mo Charged",
  "stonesplitStrength-phalanxcharged-s3-innerpassion": "Mo Charged",
  "stonesplitStrength-phalanxq": "Mo QQ",
  "stonesplitStrength-phalanxq-soul": "Mo QQ",
  "stonesplitStrength-phalanxq-supreme": "Mo QQ",
  "stonesplitStrength-mo-blade-dual": "Mo Dual",
  "stonesplitStrength-mo-light-attack-1": "Mo A1",
  "stonesplitStrength-mo-light-attack-2": "Mo A2",
  "stonesplitStrength-mo-light-attack-3": "Mo A3",
  "stonesplitStrength-anxisoldiermodown": "Mo Down",
  "stonesplitStrength-anxisoldiermojump": "Mo Jump",
  "stonesplitStrength-anxisoldiermosweep": "Mo Sweep",
  "stonesplitStrength-anxisoldiermosweep-supreme": "Mo Sweep",

  // Stonesplit Strength — Snowparting
  "stonesplitStrength-snowpartingspecial": "Heng Special",
  "stonesplitStrength-snowpartingspecial-6hit": "Heng Special 6 Hit",
  "stonesplitStrength-snowpartingq-stab": "Heng Q Stab",
  "stonesplitStrength-snowpartingq-slash": "Heng Q",
  "stonesplitStrength-snowpartingq": "Heng Q",
  "stonesplitStrength-snowpartingslide": "Heng Q",
  "stonesplitStrength-snowpartingslide-prepull": "Heng Q",
  "stonesplitStrength-snowpartingslide-reslide-prepull": "Heng Q2",
  "stonesplitStrength-snowpartingslide-prepull-hit": "Heng Q",
  "stonesplitStrength-snowpartingdual": "Heng Dual",
  "stonesplitStrength-snowpartingdual-prepull": "Heng Dual",
  "stonesplitStrength-snowpartingvc": "Heng VC",
  "stonesplitStrength-snowpartingvc-prepull": "Heng VC",
  "stonesplitStrength-snowpartingcharged": "Heng LC",
  "stonesplitStrength-snowpartingcharged-forgetfulness": "Heng LC",
  "stonesplitStrength-heng-light-attack-1": "Heng A1",
  "stonesplitStrength-heng-light-attack-2": "Heng A2",
  "stonesplitStrength-heng-light-attack-3": "Heng A3",
  "stonesplitStrength-heng-light-attack-4": "Heng A4",
  "stonesplitStrength-heng-heavy-attack-1": "Heng H1",
  "stonesplitStrength-heng-heavy-attack-2": "Heng H2",
  "stonesplitStrength-heng-heavy-attack-3": "Heng H3",
  "stonesplitStrength-heng-heavy-attack-4": "Heng H4",
  "stonesplitStrength-anxisoldierheng": "Heng Anxi",
  "stonesplitStrength-anxisoldierheng-stab": "Heng Q Stab",
  "stonesplitStrength-break-defense": "Break Defense",
  "stonesplitStrength-deflect": "Deflect",
  "stonesplitStrength-deflect-cancel": "Deflect",

  // Direct Weapon Swaps
  "Weapon Swap (phalanx)": "Mo Swap",
  "Weapon Swap (phalanx) Prepull": "Mo Swap",
  "Weapon Swap (snowparting)": "Heng Swap",
  "Weapon Swap (snowparting) Prepull": "Heng Swap",
  "Weapon Swap (sword)": "Sword Swap",
  "Weapon Swap (sword) Prepull": "Sword Swap",
  "Weapon Swap (spear)": "Spear Swap",
  "Weapon Swap (spear) Prepull": "Spear Swap",
  "Weapon Swap (umbrella)": "Umbrella Swap",
  "Weapon Swap (umbrella) Prepull": "Umbrella Swap",
  "Weapon Swap (fan)": "Fan Swap",
  "Weapon Swap (fan) Prepull": "Fan Swap",
  "Weapon Swap (gauntlet)": "Gauntlet Swap",
  "Weapon Swap (gauntlet) Prepull": "Gauntlet Swap",
  "Weapon Swap (gourd)": "Gourd Swap",
  "Weapon Swap (gourd) Prepull": "Gourd Swap",

  // Bellstrike Umbra
  "Deflect Cancel": "Deflect",
  "bellstrikeUmbra-swordq": "Sword Q",
  "bellstrikeUmbra-swordqfollowup": "Sword QQ",
  "bellstrikeUmbra-spearq": "Spear Q",
  "bellstrikeUmbra-spearq-5-hit-cancel": "Spear Q",
  "bellstrikeUmbra-spearspecial": "Spear Special",
  "bellstrikeUmbra-spearspecial-1-hit-cancel": "Spear Special",
  "bellstrikeUmbra-swordspecial-3-hit": "Sword Special",
  "bellstrikeUmbra-swordspecial-4-hit": "Sword Special",
  "bellstrikeUmbra-sword-charge-stage-1-2-hit": "Sword Charged",
  "bellstrikeUmbra-sword-charge-stage-1-3-hit": "Sword Charged",
  "bellstrikeUmbra-sword-charge-stage-1-4-hit": "Sword Charged",
  "bellstrikeUmbra-sword-martial-qqq": "Sword QQQ",
  "bellstrikeUmbra-sword-r-charge-follow-up-1-hit-cancel": "Sword Followup",
  "bellstrikeUmbra-crosswind-blade-cancel": "Crosswind",
  "bellstrikeUmbra-deflect-cancel": "Deflect",
  "bellstrikeUmbra-delay": "Delay",
  "bellstrikeUmbra-ghostly-steps": "Ghostly Steps",

  // Bellstrike Splendor
  "bellstrikeSplendor-swordheavycharged": "Sword Charged",
  "bellstrikeSplendor-swordheavycharged-2-hit": "Sword Charged",
  "bellstrikeSplendor-swordheavycharged-prepull": "Sword Charged",
  "bellstrikeSplendor-swordq": "Sword Q",
  "bellstrikeSplendor-spearq": "Spear Q",
  "bellstrikeSplendor-spearq-0-hit-cancel": "Spear Q",
  "bellstrikeSplendor-spearq-prepull": "Spear Q",
  "bellstrikeSplendor-energysurge": "Energy Surge",
  "bellstrikeSplendor-deflect-cancel": "Deflect",
  "bellstrikeSplendor-deflect-cancel-prepull": "Deflect",
  "bellstrikeSplendor-ghostly-steps": "Ghostly Steps",

  // Silkbind Jade
  "silkbindJade-umbdronelaunch": "Colorful Phoenix",
  "silkbindJade-umbdronelaunch-12hit": "Colorful Phoenix",
  "silkbindJade-umbdronelaunch-20hit": "Colorful Phoenix",
  "silkbindJade-umbq": "Umbrella Q",
  "silkbindJade-umbq-prepull": "Umbrella Q",
  "silkbindJade-umblightcharge": "Umbrella Light Charged",
  "silkbindJade-umb-heavylight": "Umbrella Heavy",
  "silkbindJade-fanq": "Fan Q",
  "silkbindJade-fanq-prepull": "Fan Q",
  "silkbindJade-fanqcancel": "Fan Q",
  "silkbindJade-fanspecial": "Fan Special",
  "silkbindJade-fanlightcharged": "Fan Light Charged",
  "silkbindJade-fanheavypursuit-3-hit": "Fan Heavy",
  "silkbindJade-deflect-cancel": "Deflect",
  "silkbindJade-delay": "Delay",
  "silkbindJade-ghostly-steps": "Ghostly Steps",
  "silkbindJade-golden-body-cancel": "Golden Body",

  // Bamboocut Draught
  "bamboocutDraught-dragonquench-inebriate-cancel": "Flamelash",
  "bamboocutDraught-dragonquench-inebriate-second-cancel": "Flamelash",
  "bamboocutDraught-dragonquench-inebriate-third-cancel": "Flamelash",
  "bamboocutDraught-heros-blood": "Hero's Blood",
  "bamboocutDraught-heros-blood-inebriate": "Hero's Blood",
  "bamboocutDraught-nightwick-primepick": "Nightwick",
  "bamboocutDraught-nightwick-primepick-follow-up-cancel": "Nightwick",
  "bamboocutDraught-peakfall": "Gauntlet Q",
  "bamboocutDraught-peakfall-prepull": "Gauntlet Q",
  "bamboocutDraught-quick-drink-cancel": "Drink",
  "bamboocutDraught-reveldrift-cancel": "Reveldrift",
  "bamboocutDraught-castlink": "Castlink",
  "bamboocutDraught-deflect-cancel": "Deflect",
  "bamboocutDraught-deflect-cancel-prepull": "Deflect",

  // Mystic Arts
  "mystic-bursting-nine-7-hits": "Bursting Nine",
  "mystic-flute-of-the-tides-cancel": "Flute Cancel",
  "mystic-flute-of-the-tides-prepull": "Flute Cancel",
  "mystic-flute-of-the-tides-full": "Flute Full",
  "mystic-drunkenpoet-prepull": "Drink",
  "mystic-drunken-poet-drink-cancel": "Drink",
  "mystic-drunken-poet-drink": "Drink",
  "mystic-poet-final-hit-cancel": "Drunken Poet",
  "mystic-poet1": "Drunken Poet",
  "mystic-poet2": "Drunken Poet",
  "mystic-poet3": "Drunken Poet",
  "mystic-poet4": "Drunken Poet",
  "mystic-dragon-fire-smolder-1-hit": "Smolder 1 Hit",
  "mystic-dragon-fire-smolder-2-hits": "Smolder Full",
  "mystic-fire-breath-1-hit": "Breath 1 Hit",
  "mystic-fire-breath-2-hit": "Breath Full",
  "mystic-toad-cancel": "Toad",
  "mystic-leaping-toad-cancel": "Toad",
  "mystic-leaping-toad": "Toad",
  "mystic-dragon-head-plus": "Dragon Head",
  "mystic-dragon-head": "Dragon Head",
  "mystic-soaring": "Soaring",

  // Universal
  "universal-deflect": "Deflect",
  "universal-deflect-cancel": "Deflect",
  "universal-deflect-cancel-prepull": "Deflect",
  "universal-delay": "Delay",
  "universal-ghostly-steps": "Ghostly Steps",
  "universal-golden-body-cancel": "Golden Body",
}

export function getSkillShortName(skill: Skill | undefined, skillId?: string): string {
  if (skill?.shortName?.trim()) return skill.shortName.trim()
  const key = skill?.id || skillId || ""
  if (SKILL_SHORT_NAMES[key]) return SKILL_SHORT_NAMES[key]
  if (skill?.name && SKILL_SHORT_NAMES[skill.name]) return SKILL_SHORT_NAMES[skill.name]

  if (skill?.name) {
    const swapMatch = skill.name.match(/Weapon Swap \(([^)]+)\)/i)
    if (swapMatch) {
      return getWeaponSwapShortName(swapMatch[1])
    }
    const rawName = skill.name
      .replace(/\s*(prepull|pre-pull|\[prepull\]|\[pre-pull\])/gi, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .trim()
    if (SKILL_SHORT_NAMES[rawName]) return SKILL_SHORT_NAMES[rawName]
    return rawName || skill.name
  }

  const idSwapMatch = key.match(/direct-swap-[^-]+-([^-]+)/i)
  if (idSwapMatch) {
    return getWeaponSwapShortName(idSwapMatch[1])
  }

  return key
}

function hitDealsDamage(h: {
  physMultiplier?: number
  attributeMultiplier?: number
  physFixed?: number
  attributeFixed?: number
}): boolean {
  return (
    (h.physMultiplier ?? 0) > 0 ||
    (h.attributeMultiplier ?? 0) > 0 ||
    (h.physFixed ?? 0) > 0 ||
    (h.attributeFixed ?? 0) > 0
  )
}

export function readableRotationText(
  rotation: Rotation | undefined,
  result: Result | undefined,
  skillsById: Map<string, Skill>,
): string {
  const steps = rotation?.steps ?? []
  const casts = (result?.casts ?? []).filter((c) => {
    if (!c.stepId) return true
    const isDirectSwap = c.stepId.startsWith("swap-") || c.stepId.startsWith("direct-swap-")
    // Keep all direct weapon swaps (both prepull and in-combat, e.g. Mo -> Heng, Heng -> Mo)
    if (isDirectSwap) {
      return true
    }
    return true
  })

  if (casts.length === 0) {
    return readableRotationFromSteps(steps, skillsById)
  }

  const anchorTime = result?.fightStartSec ?? 0

  // Identify Qi break casts
  const breakCastStepIds = new Set<string>()
  for (const qiBreak of result?.qiBreaks ?? []) {
    const breakCast = casts.find((c, i) => {
      const nextTime = casts[i + 1]?.timeSec ?? Infinity
      return qiBreak.startSec >= c.timeSec - 0.05 && qiBreak.startSec < nextTime
    })
    if (breakCast) {
      breakCastStepIds.add(breakCast.stepId)
    }
  }

  // Find start cast (cast containing or opening the fight at anchorTime)
  let startCastIndex = casts.findIndex((c) => Math.abs(c.timeSec - anchorTime) < 0.05)
  if (startCastIndex < 0) {
    startCastIndex = casts.findIndex((c, i) => {
      const nextTime = casts[i + 1]?.timeSec ?? Infinity
      return anchorTime >= c.timeSec - 0.05 && anchorTime < nextTime
    })
  }

  const stepSkillIdMap = new Map<string, string>()
  for (const s of steps) {
    if (s.id) stepSkillIdMap.set(s.id, s.skillId)
  }

  const skillsByName = new Map<string, Skill>()
  for (const s of skillsById.values()) {
    if (s.name) skillsByName.set(s.name, s)
  }

  const entries: string[] = []

  for (let i = 0; i < casts.length; i++) {
    const cast = casts[i]
    const isDirectSwap = Boolean(
      cast.stepId && (cast.stepId.startsWith("swap-") || cast.stepId.startsWith("direct-swap-")),
    )

    const skillId = isDirectSwap
      ? cast.stepId
      : (stepSkillIdMap.get(cast.stepId) ||
        (cast.stepIndex !== undefined && steps[cast.stepIndex]?.skillId) ||
        cast.fallbackFromSkillId ||
        "")

    const skill =
      skillsById.get(skillId) ||
      skillsByName.get(cast.skillName) ||
      (cast.skillName ? ({ id: skillId, name: cast.skillName } as Skill) : undefined)
    const name = getSkillShortName(skill, skillId)

    const step =
      cast.stepIndex !== undefined ? steps[cast.stepIndex] : steps.find((s) => s.id === cast.stepId)
    const distTag = step?.distanceMeters !== undefined ? ` (${step.distanceMeters}m)` : ""

    if (i === startCastIndex) {
      // Fight start cast
      if (skill?.hits && skill.hits.length > 0) {
        const startFrame = Math.round(cast.timeSec * 60)
        const fightStartFrame = Math.round(anchorTime * 60)
        const hitIndex = skill.hits.findIndex(
          (h) => Math.abs(startFrame + h.frame - fightStartFrame) <= 3,
        )
        if (hitIndex >= 0) {
          const hitNumber = skill.hits
            .slice(0, hitIndex + 1)
            .filter((h) => hitDealsDamage(h)).length
          if (hitNumber > 1) {
            entries.push(`${name} (start at hit ${hitNumber})${distTag}`)
            continue
          }
        }
      }
      entries.push(`${name} (start)${distTag}`)
      continue
    }

    if (breakCastStepIds.has(cast.stepId)) {
      entries.push(`${name} (break)${distTag}`)
      continue
    }

    entries.push(`${name}${distTag}`)
  }

  const groups = entries.reduce<Array<{ text: string; count: number }>>((acc, text) => {
    const prev = acc[acc.length - 1]
    if (prev?.text === text) prev.count += 1
    else acc.push({ text, count: 1 })
    return acc
  }, [])

  return groups.map(({ text, count }) => (count > 1 ? `${text} x${count}` : text)).join(" > ")
}

export function readableRotationFromSteps(
  steps: RotationStep[],
  skillsById: Map<string, Skill>,
): string {
  const filteredSteps = steps.filter((step) => Boolean(step.skillId))
  const entries: string[] = []
  let drawnWeapon: string | null = null

  for (let i = 0; i < filteredSteps.length; i++) {
    const step = filteredSteps[i]
    const skillId = step.skillId
    const skill = skillsById.get(skillId)

    const weapon = skill ? weaponTagOf(skill) : ""

    if (weapon && drawnWeapon && weapon !== drawnWeapon && !skill?.isWeaponSwap) {
      entries.push(getWeaponSwapShortName(weapon))
      drawnWeapon = weapon
    } else if (weapon) {
      drawnWeapon = weapon
    } else if (drawnWeapon !== null) {
      // Step has no weapon tag (e.g. mystic arts). Look ahead to the next weapon-bearing step:
      // If the next weapon differs from drawnWeapon and isn't a weapon swap skill itself,
      // perform the direct swap BEFORE this neutral skill.
      let nextWeapon: string | null = null
      let nextSkill: Skill | undefined
      for (let j = i + 1; j < filteredSteps.length; j++) {
        const s = skillsById.get(filteredSteps[j].skillId)
        const w = s ? weaponTagOf(s) : ""
        if (w) {
          nextWeapon = w
          nextSkill = s
          break
        }
      }
      if (nextWeapon && nextWeapon !== drawnWeapon && !nextSkill?.isWeaponSwap) {
        entries.push(getWeaponSwapShortName(nextWeapon))
        drawnWeapon = nextWeapon
      }
    }

    const baseName = getSkillShortName(skill, skillId)
    const text =
      step.distanceMeters !== undefined ? `${baseName} (${step.distanceMeters}m)` : baseName
    entries.push(text)
  }

  const groups = entries.reduce<Array<{ text: string; count: number }>>((acc, text) => {
    const prev = acc[acc.length - 1]
    if (prev?.text === text) prev.count += 1
    else acc.push({ text, count: 1 })
    return acc
  }, [])
  return groups.map(({ text, count }) => (count > 1 ? `${text} x${count}` : text)).join(" > ")
}

export function collapseConsecutiveSkills(text: string): string {
  if (!text || !text.trim()) return text

  const hasTrailingSep = /\s*>\s*$/.test(text)
  const segments = text
    .split(/\s*>\s*/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (segments.length === 0) return text

  interface Group {
    base: string
    count: number
  }

  const groups: Group[] = []

  for (const seg of segments) {
    const match = seg.match(/^(.*?)(?:\s*(?:[xX*×]\s*(\d+)))\s*$/)
    const base = match ? match[1].trim() : seg
    const count = match ? Math.max(1, parseInt(match[2], 10)) : 1

    const prev = groups[groups.length - 1]
    if (prev && prev.base.toLowerCase() === base.toLowerCase()) {
      prev.count += count
    } else {
      groups.push({ base, count })
    }
  }

  const formatted = groups
    .map(({ base, count }) => (count > 1 ? `${base} x${count}` : base))
    .join(" > ")

  return hasTrailingSep ? `${formatted} > ` : formatted
}

export const CANONICAL_SKILLS_BY_CLASS: Record<string, Record<string, string>> = {
  stonesplitStrength: {
    "mo special": "stonesplitStrength-phalanxspecial",
    "mo special prepull": "stonesplitStrength-phalanxspecial-prepull",
    "mo charged": "stonesplitStrength-phalanxcharged-s3-innerpassion",
    "mo qq": "stonesplitStrength-phalanxq-soul",
    "mo dual": "stonesplitStrength-mo-blade-dual",
    "mo tab": "stonesplitStrength-mo-blade-dual",
    "mo a1": "stonesplitStrength-mo-light-attack-1",
    "mo a2": "stonesplitStrength-mo-light-attack-2",
    "mo a3": "stonesplitStrength-mo-light-attack-3",
    "mo down": "stonesplitStrength-anxisoldiermodown",
    "mo jump": "stonesplitStrength-anxisoldiermojump",
    "mo sweep": "stonesplitStrength-anxisoldiermosweep",
    "heng special": "stonesplitStrength-snowpartingspecial",
    "heng special 6 hit": "stonesplitStrength-snowpartingspecial-6hit",
    "heng special [6 hit]": "stonesplitStrength-snowpartingspecial-6hit",
    "heng special [6 hits]": "stonesplitStrength-snowpartingspecial-6hit",
    "heng 6 hit": "stonesplitStrength-snowpartingspecial-6hit",
    "6 hit": "stonesplitStrength-snowpartingspecial-6hit",
    "6-hit": "stonesplitStrength-snowpartingspecial-6hit",
    "fleeting trace 6 hit": "stonesplitStrength-snowpartingspecial-6hit",
    "fleeting trace [6 hit]": "stonesplitStrength-snowpartingspecial-6hit",
    "fleeting trace [6 hits]": "stonesplitStrength-snowpartingspecial-6hit",
    "heng q": "stonesplitStrength-snowpartingq-slash",
    "heng q2": "stonesplitStrength-snowpartingslide-reslide-prepull",
    "heng q stab": "stonesplitStrength-snowpartingq-stab",
    "heng dual": "stonesplitStrength-snowpartingdual",
    "heng tab": "stonesplitStrength-snowpartingdual",
    "heng vc": "stonesplitStrength-snowpartingvc",
    "heng lc": "stonesplitStrength-snowpartingcharged-forgetfulness",
    deflect: "stonesplitStrength-deflect",
    "break defense": "stonesplitStrength-break-defense",
    "heng anxi": "stonesplitStrength-anxisoldierheng",
    "heng a1": "stonesplitStrength-heng-light-attack-1",
    "heng a2": "stonesplitStrength-heng-light-attack-2",
    "heng a3": "stonesplitStrength-heng-light-attack-3",
    "heng a4": "stonesplitStrength-heng-light-attack-4",
    "heng h1": "stonesplitStrength-heng-heavy-attack-1",
    "heng h2": "stonesplitStrength-heng-heavy-attack-2",
    "heng h3": "stonesplitStrength-heng-heavy-attack-3",
    "heng h4": "stonesplitStrength-heng-heavy-attack-4",
  },
  bellstrikeUmbra: {
    "sword charged": "bellstrikeUmbra-sword-charge-stage-1-4-hit",
    "sword special": "bellstrikeUmbra-swordspecial-3-hit",
    "sword qq": "bellstrikeUmbra-swordqfollowup",
    "sword q": "bellstrikeUmbra-swordq",
    "sword qqq": "bellstrikeUmbra-sword-martial-qqq",
    "sword followup": "bellstrikeUmbra-sword-r-charge-follow-up-1-hit-cancel",
    "spear q": "bellstrikeUmbra-spearq-5-hit-cancel",
    "spear special": "bellstrikeUmbra-spearspecial-1-hit-cancel",
    crosswind: "bellstrikeUmbra-crosswind-blade-cancel",
    deflect: "bellstrikeUmbra-deflect-cancel",
    delay: "bellstrikeUmbra-delay",
    "ghostly steps": "bellstrikeUmbra-ghostly-steps",
  },
  bellstrikeSplendor: {
    "sword charged": "bellstrikeSplendor-swordheavycharged",
    "sword q": "bellstrikeSplendor-swordq",
    "spear q": "bellstrikeSplendor-spearq",
    "energy surge": "bellstrikeSplendor-energysurge",
    deflect: "bellstrikeSplendor-deflect-cancel-prepull",
    "ghostly steps": "bellstrikeSplendor-ghostly-steps",
  },
  silkbindJade: {
    "umbrella q": "silkbindJade-umbq",
    "umbrella light charged": "silkbindJade-umblightcharge",
    "umbrella heavy": "silkbindJade-umb-heavylight",
    "colorful phoenix": "silkbindJade-umbdronelaunch-20hit",
    "fan q": "silkbindJade-fanq",
    "fan special": "silkbindJade-fanspecial",
    "fan light charged": "silkbindJade-fanlightcharged",
    "fan heavy": "silkbindJade-fanheavypursuit-3-hit",
    deflect: "silkbindJade-deflect-cancel",
    "golden body": "silkbindJade-golden-body-cancel",
    "ghostly steps": "silkbindJade-ghostly-steps",
    delay: "silkbindJade-delay",
  },
  bamboocutDraught: {
    flamelash: "bamboocutDraught-dragonquench-inebriate-cancel",
    "hero's blood": "bamboocutDraught-heros-blood",
    nightwick: "bamboocutDraught-nightwick-primepick",
    "gauntlet q": "bamboocutDraught-peakfall",
    drink: "bamboocutDraught-quick-drink-cancel",
    reveldrift: "bamboocutDraught-reveldrift-cancel",
    castlink: "bamboocutDraught-castlink",
    deflect: "bamboocutDraught-deflect-cancel",
  },
}

export const COMMON_MYSTIC_AND_UNIVERSAL: Record<string, string> = {
  "bursting nine": "mystic-bursting-nine-7-hits",
  "bursting nine [7 hits]": "mystic-bursting-nine-7-hits",
  "flute cancel": "mystic-flute-of-the-tides-cancel",
  "flute full": "mystic-flute-of-the-tides-full",
  drink: "mystic-drunkenpoet-prepull",
  "drunken poet": "mystic-poet-final-hit-cancel",
  "smolder 1 hit": "mystic-dragon-fire-smolder-1-hit",
  "smolder full": "mystic-dragon-fire-smolder-2-hits",
  "breath 1 hit": "mystic-fire-breath-1-hit",
  "breath full": "mystic-fire-breath-2-hit",
  toad: "mystic-toad-cancel",
  "toad cancel": "mystic-toad-cancel",
  "dragon head": "mystic-dragon-head-plus",
  soaring: "mystic-soaring",
  deflect: "universal-deflect-cancel",
  delay: "universal-delay",
  "ghostly steps": "universal-ghostly-steps",
  "golden body": "universal-golden-body-cancel",
}

export interface SkillSuggestion {
  shortName: string
  fullName: string
  skillId: string
  category: "class" | "mystic" | "universal"
}

export interface QuickAddGroup {
  label: string
  skills: Array<{ shortName: string; skillId: string }>
}

export const QUICK_ADD_GROUPS_BY_CLASS: Record<string, QuickAddGroup[]> = {
  stonesplitStrength: [
    {
      label: "Mo",
      skills: [
        { shortName: "Mo Special", skillId: "stonesplitStrength-phalanxspecial" },
        { shortName: "Mo Charged", skillId: "stonesplitStrength-phalanxcharged-s3-innerpassion" },
        { shortName: "Mo QQ", skillId: "stonesplitStrength-phalanxq-soul" },
        { shortName: "Mo Dual", skillId: "stonesplitStrength-mo-blade-dual" },
      ],
    },
    {
      label: "Heng",
      skills: [
        { shortName: "Heng Special", skillId: "stonesplitStrength-snowpartingspecial" },
        { shortName: "Heng Special 6 Hit", skillId: "stonesplitStrength-snowpartingspecial-6hit" },
        { shortName: "Heng Q", skillId: "stonesplitStrength-snowpartingq-slash" },
        { shortName: "Heng Q2", skillId: "stonesplitStrength-snowpartingslide-reslide-prepull" },
        { shortName: "Heng Q Stab", skillId: "stonesplitStrength-snowpartingq-stab" },
        { shortName: "Heng Dual", skillId: "stonesplitStrength-snowpartingdual" },
        { shortName: "Heng VC", skillId: "stonesplitStrength-snowpartingvc" },
        { shortName: "Heng LC", skillId: "stonesplitStrength-snowpartingcharged-forgetfulness" },
      ],
    },
  ],
  bellstrikeUmbra: [
    {
      label: "Sword",
      skills: [
        { shortName: "Sword Charged", skillId: "bellstrikeUmbra-sword-charge-stage-1-4-hit" },
        { shortName: "Sword Special", skillId: "bellstrikeUmbra-swordspecial-3-hit" },
        { shortName: "Sword Q", skillId: "bellstrikeUmbra-swordq" },
        { shortName: "Sword QQ", skillId: "bellstrikeUmbra-swordqfollowup" },
        { shortName: "Sword QQQ", skillId: "bellstrikeUmbra-sword-martial-qqq" },
        {
          shortName: "Sword Followup",
          skillId: "bellstrikeUmbra-sword-r-charge-follow-up-1-hit-cancel",
        },
      ],
    },
    {
      label: "Spear",
      skills: [
        { shortName: "Spear Special", skillId: "bellstrikeUmbra-spearspecial-1-hit-cancel" },
        { shortName: "Spear Q", skillId: "bellstrikeUmbra-spearq-5-hit-cancel" },
        { shortName: "Crosswind", skillId: "bellstrikeUmbra-crosswind-blade-cancel" },
      ],
    },
  ],
  bellstrikeSplendor: [
    {
      label: "Sword",
      skills: [
        { shortName: "Sword Charged", skillId: "bellstrikeSplendor-swordheavycharged" },
        { shortName: "Sword Q", skillId: "bellstrikeSplendor-swordq" },
      ],
    },
    {
      label: "Spear",
      skills: [
        { shortName: "Spear Q", skillId: "bellstrikeSplendor-spearq" },
        { shortName: "Energy Surge", skillId: "bellstrikeSplendor-energysurge" },
      ],
    },
  ],
  silkbindJade: [
    {
      label: "Umbrella",
      skills: [
        { shortName: "Umbrella Q", skillId: "silkbindJade-umbq" },
        { shortName: "Umbrella Light Charged", skillId: "silkbindJade-umblightcharge" },
        { shortName: "Umbrella Heavy", skillId: "silkbindJade-umb-heavylight" },
        { shortName: "Colorful Phoenix", skillId: "silkbindJade-umbdronelaunch-20hit" },
      ],
    },
    {
      label: "Fan",
      skills: [
        { shortName: "Fan Special", skillId: "silkbindJade-fanspecial" },
        { shortName: "Fan Q", skillId: "silkbindJade-fanq" },
        { shortName: "Fan Light Charged", skillId: "silkbindJade-fanlightcharged" },
        { shortName: "Fan Heavy", skillId: "silkbindJade-fanheavypursuit-3-hit" },
      ],
    },
  ],
  bamboocutDraught: [
    {
      label: "Gauntlet & Brew",
      skills: [
        { shortName: "Flamelash", skillId: "bamboocutDraught-dragonquench-inebriate-cancel" },
        { shortName: "Hero's Blood", skillId: "bamboocutDraught-heros-blood" },
        { shortName: "Nightwick", skillId: "bamboocutDraught-nightwick-primepick" },
        { shortName: "Gauntlet Q", skillId: "bamboocutDraught-peakfall" },
        { shortName: "Drink", skillId: "bamboocutDraught-quick-drink-cancel" },
        { shortName: "Reveldrift", skillId: "bamboocutDraught-reveldrift-cancel" },
        { shortName: "Castlink", skillId: "bamboocutDraught-castlink" },
      ],
    },
  ],
}

export function getQuickAddGroups(
  classId: string,
  availableSuggestions: SkillSuggestion[],
): QuickAddGroup[] {
  const configured = QUICK_ADD_GROUPS_BY_CLASS[classId]
  if (configured && configured.length > 0) {
    return configured
  }

  return [
    {
      label: "Skills",
      skills: availableSuggestions.slice(0, 12).map((s) => ({
        shortName: s.shortName,
        skillId: s.skillId,
      })),
    },
  ]
}

export function getAvailableSkillSuggestions(
  classId: string,
  skillsById: Map<string, Skill>,
): SkillSuggestion[] {
  const suggestions: SkillSuggestion[] = []
  const seenShortNames = new Set<string>()

  // 1. Add canonical class skills
  const classCanonical = CANONICAL_SKILLS_BY_CLASS[classId] ?? {}
  for (const skillId of Object.values(classCanonical)) {
    const skill = skillsById.get(skillId)
    const shortName = getSkillShortName(skill, skillId)
    if (!seenShortNames.has(shortName.toLowerCase())) {
      seenShortNames.add(shortName.toLowerCase())
      suggestions.push({
        shortName,
        fullName: skill?.name || shortName,
        skillId,
        category: "class",
      })
    }
  }

  // 2. Add other class skills from skillsById
  for (const [id, skill] of skillsById) {
    if (id.startsWith(classId)) {
      const shortName = getSkillShortName(skill, id)
      if (!seenShortNames.has(shortName.toLowerCase())) {
        seenShortNames.add(shortName.toLowerCase())
        suggestions.push({
          shortName,
          fullName: skill.name || shortName,
          skillId: id,
          category: "class",
        })
      }
    }
  }

  // 3. Add common mystics and universals
  for (const skillId of Object.values(COMMON_MYSTIC_AND_UNIVERSAL)) {
    const skill = skillsById.get(skillId)
    const shortName = getSkillShortName(skill, skillId)
    if (!seenShortNames.has(shortName.toLowerCase())) {
      seenShortNames.add(shortName.toLowerCase())
      suggestions.push({
        shortName,
        fullName: skill?.name || shortName,
        skillId,
        category: skillId.startsWith("mystic-") ? "mystic" : "universal",
      })
    }
  }

  return suggestions
}

export interface ParsedRotationToken {
  raw: string
  cleanName: string
  multiplier: number
  skillId?: string
  skillName?: string
  valid: boolean
  error?: string
}

export interface ParseReadableRotationResult {
  tokens: ParsedRotationToken[]
  steps: RotationStep[]
  totalSteps: number
  validCount: number
  hasErrors: boolean
}

export function parseReadableRotation(
  text: string,
  classId: string,
  skillsById: Map<string, Skill>,
): ParseReadableRotationResult {
  const trimmed = text.trim()
  if (!trimmed) {
    return {
      tokens: [],
      steps: [],
      totalSteps: 0,
      validCount: 0,
      hasErrors: false,
    }
  }

  // Split by `>`, `->`, commas, or newlines
  const rawSegments = trimmed
    .split(/(?:\s*(?:>|->|\n|,)\s*)+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const tokens: ParsedRotationToken[] = []
  const steps: RotationStep[] = []
  const classCanonical = CANONICAL_SKILLS_BY_CLASS[classId] ?? {}

  const startIndex = rawSegments.findIndex((seg) => /\(start(?:\s+at\s+hit\s+\d+)?\)/i.test(seg))

  for (let i = 0; i < rawSegments.length; i++) {
    const raw = rawSegments[i]

    // Extract distance override e.g. "(5m)", "[5m]", "(5 m)", "(2m)", etc.
    let distanceMeters: number | undefined
    const distMatch = raw.match(/(?:\(|\[)\s*(\d+(?:\.\d+)?)\s*m\s*(?:\)|\])/i)
    if (distMatch) {
      const parsedDist = parseFloat(distMatch[1])
      if (Number.isFinite(parsedDist) && parsedDist >= 0 && parsedDist <= 40) {
        distanceMeters = parsedDist
      }
    }
    const withoutDist = raw.replace(/(?:\(|\[)\s*\d+(?:\.\d+)?\s*m\s*(?:\)|\])/gi, "").trim()

    // Extract multiplier e.g. "Mo Charged x3", "Mo Charged * 3", "Mo Charged ×3"
    let multiplier = 1
    let base = withoutDist
    const multiplierMatch = withoutDist.match(/\s*(?:[xX*×]\s*(\d+))\s*$/)
    if (multiplierMatch) {
      multiplier = Math.max(1, Math.min(100, parseInt(multiplierMatch[1], 10)))
      base = withoutDist.slice(0, multiplierMatch.index).trim()
    }

    // Strip tags: (start), (break), (start at hit 6), etc.
    const cleanName = base
      .replace(/\s*\((?:start|break|start at hit \d+|start\/break)[^)]*\)/gi, "")
      .trim()

    const normKey = cleanName.toLowerCase().replace(/\s+/g, " ")
    const isPrepull = startIndex >= 0 ? i < startIndex : i <= 4

    // Weapon swap token (e.g. Mo Swap, Heng Swap, Sword Swap, Weapon Swap)
    if (normKey.endsWith(" swap") || normKey === "weapon swap") {
      tokens.push({
        raw,
        cleanName,
        multiplier,
        skillId: `direct-swap-${classId}-${normKey.replace(" swap", "")}-${isPrepull ? "prepull" : "active"}`,
        skillName: cleanName,
        valid: true,
      })
      continue
    }

    // Match resolution:
    let resolvedSkillId: string | undefined

    // Check prepull specific variants for opening skills
    if (isPrepull) {
      if (classId === "stonesplitStrength") {
        if (
          normKey === "mo special" &&
          skillsById.has("stonesplitStrength-phalanxspecial-prepull")
        ) {
          resolvedSkillId = "stonesplitStrength-phalanxspecial-prepull"
        }
        if (normKey === "heng q" && skillsById.has("stonesplitStrength-snowpartingslide-prepull")) {
          resolvedSkillId = "stonesplitStrength-snowpartingslide-prepull"
        }
      }
      if (normKey === "flute cancel" && skillsById.has("mystic-flute-of-the-tides-prepull")) {
        resolvedSkillId = "mystic-flute-of-the-tides-prepull"
      }
    }

    // Support alias for "heng q2" outside prepull
    if (!resolvedSkillId && normKey === "heng q2") {
      resolvedSkillId = "stonesplitStrength-snowpartingslide-reslide-prepull"
    }

    // 1. Canonical class mapping
    if (!resolvedSkillId && classCanonical[normKey]) {
      resolvedSkillId = classCanonical[normKey]
    }

    // 2. Common mystic and universal mapping
    if (!resolvedSkillId && COMMON_MYSTIC_AND_UNIVERSAL[normKey]) {
      resolvedSkillId = COMMON_MYSTIC_AND_UNIVERSAL[normKey]
    }

    // 3. Search skillsById by short name
    if (!resolvedSkillId) {
      for (const [id, skill] of skillsById) {
        if (getSkillShortName(skill, id).toLowerCase() === normKey) {
          resolvedSkillId = id
          break
        }
      }
    }

    // 4. Search skillsById by full name
    if (!resolvedSkillId) {
      for (const [id, skill] of skillsById) {
        if (skill.name?.toLowerCase() === normKey) {
          resolvedSkillId = id
          break
        }
      }
    }

    // 5. Search skillsById by exact ID
    if (!resolvedSkillId) {
      if (skillsById.has(cleanName)) {
        resolvedSkillId = cleanName
      } else {
        const idLower = cleanName.toLowerCase()
        for (const id of skillsById.keys()) {
          if (id.toLowerCase() === idLower) {
            resolvedSkillId = id
            break
          }
        }
      }
    }

    if (resolvedSkillId) {
      const skill = skillsById.get(resolvedSkillId)
      const token: ParsedRotationToken = {
        raw,
        cleanName,
        multiplier,
        skillId: resolvedSkillId,
        skillName: skill?.name || cleanName,
        valid: true,
      }
      tokens.push(token)

      for (let m = 0; m < multiplier; m++) {
        steps.push({
          id: newStepId(),
          skillId: resolvedSkillId,
          ...(distanceMeters !== undefined ? { distanceMeters } : {}),
        })
      }
    } else {
      tokens.push({
        raw,
        cleanName,
        multiplier,
        valid: false,
        error: `Unknown skill: "${cleanName}"`,
      })
    }
  }

  const validCount = tokens.filter((t) => t.valid).length
  const hasErrors = tokens.some((t) => !t.valid)

  return {
    tokens,
    steps,
    totalSteps: steps.length,
    validCount,
    hasErrors,
  }
}
