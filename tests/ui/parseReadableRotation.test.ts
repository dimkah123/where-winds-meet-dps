import { describe, expect, it } from "vitest"
import { builtinSkillsForClass } from "../../src/engine/builtinLibrary"
import {
  parseReadableRotation,
  getAvailableSkillSuggestions,
} from "../../src/ui/features/rotation/readableRotation"

describe("parseReadableRotation", () => {
  it("parses human readable rotation with multipliers and tags", () => {
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    const input =
      "Mo Special > Heng Q2 > Heng Q > Flute Cancel > Deflect > Heng Special (start) > Heng Q Stab > Mo Charged x3 > Heng Tab > Heng VC > Heng LC"

    const parsed = parseReadableRotation(input, "stonesplitStrength", skillsById)

    expect(parsed.hasErrors).toBe(false)
    expect(parsed.validCount).toBe(11)
    // 10 single skills + 1 skill with x3 = 13 steps
    expect(parsed.totalSteps).toBe(13)

    const names = parsed.tokens.map((t) => t.cleanName)
    expect(names).toEqual([
      "Mo Special",
      "Heng Q2",
      "Heng Q",
      "Flute Cancel",
      "Deflect",
      "Heng Special",
      "Heng Q Stab",
      "Mo Charged",
      "Heng Tab",
      "Heng VC",
      "Heng LC",
    ])

    expect(parsed.tokens[7].multiplier).toBe(3)
  })

  it("automatically expands single Heng Q in prepull into both required prepull slide steps", () => {
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    const input =
      "Mo Special > Heng Q > Flute Cancel > Deflect > Heng Special (start) > Heng Q Stab > Mo Charged x3 > Heng Tab > Heng VC > Heng LC"

    const parsed = parseReadableRotation(input, "stonesplitStrength", skillsById)

    expect(parsed.hasErrors).toBe(false)
    expect(parsed.validCount).toBe(10)
    // 10 tokens where Heng Q produces 2 slide steps + 1 skill with x3 = 13 steps
    expect(parsed.totalSteps).toBe(13)
    expect(parsed.steps[1].skillId).toBe("stonesplitStrength-snowpartingslide-reslide-prepull")
    expect(parsed.steps[2].skillId).toBe("stonesplitStrength-snowpartingslide-prepull")
  })

  it("handles unknown skills gracefully with error tokens", () => {
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    const input = "Mo Special > NonExistentSkill > Mo Charged x2"
    const parsed = parseReadableRotation(input, "stonesplitStrength", skillsById)

    expect(parsed.hasErrors).toBe(true)
    expect(parsed.validCount).toBe(2)
    expect(parsed.tokens[1].valid).toBe(false)
    expect(parsed.tokens[1].error).toContain('Unknown skill: "NonExistentSkill"')
  })

  it("provides autocomplete suggestions for class skills and mystics", () => {
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    const suggestions = getAvailableSkillSuggestions("stonesplitStrength", skillsById)
    expect(suggestions.length).toBeGreaterThan(15)

    const shortNames = suggestions.map((s) => s.shortName)
    expect(shortNames).toContain("Mo Special")
    expect(shortNames).toContain("Mo Charged")
    expect(shortNames).toContain("Mo QQ")
    expect(shortNames).toContain("Heng Special")
    expect(shortNames).toContain("Flute Cancel")
    expect(shortNames).toContain("Toad")
  })
})
