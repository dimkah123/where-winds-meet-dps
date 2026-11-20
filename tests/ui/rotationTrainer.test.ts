import { describe, expect, it } from "vitest"
import {
  formatKeyDisplay,
  resolveSkillKey,
  buildTrainerSteps,
  normalizeKeyInput,
} from "../../src/ui/features/rotation/trainer/keyResolution"
import {
  DEFAULT_KEY_MAP,
  loadTrainerSettings,
} from "../../src/ui/features/rotation/trainer/trainerStorage"

describe("Rotation Trainer Key Resolution", () => {
  it("normalizes Russian keyboard layout keys to English physical keys", () => {
    expect(normalizeKeyInput("й")).toBe("q")
    expect(normalizeKeyInput("Й")).toBe("q")
    expect(normalizeKeyInput("к")).toBe("r")
    expect(normalizeKeyInput("К")).toBe("r")
    expect(normalizeKeyInput("у")).toBe("e")
    expect(normalizeKeyInput("У")).toBe("e")
    expect(normalizeKeyInput("а")).toBe("f")
    expect(normalizeKeyInput("А")).toBe("f")
    expect(normalizeKeyInput("ё")).toBe("~")
    expect(normalizeKeyInput("Ё")).toBe("~")
    expect(normalizeKeyInput("`")).toBe("~")
    expect(normalizeKeyInput("~")).toBe("~")
    expect(normalizeKeyInput("q")).toBe("q")
    expect(normalizeKeyInput("r")).toBe("r")
  })

  it("resolves default user keys for skills accurately", () => {
    expect(resolveSkillKey("Mo Special", DEFAULT_KEY_MAP)).toEqual({
      key: "~",
      label: "~",
      isHold: false,
    })

    expect(resolveSkillKey("Heng Special 6 Hit", DEFAULT_KEY_MAP)).toEqual({
      key: "~",
      label: "~",
      isHold: false,
    })

    expect(resolveSkillKey("Heng Q", DEFAULT_KEY_MAP)).toEqual({
      key: "q",
      label: "Q",
      isHold: false,
    })

    expect(resolveSkillKey("Heng Q2", DEFAULT_KEY_MAP)).toEqual({
      key: "q",
      label: "Q",
      isHold: false,
    })

    expect(resolveSkillKey("Mo QQ", DEFAULT_KEY_MAP)).toEqual({
      key: "q",
      label: "Q",
      isHold: false,
    })

    expect(resolveSkillKey("Mo Charged", DEFAULT_KEY_MAP)).toEqual({
      key: "r",
      label: "R (Hold)",
      isHold: true,
    })

    expect(resolveSkillKey("Heng Tab", DEFAULT_KEY_MAP)).toEqual({
      key: "tab",
      label: "Tab",
      isHold: false,
    })

    expect(resolveSkillKey("Heng VC", DEFAULT_KEY_MAP)).toEqual({
      key: "e",
      label: "E",
      isHold: false,
    })

    expect(resolveSkillKey("Heng LC", DEFAULT_KEY_MAP)).toEqual({
      key: "lclick",
      label: "LClick",
      isHold: false,
    })

    expect(resolveSkillKey("Flute Cancel", DEFAULT_KEY_MAP)).toEqual({
      key: "f",
      label: "F",
      isHold: false,
    })

    expect(resolveSkillKey("Bursting Nine", DEFAULT_KEY_MAP)).toEqual({
      key: "f",
      label: "F",
      isHold: false,
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

    // Russian locale display
    expect(formatKeyDisplay("lclick", true)).toBe("ЛКМ")
    expect(formatKeyDisplay("rclick", true)).toBe("ПКМ")
    expect(formatKeyDisplay("~", true)).toBe("~ (Ё)")
    expect(formatKeyDisplay("q", true)).toBe("Q (Й)")
    expect(formatKeyDisplay("r", true)).toBe("R (К)")
    expect(formatKeyDisplay("e", true)).toBe("E (У)")
    expect(formatKeyDisplay("f", true)).toBe("F (А)")
  })

  it("builds trainer steps with multipliers and hold normalization", () => {
    const tokens = [
      { raw: "Mo Special", cleanName: "Mo Special", multiplier: 1, valid: true },
      { raw: "Mo Charged x4", cleanName: "Mo Charged", multiplier: 4, valid: true },
      { raw: "Heng LC x3", cleanName: "Heng LC", multiplier: 3, valid: true },
    ]

    const steps = buildTrainerSteps(tokens, DEFAULT_KEY_MAP)
    expect(steps).toHaveLength(3)
    expect(steps[0].expectedKey).toBe("~")
    expect(steps[0].multiplier).toBe(1)
    expect(steps[0].remainingCount).toBe(1)

    // Mo Charged is a hold skill -> normalized to 1 hold action instead of 4 taps
    expect(steps[1].expectedKey).toBe("r")
    expect(steps[1].multiplier).toBe(1)
    expect(steps[1].remainingCount).toBe(1)

    // Tap combo retains multiplier 3
    expect(steps[2].expectedKey).toBe("lclick")
    expect(steps[2].multiplier).toBe(3)
    expect(steps[2].remainingCount).toBe(3)
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
