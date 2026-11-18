import { describe, expect, it } from "vitest"
import { decodeSharedBuild, encodeSharedBuild, type SharedBuildPayload } from "../../src/engine/shareBuild"
import { defaultInputs } from "../../src/engine/defaults"

describe("shareBuild engine", () => {
  it("encodes and decodes a shared build payload accurately", async () => {
    const payload: SharedBuildPayload = {
      v: 1,
      author: "Dimka",
      title: "Stonesplit 85k DPS",
      inputs: {
        ...defaultInputs,
        classId: "stonesplitStrength",
        breakthrough: 18,
      },
    }

    const encoded = await encodeSharedBuild(payload)
    expect(typeof encoded).toBe("string")
    expect(encoded.length).toBeGreaterThan(10)

    const decoded = await decodeSharedBuild(encoded)
    expect(decoded.v).toBe(1)
    expect(decoded.author).toBe("Dimka")
    expect(decoded.title).toBe("Stonesplit 85k DPS")
    expect(decoded.inputs.classId).toBe("stonesplitStrength")
    expect(decoded.inputs.breakthrough).toBe(18)
  })

  it("handles Cyrillic player names and build titles without corruption", async () => {
    const payload: SharedBuildPayload = {
      v: 1,
      author: "Димка",
      title: "Сборка Расколотый пик (Мо + Хэн) 85к УВС",
      inputs: defaultInputs,
    }

    const encoded = await encodeSharedBuild(payload)
    const decoded = await decodeSharedBuild(encoded)
    expect(decoded.author).toBe("Димка")
    expect(decoded.title).toBe("Сборка Расколотый пик (Мо + Хэн) 85к УВС")
  })

  it("throws a descriptive error on corrupted base64url data", async () => {
    await expect(decodeSharedBuild("not-a-valid-payload")).rejects.toThrow()
  })

  it("rapidly encodes and decodes heavy builds with many gear pieces without hanging or deadlocking", async () => {
    const dummyPieces = Array.from({ length: 80 }, (_, i) => ({
      id: `piece-${i}`,
      slot: "helm" as const,
      level: 100 as const,
      rarity: "legendary" as const,
      minPhys: 50,
      maxPhys: 80,
      hp: 1000,
      physDef: 200,
      words: [
        { word: "crit", value: 0.032, retuned: false },
        { word: "minPhys", value: 45, retuned: false },
        { word: "maxPhys", value: 75, retuned: false },
        { word: "agility", value: 48, retuned: false },
        { word: "crit", value: 0.032, retuned: true },
      ] as any,
      attunement: "phalanxbaneQ",
      attunementValue: 0.058,
      relayed: false,
    }))

    const heavyInputs = {
      ...defaultInputs,
      inventory: dummyPieces,
      equipped: {
        ...defaultInputs.equipped,
        helm: "piece-0",
      },
    }

    const payload: SharedBuildPayload = {
      v: 1,
      author: "HeavyTester",
      title: "Massive Inventory Build",
      inputs: heavyInputs,
    }

    const start = Date.now()
    const encoded = await encodeSharedBuild(payload)
    const duration = Date.now() - start

    expect(typeof encoded).toBe("string")
    expect(duration).toBeLessThan(1000) // Encodes in well under 1 second

    const decoded = await decodeSharedBuild(encoded)
    expect(decoded.author).toBe("HeavyTester")
    expect(decoded.inputs.equipped.helm).toBe("piece-0")
    // Only equipped pieces are retained in shared inventory
    expect(decoded.inputs.inventory.length).toBe(1)
  })
})
