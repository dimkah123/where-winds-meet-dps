import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { ConfirmProvider } from "../../src/ui/components/confirm-dialog/ConfirmDialog"
import { ReadableRotationDialog } from "../../src/ui/features/rotation/readable-rotation-dialog/ReadableRotationDialog"
import { RotationEditorPanel } from "../../src/ui/features/rotation/rotation-editor-panel/RotationEditorPanel"
import { defaultInputs } from "../../src/engine/defaults"
import { simulateTimeline } from "../../src/engine/timeline"
import type { Inputs } from "../../src/engine/types"

describe("ReadableRotationDialog", () => {
  it("renders rotation title, subtitle, and readable text with close and copy buttons", () => {
    const handleClose = vi.fn()
    render(
      <I18nProvider>
        <ReadableRotationDialog
          title="Mixed Dummy 1 Min"
          readableText="Mo Special at 5.5 > Heng Special (start) > Mo Charged x3"
          onClose={handleClose}
        />
      </I18nProvider>,
    )

    expect(screen.getByText("READABLE FORMAT")).toBeInTheDocument()
    expect(screen.getByText("Mixed Dummy 1 Min")).toBeInTheDocument()
    expect(
      screen.getByText("Skills before the start use a rounded pre-fight countdown in 0.5-second increments."),
    ).toBeInTheDocument()

    const textarea = screen.getByLabelText("Readable format") as HTMLTextAreaElement
    expect(textarea.value).toBe("Mo Special at 5.5 > Heng Special (start) > Mo Charged x3")

    const closeButtons = screen.getAllByRole("button", { name: "Close" })
    expect(closeButtons).toHaveLength(2)
    fireEvent.click(closeButtons[1])
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("opens readable rotation dialog from the button in RotationEditorPanel", () => {
    const inputs: Inputs = {
      ...defaultInputs,
      classId: "stonesplitStrength",
      selectedBuiltinRotationId: "builtin-stonesplitStrength-mixed-dummy-1-min",
    }
    const result = simulateTimeline(inputs)

    render(
      <I18nProvider>
        <ConfirmProvider>
          <RotationEditorPanel inputs={inputs} onChange={() => {}} result={result} />
        </ConfirmProvider>
      </I18nProvider>,
    )

    const btn = screen.getByRole("button", { name: "Readable format" })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)

    expect(screen.getByText("READABLE FORMAT")).toBeInTheDocument()
    expect(screen.getByText("Mixed Dummy 1 Min")).toBeInTheDocument()
    expect(screen.getByLabelText("Readable format")).toBeInTheDocument()
  })
})
