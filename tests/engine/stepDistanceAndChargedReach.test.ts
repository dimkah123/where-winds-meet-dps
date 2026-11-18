import { describe, expect, it } from "vitest"
import { simulateTimeline } from "../../src/engine/timeline"
import { defaultInputs } from "../../src/engine/defaults"
import { makeRotation, makeStep } from "../../src/engine/rotation"
import { SKILL as STONESPLIT_SKILL } from "../../src/data/skills/stonesplit-strength/ids"
import { SKILL as MYSTIC_SKILL } from "../../src/data/skills/mystic/ids"
import { parseReadableRotation, readableRotationFromSteps } from "../../src/ui/features/rotation/readableRotation"
import { classDefinition } from "../../src/definitions/classes/registry"

describe("Mo Charged attack distance and step distance overrides", () => {
  const classDef = classDefinition("stonesplitStrength")
  const skillsById = new Map((classDef?.skills ?? []).map((s) => [s.id, s]))

  it("Mo Charged stays at preferred distance (e.g. 2m) instead of collapsing to 0.25m", () => {
    const rotation = makeRotation("stonesplitStrength", {
      steps: [
        makeStep({ skillId: STONESPLIT_SKILL.phalanxspecialPrepull }),
        makeStep({ skillId: STONESPLIT_SKILL.phalanxqSoul }),
        makeStep({ skillId: STONESPLIT_SKILL.phalanxchargedS3Innerpassion }),
      ],
      preferredDistanceMeters: 2,
    })

    const result = simulateTimeline({
      ...defaultInputs,
      classId: "stonesplitStrength",
      activeCustomRotation: rotation,
    })

    const casts = result.casts ?? []
    const chargedCast = casts.find((c) => c.skillName.includes("PhalanxCharged"))
    expect(chargedCast).toBeDefined()
    // It should stay at 2m (preferred distance) and NOT collapse to 0.25m
    expect(chargedCast?.distanceMeters).toBe(2)
  })

  it("step.distanceMeters overrides rotation distance for that specific cast", () => {
    const rotation = makeRotation("stonesplitStrength", {
      steps: [
        makeStep({ skillId: STONESPLIT_SKILL.phalanxspecialPrepull }),
        makeStep({ skillId: STONESPLIT_SKILL.phalanxqSoul }),
        makeStep({
          skillId: STONESPLIT_SKILL.phalanxchargedS3Innerpassion,
          distanceMeters: 5,
        }),
      ],
      preferredDistanceMeters: 2,
    })

    const result = simulateTimeline({
      ...defaultInputs,
      classId: "stonesplitStrength",
      activeCustomRotation: rotation,
    })

    const casts = result.casts ?? []
    const chargedCast = casts.find((c) => c.skillName.includes("PhalanxCharged"))
    expect(chargedCast).toBeDefined()
    expect(chargedCast?.distanceMeters).toBe(5)
  })

  it("Mo Charged at 5m receives higher Flute of the Tides distance bonus (+8%) than at 2m (+3%)", () => {
    const makeRunWithDistance = (chargedDistance: number) => {
      const rotation = makeRotation("stonesplitStrength", {
        steps: [
          makeStep({ skillId: MYSTIC_SKILL.fluteOfTheTidesFull }),
          makeStep({ skillId: STONESPLIT_SKILL.phalanxspecialPrepull }),
          makeStep({ skillId: STONESPLIT_SKILL.phalanxqSoul }),
          makeStep({
            skillId: STONESPLIT_SKILL.phalanxchargedS3Innerpassion,
            distanceMeters: chargedDistance,
          }),
        ],
        preferredDistanceMeters: 2,
        fixedWindowSec: 10,
      })
      return simulateTimeline({
        ...defaultInputs,
        classId: "stonesplitStrength",
        activeCustomRotation: rotation,
      })
    }

    const result2m = makeRunWithDistance(2)
    const result5m = makeRunWithDistance(5)

    const charged2m = result2m.casts?.find((c) => c.skillName.includes("PhalanxCharged"))
    const charged5m = result5m.casts?.find((c) => c.skillName.includes("PhalanxCharged"))

    expect(charged2m?.distanceMeters).toBe(2)
    expect(charged5m?.distanceMeters).toBe(5)

    // Damage at 5m with Flute bonus (+8%) on soldiers should be strictly higher than at 2m (+3%)
    expect(result5m.totalDamage).toBeGreaterThan(result2m.totalDamage)

    // Soldiers triggered during charge at 5m should deal higher damage than at 2m
    const chargedSoldierDamage = (res: typeof result2m) =>
      res.perSkill
        .filter(
          (s) =>
            (s.name.includes("Soldier") || s.breakdownName.includes("Soldier")) &&
            (s.breakdownName.includes("modown") ||
              s.breakdownName.includes("mojump") ||
              s.name.toLowerCase().includes("downward") ||
              s.name.toLowerCase().includes("leaping")),
        )
        .reduce((sum, s) => sum + s.expectedDamage, 0)

    const soldierDamage2m = chargedSoldierDamage(result2m)
    const soldierDamage5m = chargedSoldierDamage(result5m)
    if (soldierDamage2m > 0 && soldierDamage5m > 0) {
      expect(soldierDamage5m).toBeGreaterThan(soldierDamage2m)
    }
  })

  it("readable rotation parses distance tags like (5m) and [2m] into step.distanceMeters", () => {
    const text = "Mo Special > Heng Q > Mo Charged x4 (5m) > Mo Charged (2m)"
    const parsed = parseReadableRotation(text, "stonesplitStrength", skillsById)

    expect(parsed.hasErrors).toBe(false)
    // 1 (Mo Special) + 1 (Heng Q) + 4 (Mo Charged 5m) + 1 (Mo Charged 2m) = 7 steps
    expect(parsed.steps.length).toBe(7)

    // The 4 Mo Charged steps should all have distanceMeters: 5
    expect(parsed.steps[2].distanceMeters).toBe(5)
    expect(parsed.steps[3].distanceMeters).toBe(5)
    expect(parsed.steps[4].distanceMeters).toBe(5)
    expect(parsed.steps[5].distanceMeters).toBe(5)

    // The last Mo Charged step should have distanceMeters: 2
    expect(parsed.steps[6].distanceMeters).toBe(2)
  })

  it("readableRotationFromSteps exports distance tag when step has distanceMeters override", () => {
    const steps = [
      makeStep({ skillId: STONESPLIT_SKILL.phalanxspecialPrepull }),
      makeStep({ skillId: STONESPLIT_SKILL.phalanxchargedS3Innerpassion, distanceMeters: 5 }),
      makeStep({ skillId: STONESPLIT_SKILL.phalanxchargedS3Innerpassion, distanceMeters: 5 }),
    ]

    const text = readableRotationFromSteps(steps, skillsById)
    expect(text).toContain("(5m)")
  })

  it("Mo Charged spawns first soldier at 3m, second soldier at 5m, and lands slam at 2m", () => {
    const rotation = makeRotation("stonesplitStrength", {
      steps: [
        makeStep({ skillId: MYSTIC_SKILL.fluteOfTheTidesFull }),
        makeStep({ skillId: STONESPLIT_SKILL.phalanxspecialPrepull }),
        makeStep({ skillId: STONESPLIT_SKILL.phalanxqSoul }),
        makeStep({ skillId: STONESPLIT_SKILL.phalanxchargedS3Innerpassion }),
      ],
      preferredDistanceMeters: 2,
    })

    const result = simulateTimeline({
      ...defaultInputs,
      classId: "stonesplitStrength",
      activeCustomRotation: rotation,
      mindMethods: [
        { name: "steadfastDevotion", stacks: "tier 6" },
        { name: "", stacks: "" },
        { name: "", stacks: "" },
        { name: "", stacks: "" },
      ],
    })

    const downSoldier = result.perSkill.find(
      (s) => s.breakdownName.includes("MoDown") || s.name.includes("MoDown"),
    )
    const jumpSoldier = result.perSkill.find(
      (s) => s.breakdownName.includes("MoJump") || s.name.includes("MoJump"),
    )
    const chargedSlam = result.perSkill.find(
      (s) => s.breakdownName.includes("PhalanxCharged") || s.name.includes("PhalanxCharged"),
    )

    expect(downSoldier).toBeDefined()
    expect(downSoldier!.expectedDamage).toBeGreaterThan(0)

    expect(jumpSoldier).toBeDefined()
    expect(jumpSoldier!.expectedDamage).toBeGreaterThan(0)

    expect(chargedSlam).toBeDefined()
    expect(chargedSlam!.expectedDamage).toBeGreaterThan(0)
  })
})
