import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { defaultInputs } from "../../src/engine/defaults"
import { runEngine } from "../../src/engine/dps"
import type { Result } from "../../src/engine/types"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { AlertsTab } from "../../src/ui/features/alerts/alerts-tab/AlertsTab"

const baseResult = runEngine(defaultInputs)

const qiEdgeWarning = {
  skillName: "PhalanxCharged-S3[InnerPassion]",
  edge: "end" as const,
  side: "before" as const,
  edgeSec: 36.65,
  offsetSec: 0.35,
  shareOfTotal: 0.08,
}

function resultWith(overrides: Partial<Result>): Result {
  return { ...baseResult, warnings: [], qiEdgeWarnings: [], ...overrides }
}

describe("AlertsTab", () => {
  it("renders empty state when there are no warnings", () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <AlertsTab result={resultWith({})} isDnd={false} onToggleDnd={() => {}} />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText(/everything is in order/i)).toBeInTheDocument()
  })

  it("renders Qi edge warnings and general warnings", () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <AlertsTab
            result={resultWith({
              warnings: ["Rotation loop broke early"],
              qiEdgeWarnings: [qiEdgeWarning],
            })}
            isDnd={false}
            onToggleDnd={() => {}}
          />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText("PhalanxCharged-S3[InnerPassion]")).toBeInTheDocument()
    expect(screen.getByText(/Rotation loop broke early/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /open in rotation editor/i })).toBeInTheDocument()
  })

  it("toggles Do Not Disturb mode when clicking the button", () => {
    const onToggleDnd = vi.fn()
    render(
      <MemoryRouter>
        <I18nProvider>
          <AlertsTab
            result={resultWith({ warnings: ["Some warning"] })}
            isDnd={false}
            onToggleDnd={onToggleDnd}
          />
        </I18nProvider>
      </MemoryRouter>,
    )

    const dndButton = screen.getByRole("button", { name: /do not disturb/i })
    fireEvent.click(dndButton)
    expect(onToggleDnd).toHaveBeenCalledTimes(1)
  })

  it("shows active DND state when isDnd is true", () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <AlertsTab
            result={resultWith({ warnings: ["Some warning"] })}
            isDnd={true}
            onToggleDnd={() => {}}
          />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText(/do not disturb: active/i)).toBeInTheDocument()
  })
})
