import type { GraduationBuild } from "../definitions/graduationBuilds/graduationBuildDef"
import type { GearPiece, GearWordId, Inputs } from "./types"
import { followedGraduationBuildAmong, graduationBuildsForProfile } from "./graduation"
import { ALL_REROLLABLE_SLOTS, retunedOutWordsOf } from "./retunement"
import { gearPieceAtGearLevel } from "../data/classes/graduationGear"
import { gearWordPoolForLine } from "../data/stats/gearWordPools"
import { FOREIGN_ATTRIBUTE_ATTACK_ID } from "../data/stats/statLines"
import { isOffSpecAttributeWord, weaponTypeForSlot } from "../definitions/classes/registry"

export interface HeirloomSwap {
  slotIndex: number
  currentWord: GearWordId | ""
  word: GearWordId | typeof FOREIGN_ATTRIBUTE_ATTACK_ID
  builds: readonly GraduationBuild[]
}

export type HeirloomProfile = Pick<
  Inputs,
  "classId" | "graduationBuildId" | "customGraduationBuild"
>

export interface HeirloomMatch {
  builds: readonly GraduationBuild[]
  followed: boolean
  swaps: readonly HeirloomSwap[]
  swap: HeirloomSwap | null
}

const NO_MATCH: HeirloomMatch = { builds: [], followed: false, swaps: [], swap: null }

function wordIds(piece: Pick<GearPiece, "words">): string[] {
  return piece.words.map((word) => word.word)
}

function sameWordSet(
  piece: Pick<GearPiece, "words">,
  target: GearPiece,
  classId?: string,
): boolean {
  const pieceWords = wordIds(piece)
  const targetWords = wordIds(target)
  if (pieceWords.length !== targetWords.length) return false
  const remainingTarget = [...targetWords]
  const unmatchedPiece: string[] = []

  for (const pw of pieceWords) {
    const idx = remainingTarget.indexOf(pw)
    if (idx >= 0) {
      remainingTarget.splice(idx, 1)
    } else {
      unmatchedPiece.push(pw)
    }
  }

  if (unmatchedPiece.length === 0 && remainingTarget.length === 0) return true
  if (!classId) return false

  const stillUnmatchedPiece: string[] = []
  for (const pw of unmatchedPiece) {
    if (isOffSpecAttributeWord(pw, classId)) {
      const targetOffSpecIdx = remainingTarget.findIndex((tw) =>
        isOffSpecAttributeWord(tw, classId),
      )
      if (targetOffSpecIdx >= 0) {
        remainingTarget.splice(targetOffSpecIdx, 1)
        continue
      }
    }
    stillUnmatchedPiece.push(pw)
  }

  return stillUnmatchedPiece.length === 0 && remainingTarget.length === 0
}

function singleSwapTo(
  piece: GearPiece,
  target: GearPiece,
  build: GraduationBuild,
  classId?: string,
): HeirloomSwap | null {
  const remainingTarget = [...wordIds(target)]
  const unmatchedPiece: { slotIndex: number; word: string }[] = []

  for (const [slotIndex, word] of wordIds(piece).entries()) {
    const found = remainingTarget.indexOf(word)
    if (found >= 0) remainingTarget.splice(found, 1)
    else unmatchedPiece.push({ slotIndex, word })
  }

  const stillUnmatchedPiece: { slotIndex: number; word: string }[] = []
  if (classId) {
    for (const item of unmatchedPiece) {
      if (isOffSpecAttributeWord(item.word, classId)) {
        const targetOffSpecIdx = remainingTarget.findIndex((tw) =>
          isOffSpecAttributeWord(tw, classId),
        )
        if (targetOffSpecIdx >= 0) {
          remainingTarget.splice(targetOffSpecIdx, 1)
          continue
        }
      }
      stillUnmatchedPiece.push(item)
    }
  } else {
    stillUnmatchedPiece.push(...unmatchedPiece)
  }

  if (stillUnmatchedPiece.length !== 1 || remainingTarget.length !== 1) return null
  const slotIndex = stillUnmatchedPiece[0].slotIndex
  if (!ALL_REROLLABLE_SLOTS.includes(slotIndex)) return null
  const missingWord = remainingTarget[0]
  const word =
    classId && isOffSpecAttributeWord(missingWord, classId)
      ? (FOREIGN_ATTRIBUTE_ATTACK_ID as GearWordId)
      : (missingWord as GearWordId)
  return {
    slotIndex,
    currentWord: piece.words[slotIndex].word,
    word,
    builds: [build],
  }
}

