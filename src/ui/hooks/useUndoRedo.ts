import { useCallback, useEffect, useReducer, useRef } from "react"

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

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

type HistoryAction<T> =
  | { type: "SET"; next: T; isEqual?: (a: T, b: T) => boolean }
  | { type: "RESET"; initial: T }
  | { type: "UNDO" }
  | { type: "REDO" }

function defaultIsEqual<T>(a: T, b: T): boolean {
  if (a === b) return true
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

function historyReducer<T>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
  switch (action.type) {
    case "SET": {
      const eq = action.isEqual ?? defaultIsEqual
      if (eq(state.present, action.next)) return state
      const updatedPast = [...state.past, state.present]
      const trimmedPast =
        updatedPast.length > MAX_HISTORY_STEPS
          ? updatedPast.slice(updatedPast.length - MAX_HISTORY_STEPS)
          : updatedPast
      return {
        past: trimmedPast,
        present: action.next,
        future: [],
      }
    }
    case "RESET": {
      return {
        past: [],
        present: action.initial,
        future: [],
      }
    }
    case "UNDO": {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      const nextPast = state.past.slice(0, state.past.length - 1)
      return {
        past: nextPast,
        present: previous,
        future: [state.present, ...state.future],
      }
    }
    case "REDO": {
      if (state.future.length === 0) return state
      const next = state.future[0]
      const nextFuture = state.future.slice(1)
      const updatedPast = [...state.past, state.present]
      const trimmedPast =
        updatedPast.length > MAX_HISTORY_STEPS
          ? updatedPast.slice(updatedPast.length - MAX_HISTORY_STEPS)
          : updatedPast
      return {
        past: trimmedPast,
        present: next,
        future: nextFuture,
      }
    }
    default:
      return state
  }
}

export function useUndoRedo<T>(
  initialState: T,
  options?: {
    isEqual?: (a: T, b: T) => boolean
    enableKeyboardShortcuts?: boolean
  },
): UndoRedo<T> {
  const [history, dispatch] = useReducer(historyReducer<T>, {
    past: [],
    present: initialState,
    future: [],
  })

  const historyRef = useRef(history)
  useEffect(() => {
    historyRef.current = history
  })

  const customIsEqual = options?.isEqual
  const set = useCallback(
    (next: T) => {
      dispatch({ type: "SET", next, isEqual: customIsEqual })
    },
    [customIsEqual],
  )

  const reset = useCallback((initial: T) => {
    dispatch({ type: "RESET", initial })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: "REDO" })
  }, [])

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const enableShortcuts = options?.enableKeyboardShortcuts ?? true

  useEffect(() => {
    if (!enableShortcuts) return

    function onKeyDown(e: KeyboardEvent) {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      if (!isCtrlOrCmd) return

      const isZ = e.code === "KeyZ" || e.key.toLowerCase() === "z" || e.key.toLowerCase() === "я"
      const isY = e.code === "KeyY" || e.key.toLowerCase() === "y" || e.key.toLowerCase() === "н"

      if (!isZ && !isY) return

      const target = e.target as HTMLElement | null
      const isTextEntry =
        target &&
        ((target.tagName === "INPUT" &&
          (target as HTMLInputElement).type !== "checkbox" &&
          (target as HTMLInputElement).type !== "radio" &&
          (target as HTMLInputElement).type !== "range" &&
          (target as HTMLInputElement).type !== "button" &&
          (target as HTMLInputElement).type !== "submit") ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)

      if (isTextEntry) {
        return
      }

      if (isZ) {
        if (e.shiftKey) {
          if (historyRef.current.future.length > 0) {
            e.preventDefault()
            dispatch({ type: "REDO" })
          }
        } else {
          if (historyRef.current.past.length > 0) {
            e.preventDefault()
            dispatch({ type: "UNDO" })
          }
        }
      } else if (isY) {
        if (historyRef.current.future.length > 0) {
          e.preventDefault()
          dispatch({ type: "REDO" })
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enableShortcuts])

  return {
    state: history.present,
    set,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
    pastLength: history.past.length,
    futureLength: history.future.length,
  }
}
