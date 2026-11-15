import { describe, expect, it } from "vitest"
import { readableRotationText, readableRotationFromSteps } from "../../src/ui/features/rotation/readableRotation"
import { runEngine } from "../../src/engine/dps"
import { defaultInputs } from "../../src/engine/defaults"
import { builtinSkillsForClass, builtinRotationsForClass } from "../../src/engine/builtinLibrary"

describe("readableRotation", () => {
  it("formats mixed dummy 1 min to human-readable rotation string", () => {
    const inputs = {
      ...defaultInputs,
      classId: "stonesplitStrength",
      selectedBuiltinRotationId: "builtin-stonesplitStrength-mixed-dummy-1-min",
    }
    const result = runEngine(inputs)
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))
    const rotation = builtinRotationsForClass("stonesplitStrength").find(
      (r) => r.id === "builtin-stonesplitStrength-mixed-dummy-1-min",
    )

    const text = readableRotationText(rotation, result, skillsById)
    expect(text).not.toContain(" at ")
    expect(text).toContain("Mo Special >")
    expect(text).toContain("Heng Special (start")
    expect(text).toContain("Mo Charged")
    expect(text).toContain("Mo QQ")
    expect(text).toContain("Heng Tab")
    expect(text).toContain("Heng VC")
    expect(text).toContain("Heng LC")
    expect(text).toContain("Mo Charged (break)")
    expect(text).toContain("Mo Charged x")
  })

  it("falls back to steps when casts are empty", () => {
    const steps = [
      { id: "s1", skillId: "stonesplitStrength-phalanxspecial" },
      { id: "s2", skillId: "stonesplitStrength-phalanxcharged-s3-innerpassion" },
      { id: "s3", skillId: "stonesplitStrength-phalanxcharged-s3-innerpassion" },
      { id: "s4", skillId: "stonesplitStrength-phalanxq-soul" },
    ]
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    const text = readableRotationFromSteps(steps, skillsById)
    expect(text).toBe("Mo Special > Mo Charged x2 > Mo QQ")
  })
})
