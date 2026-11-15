import { describe, expect, it } from "vitest"
import { wizardSteps } from "../../src/ui/features/setup/setup-wizard/wizardSteps"

describe("wizardSteps", () => {
  it("returns language, class, import for normal flow", () => {
    expect(wizardSteps(1, false)).toEqual(["language", "class", "import"])
  })

  it("appends name step for manual path", () => {
    expect(wizardSteps(1, true)).toEqual(["language", "class", "import", "name"])
  })
})
