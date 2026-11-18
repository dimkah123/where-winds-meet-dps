import { describe, expect, it } from "vitest"
import { builtinRotationsForClass } from "../../src/engine/builtinLibrary"
import { runEngine } from "../../src/engine/dps"
import { defaultInputs } from "../../src/engine/defaults"

describe("3 Heng + Bow rotation", () => {
  it("registers 3 Heng + Bow as a built-in rotation for stonesplitStrength", () => {
    const rotations = builtinRotationsForClass("stonesplitStrength")
    const rotation = rotations.find((r) => r.id === "builtin-stonesplitStrength-3-heng-bow")
    expect(rotation).toBeDefined()
    expect(rotation?.name).toBe("3 Heng + Bow")
    expect(rotation?.category).toBe("Mo - Rotation")
    expect(rotation?.steps).toHaveLength(43)
  })

  it("simulates 3 Heng + Bow cleanly producing non-zero DPS and total damage", () => {
    const inputs = {
      ...defaultInputs,
      classId: "stonesplitStrength",
      selectedBuiltinRotationId: "builtin-stonesplitStrength-3-heng-bow",
    }
    const result = runEngine(inputs)
    expect(result.dps).toBeGreaterThan(0)
    expect(result.totalDamage).toBeGreaterThan(0)
    expect(result.casts && result.casts.length).toBeGreaterThan(0)
  })
})
