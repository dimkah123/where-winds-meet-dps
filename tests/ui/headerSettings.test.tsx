import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import {
  DEFAULT_HEADER_SETTINGS,
  getStoredHeaderSettings,
  useHeaderSettings,
} from "../../src/ui/hooks/useHeaderSettings"

describe("useHeaderSettings", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("returns defaults when storage is empty", () => {
    const { result } = renderHook(() => useHeaderSettings())
    expect(result.current.settings).toEqual(DEFAULT_HEADER_SETTINGS)
    expect(result.current.settings.showProfile).toBe(true)
    expect(result.current.settings.showShare).toBe(true)
    expect(result.current.settings.showUndoRedo).toBe(true)
    expect(result.current.settings.showSaveReset).toBe(true)
  })

  it("updates individual setting and persists to localStorage", () => {
    const { result } = renderHook(() => useHeaderSettings())

    act(() => {
      result.current.updateSetting("showProfile", false)
    })

    expect(result.current.settings.showProfile).toBe(false)
    expect(result.current.settings.showUndoRedo).toBe(true)

    // Check localStorage persistence
    const stored = getStoredHeaderSettings()
    expect(stored.showProfile).toBe(false)
  })

  it("resets back to default settings", () => {
    const { result } = renderHook(() => useHeaderSettings())

    act(() => {
      result.current.updateSetting("showUndoRedo", false)
      result.current.updateSetting("showSaveReset", false)
    })

    expect(result.current.settings.showUndoRedo).toBe(false)
    expect(result.current.settings.showSaveReset).toBe(false)

    act(() => {
      result.current.resetSettings()
    })

    expect(result.current.settings).toEqual(DEFAULT_HEADER_SETTINGS)
  })
})
