import type { QiEdgeWarning, Result } from "../../../engine/types"

export function getQiEdgeWarningKey(w: QiEdgeWarning): string {
  return `qi-edge:${w.skillName}:${w.edge}:${w.side}`
}

export function getGeneralWarningKey(w: string): string {
  if (w.includes("calculated damage is too low for rotation timing")) {
    return "warning:fallback-damage-low"
  }
  return `warning:${w}`
}

export function getAllAlertKeys(result: Result): string[] {
  const keys: string[] = []
  const seenWarnings = new Set<string>()
  for (const w of result.warnings) {
    const key = getGeneralWarningKey(w)
    if (!seenWarnings.has(key)) {
      seenWarnings.add(key)
      keys.push(key)
    }
  }
  for (const q of result.qiEdgeWarnings ?? []) {
    keys.push(getQiEdgeWarningKey(q))
  }
  return keys
}
