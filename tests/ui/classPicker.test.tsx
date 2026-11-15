import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ClassPicker } from "../../src/ui/features/setup/class-picker/ClassPicker"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { SELECTABLE_CLASS_DEFS, classDefinition } from "../../src/definitions/classes/registry"

describe("ClassPicker", () => {
  it("offers one tile per registered class, and each names its martial arts", () => {
    const classDefs = SELECTABLE_CLASS_DEFS()
    render(
      <I18nProvider>
        <ClassPicker value={classDefs[0].id} onChange={() => {}} />
      </I18nProvider>,
    )

    for (const classDef of classDefs) {
      const martialArts = classDefinition(classDef.id)!.martialArts
      const tile = screen.getByRole("button", {
        name: new RegExp(classDef.displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      for (const martialArt of martialArts) {
        expect(tile).toHaveTextContent(martialArt.name)
      }
    }
  })

  it("clicking a tile reports that class's id", () => {
    const onChange = vi.fn()
    const classDefs = SELECTABLE_CLASS_DEFS()
    render(
      <I18nProvider>
        <ClassPicker value={classDefs[0].id} onChange={onChange} />
      </I18nProvider>,
    )

    const target = classDefs[0]
    screen.getByRole("button", { name: new RegExp(target.displayName) }).click()
    expect(onChange).toHaveBeenCalledWith(target.id)
  })

  it("marks the selected class's tile as current", () => {
    const classDefs = SELECTABLE_CLASS_DEFS()
    render(
      <I18nProvider>
        <ClassPicker value={classDefs[0].id} onChange={() => {}} />
      </I18nProvider>,
    )

    const selectedTile = screen.getByRole("button", { name: new RegExp(classDefs[0].displayName) })
    expect(selectedTile).toHaveAttribute("aria-current", "true")

    if (classDefs.length > 1) {
      const otherTile = screen.getByRole("button", { name: new RegExp(classDefs[1].displayName) })
      expect(otherTile).toHaveAttribute("aria-current", "false")
    }
  })

  it("offers Min Build and Max Build options instead of the external link", () => {
    const onSelectBuild = vi.fn()
    render(
      <I18nProvider>
        <ClassPicker
          value={SELECTABLE_CLASS_DEFS()[0].id}
          onChange={() => {}}
          onSelectBuild={onSelectBuild}
        />
      </I18nProvider>,
    )

    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    const minBuildBtn = screen.getByRole("button", { name: /Min Build/i })
    const maxBuildBtn = screen.getByRole("button", { name: /Max Build/i })
    expect(minBuildBtn).toBeInTheDocument()
    expect(maxBuildBtn).toBeInTheDocument()

    maxBuildBtn.click()
    expect(onSelectBuild).toHaveBeenCalledWith("graduation-stonesplitStrength-max-build")
  })

  it("badges every unvalidated class as WIP, and no validated one", () => {
    render(
      <I18nProvider>
        <ClassPicker value={SELECTABLE_CLASS_DEFS()[0].id} onChange={() => {}} />
      </I18nProvider>,
    )

    for (const classDef of SELECTABLE_CLASS_DEFS()) {
      const tile = screen.getByRole("button", {
        name: new RegExp(classDef.displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      if (classDef.validated) expect(tile).not.toHaveTextContent("WIP")
      else expect(tile).toHaveTextContent("WIP")
    }
  })
})
