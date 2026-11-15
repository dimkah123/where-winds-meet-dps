import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { classDefinition } from "../../src/definitions/classes/registry"
import type { GraduationBuild } from "../../src/definitions/graduationBuilds/graduationBuildDef"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { GraduationBuildPicker } from "../../src/ui/features/gear/graduation-build-picker/GraduationBuildPicker"

const [umbraBuild] = classDefinition("bellstrikeUmbra")!.graduationBuilds
const FIRST: GraduationBuild = { ...umbraBuild, id: "picker-first", name: "First Example" }
const SECOND: GraduationBuild = {
  ...umbraBuild,
  id: "picker-second",
  name: "Second Example",
  bowSet: "affinity",
}

function renderPicker(followedBuildId: string | null, onFollow = vi.fn()) {
  render(
    <I18nProvider>
      <GraduationBuildPicker
        builds={[FIRST, SECOND]}
        followedBuildId={followedBuildId}
        onFollow={onFollow}
      />
    </I18nProvider>,
  )
  return onFollow
}

describe("GraduationBuildPicker", () => {
  it("marks the followed build and leaves the others unchecked", () => {
    renderPicker(SECOND.id)

    expect(screen.getByRole("radio", { name: /Second Example/ })).toBeChecked()
    expect(screen.getByRole("radio", { name: /First Example/ })).not.toBeChecked()
    expect(screen.getAllByText("Following")).toHaveLength(1)
  })

  it("checks nothing while no build is followed", () => {
    renderPicker(null)

    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked()
    expect(screen.queryByText("Following")).toBeNull()
  })

  it("follows a build the moment it is picked", () => {
    const onFollow = renderPicker(FIRST.id)

    fireEvent.click(screen.getByRole("radio", { name: /Second Example/ }))

    expect(onFollow).toHaveBeenCalledWith(SECOND.id)
  })

  it("supports Stonesplit archetypes (Mix Build & Pure Heng) tabs with Min/Max options", () => {
    const stonesplitBuilds = classDefinition("stonesplitStrength")!.graduationBuilds
    const onFollow = vi.fn()
    const { rerender } = render(
      <I18nProvider>
        <GraduationBuildPicker
          builds={stonesplitBuilds}
          followedBuildId="graduation-stonesplitStrength-max-build"
          onFollow={onFollow}
        />
      </I18nProvider>,
    )

    const mixTab = screen.getByRole("tab", { name: /Mix Build/i })
    const pureHengTab = screen.getByRole("tab", { name: /Pure Heng/i })
    expect(mixTab).toBeInTheDocument()
    expect(pureHengTab).toBeInTheDocument()
    expect(mixTab).toHaveAttribute("aria-selected", "true")

    // Inside Mix tab, offers Max Build and Min Build
    expect(screen.getByRole("radio", { name: /Max Build/i })).toBeChecked()
    expect(screen.getByRole("radio", { name: /Min Build/i })).not.toBeChecked()

    // Switch to Pure Heng tab
    fireEvent.click(pureHengTab)
    expect(pureHengTab).toHaveAttribute("aria-selected", "true")

    // Click Pure Heng Min Build
    const minRadio = screen.getByRole("radio", { name: /Min Build/i })
    fireEvent.click(minRadio)
    expect(onFollow).toHaveBeenCalledWith("graduation-stonesplitStrength-pureHeng-min-build")

    // When rerendered with followed Pure Heng build, Pure Heng tab remains active
    rerender(
      <I18nProvider>
        <GraduationBuildPicker
          builds={stonesplitBuilds}
          followedBuildId="graduation-stonesplitStrength-pureHeng-min-build"
          onFollow={onFollow}
        />
      </I18nProvider>,
    )
    expect(pureHengTab).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("radio", { name: /Min Build/i })).toBeChecked()
  })
})
