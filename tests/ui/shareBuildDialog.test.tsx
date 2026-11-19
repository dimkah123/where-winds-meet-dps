import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { ShareBuildDialog } from "../../src/ui/features/share/share-build-dialog/ShareBuildDialog"
import { SharedBuildBanner } from "../../src/ui/layout/shared-build-banner/SharedBuildBanner"
import { drawBuildCard, type BuildCardData, type BuildCardLabels } from "../../src/ui/features/share/build-showcase/drawBuildCard"
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

  it("drawBuildCard renders complete build showcase data to canvas without errors", () => {
    const filledTexts: string[] = []
    const mockCtx = {
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn((text: string) => filledTexts.push(text)),
      measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      roundRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      font: "",
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      textAlign: "left",
    }

    const mockCanvas = {
      width: 1200,
      height: 675,
      getContext: vi.fn((type: string) => (type === "2d" ? mockCtx : null)),
    } as unknown as HTMLCanvasElement

    const cardData: BuildCardData = {
      author: "Лёха",
      title: "Mixed 1 Min",
      classDisplayName: "Stonesplit Strength",
      breakthroughText: "Прорыв 18 (100 ур.)",
      dps: 83675.68,
      totalDamage: 5020541,
      rotationDuration: 60,
      rotationName: "Mixed 1 Min",

      minPhys: 2751.66,
      maxPhys: 2501.22,
      physPenetration: 0.511,

      elements: [
        { id: "stonesplit", name: "Камнелом", min: 374.3, max: 845.72, isPrimary: true, penetration: 0.296 },
        { id: "bellstrike", name: "Колокольный Удар", min: 48.32, max: 0 },
        { id: "bamboocut", name: "Бамбуковый клинок", min: 96.64, max: 0 },
        { id: "silkbind", name: "Шелковые путы", min: 0, max: 0 },
      ],
      formlessMin: 26.4,
      formlessMax: 123.32,

      critRate: 0.7803,
      directCritRate: 0.092,
      precisionRate: 0.931,
      affinityRate: 0.1033,
      agility: 517.64,
      power: 187,
      momentum: 187,
      body: 187,
      defense: 187,
      physDefense: 656.19,
      baseHp: 181541,
      effHp: 217849,

      allMartialBoost: 0.0676,
      bossBoost: 0.0737,
      critDamageBoost: 0.54,
      attributeDamageBoost: 0.118,
      topClassBoost: {
        label: "Mo - Charge Boost",
        value: 0.279,
      },

      armorSetName: "Шлем Туманистого хребта (4/4)",
      bowSetName: "Комплект Двойного дракона",
      bowSetBonus: "+12.8% Физ. пробитие",
      scriptName: "Свиток прозрения",
      divinecraftName: "Огненное масло (Тлеющий пепел)",
      foodName: "Жаркое из оленины",
      innerWays: ["Frost-Clad Night", "Morale Chant", "Steadfast Devotion", "Throat-Pierce"],
      bossName: "Хозяин Реки",
      resistance: 85,
    }

    const labels: BuildCardLabels = {
      playerBuildPrefix: "Сборка игрока:",
      defaultPlayer: "Игрок",
      heroDpsTitle: "ИТОГОВЫЙ УРОН В СЕКУНДУ (DPS)",
      totalDamage: "Всего урона",
      duration: "Длительность",
      rotation: "Ротация",
      panelStatsTitle: "ХАРАКТЕРИСТИКИ ПАНЕЛИ",
      resistanceLabel: "Сопротивление",
      gearTitle: "КОМПЛЕКТЫ И СТОЛКНОВЕНИЕ",
      attributesTitle: "АТРИБУТЫ",
      threeRatesTitle: "ТРОЙНЫЕ ШАНСЫ",
      attackTitle: "АТАКА И ПРОНИКНОВЕНИЕ",
      damageBoostsTitle: "УВЕЛИЧЕНИЕ И СНИЖЕНИЕ УРОНА",
      physAttackLabel: "Физ. атака (Мин – Макс)",
      minPhysAttackLabel: "Мин. физ. атака",
      maxPhysAttackLabel: "Макс. физ. атака",
      physPenLabel: "Физ. пробитие",
      attrPenLabel: "Пробитие: {attr}",
      minFormlessLabel: "Мин. бесформенная атака",
      maxFormlessLabel: "Макс. бесформенная атака",
      agilityLabel: "Ловкость (Agility)",
      powerLabel: "Сила (Power)",
      critLabel: "Крит. шанс",
      precisionLabel: "Точность (Precision)",
      affinityLabel: "Сокрушение (Affinity)",
      allMartialArtsLabel: "Все боевые искусства",
      bossBoostLabel: "Урон против боссов",
      classSkillBoostLabel: "Навык класса",
      armorSetLabel: "Комплект брони (4/4):",
      bowSetLabel: "Комплект лука (2/2):",
      scriptLabel: "Крафтовый свиток:",
      divinecraftLabel: "Ремесло / Масло:",
      foodLabel: "Боевая еда:",
      noScript: "Без свитка",
      innerWaysLabel: "Внутренние пути (4/4):",
      notEquipped: "Не надет",
      generated: "Сгенерировано:",
      locale: "ru",
    }

    expect(() => drawBuildCard(mockCanvas, cardData, labels)).not.toThrow()
    expect(mockCtx.fillText).toHaveBeenCalled()

    // Verify key rendered values exist in text draws
    expect(filledTexts.some((t) => t.includes("83,676"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("Лёха"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("5.0M") || t.includes("5,020,541"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("Mixed 1 Min"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("2,751.66"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("2,501.22"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("51.1"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("374.30"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("845.72"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("29.6"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("48.32"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("96.64"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("26.40"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("123.32"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("78.03%"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("9.2%"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("517.64"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("+6.76%"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("+7.37%"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("+54%"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("Mo - Charge Boost"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("+27.9%"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("Frost-Clad Night"))).toBe(true)
    expect(filledTexts.some((t) => t.includes("181,541 → 217,849"))).toBe(true)
  })
})
