import { describe, expect, it } from "vitest"
import { defaultInputs } from "../../src/engine/defaults"
import { equipGraduationGearToInputs } from "../../src/engine/graduation"
import { importProfile } from "../../src/storage"
import { EMPTY_EQUIPPED, GEAR_SLOTS } from "../../src/engine/types"

describe("equipGraduationGearToInputs and resilient importProfile", () => {
  it("equips all graduation gear pieces and bow gear onto empty inputs", () => {
    const emptyInputs = {
      ...defaultInputs,
      classId: "stonesplitStrength",
      breakthrough: 18,
      graduationBuildId: "graduation-stonesplitStrength-max-build",
      inventory: [],
      equipped: { ...EMPTY_EQUIPPED },
    }

    const equipped = equipGraduationGearToInputs(emptyInputs)
    expect(equipped.inventory.length).toBe(8)
    for (const slot of GEAR_SLOTS) {
      expect(equipped.equipped[slot]).toBeTruthy()
      const piece = equipped.inventory.find((p) => p.id === equipped.equipped[slot])
      expect(piece).toBeDefined()
      expect(piece?.slot).toBe(slot)
    }
    expect(equipped.bowGear.bow).toBeTruthy()
    expect(equipped.bowGear.thumbRing).toBeTruthy()
  })

  it("importProfile imports shared build format without id/name and equips gear", () => {
    const sharedPayload = {
      v: 2,
      author: "TestAuthor",
      title: "My Shared Build",
      inputs: {
        ...defaultInputs,
        classId: "stonesplitStrength",
        breakthrough: 18,
        inventory: [
          {
            id: 101, // numeric id
            slot: "leftWeapon",
            level: 100,
            rarity: "legendary",
            minPhys: 100,
            maxPhys: 200,
            hp: 500,
            physDef: 50,
            words: [],
            attunement: "",
            attunementValue: 0,
            relayed: false,
          },
        ],
        equipped: {
          ...EMPTY_EQUIPPED,
          leftWeapon: "101", // string id
        },
      },
    }

    const imported = importProfile(JSON.stringify(sharedPayload))
    expect(imported.name).toBe("My Shared Build")
    expect(imported.inputs.inventory.length).toBe(1)
    expect(imported.inputs.equipped.leftWeapon).toBeTruthy()
    expect(imported.inputs.equipped.leftWeapon).toBe(imported.inputs.inventory[0].id)
  })
})
