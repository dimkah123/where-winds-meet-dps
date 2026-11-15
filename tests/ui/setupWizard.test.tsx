import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { SetupWizard } from "../../src/ui/features/setup/setup-wizard/SetupWizard"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { blankInputs } from "../../src/engine/defaults"
import { classDefinition } from "../../src/definitions/classes/registry"
import fixture from "./fixtures/dashboardRoleInfo.json"

const fixtureText = JSON.stringify(fixture)

const CURRENT_CLASS = classDefinition(blankInputs.classId)!

function renderWizard(onFinish = vi.fn()) {
  render(
    <I18nProvider>
      <SetupWizard
        initialName="Fallback Name"
        initialInputs={blankInputs}
        mode="first-run"
        onFinish={onFinish}
      />
    </I18nProvider>,
  )
  return onFinish
}

function pasteCapture() {
  fireEvent.change(screen.getByPlaceholderText("Paste the copied gear JSON here"), {
    target: { value: fixtureText },
  })
}

describe("SetupWizard", () => {
  it("step 1 shows the class picker, and Next lands on the gear import step", () => {
    renderWizard()

    fireEvent.click(screen.getByRole("button", { name: /Mix Build/i }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByText("Import your gear")).toBeInTheDocument()
  })

  it("the manual button leads to a name step, and finishing there reports the typed name and chosen class", () => {
    const onFinish = renderWizard()

    fireEvent.click(screen.getByRole("button", { name: /Mix Build/i }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "I'd rather do it manually" }))

    fireEvent.change(screen.getByLabelText("Profile name"), {
      target: { value: "My Wanderer" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Finish setup" }))

    expect(onFinish).toHaveBeenCalledOnce()
    const [name, inputs] = onFinish.mock.calls[0]
    expect(name).toBe("My Wanderer")
    expect(inputs.classId).toBe(CURRENT_CLASS.id)
  })

  it("moves on from the import step only once a capture with importable pieces is pasted", () => {
    renderWizard()
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByRole("button", { name: "Finish setup" })).toBeDisabled()

    pasteCapture()

    expect(screen.getByRole("button", { name: "Finish setup" })).toBeEnabled()
  })

  it("allows choosing between Min Build and Max Build in step 1, and finishes setup with chosen build", () => {
    const onFinish = renderWizard()
    fireEvent.click(screen.getByRole("button", { name: /Max Build/i }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    pasteCapture()
    fireEvent.click(screen.getByRole("button", { name: "Finish setup" }))

    expect(onFinish).toHaveBeenCalledOnce()
    const [name, inputs] = onFinish.mock.calls[0]
    expect(name).toBe("Testwanderer")
    expect(inputs.graduationBuildId).toBe("graduation-stonesplitStrength-max-build")
    expect(inputs.inventory.length).toBeGreaterThan(0)
    for (const piece of inputs.inventory) {
      expect(inputs.equipped[piece.slot]).toBe(piece.id)
    }
  })

  it("Back from the import step returns to the class step", () => {
    renderWizard()
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByRole("button", { name: "I'd rather do it manually" })).toBeInTheDocument()
    expect(screen.getByText("Step 2 / 2")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByText("Step 1 / 2")).toBeInTheDocument()
  })

  it("Back from the name step returns to the import step", () => {
    renderWizard()
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "I'd rather do it manually" }))
    expect(screen.getByLabelText("Profile name")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Back" }))

    expect(screen.getByPlaceholderText("Paste the copied gear JSON here")).toBeInTheDocument()
    expect(screen.getByText("Step 2 / 2")).toBeInTheDocument()
  })
})
