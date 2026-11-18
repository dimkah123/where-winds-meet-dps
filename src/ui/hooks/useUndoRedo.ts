import { useCallback, useEffect, useRef, useState } from "react"

const MAX_HISTORY_STEPS = 50

export interface UndoRedo<T> {
  state: T
  set: (next: T) => void
  reset: (initial: T) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  pastLength: number
  futureLength: number
}

export function useUndoRedo<T>(
  initialState: T,
  options?: {
    isEqual?: (a: T, b: T) => boolean
    enableKeyboardShortcuts?: boolean
  },
): UndoRedo<T> {
  const isEqual =
    options?.isEqual ??
    ((a: T, b: T) => {
      if (a === b) return true
      try {
        return JSON.stringify(a) === JSON.stringify(b)
      } catch {
        return false
      }
    })

  const [past, setPast] = useState<T[]>([])
  const [present, setPresent] = useState<T>(initialState)
  const [future, setFuture] = useState<T[]>([])

  const presentRef = useRef(present)
  presentRef.current = present

  const pastRef = useRef(past)
  pastRef.current = past

  const futureRef = useRef(future)
  futureRef.current = future

  const set = useCallback(
    (next: T) => {
      const current = presentRef.current
      if (isEqual(current, next)) return

      setPast((prev) => {
        const updated = [...prev, current]
        if (updated.length > MAX_HISTORY_STEPS) {
          return updated.slice(updated.length - MAX_HISTORY_STEPS)
        }
        return updated
      })
      setPresent(next)
      setFuture([])
    },
    [isEqual],
  )

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast
      const previous = prevPast[prevPast.length - 1]
      const nextPast = prevPast.slice(0, prevPast.length - 1)

      setFuture((prevFuture) => [presentRef.current, ...prevFuture])
      setPresent(previous)
      return nextPast
    })
  }, [])

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture
      const next = prevFuture[0]
      const nextFuture = prevFuture.slice(1)

      setPast((prevPast) => {
        const updated = [...prevPast, presentRef.current]
        if (updated.length > MAX_HISTORY_STEPS) {
          return updated.slice(updated.length - MAX_HISTORY_STEPS)
        }
        return updated
      })
      setPresent(next)
      return nextFuture
    })
  }, [])

  const reset = useCallback((initial: T) => {
    setPast([])
    setFuture([])
    setPresent(initial)
  }, [])

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const enableShortcuts = options?.enableKeyboardShortcuts ?? true

  useEffect(() => {
    if (!enableShortcuts) return

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      if (!isCtrlOrCmd) return

      if (e.key === "z" || e.key === "Z") {
        if (e.shiftKey) {
          if (futureRef.current.length > 0) {
            e.preventDefault()
            redo()
          }
        } else {
          if (pastRef.current.length > 0) {
            e.preventDefault()
            undo()
          }
        }
      } else if (e.key === "y" || e.key === "Y") {
        if (futureRef.current.length > 0) {
          e.preventDefault()
          redo()
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enableShortcuts, undo, redo])

  return {
    state: present,
    set,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
    pastLength: past.length,
    futureLength: future.length,
  }
}
