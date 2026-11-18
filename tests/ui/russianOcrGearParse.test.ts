import { describe, expect, it } from "vitest"
import { defaultInputs } from "../../src/engine/defaults"
import type { GearSlot, Inputs } from "../../src/engine/types"
import { parseGearScreenshot } from "../../src/ui/features/gear/screenshot-ocr/ocrGearPiece"

const inputs: Inputs = { ...defaultInputs, classId: "stonesplitStrength" }
const FALLBACK_SLOT: GearSlot = "leftWeapon"

const RUSSIAN_TRANSCRIPT_WEAPON = `
Клинок лунного ветра
Ранг 96
Макс. физ. атака +73.1
Импульс +45.9
Шанс сродства +4.1%
Сила +46.4
[Перековано]Макс. физ. атака +73.1
Физическое проникновение +10.7
`

const RUSSIAN_TRANSCRIPT_HELM = `
Шлем лунного ветра
Ранг 96
Шанс сродства +4.1%
Импульс +45.9
Макс. физ. атака +73.1
Сила +46.4
[Перековано]Макс. физ. атака +73.1
Разрушитель Легионов - Заряженный навык: Увеличение урона +5.8%
`

const RUSSIAN_TRANSCRIPT_ARMOR = `
Нагрудник ночного странника
Ранг 100
Шанс критического удара +3.2%
Мин. физ. атака +45.0
Макс. физ. атака +75.0
Ловкость +48.0
[Закалка]Шанс критического удара +3.2%
Разрушитель Легионов - Боевое искусство: Увеличение урона +5.8%
`

