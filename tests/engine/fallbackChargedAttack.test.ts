import { describe, expect, it } from "vitest"
import { makeRotation, makeStep } from "../../src/engine/rotation"
import { defaultInputs } from "../../src/engine/defaults"
import { withDerivedStats } from "../../src/engine/derivedInputs"
import { applySetBonuses } from "../../src/engine/setBonuses"
import { runEngine } from "../../src/engine/dps"
import { graduationInputs } from "../../src/engine/graduation"
import type { Inputs } from "../../src/engine/types"

describe("SnowpartingCharged[Forgetfulness] automatic fallback", () => {
  it("automatically falls back to regular SnowpartingCharged when Forgetfulness is on cooldown", () => {
    // Rotation with two back-to-back Forgetfulness LCs outside Qi break
    const rotation = makeRotation("stonesplitStrength", {
      name: "Test Fallback",
      steps: [
        makeStep({ skillId: "stonesplitStrength-snowpartingdual-prepull" }),
        makeStep({ skillId: "stonesplitStrength-snowpartingvc" }),
        makeStep({ skillId: "stonesplitStrength-snowpartingcharged-forgetfulness" }), // consumes Forgetfulness, starts 5.5s CD
        makeStep({ skillId: "stonesplitStrength-snowpartingvc" }), // cannot grant Forgetfulness because CD > 0
        makeStep({ skillId: "stonesplitStrength-snowpartingcharged-forgetfulness" }), // falls back to regular SnowpartingCharged!
      ],
    })

    const baseGrad = graduationInputs({
      ...defaultInputs,
      graduationBuildId: "graduation-stonesplitStrength-pureHeng-max-build",
    })!

    const inputs: Inputs = {
      ...baseGrad,
      selectedBuiltinRotationId: null,
      activeCustomRotation: rotation,
    }

    const res = runEngine(applySetBonuses(withDerivedStats(inputs)))

    // Should NOT have "would be illegal in the game" error for the fallback cast
    const illegalWarnings = res.warnings.filter(
      (w) => w.includes("would be illegal in the game") && w.includes("SnowpartingCharged"),
    )
    expect(illegalWarnings).toHaveLength(0)

    // Should have a diagnostic fallback warning
    const fallbackWarning = res.warnings.find((w) =>
      w.includes("calculated damage is too low for rotation timing") &&
      w.includes("used SnowpartingCharged instead"),
    )
    expect(fallbackWarning).toBeDefined()

    // No invalid steps for the charged attacks
    expect(res.invalidStepIds ?? []).toHaveLength(0)

    // Second charged attack was executed as SnowpartingCharged
    const chargedSkills = (res.perSkill ?? []).map((s) => s.name)
    expect(chargedSkills).toContain("SnowpartingCharged")

    // Tracks fallback step ID
    expect(res.fallbackStepIds).toBeDefined()
    expect(res.fallbackStepIds).toContain(rotation.steps[4].id)

    // Cast carries fallbackFromSkillId
    const fallbackCast = res.casts?.find((c) => c.stepId === rotation.steps[4].id)
    expect(fallbackCast?.fallbackFromSkillId).toBe(
      "stonesplitStrength-snowpartingcharged-forgetfulness",
    )
  })

  it("consolidates multiple fallback occurrences into exactly 1 diagnostic warning", () => {
    // Rotation with three Forgetfulness LCs that all fall back
    const step1 = makeStep({ skillId: "stonesplitStrength-snowpartingdual-prepull" })
    const step2 = makeStep({ skillId: "stonesplitStrength-snowpartingvc" })
    const step3 = makeStep({ skillId: "stonesplitStrength-snowpartingcharged-forgetfulness" })
    const step4 = makeStep({ skillId: "stonesplitStrength-snowpartingvc" })
    const step5 = makeStep({ skillId: "stonesplitStrength-snowpartingcharged-forgetfulness" })
    const step6 = makeStep({ skillId: "stonesplitStrength-snowpartingvc" })
    const step7 = makeStep({ skillId: "stonesplitStrength-snowpartingcharged-forgetfulness" })

    const rotation = makeRotation("stonesplitStrength", {
      name: "Test Multi Fallback",
      steps: [step1, step2, step3, step4, step5, step6, step7],
    })

    const baseGrad = graduationInputs({
      ...defaultInputs,
      graduationBuildId: "graduation-stonesplitStrength-pureHeng-max-build",
    })!

    const inputs: Inputs = {
      ...baseGrad,
      selectedBuiltinRotationId: null,
      activeCustomRotation: rotation,
    }

    const res = runEngine(applySetBonuses(withDerivedStats(inputs)))

    // Multiple steps fell back
    expect(res.fallbackStepIds).toBeDefined()
    expect(res.fallbackStepIds).toHaveLength(2)
    expect(res.fallbackStepIds).toContain(step5.id)
    expect(res.fallbackStepIds).toContain(step7.id)

    // But exactly 1 consolidated warning is emitted in res.warnings
    const fallbackWarnings = res.warnings.filter((w) =>
      w.includes("calculated damage is too low for rotation timing"),
    )
    expect(fallbackWarnings).toHaveLength(1)
  })
})
