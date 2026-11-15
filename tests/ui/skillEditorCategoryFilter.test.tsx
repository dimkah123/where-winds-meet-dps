import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { defaultInputs } from "../../src/engine/defaults"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { ConfirmProvider } from "../../src/ui/components/confirm-dialog/ConfirmDialog"
import { SkillsTab } from "../../src/ui/features/skills/skills-tab/SkillsTab"

const CLASS_ID = "stonesplitStrength"

function renderSkillsTab() {
  return render(
    <I18nProvider>
      <ConfirmProvider>
        <SkillsTab
          inputs={{ ...defaultInputs, classId: CLASS_ID }}
          engineInputs={{ ...defaultInputs, classId: CLASS_ID }}
          customSkills={[]}
          onCustomSkillsChange={() => {}}
          customBuffs={[]}
          customDebuffs={[]}
        />
      </ConfirmProvider>
    </I18nProvider>,
  )
}

describe("Skill Editor — Category Filter Panel", () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it("renders all category filter chips with non-zero counts", () => {
    renderSkillsTab()

    const allChip = screen.getByRole("button", { name: /all/i })
    const stonesplitChip = screen.getByRole("button", { name: /stonesplit/i })
    const innerWaysChip = screen.getByRole("button", { name: /inner ways/i })
    const mysticsChip = screen.getByRole("button", { name: /mystics/i })

    expect(allChip).toBeInTheDocument()
    expect(stonesplitChip).toBeInTheDocument()
    expect(innerWaysChip).toBeInTheDocument()
    expect(mysticsChip).toBeInTheDocument()

    // Initially contains skills from all categories
    expect(screen.getByText("AnxiSoldierHeng")).toBeInTheDocument()
    expect(screen.getByText("Bitter Season Tick")).toBeInTheDocument()
    expect(screen.getByText("Dragon Head")).toBeInTheDocument()
  })

  it("filters to inner ways and mystics when Stonesplit is toggled off", () => {
    renderSkillsTab()

    const stonesplitChip = screen.getByRole("button", { name: /stonesplit/i })
    fireEvent.click(stonesplitChip)

    // Stonesplit class skills should be hidden
    expect(screen.queryByText("AnxiSoldierHeng")).not.toBeInTheDocument()

    // Inner Ways and Mystics should remain visible
    expect(screen.getByText("Bitter Season Tick")).toBeInTheDocument()
    expect(screen.getByText("Dragon Head")).toBeInTheDocument()
  })

  it("restores all skills when All is clicked", () => {
    renderSkillsTab()

    const stonesplitChip = screen.getByRole("button", { name: /stonesplit/i })
    fireEvent.click(stonesplitChip)
    expect(screen.queryByText("AnxiSoldierHeng")).not.toBeInTheDocument()

    const allChip = screen.getByRole("button", { name: /all/i })
    fireEvent.click(allChip)

    expect(screen.getByText("AnxiSoldierHeng")).toBeInTheDocument()
    expect(screen.getByText("Bitter Season Tick")).toBeInTheDocument()
    expect(screen.getByText("Dragon Head")).toBeInTheDocument()
  })
})
