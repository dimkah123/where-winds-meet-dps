import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ClassPicker } from "../../src/ui/features/setup/class-picker/ClassPicker"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { classDefinition } from "../../src/definitions/classes/registry"

describe("ClassPicker", () => {
  it("offers Mix Build and Pure Heng tiles, and each names the martial arts", () => {
    render(
      <I18nProvider>
        <ClassPicker value="stonesplitStrength" onChange={() => {}} />
      </I18nProvider>,
    )

    const mixTile = screen.getByRole("button", { name: /Mix Build/i })
    const pureHengTile = screen.getByRole("button", { name: /Pure Heng/i })
    expect(mixTile).toBeInTheDocument()
    expect(pureHengTile).toBeInTheDocument()

    const martialArts = classDefinition("stonesplitStrength")!.martialArts
    for (const martialArt of martialArts) {
      expect(mixTile).toHaveTextContent(martialArt.name)
      expect(pureHengTile).toHaveTextContent(martialArt.name)
    }
  })

  it("clicking an archetype tile reports class id and selects corresponding build", () => {
    const onChange = vi.fn()
    const onSelectBuild = vi.fn()
    render(
      <I18nProvider>
        <ClassPicker
          value="stonesplitStrength"
          selectedBuildId="graduation-stonesplitStrength-max-build"
          onChange={onChange}
          onSelectBuild={onSelectBuild}
        />
      </I18nProvider>,
    )

    screen.getByRole("button", { name: /Pure Heng/i }).click()
    expect(onChange).toHaveBeenCalledWith("stonesplitStrength")
    expect(onSelectBuild).toHaveBeenCalledWith("graduation-stonesplitStrength-pureHeng-max-build")
  })

  it("marks the active archetype tile as current", () => {
    const { rerender } = render(
      <I18nProvider>
        <ClassPicker
          value="stonesplitStrength"
          selectedBuildId="graduation-stonesplitStrength-max-build"
          onChange={() => {}}
        />
      </I18nProvider>,
    )

    const mixTile = screen.getByRole("button", { name: /Mix Build/i })
    const pureHengTile = screen.getByRole("button", { name: /Pure Heng/i })
    expect(mixTile).toHaveAttribute("aria-current", "true")
    expect(pureHengTile).toHaveAttribute("aria-current", "false")

    rerender(
      <I18nProvider>
        <ClassPicker
          value="stonesplitStrength"
          selectedBuildId="graduation-stonesplitStrength-pureHeng-min-build"
          onChange={() => {}}
        />
      </I18nProvider>,
    )

    expect(mixTile).toHaveAttribute("aria-current", "false")
    expect(pureHengTile).toHaveAttribute("aria-current", "true")
  })

  it("offers Min Build and Max Build options for Mix Build", () => {
    const onSelectBuild = vi.fn()
    render(
      <I18nProvider>
        <ClassPicker
          value="stonesplitStrength"
          selectedBuildId="graduation-stonesplitStrength-max-build"
          onChange={() => {}}
          onSelectBuild={onSelectBuild}
        />
      </I18nProvider>,
    )

    const minBuildBtn = screen.getByRole("button", { name: /Min Build/i })
    const maxBuildBtn = screen.getByRole("button", { name: /Max Build/i })
    expect(minBuildBtn).toBeInTheDocument()
    expect(maxBuildBtn).toBeInTheDocument()

    minBuildBtn.click()
    expect(onSelectBuild).toHaveBeenCalledWith("graduation-stonesplitStrength-cleftpeak-crit")
  })

  it("offers Min Build and Max Build options for Pure Heng", () => {
    const onSelectBuild = vi.fn()
    render(
      <I18nProvider>
        <ClassPicker
          value="stonesplitStrength"
          selectedBuildId="graduation-stonesplitStrength-pureHeng-max-build"
          onChange={() => {}}
          onSelectBuild={onSelectBuild}
        />
      </I18nProvider>,
    )

    const minBuildBtn = screen.getByRole("button", { name: /Min Build/i })
    minBuildBtn.click()
    expect(onSelectBuild).toHaveBeenCalledWith("graduation-stonesplitStrength-pureHeng-min-build")
  })
})
