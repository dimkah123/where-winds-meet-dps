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
})
