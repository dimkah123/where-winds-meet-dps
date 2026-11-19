import { describe, expect, it } from "vitest"
import type { SkillTickResult } from "../../src/engine/types"
import { groupIntoInGameCategories } from "../../src/ui/utils/compactBreakdown"

function makeRow(patch: Partial<SkillTickResult>): SkillTickResult {
  return {
    name: "Skill",
    breakdownName: "Skill",
    breakdownKey: "content.skill.breakdown",
    type: "weapon",
    count: 1,
    expectedDamage: 100,
    percentOfTotal: 0.1,
    castCount: 1,
    ...patch,
  }
}

describe("groupIntoInGameCategories", () => {
  it("groups Burning Heart hits into a single category with sum of damages and hit count attempts", () => {
    const rows: SkillTickResult[] = [
      makeRow({
        name: "PhalanxCharged-S1",
        breakdownName: "PhalanxCharged-S1",
        count: 10,
        castCount: 10,
        expectedDamage: 500_000,
        percentOfTotal: 0.1,
      }),
      makeRow({
        name: "PhalanxCharged-S2",
        breakdownName: "PhalanxCharged-S2",
        count: 10,
        castCount: 10,
        expectedDamage: 1_000_000,
        percentOfTotal: 0.2,
      }),
      makeRow({
        name: "PhalanxCharged-S3[InnerPassion]",
        breakdownName: "PhalanxCharged-S3[InnerPassion]",
        count: 10,
        castCount: 0,
        expectedDamage: 2_000_000,
        percentOfTotal: 0.4,
      }),
    ]

    const grouped = groupIntoInGameCategories(rows, 60)
    expect(grouped).toHaveLength(1)
    const bh = grouped[0]
    expect(bh.categoryId).toBe("burningHeart")
    expect(bh.name).toBe("Burning Heart")
    expect(bh.expectedDamage).toBe(3_500_000)
    expect(bh.percentOfTotal).toBeCloseTo(0.7)
    expect(bh.dps).toBeCloseTo(3_500_000 / 60)
    expect(bh.attempt).toBe(30) // sum of hit counts, exactly as in-game Attempt column
    expect(bh.subSkills).toHaveLength(3)
    // Sorted by damage descending
    expect(bh.subSkills[0].name).toBe("PhalanxCharged-S3[InnerPassion]")
    expect(bh.subSkills[1].name).toBe("PhalanxCharged-S2")
    expect(bh.subSkills[2].name).toBe("PhalanxCharged-S1")
  })

  it("calculates soldiers' attempts as total hits matching in-game combat log", () => {
    const rows: SkillTickResult[] = [
      makeRow({
        name: "AnxiSoldierMoDown",
        breakdownName: "AnxiSoldierMoDown",
        count: 16,
        castCount: 0,
        expectedDamage: 187_000,
        percentOfTotal: 0.036,
      }),
      makeRow({
        name: "AnxiSoldierMoJump",
        breakdownName: "AnxiSoldierMoJump",
        count: 16,
        castCount: 0,
        expectedDamage: 338_000,
        percentOfTotal: 0.066,
      }),
      makeRow({
        name: "AnxiSoldierMoSweep (Supreme)",
        breakdownName: "AnxiSoldierMoSweep (Supreme)",
        count: 8,
        castCount: 0,
        expectedDamage: 111_000,
        percentOfTotal: 0.022,
      }),
    ]

    const grouped = groupIntoInGameCategories(rows, 60)
    expect(grouped).toHaveLength(1)
    const mo = grouped[0]
    expect(mo.categoryId).toBe("moSoldier")
    expect(mo.name).toBe("Mo Blade Anxi Soldier")
    expect(mo.attempt).toBe(40) // 16 + 16 + 8 hits
    expect(mo.expectedDamage).toBe(187_000 + 338_000 + 111_000)
    expect(mo.subSkills).toHaveLength(3)
  })

  it("groups Yi River ticks into Morale Chant category", () => {
    const rows: SkillTickResult[] = [
      makeRow({
        name: "Yi River",
        breakdownName: "Morale Chant",
        count: 5,
        castCount: 0,
        expectedDamage: 60_593,
        percentOfTotal: 0.012,
      }),
    ]

    const grouped = groupIntoInGameCategories(rows, 60)
    expect(grouped).toHaveLength(1)
    expect(grouped[0].categoryId).toBe("moraleChant")
    expect(grouped[0].name).toBe("Morale Chant")
    expect(grouped[0].attempt).toBe(5)
    expect(grouped[0].expectedDamage).toBe(60_593)
  })

  it("separates Fire - Solid Foundation from Divinecraft - Fire", () => {
    const rows: SkillTickResult[] = [
      makeRow({
        name: "Divinecraft - Fire",
        breakdownName: "Divinecraft - Fire",
        count: 60,
        castCount: 0,
        expectedDamage: 79_124,
        percentOfTotal: 0.015,
      }),
      makeRow({
        name: "Divinecraft - Fire Explosion",
        breakdownName: "Divinecraft - Fire Explosion",
        count: 6,
        castCount: 0,
        expectedDamage: 12_014,
        percentOfTotal: 0.002,
      }),
    ]

    const grouped = groupIntoInGameCategories(rows, 60)
    expect(grouped).toHaveLength(2)
    expect(grouped[0].categoryId).toBe("divinecraftFire")
    expect(grouped[0].name).toBe("Divinecraft - Fire")
    expect(grouped[0].attempt).toBe(60)
    expect(grouped[1].categoryId).toBe("fireSolidFoundation")
    expect(grouped[1].name).toBe("Fire - Solid Foundation")
    expect(grouped[1].attempt).toBe(6)
  })

  it("handles uncategorized skills gracefully by stripping modifiers and keeping them cleanly grouped", () => {
    const rows: SkillTickResult[] = [
      makeRow({
        name: "CustomSkill[Hit1]",
        breakdownName: "CustomSkill[Hit1]",
        count: 3,
        castCount: 1,
        expectedDamage: 50_000,
        percentOfTotal: 0.05,
      }),
      makeRow({
        name: "CustomSkill[Hit2]",
        breakdownName: "CustomSkill[Hit2]",
        count: 3,
        castCount: 0,
        expectedDamage: 50_000,
        percentOfTotal: 0.05,
      }),
    ]

    const grouped = groupIntoInGameCategories(rows, 60)
    expect(grouped).toHaveLength(1)
    expect(grouped[0].name).toBe("CustomSkill")
    expect(grouped[0].expectedDamage).toBe(100_000)
    expect(grouped[0].attempt).toBe(6) // 3 + 3 hits
    expect(grouped[0].subSkills).toHaveLength(2)
  })

  it("preserves distinct skillKey on subskills when sharing identical breakdownName and breakdownKey", () => {
    const rows: SkillTickResult[] = [
      makeRow({
        name: "Flute Ripple (DoT)",
        breakdownName: "Flute Chanting a Thousand Waves",
        breakdownKey: "content.debuff.debuff-mystic-flute-ripple.breakdown",
        skillKey: "content.debuff.debuff-mystic-flute-ripple",
        count: 10,
        expectedDamage: 218_000,
        percentOfTotal: 0.042,
      }),
      makeRow({
        name: "Flute of the Tides Cancel",
        breakdownName: "Flute Chanting a Thousand Waves",
        breakdownKey: "content.skill.mystic-flute-of-the-tides-cancel.breakdown",
        skillKey: "content.skill.mystic-flute-of-the-tides-cancel",
        count: 1,
        expectedDamage: 22_000,
        percentOfTotal: 0.004,
      }),
    ]

    const grouped = groupIntoInGameCategories(rows, 60)
    expect(grouped).toHaveLength(1)
    const flute = grouped[0]
    expect(flute.categoryId).toBe("flute")
    expect(flute.name).toBe("Flute Chanting a Thousand Waves")
    expect(flute.attempt).toBe(11) // 10 + 1 hits
    expect(flute.subSkills).toHaveLength(2)

    // Verify subSkills have distinct nameKeys for proper localization display
    expect(flute.subSkills[0].name).toBe("Flute Ripple (DoT)")
    expect(flute.subSkills[0].nameKey).toBe("content.debuff.debuff-mystic-flute-ripple")

    expect(flute.subSkills[1].name).toBe("Flute of the Tides Cancel")
    expect(flute.subSkills[1].nameKey).toBe("content.skill.mystic-flute-of-the-tides-cancel")
  })
})
