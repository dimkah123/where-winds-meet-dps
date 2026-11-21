import { useCallback, useEffect, useState } from "react"

export interface PipOptions {
  width?: number
  height?: number
  title?: string
}

export function copyStylesheetsToWindow(targetWin: Window, title: string) {
  try {
    targetWin.document.title = title
    targetWin.document.body.style.margin = "0"
    targetWin.document.body.style.padding = "0"
    targetWin.document.body.style.background = "#141416"
    targetWin.document.body.style.color = "#e8e8e8"
    targetWin.document.body.style.fontFamily =
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    targetWin.document.body.style.overflow = "hidden"

    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.href) {
          const link = targetWin.document.createElement("link")
          link.rel = "stylesheet"
          link.href = sheet.href
          targetWin.document.head.appendChild(link)
        } else if (sheet.cssRules) {
          const style = targetWin.document.createElement("style")
          Array.from(sheet.cssRules).forEach((rule) => {
            style.appendChild(targetWin.document.createTextNode(rule.cssText))
          })
          targetWin.document.head.appendChild(style)
        }
      } catch {
        if (sheet.href) {
          const link = targetWin.document.createElement("link")
          link.rel = "stylesheet"
          link.href = sheet.href
          targetWin.document.head.appendChild(link)
        }
      }
    })
  } catch {
    // Ignored
  }
}

const SAVED_W_KEY = "wwm.trainer.pipWidth.v3"
const SAVED_H_KEY = "wwm.trainer.pipHeight.v3"
export const DEFAULT_PIP_WIDTH = 760
export const DEFAULT_PIP_HEIGHT = 165

export function getSavedPipDimensions(): { width: number; height: number } {
  if (typeof localStorage === "undefined") {
    return { width: DEFAULT_PIP_WIDTH, height: DEFAULT_PIP_HEIGHT }
  }
  const savedW = Number(localStorage.getItem(SAVED_W_KEY))
  const savedH = Number(localStorage.getItem(SAVED_H_KEY))
  return {
    width: savedW >= 550 && savedW <= 1600 ? savedW : DEFAULT_PIP_WIDTH,
    height: savedH >= 140 && savedH <= 220 ? savedH : DEFAULT_PIP_HEIGHT,
  }
}

function attachWindowResizeListener(targetWin: Window) {
  let timer: ReturnType<typeof setTimeout> | undefined
  targetWin.addEventListener("resize", () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      try {
        const curW = targetWin.innerWidth || targetWin.outerWidth
        const curH = targetWin.innerHeight || targetWin.outerHeight
        if (curW >= 550 && curW <= 1600) {
          localStorage.setItem(SAVED_W_KEY, String(curW))
        }
        // Only save normal overlay heights (not oversized dialogs like 540px)
        if (curH >= 140 && curH <= 220) {
          localStorage.setItem(SAVED_H_KEY, String(curH))
        }
      } catch {}
    }, 250)
  })
}

export function useDocumentPictureInPicture() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null)

  const openPip = useCallback(
    async (options: PipOptions = {}) => {
      const defaultDims = getSavedPipDimensions()
      const width = options.width ?? defaultDims.width
      const height = options.height ?? defaultDims.height
      const title = options.title ?? "WWM Rotation Trainer"

      // 1. Try Document Picture-in-Picture API
      if (typeof window !== "undefined" && "documentPictureInPicture" in window) {
        try {
          const docPip = (window as unknown as {
            documentPictureInPicture: {
              requestWindow(opts: { width: number; height: number }): Promise<Window>
            }
          }).documentPictureInPicture

          const win = await docPip.requestWindow({ width, height })
          copyStylesheetsToWindow(win, title)
          attachWindowResizeListener(win)

          win.addEventListener("pagehide", () => {
            setPipWindow(null)
          })

          setPipWindow(win)
          return win
        } catch (err) {
          console.warn("Document PiP request error, falling back to popup window", err)
        }
      }

      // 2. Fallback popup window
      const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2))
      const top = Math.max(0, Math.round(window.screen.availHeight - height - 80))
      const popup = window.open(
        "",
        "wwm_trainer_pip",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no`,
      )

      if (popup) {
        copyStylesheetsToWindow(popup, title)
        attachWindowResizeListener(popup)
        popup.addEventListener("beforeunload", () => {
          setPipWindow(null)
        })
        setPipWindow(popup)
        return popup
      }

      return null
    },
    [],
  )

  const closePip = useCallback(() => {
    if (pipWindow) {
      try {
        pipWindow.close()
      } catch {
        // Ignored
      }
      setPipWindow(null)
    }
  }, [pipWindow])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pipWindow) {
        try {
          pipWindow.close()
        } catch {
          // Ignored
        }
      }
    }
  }, [pipWindow])

  return {
    pipWindow,
    isOpen: Boolean(pipWindow),
    openPip,
    closePip,
  }
}
