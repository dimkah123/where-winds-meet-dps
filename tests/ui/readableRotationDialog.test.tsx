import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { ConfirmProvider } from "../../src/ui/components/confirm-dialog/ConfirmDialog"
import { ReadableRotationDialog } from "../../src/ui/features/rotation/readable-rotation-dialog/ReadableRotationDialog"
import { RotationEditorPanel } from "../../src/ui/features/rotation/rotation-editor-panel/RotationEditorPanel"
import { defaultInputs } from "../../src/engine/defaults"
import { simulateTimeline } from "../../src/engine/timeline"
import { builtinSkillsForClass } from "../../src/engine/builtinLibrary"
import type { Inputs } from "../../src/engine/types"

describe("ReadableRotationDialog", () => {
  it("renders rotation title, subtitle, and readable text with close, copy, and apply buttons", () => {
    const handleClose = vi.fn()
    const handleApply = vi.fn()
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    render(
      <I18nProvider>
        <ReadableRotationDialog
          title="Mixed Dummy 1 Min"
          readableText="Mo Special > Heng Special > Mo Charged x3"
          classId="stonesplitStrength"
          skillsById={skillsById}
          onApply={handleApply}
          onClose={handleClose}
        />
      </I18nProvider>,
    )

    expect(screen.getByText("READABLE FORMAT")).toBeInTheDocument()
    expect(screen.getByText("Mixed Dummy 1 Min")).toBeInTheDocument()
    expect(
      screen.getByText(
        "(start) marks fight start, (break) marks Qi break. Consecutive skills are grouped with xN.",
      ),
    ).toBeInTheDocument()

    const textarea = screen.getByLabelText("Readable format") as HTMLTextAreaElement
    expect(textarea.value).toBe("Mo Special > Heng Special > Mo Charged x3")

    // Check parsed step count: 1 + 1 + 3 = 5 skills
    expect(screen.getByText("5 skills")).toBeInTheDocument()

    // Test apply button
    const applyButton = screen.getByRole("button", { name: "Apply to Rotation" })
    expect(applyButton).toBeInTheDocument()
    expect(applyButton).not.toBeDisabled()
    fireEvent.click(applyButton)
    expect(handleApply).toHaveBeenCalledTimes(1)
    const appliedSteps = handleApply.mock.calls[0][0]
    expect(appliedSteps).toHaveLength(5)

    // Test close
    const closeButtons = screen.getAllByRole("button", { name: "Close" })
    fireEvent.click(closeButtons[1])
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("supports quick add buttons to append skills", () => {
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    render(
      <I18nProvider>
        <ReadableRotationDialog
          title="(unnamed)"
          readableText=""
          classId="stonesplitStrength"
          skillsById={skillsById}
          onClose={() => {}}
        />
      </I18nProvider>,
    )

    const textarea = screen.getByLabelText("Readable format") as HTMLTextAreaElement
    expect(textarea.value).toBe("")

    const quickMoSpecial = screen.getByRole("button", { name: "+Mo Special" })
    fireEvent.click(quickMoSpecial)
    expect(textarea.value).toBe("Mo Special > ")

    const quickHengQ = screen.getByRole("button", { name: "+Heng Q" })
    fireEvent.click(quickHengQ)
    expect(textarea.value).toBe("Mo Special > Heng Q > ")
    expect(screen.queryByRole("button", { name: "+Heng Q2" })).not.toBeInTheDocument()

    const quickHengLC = screen.getByRole("button", { name: "+Heng LC" })
    expect(quickHengLC).toBeInTheDocument()
    fireEvent.click(quickHengLC)
    expect(textarea.value).toBe("Mo Special > Heng Q > Heng LC > ")
  })

  it("shows unknown skill highlight warning when typo is present", () => {
    const skills = builtinSkillsForClass("stonesplitStrength")
    const skillsById = new Map(skills.map((s) => [s.id, s]))

    render(
      <I18nProvider>
        <ReadableRotationDialog
          title="(unnamed)"
          readableText="Mo Special > UnknownAttack"
          classId="stonesplitStrength"
          skillsById={skillsById}
          onApply={() => {}}
          onClose={() => {}}
        />
      </I18nProvider>,
    )

    expect(screen.getByText(/1 unknown/)).toBeInTheDocument()
    const applyButton = screen.getByRole("button", { name: "Apply to Rotation" })
    expect(applyButton).toBeDisabled()
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
    expect(screen.getByRole("button", { name: "Apply to Rotation" })).toBeInTheDocument()
  })
})
