import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { I18nContext } from "../../src/i18n/i18nContext"
import type { Locale } from "../../src/i18n/translations"
import { ChangelogDetails } from "../../src/ui/layout/changelog-details/ChangelogDetails"
import { CHANGELOG_ENTRIES } from "../../src/changelog/registry"

function renderWithLocale(ui: React.ReactNode, locale: Locale) {
  return render(
    <I18nContext.Provider
      value={{
        locale,
        setLocale: () => {},
        t: (key, fallback) => fallback ?? key,
      }}
    >
      {ui}
    </I18nContext.Provider>,
  )
}

describe("changelog translation depending on selected language", () => {
  const entry = CHANGELOG_ENTRIES[0] // v1.1.2

  it("renders in Russian when Russian locale is active", async () => {
    const details = await entry.loadDetails()
    renderWithLocale(
      <ChangelogDetails
        entry={entry}
        details={details}
        isLoading={false}
        hasFailed={false}
      />,
      "ru",
    )

    // Headline in Russian
    expect(
      screen.getByText("Терминология истощения Ци, улучшение интерфейса и строки ротаций"),
    ).toBeInTheDocument()

    // Section labels in Russian
    expect(screen.getByText("Добавлено")).toBeInTheDocument()
    expect(screen.getByText("Изменено")).toBeInTheDocument()

    // Item text in Russian
    expect(
      screen.getByText(
        "Корректные окончания числительных для количества ударов в таймлайне ротации (1 удар, 2 удара, 5 ударов).",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Ширина панели параметров ротации увеличена до 250px для удобного чтения длинных названий.",
      ),
    ).toBeInTheDocument()
  })

  it("renders in English when English locale is active", async () => {
    const details = await entry.loadDetails()
    renderWithLocale(
      <ChangelogDetails
        entry={entry}
        details={details}
        isLoading={false}
        hasFailed={false}
      />,
      "en",
    )

    // Headline in English
    expect(
      screen.getByText("Qi Break Terminology & Layout Polish, Clean Rotation Rows"),
    ).toBeInTheDocument()

    // Section labels in English
    expect(screen.getByText("Added")).toBeInTheDocument()
    expect(screen.getByText("Changed")).toBeInTheDocument()

    // Item text in English
    expect(
      screen.getByText(
        "Proper Russian pluralization for skill hit counts in the rotation timeline (1 удар, 2 удара, 5 ударов).",
      ),
    ).toBeInTheDocument()
  })

  it("renders in Chinese when Chinese locale is active", async () => {
    const details = await entry.loadDetails()
    renderWithLocale(
      <ChangelogDetails
        entry={entry}
        details={details}
        isLoading={false}
        hasFailed={false}
      />,
      "zh",
    )

    // Headline in Chinese
    expect(screen.getByText("气绝术语与布局优化，清晰的循环行")).toBeInTheDocument()

    // Section labels in Chinese
    expect(screen.getByText("新增")).toBeInTheDocument()
    expect(screen.getByText("变更")).toBeInTheDocument()
  })
})
