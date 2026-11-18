import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { ShareBuildDialog } from "../../src/ui/features/share/share-build-dialog/ShareBuildDialog"
import { SharedBuildBanner } from "../../src/ui/layout/shared-build-banner/SharedBuildBanner"
import { defaultInputs } from "../../src/engine/defaults"
import type { Result } from "../../src/engine/types"

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

describe("Share Build & Showcase Card UI", () => {
  it("renders ShareBuildDialog with default author, title, and link", () => {
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
  })

  it("switches to character card tab and shows action buttons", () => {
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

    const cardTab = screen.getByRole("tab", { name: /Карточка персонажа/ })
    fireEvent.click(cardTab)

    expect(screen.getByRole("button", { name: /Скопировать картинку/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Скачать PNG/ })).toBeInTheDocument()
  })

  it("renders SharedBuildBanner and triggers callbacks", () => {
    const handleSave = vi.fn()
    const handleDismiss = vi.fn()

    render(
      <SharedBuildBanner
        author="Dimka"
        title="Stonesplit 85k"
        onSave={handleSave}
        onDismiss={handleDismiss}
      />,
    )

    expect(screen.getByText(/Загружена сборка игрока/)).toBeInTheDocument()
    expect(screen.getByText("Dimka")).toBeInTheDocument()
    expect(screen.getByText("«Stonesplit 85k»")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Сохранить в мои профили/ }))
    expect(handleSave).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }))
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })
})
