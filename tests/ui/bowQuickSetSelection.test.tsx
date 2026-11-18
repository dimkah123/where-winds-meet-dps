import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { GearSetStrip } from "../../src/ui/features/gear/gear-set-strip/GearSetStrip"
import { defaultInputs } from "../../src/engine/defaults"
import { withSetChoice } from "../../src/engine/setChoice"
import type { Inputs } from "../../src/engine/types"

describe("Bow quick set selection and auto-pairing", () => {
  it("renders the quick bow set dropdown button in GearSetStrip and allows selecting a set", () => {
    const handleUpdate = vi.fn()
    const inputs: Inputs = {
      ...defaultInputs,
      bowGear: {
        bow: { level: 100, rarity: "legendary", set: "crit" },
        thumbRing: { level: 100, rarity: "legendary", set: "crit" },
      },
    }

    render(
      <I18nProvider>
        <GearSetStrip inputs={inputs} onChangeBowSet={handleUpdate} />
      </I18nProvider>,
    )

    expect(screen.getByText("Critical")).toBeInTheDocument()
    expect(screen.getByText("Lv100")).toBeInTheDocument()
    expect(screen.getByText("+5.2% Critical Rate")).toBeInTheDocument()

    const dropdownTrigger = screen.getByRole("button", { name: "Quick select bow set" })
    expect(dropdownTrigger).toBeInTheDocument()

    // Open dropdown
    fireEvent.click(dropdownTrigger)

    // Check options appear
    expect(screen.getByRole("option", { name: /Precision/ })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: /Affinity/ })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: /none/ })).toBeInTheDocument()

    // Select Precision
    fireEvent.mouseDown(screen.getByRole("option", { name: /Precision/ }))
    expect(handleUpdate).toHaveBeenCalledWith("precision")
  })

  it("auto-pairs thumbRing when selecting a set on bow if thumbRing has no set", () => {
    const initialInputs: Inputs = {
      ...defaultInputs,
      bowGear: {
        bow: { level: 100, rarity: "legendary", set: null },
        thumbRing: { level: 100, rarity: "legendary", set: null },
      },
    }

    // User chooses crit on bow
    const updated = withSetChoice(initialInputs, { kind: "bow", slot: "bow" }, false, "crit")
    expect(updated.bowGear.bow?.set).toBe("crit")
    expect(updated.bowGear.thumbRing?.set).toBe("crit")
  })

  it("allows changing thumbRing manually after auto-pairing without altering bow", () => {
    const pairedInputs: Inputs = {
      ...defaultInputs,
      bowGear: {
        bow: { level: 100, rarity: "legendary", set: "crit" },
        thumbRing: { level: 100, rarity: "legendary", set: "crit" },
      },
    }

    // User manually changes thumbRing to affinity
    const changed = withSetChoice(pairedInputs, { kind: "bow", slot: "thumbRing" }, false, "affinity")
    expect(changed.bowGear.thumbRing?.set).toBe("affinity")
    expect(changed.bowGear.bow?.set).toBe("crit")

    // User manually sets thumbRing to none
    const unassigned = withSetChoice(pairedInputs, { kind: "bow", slot: "thumbRing" }, false, null)
    expect(unassigned.bowGear.thumbRing?.set).toBeNull()
    expect(unassigned.bowGear.bow?.set).toBe("crit")
  })
})
