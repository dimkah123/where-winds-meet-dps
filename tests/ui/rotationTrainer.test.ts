import { describe, expect, it } from "vitest"
import {
  formatKeyDisplay,
  resolveSkillKey,
  buildTrainerSteps,
} from "../../src/ui/features/rotation/trainer/keyResolution"
import {
  DEFAULT_KEY_MAP,
  loadTrainerSettings,
} from "../../src/ui/features/rotation/trainer/trainerStorage"

describe("Rotation Trainer Key Resolution", () => {
  it("resolves default user keys for skills accurately", () => {
    expect(resolveSkillKey("Mo Special", DEFAULT_KEY_MAP)).toEqual({
      key: "~",
      label: "~",
    })

    expect(resolveSkillKey("Heng Special 6 Hit", DEFAULT_KEY_MAP)).toEqual({
      key: "~",
      label: "~",
    })

    expect(resolveSkillKey("Heng Q", DEFAULT_KEY_MAP)).toEqual({
      key: "q",
      label: "Q",
    })

    expect(resolveSkillKey("Heng Q2", DEFAULT_KEY_MAP)).toEqual({
      key: "q",
      label: "Q",
    })

    expect(resolveSkillKey("Mo QQ", DEFAULT_KEY_MAP)).toEqual({
      key: "q",
      label: "Q",
    })

    expect(resolveSkillKey("Mo Charged", DEFAULT_KEY_MAP)).toEqual({
      key: "r",
      label: "R (Hold)",
    })

    expect(resolveSkillKey("Heng Tab", DEFAULT_KEY_MAP)).toEqual({
      key: "tab",
      label: "Tab",
    })

    expect(resolveSkillKey("Heng VC", DEFAULT_KEY_MAP)).toEqual({
      key: "e",
      label: "E",
    })

    expect(resolveSkillKey("Heng LC", DEFAULT_KEY_MAP)).toEqual({
      key: "lclick",
      label: "LClick",
    })

    expect(resolveSkillKey("Flute Cancel", DEFAULT_KEY_MAP)).toEqual({
      key: "f",
      label: "F",
    })

    expect(resolveSkillKey("Bursting Nine", DEFAULT_KEY_MAP)).toEqual({
      key: "f",
      label: "F",
    })
  })

  it("formats key display labels cleanly", () => {
    expect(formatKeyDisplay("lclick")).toBe("LClick")
    expect(formatKeyDisplay("rclick")).toBe("RClick")
    expect(formatKeyDisplay("mclick")).toBe("MClick")
    expect(formatKeyDisplay("tab")).toBe("Tab")
    expect(formatKeyDisplay("shift")).toBe("Shift")
    expect(formatKeyDisplay("space")).toBe("Space")
    expect(formatKeyDisplay("~")).toBe("~")
    expect(formatKeyDisplay("q")).toBe("Q")
  })

  it("builds trainer steps with multipliers and remaining counts", () => {
    const tokens = [
      { raw: "Mo Special", cleanName: "Mo Special", multiplier: 1, valid: true },
      { raw: "Mo Charged x4", cleanName: "Mo Charged", multiplier: 4, valid: true },
    ]

    const steps = buildTrainerSteps(tokens, DEFAULT_KEY_MAP)
    expect(steps).toHaveLength(2)
    expect(steps[0].expectedKey).toBe("~")
    expect(steps[0].multiplier).toBe(1)
    expect(steps[0].remainingCount).toBe(1)

    expect(steps[1].expectedKey).toBe("r")
    expect(steps[1].multiplier).toBe(4)
    expect(steps[1].remainingCount).toBe(4)
  })

  it("loads default settings correctly", () => {
    const settings = loadTrainerSettings()
    expect(settings.mode).toBe("strict")
    expect(settings.speed).toBe(1.0)
    expect(settings.keyMap.skill1).toBe("~")
    expect(settings.keyMap.skill2).toBe("q")
    expect(settings.keyMap.heavy).toBe("r")
  })
})
