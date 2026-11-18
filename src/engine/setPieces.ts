import type { GearPiece, GearSlot, Inputs } from "./types"
import { isWeaponSlot, WEAPON_SLOTS } from "./types"

export const TWO_PIECE_SIZE = 2
export const FOUR_PIECE_SIZE = 4

export function equippedSetBearingPieces(inputs: Inputs): GearPiece[] {
  const pieceById = new Map(inputs.inventory.map((piece) => [piece.id, piece]))
  const pieces: GearPiece[] = []
  for (const slot of WEAPON_SLOTS) {
    const equippedId = inputs.equipped[slot]
    const piece = equippedId ? pieceById.get(equippedId) : undefined
    if (piece) pieces.push(piece)
  }
  return pieces
}

export function setPieceCount(inputs: Inputs, setId: string): number {
  return equippedSetBearingPieces(inputs).filter((piece) => piece.set === setId).length
}

export function setPieceCountWith(inputs: Inputs, pieceId: string, setId: string): number {
  const placed = inputs.inventory.find((piece) => piece.id === pieceId)
  if (!placed || !WEAPON_SLOTS.includes(placed.slot)) return setPieceCount(inputs, setId)
  const pieceById = new Map(inputs.inventory.map((piece) => [piece.id, piece]))
  return WEAPON_SLOTS.filter((slot) => {
    if (slot === placed.slot) return true
    const equippedId = inputs.equipped[slot]
    return equippedId ? pieceById.get(equippedId)?.set === setId : false
  }).length
}

/**
 * Resolves the gear set that belongs to the given slot.
 * If the currently equipped piece in this slot has a set, that set is returned.
 * If the slot has no piece or its piece has no set, it falls back to the dominant
 * set among other equipped weapon slots.
 */
export function slotSetFor(inputs: Inputs, slot: GearSlot): string | undefined {
  if (!isWeaponSlot(slot)) return undefined

  const pieceById = new Map(inputs.inventory.map((piece) => [piece.id, piece]))

  // 1. If currently equipped item in this slot has a set, use it
  const currentEquippedId = inputs.equipped[slot]
  const currentPiece = currentEquippedId ? pieceById.get(currentEquippedId) : undefined
  if (currentPiece?.set) return currentPiece.set

  // 2. Fallback: check other equipped weapon slots for a dominant set
  const otherSets = WEAPON_SLOTS.filter((s) => s !== slot)
    .map((s) => {
      const id = inputs.equipped[s]
      return id ? pieceById.get(id)?.set : undefined
    })
    .filter((s): s is string => typeof s === "string" && s.length > 0)

  if (otherSets.length > 0) {
    const counts = new Map<string, number>()
    for (const s of otherSets) counts.set(s, (counts.get(s) ?? 0) + 1)
    let bestSet: string | undefined
    let maxCount = 0
    for (const [s, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count
        bestSet = s
      }
    }
    return bestSet
  }

  return undefined
}

