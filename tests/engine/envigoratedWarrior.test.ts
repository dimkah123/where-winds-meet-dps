import { describe, expect, it } from "vitest"
import { INNER_WAY_ID, INNER_WAY_LADDER } from "../../src/data/innerWays/ids"
import { INNER_WAY_LADDERS } from "../../src/data/innerWays/breakthroughLadders"
import { INNER_WAYS, innerWayDefinition } from "../../src/definitions/innerWays/registry"
import { PASSIVE_ID_TO_INNER_WAY } from "../../src/data/innerWays/passiveIds"
import { BUFF, PARAM } from "../../src/data/skills/buffs/ids"
import { getMindMethodContributions } from "../../src/definitions/baseStats"
import { defaultInputs, emptyMindMethod } from "../../src/engine/defaults"
import { classDefinition } from "../../src/definitions/classes/registry"
import { buffEngineWith } from "../helpers/qiBars"
import { buffDefsForClass } from "../../src/engine/buffs/data"
import { makeSkill, makeHit } from "../../src/engine/skill"
import { makeRotation, makeStep } from "../../src/engine/rotation"
import { runEngine } from "../../src/engine/dps"
import { withDerivedStats } from "../../src/engine/derivedInputs"
import type { StatusView } from "../../src/engine/ledger"
import type { Inputs } from "../../src/engine/types"

const CLASS = "stonesplitStrength"

function mindMethodsWith(tier: number): Inputs["mindMethods"] {
  return [
    { id: INNER_WAY_ID.envigoratedWarrior, name: "Envigorated Warrior", stacks: `tier ${tier}` },
    emptyMindMethod,
    emptyMindMethod,
    emptyMindMethod,
  ]
}

const UNSLOTTED: Inputs["mindMethods"] = [
  emptyMindMethod,
  emptyMindMethod,
  emptyMindMethod,
  emptyMindMethod,
]

describe("Envigorated Warrior — registry and definition", () => {
  it("is registered in INNER_WAYS with expected metadata", () => {
    const fromBarrel = INNER_WAYS.find((candidate) => candidate.id === INNER_WAY_ID.envigoratedWarrior)
    expect(fromBarrel).toBeDefined()
    const def = innerWayDefinition(INNER_WAY_ID.envigoratedWarrior)
    expect(def).toBeDefined()
    expect(def).toBe(fromBarrel)
    expect(def?.name).toBe("Envigorated Warrior")
    expect(def?.selectableTiers).toEqual([6, 5, 4, 3, 2, 1])
    expect(def?.confirmedBreakthrough).toBe(21)
    expect(def?.buffParam).toBe(PARAM.envigoratedWarrior)
  })

  it("is mapped in PASSIVE_ID_TO_INNER_WAY with passive ID 41", () => {
    expect(PASSIVE_ID_TO_INNER_WAY["41"]).toBe(INNER_WAY_ID.envigoratedWarrior)
  })

  it("is allowed in stonesplit-strength, bamboocut-draught, and silkbind-jade", () => {
    for (const classId of ["stonesplitStrength", "bamboocutDraught", "silkbindJade"]) {
      const def = classDefinition(classId)
      expect(def?.allowedMindMethods).toContain(INNER_WAY_ID.envigoratedWarrior)
    }
  })
})

describe("Envigorated Warrior — stat scaling across breakthroughs and tiers", () => {
  function contributions(breakthrough: number, tier: number) {
    return getMindMethodContributions({
      ...defaultInputs,
      classId: CLASS,
      breakthrough,
      mindMethods: mindMethodsWith(tier),
    })
  }

  it("does not grant weaponAttackMin ladder bonus below tier 2", () => {
    const atTier1 = contributions(17, 1)
    expect(atTier1["phys.min"] ?? 0).toBe(0)
  })

  it("grants weaponAttackMinFourStar ladder values from tier 2 across breakthroughs", () => {
    const testCases: [number, number][] = [
      [12, 42.3],
      [13, 49.3],
      [14, 57.5],
      [15, 63.8],
      [16, 66.9],
      [17, 70.1],
      [18, 75.6],
      [19, 81.6],
      [20, 88],
      [21, 95],
    ]
    for (const [breakthrough, expectedMinPhys] of testCases) {
      const atTier2 = contributions(breakthrough, 2)
      expect(atTier2["phys.min"]).toBeCloseTo(expectedMinPhys, 10)
      expect(atTier2["phys.min"]).toBeCloseTo(
        INNER_WAY_LADDERS[INNER_WAY_LADDER.weaponAttackMinFourStar][breakthrough]["phys.min"]!,
        10,
      )
    }
  })

  it("does not grant physical penetration below tier 5", () => {
    for (const tier of [1, 2, 3, 4]) {
      const result = contributions(21, tier)
      expect(result["phys.penetration"] ?? 0).toBe(0)
    }
  })

  it("grants 0.051 physical penetration from tier 5 onward", () => {
    for (const tier of [5, 6]) {
      const atBreakthrough16 = contributions(16, tier)
      const atBreakthrough21 = contributions(21, tier)
      expect(atBreakthrough16["phys.penetration"]).toBeCloseTo(0.051, 10)
      expect(atBreakthrough21["phys.penetration"]).toBeCloseTo(0.051, 10)
    }
  })
})

