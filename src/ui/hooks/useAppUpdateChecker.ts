import { useCallback, useEffect, useRef, useState } from "react"
import { BUILD_INFO, type BuildInfo } from "../../buildInfo"

export interface AppUpdateState {
  hasUpdate: boolean
  serverVersion: string | null
  dismissed: boolean
  dismiss: () => void
  reload: () => void
  checkNow: () => Promise<boolean>
}

const CHECK_INTERVAL_MS = 60_000 // 1 minute
const INITIAL_DELAY_MS = 8_000 // 8 seconds after initial load

export function useAppUpdateChecker(): AppUpdateState {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [serverVersion, setServerVersion] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const checkingRef = useRef(false)

  const checkNow = useCallback(async (): Promise<boolean> => {
    if (checkingRef.current) return false
    checkingRef.current = true
    try {
      const url = `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      if (!response.ok) return false
      const data = (await response.json()) as BuildInfo
      if (!data || typeof data.buildTime !== "number") return false

      const isNewer = data.buildTime > BUILD_INFO.buildTime || data.version !== BUILD_INFO.version

      if (isNewer) {
        setHasUpdate(true)
        setServerVersion(data.version)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      checkingRef.current = false
    }
  }, [])

  const reload = useCallback(() => {
    window.location.reload()
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      void checkNow()
    }, INITIAL_DELAY_MS)

    const interval = setInterval(() => {
      void checkNow()
    }, CHECK_INTERVAL_MS)

    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        void checkNow()
      }
    }

    window.addEventListener("focus", onFocusOrVisible)
    document.addEventListener("visibilitychange", onFocusOrVisible)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
      window.removeEventListener("focus", onFocusOrVisible)
      document.removeEventListener("visibilitychange", onFocusOrVisible)
    }
  }, [checkNow])

  return {
    hasUpdate,
    serverVersion,
    dismissed,
    dismiss,
    reload,
    checkNow,
  }
}
