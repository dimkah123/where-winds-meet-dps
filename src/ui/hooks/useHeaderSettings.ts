import { useCallback, useState } from "react"

export interface HeaderSettings {
  showProfile: boolean
  showShare: boolean
  showUndoRedo: boolean
  showSaveReset: boolean
  collapseHeader: boolean
  gameFonts: boolean
  showLanguage: boolean
}

export const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
  showProfile: true,
  showShare: true,
  showUndoRedo: true,
  showSaveReset: true,
  collapseHeader: false,
  gameFonts: true,
  showLanguage: false,
}

const STORAGE_KEY = "wwm.ui.headerSettings"

export function getStoredHeaderSettings(): HeaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_HEADER_SETTINGS
    const parsed = JSON.parse(raw) as Partial<HeaderSettings>
    return {
      showProfile: typeof parsed.showProfile === "boolean" ? parsed.showProfile : true,
      showShare: typeof parsed.showShare === "boolean" ? parsed.showShare : true,
      showUndoRedo: typeof parsed.showUndoRedo === "boolean" ? parsed.showUndoRedo : true,
      showSaveReset: typeof parsed.showSaveReset === "boolean" ? parsed.showSaveReset : true,
      collapseHeader: typeof parsed.collapseHeader === "boolean" ? parsed.collapseHeader : false,
      gameFonts: typeof parsed.gameFonts === "boolean" ? parsed.gameFonts : true,
      showLanguage: typeof parsed.showLanguage === "boolean" ? parsed.showLanguage : false,
    }
  } catch {
    return DEFAULT_HEADER_SETTINGS
  }
}

export function saveStoredHeaderSettings(settings: HeaderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export function useHeaderSettings() {
  const [settings, setSettings] = useState<HeaderSettings>(getStoredHeaderSettings)

  const updateSetting = useCallback(
    <K extends keyof HeaderSettings>(key: K, value: HeaderSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        saveStoredHeaderSettings(next)
        return next
      })
    },
    [],
  )

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_HEADER_SETTINGS)
    saveStoredHeaderSettings(DEFAULT_HEADER_SETTINGS)
  }, [])

  return {
    settings,
    updateSetting,
    resetSettings,
  }
}
