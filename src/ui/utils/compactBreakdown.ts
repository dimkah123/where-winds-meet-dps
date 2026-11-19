import { breakdownNameOf } from "../../engine/skill"
import type { SkillTickResult } from "../../engine/types"

export interface CompactSubSkill {
  name: string
  nameKey: string
  count: number
  castCount: number
  expectedDamage: number
  percentOfTotal: number
  dps: number
}

export interface CompactBreakdownRow {
  categoryId: string
  name: string
  nameKey: string
  attempt: number
  expectedDamage: number
  percentOfTotal: number
  dps: number
  subSkills: CompactSubSkill[]
}

interface CategoryRule {
  id: string
  nameKey: string
  fallbackName: string
  match: (name: string, breakdownName: string) => boolean
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    id: "burningHeart",
    nameKey: "rotation.breakdown.cat.burningHeart",
    fallbackName: "Burning Heart",
    match: (name, bd) =>
      /phalanxcharged/i.test(name) ||
      /burning\s*heart/i.test(name) ||
      /burning\s*heart/i.test(bd) ||
      /пылающее\s*сердце/i.test(bd),
  },
  {
    id: "moSoldier",
    nameKey: "rotation.breakdown.cat.moSoldier",
    fallbackName: "Mo Blade Anxi Soldier",
    match: (name, bd) =>
      /anxisoldiermo/i.test(name) || /солдат.*мо/i.test(bd) || /mo.*anxi/i.test(bd),
  },
  {
    id: "hengSoldier",
    nameKey: "rotation.breakdown.cat.hengSoldier",
    fallbackName: "Heng Blade Anxi Soldier",
    match: (name, bd) =>
      /anxisoldierheng/i.test(name) || /солдат.*хэн/i.test(bd) || /heng.*anxi/i.test(bd),
  },
  {
    id: "flute",
    nameKey: "rotation.breakdown.cat.flute",
    fallbackName: "Flute Chanting a Thousand Waves",
    match: (name, bd) => /flute/i.test(name) || /flute/i.test(bd) || /флейта/i.test(bd),
  },
  {
    id: "snowbreakSpring",
    nameKey: "rotation.breakdown.cat.snowbreakSpring",
    fallbackName: "Snowbreak Spring",
    match: (name, bd) =>
      /snowpartingvc/i.test(name) ||
      /snowbreak/i.test(name) ||
      /snowbreak/i.test(bd) ||
      /в поисках весны/i.test(bd) ||
      /весенний излом/i.test(bd),
  },
  {
    id: "fleetingTrace",
    nameKey: "rotation.breakdown.cat.fleetingTrace",
    fallbackName: "Fleeting Trace",
    match: (name, bd) =>
      /snowpartingspecial/i.test(name) ||
      /fleeting/i.test(name) ||
      /ступая по снегу/i.test(bd) ||
      /мимолётный/i.test(bd),
  },
  {
    id: "generalsBaneStab",
    nameKey: "rotation.breakdown.cat.generalsBaneStab",
    fallbackName: "General's Bane: Stab",
    match: (name, bd) =>
      /snowpartingq-stab/i.test(name) ||
      /general.*stab/i.test(name) ||
      /погибель.*укол/i.test(bd) ||
      /гибель.*укол/i.test(bd) ||
      /погибель.*колющ/i.test(bd),
  },
  {
    id: "generalsBaneSlash",
    nameKey: "rotation.breakdown.cat.generalsBaneSlash",
    fallbackName: "General's Bane: Slash",
    match: (name, bd) =>
      /snowpartingq-slash/i.test(name) ||
      /general.*slash/i.test(name) ||
      /погибель.*удар/i.test(bd) ||
      /гибель.*удар/i.test(bd) ||
      /погибель.*рубящ/i.test(bd),
  },
  {
    id: "burstingNine",
    nameKey: "rotation.breakdown.cat.burstingNine",
    fallbackName: "Bursting Nine",
    match: (name, bd) => /bursting/i.test(name) || /разрывающий/i.test(bd),
  },
  {
    id: "fireSolidFoundation",
    nameKey: "rotation.breakdown.cat.fireSolidFoundation",
    fallbackName: "Fire - Solid Foundation",
    match: (name, bd) =>
      /fire\s*explosion/i.test(name) ||
      /solid\s*foundation/i.test(name) ||
      /divinecraft.*взрыв/i.test(bd) ||
      /solid\s*foundation/i.test(bd),
  },
  {
    id: "divinecraftFire",
    nameKey: "rotation.breakdown.cat.divinecraftFire",
    fallbackName: "Divinecraft - Fire",
    match: (name, bd) =>
      /divinecraft.*fire/i.test(name) ||
      /divinecraft.*огонь/i.test(bd) ||
      /мастерство.*огонь/i.test(bd),
  },
  {
    id: "graveFrost",
    nameKey: "rotation.breakdown.cat.graveFrost",
    fallbackName: "Grave Frost",
    match: (name, bd) =>
      /snowpartingcharged/i.test(name) ||
      /gravefrost/i.test(name) ||
      /гробовой мороз/i.test(bd) ||
      /морозная могила/i.test(bd),
  },
  {
    id: "totalAnnihilationSoul",
    nameKey: "rotation.breakdown.cat.totalAnnihilationSoul",
    fallbackName: "Total Annihilation - Soul",
    match: (name, bd) =>
      /phalanxq.*soul/i.test(name) || /total.*soul/i.test(name) || /уничтожение.*душа/i.test(bd),
  },
  {
    id: "totalAnnihilationSupreme",
    nameKey: "rotation.breakdown.cat.totalAnnihilationSupreme",
    fallbackName: "Total Annihilation - Supreme",
    match: (name, bd) =>
      /phalanxq.*supreme/i.test(name) ||
      /total.*supreme/i.test(name) ||
      /уничтожение.*высш/i.test(bd),
  },
  {
    id: "totalAnnihilation",
    nameKey: "rotation.breakdown.cat.totalAnnihilation",
    fallbackName: "Total Annihilation",
    match: (name, bd) =>
      /phalanxq/i.test(name) || /total.*annihilation/i.test(name) || /полное уничтожение/i.test(bd),
  },
  {
    id: "moraleChant",
    nameKey: "rotation.breakdown.cat.moraleChant",
    fallbackName: "Morale Chant",
    match: (name, bd) =>
      /morale/i.test(name) ||
      /yi\s*river/i.test(name) ||
      /morale/i.test(bd) ||
      /yi\s*river/i.test(bd) ||
      /песнь боевого духа/i.test(bd) ||
      /боевой клич/i.test(bd) ||
      /боевой напев/i.test(bd),
  },
  {
    id: "slide",
    nameKey: "rotation.breakdown.cat.slide",
    fallbackName: "Slide",
    match: (name, bd) => /slide/i.test(name) || /скольжение/i.test(bd),
  },
  {
    id: "dualWeapon",
    nameKey: "rotation.breakdown.cat.dualWeapon",
    fallbackName: "Dual-Weapon Skill",
    match: (name, bd) =>
      /dual/i.test(name) || /парное оружие/i.test(bd) || /двойное оружие/i.test(bd),
  },
  {
    id: "legionSummoner",
    nameKey: "rotation.breakdown.cat.legionSummoner",
    fallbackName: "Legion Summoner",
    match: (name, bd) =>
      /phalanxspecial/i.test(name) ||
      /призыватель легиона/i.test(bd) ||
      /legion summoner/i.test(bd),
  },
]

