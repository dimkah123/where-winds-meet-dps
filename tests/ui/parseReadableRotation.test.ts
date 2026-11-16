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

  it("resolves Heng Q and Heng Q2 in prepull into both required prepull slide steps", () => {
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    const input =
      "Mo Special > Heng Q > Heng Q2 > Flute Cancel > Deflect > Heng Special (start) > Heng Q Stab > Mo Charged x3 > Heng Tab > Heng VC > Heng LC"

    const parsed = parseReadableRotation(input, "stonesplitStrength", skillsById)

    expect(parsed.hasErrors).toBe(false)
    expect(parsed.validCount).toBe(11)
    expect(parsed.totalSteps).toBe(13)
    expect(parsed.steps[1].skillId).toBe("stonesplitStrength-snowpartingslide-prepull")
    expect(parsed.steps[2].skillId).toBe("stonesplitStrength-snowpartingslide-reslide-prepull")
  })

  it("resolves Bursting Nine mystic art in rotation", () => {
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    const input = "Heng Special (start) > Bursting Nine > Heng Tab"
    const parsed = parseReadableRotation(input, "stonesplitStrength", skillsById)

    expect(parsed.hasErrors).toBe(false)
    expect(parsed.steps[1].skillId).toBe("mystic-bursting-nine-7-hits")
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
    expect(shortNames).toContain("Heng Special 6 Hit")
    expect(shortNames).toContain("Flute Cancel")
    expect(shortNames).toContain("Toad")
  })

  it("resolves Heng Special 6 Hit and 6 Hit aliases", () => {
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    const input1 = "Heng Special 6 Hit (start) > Heng Q Stab"
    const parsed1 = parseReadableRotation(input1, "stonesplitStrength", skillsById)
    expect(parsed1.hasErrors).toBe(false)
    expect(parsed1.steps[0].skillId).toBe("stonesplitStrength-snowpartingspecial-6hit")

    const input2 = "6 Hit (start) > Heng Q Stab"
    const parsed2 = parseReadableRotation(input2, "stonesplitStrength", skillsById)
    expect(parsed2.hasErrors).toBe(false)
    expect(parsed2.steps[0].skillId).toBe("stonesplitStrength-snowpartingspecial-6hit")

    const input3 = "Heng 6 Hit (start) > Heng Q Stab"
    const parsed3 = parseReadableRotation(input3, "stonesplitStrength", skillsById)
    expect(parsed3.hasErrors).toBe(false)
    expect(parsed3.steps[0].skillId).toBe("stonesplitStrength-snowpartingspecial-6hit")
  })
})