describe("Envigorated Warrior — buff engine and effects", () => {
  const probeSkill = makeSkill(CLASS, {
    name: "Probe Skill",
    castFrames: 60,
    hits: [makeHit({ frame: 0, physMultiplier: 1, physFixed: 1000 })],
  })

  function makeStatusView(disabled: boolean): StatusView {
    return {
      activeIdsAt: () => (disabled ? [BUFF.envigoratedDisabled] : []),
      isActiveAt: (id) => (disabled ? id === BUFF.envigoratedDisabled : false),
      stacksAt: (id) => (disabled && id === BUFF.envigoratedDisabled ? 1 : 0),
      conditionStacksAt: () => 0,
      remainingFramesAt: () => undefined,
      framesSinceLastEnd: () => undefined,
      framesSinceStacksBelowThreshold: () => undefined,
      frameStacksLastReachedThreshold: () => undefined,
      windowsOf: () => [],
    }
  }

  function allDamageBoostAt(tier: number, disabled = false): number {
    const engine = buffEngineWith(
      {
        classId: CLASS,
        [PARAM.envigoratedWarrior]: true,
        [`${PARAM.envigoratedWarrior}Tier`]: tier,
      },
      buffDefsForClass(CLASS),
    )
    engine.attachStatuses({ view: makeStatusView(disabled), fps: 60 })
    const site = engine.calculateDamageEffects(probeSkill, 1, [], 0)
    return site.effects
      .filter((effect) => effect.statKey === "allDamageBoost")
      .reduce((sum, effect) => sum + effect.amount, 0)
  }

  it("applies +5% allDamageBoost at tier 1 to tier 3 when active", () => {
    for (const tier of [1, 2, 3]) {
      expect(allDamageBoostAt(tier)).toBeCloseTo(0.05, 6)
    }
  })

  it("applies +8% allDamageBoost at tier 4 to tier 6 when active", () => {
    for (const tier of [4, 5, 6]) {
      expect(allDamageBoostAt(tier)).toBeCloseTo(0.08, 6)
    }
  })

  it("suppresses allDamageBoost when envigoratedDisabled is active", () => {
    expect(allDamageBoostAt(1, true)).toBeCloseTo(0, 6)
    expect(allDamageBoostAt(4, true)).toBeCloseTo(0, 6)
    expect(allDamageBoostAt(6, true)).toBeCloseTo(0, 6)
  })

  it("raises simulated damage and DPS through runEngine: tier 6 > tier 4 > tier 3 > tier 1 > unslotted", () => {
    function run(mindMethods: Inputs["mindMethods"]) {
      return runEngine(
        withDerivedStats({
          ...defaultInputs,
          classId: CLASS,
          breakthrough: 21,
          mindMethods,
          activeCustomRotation: makeRotation(CLASS, {
            steps: [makeStep({ skillId: probeSkill.id })],
            fixedWindowSec: 2,
          }),
          customSkills: [probeSkill],
        }),
      )
    }

    const unslottedResult = run(UNSLOTTED)
    const tier1Result = run(mindMethodsWith(1))
    const tier3Result = run(mindMethodsWith(3))
    const tier4Result = run(mindMethodsWith(4))
    const tier6Result = run(mindMethodsWith(6))

    expect(unslottedResult.totalDamage).toBeGreaterThan(0)
    expect(unslottedResult.dps).toBeGreaterThan(0)
    expect(tier1Result.dps).toBeGreaterThan(unslottedResult.dps)
    expect(tier3Result.dps).toBeGreaterThan(tier1Result.dps) // tier 2 adds minPhys ladder
    expect(tier4Result.dps).toBeGreaterThan(tier3Result.dps) // tier 4 bumps damage boost from 5% to 8%
    expect(tier6Result.dps).toBeGreaterThan(tier4Result.dps) // tier 5 adds 5.1% phys.penetration
  })
})