export function groupIntoInGameCategories(
  rows: SkillTickResult[],
  rotationDuration: number,
): CompactBreakdownRow[] {
  const categoryBuckets = new Map<
    string,
    {
      rule: CategoryRule
      items: SkillTickResult[]
    }
  >()
  const uncategorized = new Map<string, SkillTickResult[]>()

  for (const row of rows) {
    const rawName = row.name
    const bdName = breakdownNameOf(row.breakdownName, row.name)

    const matchedRule = CATEGORY_RULES.find((rule) => rule.match(rawName, bdName))
    if (matchedRule) {
      const bucket = categoryBuckets.get(matchedRule.id) ?? {
        rule: matchedRule,
        items: [],
      }
      bucket.items.push(row)
      categoryBuckets.set(matchedRule.id, bucket)
    } else {
      const cleanName = rawName.replace(/\[.*?\]|\(.*?\)|-S\d+/g, "").trim() || rawName
      const items = uncategorized.get(cleanName) ?? []
      items.push(row)
      uncategorized.set(cleanName, items)
    }
  }

  const resultRows: CompactBreakdownRow[] = []

  for (const { rule, items } of categoryBuckets.values()) {
    const expectedDamage = items.reduce((sum, i) => sum + i.expectedDamage, 0)
    const percentOfTotal = items.reduce((sum, i) => sum + i.percentOfTotal, 0)
    const dps = rotationDuration > 0 ? expectedDamage / rotationDuration : 0

    // In-game "Attempt" column represents the total hit count of the skill / category:
    const attempt = items.reduce((sum, i) => sum + i.count, 0)

    const subSkills: CompactSubSkill[] = items
      .map((i) => ({
        name: i.name,
        nameKey: i.skillKey || i.breakdownKey,
        count: i.count,
        castCount: i.castCount ?? 0,
        expectedDamage: i.expectedDamage,
        percentOfTotal: i.percentOfTotal,
        dps: rotationDuration > 0 ? i.expectedDamage / rotationDuration : 0,
      }))
      .sort((a, b) => b.expectedDamage - a.expectedDamage)

    resultRows.push({
      categoryId: rule.id,
      name: rule.fallbackName,
      nameKey: rule.nameKey,
      attempt,
      expectedDamage,
      percentOfTotal,
      dps,
      subSkills,
    })
  }

  for (const [cleanName, items] of uncategorized.entries()) {
    const expectedDamage = items.reduce((sum, i) => sum + i.expectedDamage, 0)
    const percentOfTotal = items.reduce((sum, i) => sum + i.percentOfTotal, 0)
    const dps = rotationDuration > 0 ? expectedDamage / rotationDuration : 0

    const attempt = items.reduce((sum, i) => sum + i.count, 0)

    const subSkills: CompactSubSkill[] = items
      .map((i) => ({
        name: i.name,
        nameKey: i.skillKey || i.breakdownKey,
        count: i.count,
        castCount: i.castCount ?? 0,
        expectedDamage: i.expectedDamage,
        percentOfTotal: i.percentOfTotal,
        dps: rotationDuration > 0 ? i.expectedDamage / rotationDuration : 0,
      }))
      .sort((a, b) => b.expectedDamage - a.expectedDamage)

    resultRows.push({
      categoryId: `uncat-${cleanName}`,
      name: cleanName,
      nameKey: items[0]?.breakdownKey || cleanName,
      attempt,
      expectedDamage,
      percentOfTotal,
      dps,
      subSkills,
    })
  }

  return resultRows.sort((a, b) => b.expectedDamage - a.expectedDamage)
}
