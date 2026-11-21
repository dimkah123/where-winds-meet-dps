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
    expect(normalizeKeyInput(" ")).toBe("space")
    expect(normalizeKeyInput("space")).toBe("space")
    expect(normalizeKeyInput("xbutton1")).toBe("mouse4")
    expect(normalizeKeyInput("xbutton2")).toBe("mouse5")
    expect(normalizeKeyInput("m4")).toBe("mouse4")
    expect(normalizeKeyInput("m5")).toBe("mouse5")
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

    expect(resolveSkillKey("Heng Q Stab", DEFAULT_KEY_MAP)).toEqual({
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

    // In Russian locale, should have Russian key letter and '(Удерж.)'
    expect(resolveSkillKey("Mo Charged", DEFAULT_KEY_MAP, true)).toEqual({
      key: "r",
      label: "R (К) (Удерж.)",
      isHold: true,
    })

    // In English locale, should NEVER contain Cyrillic characters
    const enSkills = ["Mo Special", "Heng Special 6 Hit", "Heng Q", "Mo Charged", "Heng Dual", "Mo Swap", "Heng VC", "Deflect", "Flute Cancel", "Bursting Nine"]
    for (const sk of enSkills) {
      const res = resolveSkillKey(sk, DEFAULT_KEY_MAP, false)
      expect(/[а-яА-ЯёЁ]/.test(res.label)).toBe(false)
    }

    expect(resolveSkillKey("Heng Tab", DEFAULT_KEY_MAP)).toEqual({
      key: "tab",
      label: "Tab",
      isHold: false,
    })

    expect(resolveSkillKey("Heng Dual", DEFAULT_KEY_MAP)).toEqual({
      key: "tab",
      label: "Tab",
      isHold: false,
    })

    expect(resolveSkillKey("Mo Dual", DEFAULT_KEY_MAP)).toEqual({
      key: "tab",
      label: "Tab",
      isHold: false,
    })

    expect(resolveSkillKey("Mo Swap", DEFAULT_KEY_MAP)).toEqual({
      key: "wheeldown",
      label: "Wheel Down",
      isHold: false,
    })

    expect(resolveSkillKey("Heng Swap", DEFAULT_KEY_MAP)).toEqual({
      key: "wheeldown",
      label: "Wheel Down",
      isHold: false,
    })

    expect(resolveSkillKey("Weapon Swap", DEFAULT_KEY_MAP)).toEqual({
      key: "wheeldown",
      label: "Wheel Down",
      isHold: false,
    })

    expect(resolveSkillKey("Heng VC", DEFAULT_KEY_MAP)).toEqual({
      key: "lclick",
      label: "LClick",
      isHold: false,
    })

    expect(resolveSkillKey("Heng LC", DEFAULT_KEY_MAP)).toEqual({
      key: "lclick",
      label: "LClick",
      isHold: false,
    })

    expect(resolveSkillKey("Deflect", DEFAULT_KEY_MAP)).toEqual({
      key: "e",
      label: "E",
      isHold: false,
    })

    expect(resolveSkillKey("Deflect Cancel", DEFAULT_KEY_MAP)).toEqual({
      key: "e",
      label: "E",
      isHold: false,
    })

    expect(resolveSkillKey("Flute Cancel", DEFAULT_KEY_MAP)).toEqual({
      key: "f",
      label: "F",
      isHold: false,
    })

    expect(resolveSkillKey("Bursting Nine", DEFAULT_KEY_MAP)).toEqual({
      key: "g",
      label: "G",
      isHold: false,
    })

    expect(resolveSkillKey("Toad", DEFAULT_KEY_MAP)).toEqual({
      key: "g",
      label: "G",
      isHold: false,
    })

    // Custom mystic2 mapped to side mouse button (Mouse 4)
    expect(
      resolveSkillKey("Bursting Nine", { ...DEFAULT_KEY_MAP, mystic2: "mouse4" }, true),
    ).toEqual({
      key: "mouse4",
      label: "Боковая 1",
      isHold: false,
    })
  })

  it("formats key display labels cleanly", () => {
    expect(formatKeyDisplay("lclick")).toBe("LClick")
    expect(formatKeyDisplay("rclick")).toBe("RClick")
    expect(formatKeyDisplay("mclick")).toBe("Wheel Click")
    expect(formatKeyDisplay("wheeldown")).toBe("Wheel Down")
    expect(formatKeyDisplay("wheelup")).toBe("Wheel Up")
    expect(formatKeyDisplay("mouse4")).toBe("Mouse 4")
    expect(formatKeyDisplay("mouse5")).toBe("Mouse 5")
    expect(formatKeyDisplay("tab")).toBe("Tab")
    expect(formatKeyDisplay("shift")).toBe("Shift")
    expect(formatKeyDisplay("space")).toBe("Space")
    expect(formatKeyDisplay("ctrl")).toBe("Ctrl")
    expect(formatKeyDisplay("alt")).toBe("Alt")
    expect(formatKeyDisplay("caps")).toBe("Caps")
    expect(formatKeyDisplay("~")).toBe("~")
    expect(formatKeyDisplay("q")).toBe("Q")

    // Russian locale display
    expect(formatKeyDisplay("lclick", true)).toBe("ЛКМ")
    expect(formatKeyDisplay("rclick", true)).toBe("ПКМ")
    expect(formatKeyDisplay("mclick", true)).toBe("Клик колесика")
    expect(formatKeyDisplay("wheeldown", true)).toBe("Колесико вниз")
    expect(formatKeyDisplay("wheelup", true)).toBe("Колесико вверх")
    expect(formatKeyDisplay("mouse4", true)).toBe("Боковая 1")
    expect(formatKeyDisplay("mouse5", true)).toBe("Боковая 2")
    expect(formatKeyDisplay("~", true)).toBe("~ (Ё)")
    expect(formatKeyDisplay("q", true)).toBe("Q (Й)")
    expect(formatKeyDisplay("r", true)).toBe("R (К)")
    expect(formatKeyDisplay("e", true)).toBe("E (У)")
    expect(formatKeyDisplay("f", true)).toBe("F (А)")
  })

  it("builds trainer steps with multipliers, hold normalization, and accurate Actual cast & cooldown timings", () => {
    const tokens = [
      { raw: "Mo Special", cleanName: "Mo Special", multiplier: 1, valid: true },
      { raw: "Mo Charged x4", cleanName: "Mo Charged", multiplier: 4, valid: true },
      { raw: "Heng LC x3", cleanName: "Heng LC", multiplier: 3, valid: true },
      { raw: "Heng Special 6 Hit", cleanName: "Heng Special 6 Hit", multiplier: 1, valid: true },
      { raw: "Flute Cancel", cleanName: "Flute Cancel", multiplier: 1, valid: true },
      { raw: "Bursting Nine", cleanName: "Bursting Nine", multiplier: 1, valid: true },
    ]

    const steps = buildTrainerSteps(tokens, DEFAULT_KEY_MAP)
    expect(steps).toHaveLength(6)
    expect(steps[0].expectedKey).toBe("~")
    expect(steps[0].multiplier).toBe(1)
    expect(steps[0].remainingCount).toBe(1)
    expect(steps[0].durationSec).toBe(1.17)
    expect(steps[0].cooldownSec).toBe(20)

    // Mo Charged is a hold skill -> multiplier is preserved (4 charges), normalized to 1 hold action, duration scaled to 3.4s
    expect(steps[1].expectedKey).toBe("r")
    expect(steps[1].multiplier).toBe(4)
    expect(steps[1].remainingCount).toBe(1)
    expect(steps[1].durationSec).toBe(3.4)
    expect(steps[1].isHold).toBe(true)

    // Tap combo retains multiplier 3
    expect(steps[2].expectedKey).toBe("lclick")
    expect(steps[2].multiplier).toBe(3)
    expect(steps[2].remainingCount).toBe(3)

    // Heng Special 6 Hit (2.07s cast, 20s cooldown)
    expect(steps[3].durationSec).toBe(2.07)
    expect(steps[3].cooldownSec).toBe(20)

    // Flute Cancel (0.8s cast, 25s cooldown)
    expect(steps[4].durationSec).toBe(0.8)
    expect(steps[4].cooldownSec).toBe(25)

    // Bursting Nine (1.4s cast, 30s cooldown)
    expect(steps[5].durationSec).toBe(1.4)
    expect(steps[5].cooldownSec).toBe(30)
  })

  it("loads default settings correctly", () => {
    const settings = loadTrainerSettings()
    expect(settings.mode).toBe("strict")
    expect(settings.speed).toBe(1.0)
    expect(settings.keyMap.skill1).toBe("~")
    expect(settings.keyMap.skill2).toBe("q")
    expect(settings.keyMap.heavy).toBe("r")
    expect(settings.keyMap.dual).toBe("wheeldown")
    expect(settings.keyMap.mystic1).toBe("f")
    expect(settings.keyMap.mystic2).toBe("g")
  })
})