describe("Russian OCR gear screenshot parsing", () => {
  it("parses a Russian weapon transcript with maxPhys on line 0 and physPen attunement", () => {
    const parsed = parseGearScreenshot(RUSSIAN_TRANSCRIPT_WEAPON, inputs, FALLBACK_SLOT)

    expect(parsed.error).toBeNull()
    expect(parsed.piece.slot).toBe("leftWeapon")
    expect(parsed.piece.level).toBe(96)

    const words = parsed.piece.words
    expect(words[0].word).toBe("maxPhys")
    expect(words[0].value).toBe(73.1)
    expect(words[0].retuned).toBe(false)

    expect(words[1].word).toBe("momentum")
    expect(words[1].value).toBe(45.9)
    expect(words[1].retuned).toBe(false)

    expect(words[2].word).toBe("affinity")
    expect(words[2].value).toBe(0.041)
    expect(words[2].retuned).toBe(false)

    expect(words[3].word).toBe("power")
    expect(words[3].value).toBe(46.4)
    expect(words[3].retuned).toBe(false)

    expect(words[4].word).toBe("maxPhys")
    expect(words[4].value).toBe(73.1)
    expect(words[4].retuned).toBe(true)

    expect(parsed.piece.attunement).toBe("physPen")
    expect(parsed.piece.attunementValue).toBe(0.107)
  })

  it("parses a Russian helm screenshot with stat names, retune bracket, and class attunement", () => {
    const parsed = parseGearScreenshot(RUSSIAN_TRANSCRIPT_HELM, inputs, FALLBACK_SLOT)

    expect(parsed.error).toBeNull()
    expect(parsed.piece.slot).toBe("helm")
    expect(parsed.piece.level).toBe(96)

    const words = parsed.piece.words
    expect(words[0].word).toBe("affinity")
    expect(words[0].value).toBe(0.041)
    expect(words[0].retuned).toBe(false)

    expect(words[1].word).toBe("momentum")
    expect(words[1].value).toBe(45.9)
    expect(words[1].retuned).toBe(false)

    expect(words[2].word).toBe("maxPhys")
    expect(words[2].value).toBe(73.1)
    expect(words[2].retuned).toBe(false)

    expect(words[3].word).toBe("power")
    expect(words[3].value).toBe(46.4)
    expect(words[3].retuned).toBe(false)

    expect(words[4].word).toBe("maxPhys")
    expect(words[4].value).toBe(73.1)
    expect(words[4].retuned).toBe(true)

    expect(parsed.piece.attunement).toBe("phalanxChargeDamage")
    expect(parsed.piece.attunementValue).toBe(0.058)
  })

  it("parses a Russian armor screenshot with crit, min/max phys, agility, and class attunement", () => {
    const parsed = parseGearScreenshot(RUSSIAN_TRANSCRIPT_ARMOR, inputs, FALLBACK_SLOT)

    expect(parsed.error).toBeNull()
    expect(parsed.piece.slot).toBe("armor")
    expect(parsed.piece.level).toBe(100)

    const words = parsed.piece.words
    expect(words[0].word).toBe("crit")
    expect(words[0].value).toBe(0.032)
    expect(words[0].retuned).toBe(false)

    expect(words[1].word).toBe("minPhys")
    expect(words[1].value).toBe(45.0)
    expect(words[1].retuned).toBe(false)

    expect(words[2].word).toBe("maxPhys")
    expect(words[2].value).toBe(75.0)
    expect(words[2].retuned).toBe(false)

    expect(words[3].word).toBe("agility")
    expect(words[3].value).toBe(48.0)
    expect(words[3].retuned).toBe(false)

    expect(words[4].word).toBe("crit")
    expect(words[4].value).toBe(0.032)
    expect(words[4].retuned).toBe(true)

    expect(parsed.piece.attunement).toBe("phalanxbaneQ")
    expect(parsed.piece.attunementValue).toBe(0.058)
  })

  it("parses user screenshot 1 (Mirage Vodorez weapon with maxFormless, retuned agility, and relayed header)", () => {
    const text = `
| Мираж Водорез
Передача · Уровень 100
Мин. физ. атака +85.2
Шанс критического удара +9.8%
Максимальная Атака Безформенного +48.3
[Повернуть]Ловкость +54.0
Мин. физ. атака +85.2
`
    const parsed = parseGearScreenshot(text, inputs, "leftWeapon")

    expect(parsed.error).toBeNull()
    expect(parsed.piece.slot).toBe("leftWeapon")
    expect(parsed.piece.level).toBe(100)
    expect(parsed.piece.relayed).toBe(true)

    const words = parsed.piece.words
    expect(words[0]).toEqual({ word: "minPhys", value: 85.2, retuned: false })
    expect(words[1]).toEqual({ word: "crit", value: 0.098, retuned: false })
    expect(words[2]).toEqual({ word: "maxFormless", value: 48.3, retuned: false })
    expect(words[3]).toEqual({ word: "agility", value: 54, retuned: true })
    expect(words[4]).toEqual({ word: "minPhys", value: 85.2, retuned: false })

    // Diagnostics should not falsely flag max relayed rolls as exceeding cap
    expect(parsed.diagnostics.rows[0].exceededCap).toBe(false)
    expect(parsed.diagnostics.rows[1].exceededCap).toBe(false)
    expect(parsed.diagnostics.rows[2].exceededCap).toBe(false)
    expect(parsed.diagnostics.rows[3].exceededCap).toBe(false)
    expect(parsed.diagnostics.rows[4].exceededCap).toBe(false)
  })

  it("parses user screenshot 2 (Helm with pipe prefix, level 100, silkbind and bamboocut)", () => {
    const text = `
| Шлем Туманистого хребта
Передача · Уровень 100
Шанс критического удара +9.8%
[Повернуть]Мин. физ. атака +85.2
Мин. Атака шелковыми путями +48.3
Мин. Атака бамбуковым клинком +48.3
Ловкость +54.0
`
    const parsed = parseGearScreenshot(text, inputs, "leftWeapon")

    expect(parsed.error).toBeNull()
    expect(parsed.piece.slot).toBe("helm")
    expect(parsed.piece.level).toBe(100)
    expect(parsed.piece.relayed).toBe(true)

    const words = parsed.piece.words
    expect(words[0]).toEqual({ word: "crit", value: 0.098, retuned: false })
    expect(words[1]).toEqual({ word: "minPhys", value: 85.2, retuned: true })
    expect(words[2]).toEqual({ word: "minSilkbind", value: 48.3, retuned: false })
    expect(words[3]).toEqual({ word: "minBamboocut", value: 48.3, retuned: false })
    expect(words[4]).toEqual({ word: "agility", value: 54, retuned: false })

    // Diagnostics
    expect(parsed.diagnostics.rows[0].exceededCap).toBe(false)
    expect(parsed.diagnostics.rows[1].exceededCap).toBe(false)
    expect(parsed.diagnostics.rows[2].exceededCap).toBe(false)
    expect(parsed.diagnostics.rows[3].exceededCap).toBe(false)
    expect(parsed.diagnostics.rows[4].exceededCap).toBe(false)
  })
})
