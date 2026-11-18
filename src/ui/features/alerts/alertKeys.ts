import type { GearPiece, GearSlot, Inputs, QiEdgeWarning, Result } from "../../../engine/types"
import { WEAPON_SLOTS } from "../../../engine/types"

export function getQiEdgeWarningKey(w: QiEdgeWarning): string {
  return `qi-edge:${w.skillName}:${w.edge}:${w.side}`
}

export function getGeneralWarningKey(w: string): string {
  if (w.includes("calculated damage is too low for rotation timing")) {
    return "warning:fallback-damage-low"
  }
  return `warning:${w}`
}

export interface GearSetAlert {
  key: string
  kind: "noSet" | "incomplete"
  slot?: GearSlot
  setName?: string
  count?: number
}

export function getGearSetAlerts(inputs?: Inputs): GearSetAlert[] {
  if (!inputs) return []
  const alerts: GearSetAlert[] = []
  const pieceById = new Map(inputs.inventory.map((p) => [p.id, p]))

  const weaponPiecesWithSet: { slot: GearSlot; piece: GearPiece }[] = []
  const weaponPiecesWithoutSet: { slot: GearSlot; piece: GearPiece }[] = []

  for (const slot of WEAPON_SLOTS) {
    const id = inputs.equipped[slot]
    const piece = id ? pieceById.get(id) : null
    if (piece) {
      if (piece.set) {
        weaponPiecesWithSet.push({ slot, piece })
      } else {
        weaponPiecesWithoutSet.push({ slot, piece })
      }
    }
  }

  // If some weapon pieces have a set, but some have no set
  if (weaponPiecesWithSet.length > 0 && weaponPiecesWithoutSet.length > 0) {
    for (const { slot } of weaponPiecesWithoutSet) {
      alerts.push({
        key: `gear-set-none:${slot}`,
        kind: "noSet",
        slot,
      })
    }
  }

  // Check for incomplete sets (e.g. 1/4 or 3/4)
  const setCounts = new Map<string, number>()
  for (const { piece } of weaponPiecesWithSet) {
    if (piece.set) {
      setCounts.set(piece.set, (setCounts.get(piece.set) ?? 0) + 1)
    }
  }

  for (const [setId, count] of setCounts.entries()) {
    if (count > 0 && count < 4 && count !== 2) {
      alerts.push({
        key: `gear-set-incomplete:${setId}:${count}`,
        kind: "incomplete",
        setName: setId,
        count,
      })
    }
  }

  return alerts
}

export function getAllAlertKeys(result: Result, inputs?: Inputs): string[] {
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
  if (inputs) {
    for (const a of getGearSetAlerts(inputs)) {
      keys.push(a.key)
    }
  }
  return keys
}
