import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type {
  CustomGraduationBuild,
  CustomGraduationSlot,
} from "../../src/engine/customGraduationBuild"
import { defaultInputs } from "../../src/engine/defaults"
import type { Inputs } from "../../src/engine/types"
import { runEngine } from "../../src/engine/dps"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { OverviewTab } from "../../src/ui/features/overview/overview-tab/OverviewTab"

vi.mock("../../src/ui/hooks/useItemRanking", () => ({
  useItemRanking: () => ({ rows: [], isPending: false }),
}))

describe("the Overview tab", () => {
  it("no longer renders a set bonuses card or any set or arsenal choice", () => {
    const inputs = { ...defaultInputs, classId: "bellstrikeUmbra" }
    render(
      <I18nProvider>
        <OverviewTab
          inputs={inputs}
          configuredInputs={inputs}
          engineInputs={inputs}
          onChange={() => {}}
          result={runEngine(inputs)}
        />
      </I18nProvider>,
    )

    expect(screen.getByRole("heading", { name: "Class & Breakthrough" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Set Bonuses" })).toBeNull()
    expect(screen.queryByRole("radio", { name: /Arsenal/ })).toBeNull()
  })

  it("leaves the Encounter Settings trigger to the header", () => {
    const inputs = { ...defaultInputs, classId: "bellstrikeUmbra" }
    render(
      <I18nProvider>
        <OverviewTab
          inputs={inputs}
          configuredInputs={inputs}
          engineInputs={inputs}
          onChange={() => {}}
          result={runEngine(inputs)}
        />
      </I18nProvider>,
    )

    expect(screen.queryByRole("button", { name: /Encounter Settings/ })).toBeNull()
  })

  it("counts the wanted stat lines of a followed custom graduation build", () => {
    const inputs = { ...defaultInputs, classId: "bellstrikeUmbra" }
    const customBuild: CustomGraduationBuild = {
      id: "custom-build",
      name: "Custom build",
      classId: "bellstrikeUmbra",
      slots: [
        {
          slot: "helm",
          words: ["crit", "crit", "crit", "crit", "crit"] as CustomGraduationSlot["words"],
          attunement: "",
        },
      ],
      set: null,
      bowSet: null,
      arsenal: "general",
      rotationId: "none",
      createdAt: "",
      updatedAt: "",
    }
    const configuredInputs = {
      ...inputs,
      graduationBuildId: customBuild.id,
      customGraduationBuild: customBuild,
    }
    render(
      <I18nProvider>
        <OverviewTab
          inputs={{ ...inputs, graduationBuildId: customBuild.id }}
          configuredInputs={configuredInputs}
          engineInputs={configuredInputs}
          onChange={() => {}}
          result={runEngine(configuredInputs)}
        />
      </I18nProvider>,
    )

    const panel = screen
      .getByRole("heading", { name: "Equipped Stat Lines" })
      .closest(".panel") as HTMLElement
    expect(panel.querySelector(".panel-head-meta")?.textContent).toBe("0 / 5")
    expect(within(panel).getByRole("row", { name: /Critical/ })).toHaveTextContent("0 / 5")
  })

  it("disables the Reset to gear button when there are no stat overrides", () => {
    const inputs = { ...defaultInputs, classId: "bellstrikeUmbra" }
    render(
      <I18nProvider>
        <OverviewTab
          inputs={inputs}
          configuredInputs={inputs}
          engineInputs={inputs}
          onChange={() => {}}
          result={runEngine(inputs)}
        />
      </I18nProvider>,
    )

    const resetBtn = screen.getByRole("button", { name: "Reset to gear" })
    expect(resetBtn).toBeDisabled()
  })

  it("enables the Reset to gear button when stat overrides exist and clears them on click", () => {
    const onChange = vi.fn()
    const inputs = {
      ...defaultInputs,
      classId: "bellstrikeUmbra",
      statOverrides: { critRate: 1.5 },
    }
    render(
      <I18nProvider>
        <OverviewTab
          inputs={inputs}
          configuredInputs={inputs}
          engineInputs={inputs}
          onChange={onChange}
          result={runEngine(inputs)}
        />
      </I18nProvider>,
    )

    const resetBtn = screen.getByRole("button", { name: "Reset to gear" })
    expect(resetBtn).not.toBeDisabled()
    fireEvent.click(resetBtn)
    expect(onChange).toHaveBeenCalledWith(
      expect.not.objectContaining({ statOverrides: expect.anything() }),
    )
  })
})

describe("the Sword Trial boss choice on the Overview tab", () => {
  function renderTab(patch: Partial<Inputs> = {}, onChange: (next: Inputs) => void = () => {}) {
    const inputs = { ...defaultInputs, classId: "bellstrikeUmbra", ...patch }
    render(
      <I18nProvider>
        <OverviewTab
          inputs={inputs}
          configuredInputs={inputs}
          engineInputs={inputs}
          onChange={onChange}
          result={runEngine(inputs)}
        />
      </I18nProvider>,
    )
  }

  it("renders the Sword Trial boss choice under the breakthrough", () => {
    renderTab()
    const breakthrough = screen.getByRole("combobox", { name: "Breakthrough" })
    const boss = screen.getByRole("combobox", { name: "Sword Trial Boss" })
    expect(boss).toHaveTextContent("River Master")
    expect(
      breakthrough.compareDocumentPosition(boss) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByText("Boss talent +15%")).toBeInTheDocument()
  })

  it("marks bosses above the breakthrough as locked", () => {
    renderTab({ breakthrough: 13 })
    fireEvent.click(screen.getByRole("combobox", { name: "Sword Trial Boss" }))
    expect(screen.getByRole("option", { name: /Lodestar Swordmaster/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    )
    expect(screen.getByRole("option", { name: /Sleeping Daoist/ })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    )
  })

  it("writes the chosen boss to the inputs", () => {
    const onChange = vi.fn()
    renderTab({ breakthrough: 13 }, onChange)
    fireEvent.click(screen.getByRole("combobox", { name: "Sword Trial Boss" }))
    fireEvent.mouseDown(screen.getByRole("option", { name: /Murong Yuan/ }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ swordTrialBoss: "murongYuan" }))
  })

  it("says a boss without a talent has none instead of showing a zero bonus", () => {
    renderTab({ breakthrough: 20, swordTrialBoss: "catEmperor" })
    expect(screen.getByText("No boss talent")).toBeInTheDocument()
    expect(screen.queryByText("Boss talent +0%")).not.toBeInTheDocument()
  })

  it("hides the boss choice entirely in dummy mode", () => {
    renderTab({ dummyMode: true })
    expect(screen.queryByRole("combobox", { name: "Sword Trial Boss" })).toBeNull()
    expect(screen.queryByText("Training dummy: boss talents do not apply")).toBeNull()
  })

  it("keeps a boss saved above the breakthrough and says what it is scored as", () => {
    renderTab({ breakthrough: 13, swordTrialBoss: "yeluAbuli" })
    expect(screen.getByRole("combobox", { name: "Sword Trial Boss" })).toHaveTextContent(
      "Yelu A'buli",
    )
    expect(
      screen.getByText("Not fought at BT 13: scored as River Master"),
    ).toBeInTheDocument()
  })

  it("raises standard 70 enhancements up to 75 when raising breakthrough from 18 to 19", () => {
    const onChange = vi.fn()
    const enhancements70 = Object.fromEntries(
      Object.keys(defaultInputs.enhancements).map((slot) => [slot, 70]),
    ) as Inputs["enhancements"]
    renderTab({ breakthrough: 18, enhancements: { ...enhancements70, helm: 40 } }, onChange)
    fireEvent.click(screen.getByRole("combobox", { name: "Breakthrough" }))
    fireEvent.mouseDown(screen.getByRole("option", { name: /Lv\. 19/ }))
    const next = onChange.mock.lastCall![0] as Inputs
    expect(next.breakthrough).toBe(19)
    expect(next.enhancements.leftWeapon).toBe(75)
    expect(next.enhancements.bracer).toBe(75)
    expect(next.enhancements.helm).toBe(40)
  })
})
