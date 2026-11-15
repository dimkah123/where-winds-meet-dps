import type { Result } from "../../../engine/types"
import type { Rotation, RotationStep } from "../../../engine/rotation"
import type { Skill } from "../../../engine/skill"

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
  "stonesplitStrength-mo-blade-dual": "Mo Tab",
  "stonesplitStrength-mo-light-attack-1": "Mo A1",
  "stonesplitStrength-mo-light-attack-2": "Mo A2",
  "stonesplitStrength-mo-light-attack-3": "Mo A3",
  "stonesplitStrength-anxisoldiermodown": "Mo Down",
  "stonesplitStrength-anxisoldiermojump": "Mo Jump",
  "stonesplitStrength-anxisoldiermosweep": "Mo Sweep",
  "stonesplitStrength-anxisoldiermosweep-supreme": "Mo Sweep",

  // Stonesplit Strength — Snowparting
  "stonesplitStrength-snowpartingspecial": "Heng Special",
  "stonesplitStrength-snowpartingq-stab": "Heng Q Stab",
  "stonesplitStrength-snowpartingq-slash": "Heng Q",
  "stonesplitStrength-snowpartingq": "Heng Q",
  "stonesplitStrength-snowpartingslide": "Heng Q",
  "stonesplitStrength-snowpartingslide-prepull": "Heng Q",
  "stonesplitStrength-snowpartingslide-reslide-prepull": "Heng Q2",
  "stonesplitStrength-snowpartingslide-prepull-hit": "Heng Q",
  "stonesplitStrength-snowpartingdual": "Heng Tab",
  "stonesplitStrength-snowpartingdual-prepull": "Heng Tab",
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
    const rawName = skill.name
      .replace(/\s*(prepull|pre-pull|\[prepull\]|\[pre-pull\])/gi, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .trim()
    if (SKILL_SHORT_NAMES[rawName]) return SKILL_SHORT_NAMES[rawName]
    return rawName || skill.name
  }
  return key
}

function hitDealsDamage(h: { physMultiplier?: number; attributeMultiplier?: number; physFixed?: number; attributeFixed?: number }): boolean {
  return (h.physMultiplier ?? 0) > 0 || (h.attributeMultiplier ?? 0) > 0 || (h.physFixed ?? 0) > 0 || (h.attributeFixed ?? 0) > 0
}

export function readableRotationText(
  rotation: Rotation | undefined,
  result: Result | undefined,
  skillsById: Map<string, Skill>,
): string {
  const steps = rotation?.steps ?? []
  const casts = (result?.casts ?? []).filter((c) => !c.stepId.startsWith("swap-") && !c.stepId.startsWith("direct-swap-"))

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
    const skillId =
      stepSkillIdMap.get(cast.stepId) ||
      (cast.stepIndex !== undefined && steps[cast.stepIndex]?.skillId) ||
      cast.fallbackFromSkillId ||
      ""
    const skill =
      skillsById.get(skillId) ||
      skillsByName.get(cast.skillName) ||
      (cast.skillName ? ({ id: skillId, name: cast.skillName } as Skill) : undefined)
    const name = getSkillShortName(skill, skillId)

    if (i === startCastIndex) {
      // Fight start cast
      if (skill?.hits && skill.hits.length > 0) {
        const startFrame = Math.round(cast.timeSec * 60)
        const fightStartFrame = Math.round(anchorTime * 60)
        const hitIndex = skill.hits.findIndex((h) => Math.abs(startFrame + h.frame - fightStartFrame) <= 3)
        if (hitIndex >= 0) {
          const hitNumber = skill.hits.slice(0, hitIndex + 1).filter((h) => hitDealsDamage(h)).length
          if (hitNumber > 1) {
            entries.push(`${name} (start at hit ${hitNumber})`)
            continue
          }
        }
      }
      entries.push(`${name} (start)`)
      continue
    }

    if (breakCastStepIds.has(cast.stepId)) {
      entries.push(`${name} (break)`)
      continue
    }

    entries.push(name)
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
  const entries = steps
    .filter((step) => Boolean(step.skillId))
    .map((step) => {
      const skill = skillsById.get(step.skillId)
      return getSkillShortName(skill, step.skillId)
    })
  const groups = entries.reduce<Array<{ text: string; count: number }>>((acc, text) => {
    const prev = acc[acc.length - 1]
    if (prev?.text === text) prev.count += 1
    else acc.push({ text, count: 1 })
    return acc
  }, [])
  return groups.map(({ text, count }) => (count > 1 ? `${text} x${count}` : text)).join(" > ")
}
