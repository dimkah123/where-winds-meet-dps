import { describe, expect, it } from "vitest"
import {
  rotationOptions,
  rotationOptionSectionLabel,
} from "../../src/ui/features/rotation/rotationOptions"
import { makeRotation } from "../../src/engine/rotation"

describe("rotationOptions categorization", () => {
  it("groups and sorts Stonesplit Strength rotations by Mo - Rotation and Heng - Rotation", () => {
    const custom = makeRotation("stonesplitStrength", {
      id: "custom-1",
      name: "Custom 1",
    })

    const options = rotationOptions("stonesplitStrength", [custom])

    expect(options.length).toBe(4)

    // Option 1: Mixed Dummy 1 Min
    expect(options[0].name).toBe("Mixed Dummy 1 Min")
    expect(options[0].category).toBe("Mo - Rotation")
    expect(options[0].group).toBe("builtin")

    // Option 2: 3 Heng Charge
    expect(options[1].name).toBe("3 Heng Charge")
    expect(options[1].category).toBe("Mo - Rotation")
    expect(options[1].group).toBe("builtin")

    // Option 3: Pure Heng 1 Min
    expect(options[2].name).toBe("Pure Heng 1 Min")
    expect(options[2].category).toBe("Heng - Rotation")
    expect(options[2].group).toBe("builtin")

    // Option 4: Custom 1
    expect(options[3].name).toBe("Custom 1")
    expect(options[3].group).toBe("custom")

    const mockT = (key: string, fallback?: string) => fallback || key

    expect(rotationOptionSectionLabel(options[0], mockT)).toBe("Mo - Rotation")
    expect(rotationOptionSectionLabel(options[1], mockT)).toBe("Mo - Rotation")
    expect(rotationOptionSectionLabel(options[2], mockT)).toBe("Heng - Rotation")
    expect(rotationOptionSectionLabel(options[3], mockT)).toBe("common.customRotation")
  })
})
