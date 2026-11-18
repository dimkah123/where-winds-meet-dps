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
  it("groups Burning Heart hits into a single category with sum of damages and attempts", () => {
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
    expect(bh.attempt).toBe(20) // sum of castCounts
    expect(bh.subSkills).toHaveLength(3)
    // Sorted by damage descending
    expect(bh.subSkills[0].name).toBe("PhalanxCharged-S3[InnerPassion]")
    expect(bh.subSkills[1].name).toBe("PhalanxCharged-S2")
    expect(bh.subSkills[2].name).toBe("PhalanxCharged-S1")
  })

  it("calculates soldiers' attempts from max wave count when castCount is zero", () => {
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
    expect(mo.attempt).toBe(16)
    expect(mo.expectedDamage).toBe(187_000 + 338_000 + 111_000)
    expect(mo.subSkills).toHaveLength(3)
  })

  it("categorizes Flute and Snowbreak Spring accurately", () => {
    const rows: SkillTickResult[] = [
      makeRow({
        name: "Flute Chanting a Thousand Waves",
        breakdownName: "Flute Chanting a Thousand Waves",
        count: 11,
        castCount: 6,
        expectedDamage: 235_000,
        percentOfTotal: 0.046,
      }),
      makeRow({
        name: "SnowpartingVC",
        breakdownName: "SnowpartingVC",
        count: 4,
        castCount: 2,
        expectedDamage: 192_000,
        percentOfTotal: 0.037,
      }),
    ]

    const grouped = groupIntoInGameCategories(rows, 60)
    expect(grouped).toHaveLength(2)
    expect(grouped[0].categoryId).toBe("flute")
    expect(grouped[0].attempt).toBe(6)
    expect(grouped[1].categoryId).toBe("snowbreakSpring")
    expect(grouped[1].attempt).toBe(2)
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
    expect(grouped[0].attempt).toBe(1)
    expect(grouped[0].subSkills).toHaveLength(2)
  })
})
