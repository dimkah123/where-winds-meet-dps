import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { ShareBuildDialog } from "../../src/ui/features/share/share-build-dialog/ShareBuildDialog"
import { SharedBuildBanner } from "../../src/ui/layout/shared-build-banner/SharedBuildBanner"
import { defaultInputs } from "../../src/engine/defaults"
import type { Result } from "../../src/engine/types"
import { kvStore } from "../../src/kvStore"

const mockResult: Result = {
  dps: 85250,
  totalDamage: 5115000,
  rotationDuration: 60,
  fightStartSec: 0,
  castDuration: 60,
  graduationRate: 0.998,
  perSkill: [],
  ranking: [],
  warnings: [],
}

describe("Share Build & Showcase Card UI (English & Russian Localization)", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders ShareBuildDialog in English when locale is en", () => {
    kvStore.set("wwm.locale", "en")
    const handleClose = vi.fn()

    render(
      <I18nProvider>
        <ShareBuildDialog
          inputs={defaultInputs}
          result={mockResult}
          defaultAuthor="Dimka"
          defaultTitle="Stonesplit 85k"
          onClose={handleClose}
        />
      </I18nProvider>,
    )

    expect(screen.getByText("Share Build")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Dimka")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Stonesplit 85k")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy Link" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy Code" })).toBeInTheDocument()

    const cardTab = screen.getByRole("tab", { name: /Showcase Card/ })
    fireEvent.click(cardTab)

    expect(screen.getByRole("button", { name: /Copy Image/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Download PNG/ })).toBeInTheDocument()
  })

  it("renders ShareBuildDialog in Russian when locale is ru", () => {
    kvStore.set("wwm.locale", "ru")
    const handleClose = vi.fn()

    render(
      <I18nProvider>
        <ShareBuildDialog
          inputs={defaultInputs}
          result={mockResult}
          defaultAuthor="Dimka"
          defaultTitle="Stonesplit 85k"
          onClose={handleClose}
        />
      </I18nProvider>,
    )

    expect(screen.getByText("Поделиться сборкой")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Dimka")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Stonesplit 85k")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Копировать ссылку" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Копировать код" })).toBeInTheDocument()

    const cardTab = screen.getByRole("tab", { name: /Карточка персонажа/ })
    fireEvent.click(cardTab)

    expect(screen.getByRole("button", { name: /Скопировать картинку/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Скачать PNG/ })).toBeInTheDocument()
  })

  it("renders SharedBuildBanner and handles callbacks in English and Russian", () => {
    kvStore.set("wwm.locale", "en")
    const handleSave = vi.fn()
    const handleDismiss = vi.fn()

    const { unmount } = render(
      <I18nProvider>
        <SharedBuildBanner
          author="Dimka"
          title="Stonesplit 85k"
          onSave={handleSave}
          onDismiss={handleDismiss}
        />
      </I18nProvider>,
    )

    expect(screen.getByText(/Loaded build of player/)).toBeInTheDocument()
    expect(screen.getByText("Dimka")).toBeInTheDocument()
    expect(screen.getByText("«Stonesplit 85k»")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Save to my profiles/ }))
    expect(handleSave).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(handleDismiss).toHaveBeenCalledTimes(1)

    unmount()

    // Test in Russian
    kvStore.set("wwm.locale", "ru")
    render(
      <I18nProvider>
        <SharedBuildBanner
          author="Dimka"
          title="Stonesplit 85k"
          onSave={handleSave}
          onDismiss={handleDismiss}
        />
      </I18nProvider>,
    )

    expect(screen.getByText(/Загружена сборка игрока/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Сохранить в мои профили/ }))
    expect(handleSave).toHaveBeenCalledTimes(2)
  })
})
