import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useUndoRedo } from "../../src/ui/hooks/useUndoRedo"

describe("useUndoRedo hook", () => {
  it("tracks state transitions and enables undo and redo", () => {
    const { result } = renderHook(() => useUndoRedo({ count: 1 }))

    expect(result.current.state.count).toBe(1)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)

    act(() => {
      result.current.set({ count: 2 })
    })

    expect(result.current.state.count).toBe(2)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)

    act(() => {
      result.current.set({ count: 3 })
    })

    expect(result.current.state.count).toBe(3)
    expect(result.current.pastLength).toBe(2)

    // Undo 3 -> 2
    act(() => {
      result.current.undo()
    })

    expect(result.current.state.count).toBe(2)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)

    // Undo 2 -> 1
    act(() => {
      result.current.undo()
    })

    expect(result.current.state.count).toBe(1)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)

    // Redo 1 -> 2
    act(() => {
      result.current.redo()
    })

    expect(result.current.state.count).toBe(2)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)
  })

  it("deduplicates identical states without polluting history", () => {
    const { result } = renderHook(() => useUndoRedo({ a: "foo" }))

    act(() => {
      result.current.set({ a: "foo" })
    })

    expect(result.current.canUndo).toBe(false)
    expect(result.current.pastLength).toBe(0)
  })

  it("clears history on reset", () => {
    const { result } = renderHook(() => useUndoRedo({ a: 1 }))

    act(() => {
      result.current.set({ a: 2 })
    })
    expect(result.current.canUndo).toBe(true)

    act(() => {
      result.current.reset({ a: 99 })
    })

    expect(result.current.state.a).toBe(99)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it("handles keyboard events Ctrl+Z and Ctrl+Y", () => {
    const { result } = renderHook(() => useUndoRedo({ val: "initial" }))

    act(() => {
      result.current.set({ val: "changed" })
    })
    expect(result.current.state.val).toBe("changed")

    // Dispatch Ctrl+Z
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }),
      )
    })
    expect(result.current.state.val).toBe("initial")

    // Dispatch Ctrl+Y
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "y", ctrlKey: true, bubbles: true }),
      )
    })
    expect(result.current.state.val).toBe("changed")
  })
})
