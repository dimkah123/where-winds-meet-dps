import { beforeEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { I18nProvider } from "../../src/i18n/I18nProvider"

async function renderContributors() {
  vi.resetModules()
  const { ChangelogContributors } =
    await import("../../src/ui/layout/changelog-contributors/ChangelogContributors")
  return render(
    <I18nProvider>
      <ChangelogContributors />
    </I18nProvider>,
  )
}

describe("ChangelogContributors", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("links avatar to dimkah123 GitHub profile", async () => {
    await act(async () => {
      await renderContributors()
    })
    const profileLink = screen.getByRole("link", { name: "dimkah123" })
    expect(profileLink).toHaveAttribute("href", "https://github.com/dimkah123")
    expect(profileLink).toHaveAttribute("target", "_blank")
  })

  it("renders only dimkah123 without any other contributors", async () => {
    await act(async () => {
      await renderContributors()
    })
    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute("href", "https://github.com/dimkah123")
  })
})
