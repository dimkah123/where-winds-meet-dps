import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { ItemRankingRow } from "../../src/engine/types"
import { I18nContext } from "../../src/i18n/i18nContext"
import { translate, type Locale } from "../../src/i18n/translations"
import {
  getRuStatWord,
  ItemRankingTable,
} from "../../src/ui/features/overview/item-ranking-table/ItemRankingTable"

function renderWithLocale(ui: React.ReactNode, locale: Locale) {
  return render(
    <I18nContext.Provider
      value={{
        locale,
        setLocale: () => {},
        t: (key, fallback) => translate(key, locale, fallback),
      }}
    >
      {ui}
    </I18nContext.Provider>,
  )
}

function makeDummyRow(id: string, liftPercent: number, leadVsMin: number | string): ItemRankingRow {
  return {
    statLineId: id,
    label: `Stat ${id}`,
    labelKey: `stats.${id}`,
    source: "tunement",
    amount: 10,
    unit: "raw",
    expectedDps: 50000 + liftPercent * 10000,
    dpsDelta: liftPercent * 10000,
    liftPercent,
    leadVsMin,
  }
}

describe("getRuStatWord", () => {
  it("pluralizes correctly for Russian numerals", () => {
    expect(getRuStatWord(1)).toBe("стат")
    expect(getRuStatWord(2)).toBe("стата")
    expect(getRuStatWord(4)).toBe("стата")
    expect(getRuStatWord(5)).toBe("статов")
    expect(getRuStatWord(11)).toBe("статов")
    expect(getRuStatWord(14)).toBe("статов")
    expect(getRuStatWord(21)).toBe("стат")
    expect(getRuStatWord(22)).toBe("стата")
    expect(getRuStatWord(23)).toBe("стата")
    expect(getRuStatWord(25)).toBe("статов")
  })
})

describe("ItemRankingTable collapsing and expanding", () => {
  it("hides stats with lead < 1 behind 'Показать ещё 23 стата' and toggles on click", () => {
    // 3 high lead rows (>= 1)
    const highLeadRows: ItemRankingRow[] = [
      makeDummyRow("top1", 0.08, 2.5),
      makeDummyRow("top2", 0.06, 1.8),
      makeDummyRow("top3", 0.04, 1.0),
    ]
    // 23 low lead rows (< 1)
    const lowLeadRows: ItemRankingRow[] = Array.from({ length: 23 }, (_, i) =>
      makeDummyRow(`low_${i + 1}`, 0.02 - i * 0.0005, 0.8 - i * 0.03),
    )

    const allRows = [...highLeadRows, ...lowLeadRows]

    renderWithLocale(<ItemRankingTable rows={allRows} />, "ru")

    // Should only show 3 rows in tbody initially
    const highLeadItem = screen.getByText("Stat top1")
    expect(highLeadItem).toBeInTheDocument()
    expect(screen.queryByText("Stat low_1")).toBeNull()

    // Button should show exact pluralized count "Показать ещё 23 стата"
    const toggleButton = screen.getByRole("button", { name: /Показать ещё 23 стата/ })
    expect(toggleButton).toBeInTheDocument()

    // Expand
    fireEvent.click(toggleButton)

    // Now all 26 rows should be visible
    expect(screen.getByText("Stat low_1")).toBeInTheDocument()
    expect(screen.getByText("Stat low_23")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Скрыть дополнительные статы/ })).toBeInTheDocument()

    // Collapse back
    fireEvent.click(screen.getByRole("button", { name: /Скрыть дополнительные статы/ }))
    expect(screen.queryByText("Stat low_1")).toBeNull()
    expect(screen.getByRole("button", { name: /Показать ещё 23 стата/ })).toBeInTheDocument()
  })

  it("shows English localized label when locale is en", () => {
    const highLeadRows = [makeDummyRow("top1", 0.08, 1.5)]
    const lowLeadRows = Array.from({ length: 23 }, (_, i) =>
      makeDummyRow(`low_${i + 1}`, 0.02, 0.5),
    )

    renderWithLocale(<ItemRankingTable rows={[...highLeadRows, ...lowLeadRows]} />, "en")

    const toggleButton = screen.getByRole("button", { name: /Show 23 more stats/ })
    expect(toggleButton).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(screen.getByRole("button", { name: /Show less/ })).toBeInTheDocument()
  })
})