function canStillRetune(
  piece: GearPiece,
  slotIndex: number,
  word: GearWordId | typeof FOREIGN_ATTRIBUTE_ATTACK_ID,
  classId?: string,
): boolean {
  if (piece.relayed) return false
  const markedElsewhere = piece.words.some(
    (line, index) => line.retuned && index !== slotIndex && ALL_REROLLABLE_SLOTS.includes(index),
  )
  if (markedElsewhere) return false
  if (word === FOREIGN_ATTRIBUTE_ATTACK_ID) {
    const pool = gearWordPoolForLine(
      piece.level,
      piece.slot,
      slotIndex,
      classId ? weaponTypeForSlot(classId, piece.slot) : null,
    )
    const retunedOut = retunedOutWordsOf(piece)
    return pool.some((w) => isOffSpecAttributeWord(w, classId) && !retunedOut.has(w))
  }
  return !retunedOutWordsOf(piece).has(word as GearWordId)
}

function isWordInLinePool(piece: GearPiece, swap: HeirloomSwap, classId: string): boolean {
  const pool = gearWordPoolForLine(
    piece.level,
    piece.slot,
    swap.slotIndex,
    weaponTypeForSlot(classId, piece.slot),
  )
  if (swap.word === FOREIGN_ATTRIBUTE_ATTACK_ID) {
    return pool.some((w) => isOffSpecAttributeWord(w, classId))
  }
  return pool.includes(swap.word as GearWordId)
}

export function heirloomMatch(piece: GearPiece, profile: HeirloomProfile): HeirloomMatch {
  const builds = graduationBuildsForProfile(profile)
  if (builds.length === 0 || piece.words.some((word) => !word.word)) return NO_MATCH

  const followed = followedGraduationBuildAmong(builds, profile.graduationBuildId)
  const perfect: GraduationBuild[] = []
  const swaps: HeirloomSwap[] = []
  for (const build of builds) {
    const rawTarget = build.gear.find((gearPiece) => gearPiece.slot === piece.slot)
    if (!rawTarget) continue
    const target = gearPieceAtGearLevel(rawTarget, piece.level)
    if (sameWordSet(piece, target, profile.classId)) {
      perfect.push(build)
      continue
    }
    const candidate = singleSwapTo(piece, target, build, profile.classId)
    if (
      !candidate ||
      !canStillRetune(piece, candidate.slotIndex, candidate.word, profile.classId) ||
      !isWordInLinePool(piece, candidate, profile.classId)
    )
      continue
    const sameSwap = swaps.find(
      (swap) => swap.slotIndex === candidate.slotIndex && swap.word === candidate.word,
    )
    if (sameSwap) sameSwap.builds = [...sameSwap.builds, build]
    else swaps.push(candidate)
  }
  if (perfect.length > 0)
    return {
      builds: perfect,
      followed: perfect.some((build) => build.id === followed?.id),
      swaps: [],
      swap: null,
    }
  const followedRank = (swap: HeirloomSwap) =>
    swap.builds.some((build) => build.id === followed?.id) ? 0 : 1
  const orderedSwaps = swaps.sort((first, second) => followedRank(first) - followedRank(second))
  return { builds: [], followed: false, swaps: orderedSwaps, swap: orderedSwaps[0] ?? null }
}

export function isHeirloom(piece: GearPiece, profile: HeirloomProfile): boolean {
  return heirloomMatch(piece, profile).builds.length > 0
}

export function heirloomSwapFor(piece: GearPiece, profile: HeirloomProfile): HeirloomSwap | null {
  return heirloomMatch(piece, profile).swap
}
