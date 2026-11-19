import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { I18nProvider } from "../../src/i18n/I18nProvider"
import { UpdateBanner } from "../../src/ui/layout/update-banner/UpdateBanner"
import { useAppUpdateChecker } from "../../src/ui/hooks/useAppUpdateChecker"
import { BUILD_INFO } from "../../src/buildInfo"

describe("UpdateBanner & useAppUpdateChecker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("renders UpdateBanner with version and triggers reload and dismiss", () => {
    const onReload = vi.fn()
    const onDismiss = vi.fn()

    render(
      <I18nProvider>
        <UpdateBanner version="1.3.1" onReload={onReload} onDismiss={onDismiss} />
      </I18nProvider>,
    )

    expect(screen.getByText(/1\.3\.1/)).toBeInTheDocument()

    const reloadBtn = screen.getByRole("button", { name: /refresh page|обновить страницу/i })
    fireEvent.click(reloadBtn)
    expect(onReload).toHaveBeenCalledTimes(1)

    const dismissBtn = screen.getByRole("button", { name: /close|закрыть/i })
    fireEvent.click(dismissBtn)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it("detects update when server version.json reports a newer buildTime", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: "1.3.0",
        buildTime: BUILD_INFO.buildTime + 50000,
      }),
    })
    globalThis.fetch = fetchMock

    const { result } = renderHook(() => useAppUpdateChecker())

    expect(result.current.hasUpdate).toBe(false)

    // Trigger check
    let hasUp = false
    await act(async () => {
      hasUp = await result.current.checkNow()
    })

    expect(hasUp).toBe(true)
    expect(result.current.hasUpdate).toBe(true)
    expect(result.current.serverVersion).toBe("1.3.0")
  })

  it("does not trigger update if server reports same or older buildTime", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: BUILD_INFO.version,
        buildTime: BUILD_INFO.buildTime,
      }),
    })
    globalThis.fetch = fetchMock

    const { result } = renderHook(() => useAppUpdateChecker())

    let hasUp = false
    await act(async () => {
      hasUp = await result.current.checkNow()
    })

    expect(hasUp).toBe(false)
    expect(result.current.hasUpdate).toBe(false)
  })
})
