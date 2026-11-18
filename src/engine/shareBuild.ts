import type { CombatSettings, GearLevel, GearPiece, GearWordEntry, Inputs, ScriptId } from "./types"
import { defaultCombatSettings, GEAR_SLOTS } from "./types"
import { defaultInputs, emptyMindMethod } from "./defaults"
import { hydrateInputs, newGearPieceId } from "../storage"
import { GEAR_WORD_IDS } from "../data/stats/statLines"
import { ATTUNEMENT_OPTIONS } from "./attunements"
import { gearBaseStatsFor } from "../data/stats/gearBaseStats"
import { defaultGraduationBuildId } from "./graduation"
import { defaultArsenalForClass } from "./panel"
import { defaultArsenalScores } from "../definitions/baseStats/arsenal"
import { defaultEnhancementLevels, getDefaultTalentsForClass } from "../definitions/baseStats"
import { builtinRotationsForClass } from "./builtinLibrary"

export interface SharedBuildPayload {
  v: number
  author: string
  title: string
  inputs: Inputs
}

interface CompactWordEntry {
  0: number | string // wordIndex or wordId
  1: number // value
  2?: 1 // retuned
}

interface CompactGearPiece {
  l: number // level
  s?: string // set (if set)
  r?: 1 // relayed (1 if true)
  w: CompactWordEntry[]
  a?: number | string // attunement index or id
  av?: number // attunement value
}

interface CompactBuildV2 {
  v: 2
  a?: string // author
  t?: string // title
  c: string // classId
  b: number // breakthrough
  gb?: string // graduationBuildId
  r?: string // rotation or selectedBuiltinRotationId
  d?: string // divinecraft
  dr?: string // divinecraftRefinement
  f?: string // food
  hpf?: string // hpFood
  sc?: string // script (inputs.combatSettings?.script)
  cs?: number // combatSettings bitmask
  ar?: string // arsenal (if customized)
  bg?: { b?: [string, number]; t?: [string, number] } // bowGear: bow, thumbRing
  mm?: [string, string][] // mindMethods
  dm?: 1 // dummyMode
  uqb?: 0 // useGraduationQiBreak (0 if false)
  sh5?: 1 // shareDebuff5HenZhi
  she?: 1 // shareEasyHurt
  g: Record<number, CompactGearPiece> // slotIndex -> piece
  st?: Record<string, number> // statOverrides
  cr?: any // activeCustomRotation
}

function resolveRotationId(classId: string, r?: string, title?: string): string | null {
  const builtins = builtinRotationsForClass(classId)
  if (r) {
    const byId = builtins.find((b) => b.id === r)
    if (byId) return byId.id
    const byName = builtins.find((b) => b.name.toLowerCase() === r.toLowerCase())
    if (byName) return byName.id
    return r
  }
  if (title) {
    const byName = builtins.find((b) => b.name.toLowerCase() === title.toLowerCase())
    if (byName) return byName.id
  }
  return null
}

export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode.apply(null, chunk as unknown as number[])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/")
  while (base64.length % 4) base64 += "="
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function compressBytes(bytes: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate-raw")
  const writer = cs.writable.getWriter()
  const reader = cs.readable.getReader()

  const readPromise = (async () => {
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
    return chunks
  })()

  const writePromise = (async () => {
    await writer.write(bytes as unknown as BufferSource)
    await writer.close()
  })()

  const [chunks] = await Promise.all([readPromise, writePromise])
  const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }
  return result
}

export async function decompressBytes(bytes: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate-raw")
  const writer = ds.writable.getWriter()
  const reader = ds.readable.getReader()

  const readPromise = (async () => {
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
    return chunks
  })()

  const writePromise = (async () => {
    await writer.write(bytes as unknown as BufferSource)
    await writer.close()
  })()

  const [chunks] = await Promise.all([readPromise, writePromise])
  const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }
  return result
}

function encodeToCompactV2(payload: SharedBuildPayload): CompactBuildV2 {
  const { author, title, inputs } = payload
  const inventoryById = new Map((inputs.inventory || []).map((p) => [p.id, p]))

  const g: Record<number, CompactGearPiece> = {}
  GEAR_SLOTS.forEach((slot, slotIdx) => {
    const id = inputs.equipped?.[slot]
    if (!id) return
    const piece = inventoryById.get(id)
    if (!piece) return

    const w: CompactWordEntry[] = (piece.words || []).map((wordEntry) => {
      const wordIdx = (GEAR_WORD_IDS as readonly string[]).indexOf(wordEntry.word)
      const res: CompactWordEntry = [
        wordIdx >= 0 ? wordIdx : wordEntry.word,
        wordEntry.value,
      ]
      if (wordEntry.retuned) res[2] = 1
      return res
    })

    const attunementIdx = piece.attunement
      ? ATTUNEMENT_OPTIONS.findIndex((opt) => opt.id === piece.attunement)
      : -1

    const compactPiece: CompactGearPiece = {
      l: piece.level,
      w,
    }
    if (piece.set) compactPiece.s = piece.set
    if (piece.relayed) compactPiece.r = 1
    if (piece.attunement) {
      compactPiece.a = attunementIdx >= 0 ? attunementIdx : piece.attunement
      compactPiece.av = piece.attunementValue
    }
    g[slotIdx] = compactPiece
  })

  const v2: CompactBuildV2 = {
    v: 2,
    c: inputs.classId,
    b: inputs.breakthrough,
    g,
  }

  if (author.trim()) v2.a = author.trim()
  if (title.trim()) v2.t = title.trim()
  if (inputs.graduationBuildId) v2.gb = inputs.graduationBuildId
  const rotationId = inputs.selectedBuiltinRotationId || inputs.rotation
  if (rotationId) v2.r = rotationId
  if (inputs.divinecraft) v2.d = inputs.divinecraft
  if (inputs.divinecraftRefinement) v2.dr = inputs.divinecraftRefinement
  if (inputs.food) v2.f = inputs.food
  if (inputs.hpFood) v2.hpf = inputs.hpFood
  if (inputs.dummyMode) v2.dm = 1
  if (inputs.useGraduationQiBreak === false) v2.uqb = 0
  if (inputs.shareDebuff5HenZhi) v2.sh5 = 1
  if (inputs.shareEasyHurt) v2.she = 1

  if (inputs.combatSettings?.script) {
    v2.sc = inputs.combatSettings.script
  }
  if (inputs.combatSettings) {
    let cs = 0
    if (inputs.combatSettings.dragonsBreath) cs |= 1
    if (inputs.combatSettings.healerBuff) cs |= 2
    if (inputs.combatSettings.healerPanaceaFan) cs |= 4
    if (inputs.combatSettings.breakExtension) cs |= 8
    if (inputs.combatSettings.dragonHeadFullStacks) cs |= 16
    if (inputs.combatSettings.dragonHeadLowHpMaxBonus) cs |= 32
    if (inputs.combatSettings.fragrantOrchidBathBean) cs |= 64
    if (cs > 0) v2.cs = cs
  }
  if (inputs.arsenal) {
    v2.ar = inputs.arsenal
  }

  if (inputs.bowGear) {
    const bg: NonNullable<CompactBuildV2["bg"]> = {}
    if (inputs.bowGear.bow?.set) {
      bg.b = [inputs.bowGear.bow.set, inputs.bowGear.bow.level]
    }
    if (inputs.bowGear.thumbRing?.set) {
      bg.t = [inputs.bowGear.thumbRing.set, inputs.bowGear.thumbRing.level]
    }
    if (bg.b || bg.t) {
      v2.bg = bg
    }
  }

  const mm = (inputs.mindMethods || [])
    .filter((m) => m && m.name)
    .map((m) => [m.name, m.stacks] as [string, string])
  if (mm.length > 0) v2.mm = mm

  if (inputs.statOverrides && Object.keys(inputs.statOverrides).length > 0) {
    v2.st = inputs.statOverrides
  }
  if (inputs.activeCustomRotation) {
    v2.cr = inputs.activeCustomRotation
  }

  return v2
}

function decodeFromCompactV2(v2: CompactBuildV2): SharedBuildPayload {
  const base = { ...defaultInputs, classId: v2.c, breakthrough: v2.b }
  const inventory: GearPiece[] = []
  const equipped = { ...base.equipped }

  if (v2.g) {
    for (const [slotIdxStr, cp] of Object.entries(v2.g)) {
      const slotIdx = Number(slotIdxStr)
      const slot = GEAR_SLOTS[slotIdx]
      if (!slot) continue

      const id = newGearPieceId()
      const level = (cp.l || 100) as GearLevel
      const rarity = "legendary"
      const baseStats = gearBaseStatsFor({ slot, level, rarity })

      const words: [GearWordEntry, GearWordEntry, GearWordEntry, GearWordEntry, GearWordEntry] = [
        { word: "", value: 0, retuned: false },
        { word: "", value: 0, retuned: false },
        { word: "", value: 0, retuned: false },
        { word: "", value: 0, retuned: false },
        { word: "", value: 0, retuned: false },
      ]

      if (Array.isArray(cp.w)) {
        cp.w.forEach((cw, idx) => {
          if (idx < 5 && cw) {
            const wordId =
              typeof cw[0] === "number" ? GEAR_WORD_IDS[cw[0]] || "" : String(cw[0])
            words[idx] = {
              word: (wordId as any) || "",
              value: cw[1] || 0,
              retuned: cw[2] === 1,
            }
          }
        })
      }

      let attunement = ""
      if (cp.a !== undefined) {
        attunement =
          typeof cp.a === "number" ? ATTUNEMENT_OPTIONS[cp.a]?.id || "" : String(cp.a)
      }

      const piece: GearPiece = {
        id,
        slot,
        level,
        rarity,
        minPhys: baseStats.minPhys,
        maxPhys: baseStats.maxPhys,
        hp: baseStats.hp,
        physDef: baseStats.physDef,
        words,
        attunement,
        attunementValue: cp.av || 0,
        relayed: cp.r === 1,
        set: cp.s,
      }

      inventory.push(piece)
      equipped[slot] = id
    }
  }

  const mindMethods: Inputs["mindMethods"] = [
    { ...emptyMindMethod },
    { ...emptyMindMethod },
    { ...emptyMindMethod },
    { ...emptyMindMethod },
  ]
  if (Array.isArray(v2.mm)) {
    v2.mm.forEach((m, idx) => {
      if (idx < 4 && m) {
        mindMethods[idx] = { name: m[0] || "", stacks: m[1] || "" }
      }
    })
  }

  const arsenal = (v2.ar as any) || defaultArsenalForClass(v2.c)
  const arsenalScores = defaultArsenalScores()
  const unclaimedOddityNodes = {}
  const disabledTalentNodes: number[] = []
  const martialArtsTalents = getDefaultTalentsForClass(v2.c, v2.b).map((talent) => ({
    ...talent,
    enabled: true,
  }))
  const enhancements = defaultEnhancementLevels(v2.b, { inventory, equipped })

  const combatSettings: CombatSettings = {
    ...defaultCombatSettings(),
    dragonsBreath: v2.cs ? !!(v2.cs & 1) : false,
    healerBuff: v2.cs ? !!(v2.cs & 2) : false,
    healerPanaceaFan: v2.cs ? !!(v2.cs & 4) : false,
    breakExtension: v2.cs ? !!(v2.cs & 8) : false,
    dragonHeadFullStacks: v2.cs ? !!(v2.cs & 16) : false,
    dragonHeadLowHpMaxBonus: v2.cs ? !!(v2.cs & 32) : false,
    fragrantOrchidBathBean: v2.cs ? !!(v2.cs & 64) : false,
    script: (v2.sc as ScriptId) || null,
  }

  const resolvedRotation = resolveRotationId(v2.c, v2.r, v2.t)

  const inputs: Inputs = hydrateInputs({
    ...base,
    inventory,
    equipped,
    arsenal,
    arsenalScores,
    unclaimedOddityNodes,
    disabledTalentNodes,
    martialArtsTalents,
    enhancements,
    combatSettings,
    rotation: resolvedRotation ?? base.rotation,
    selectedBuiltinRotationId: resolvedRotation ?? base.selectedBuiltinRotationId,
    divinecraft: v2.d ? (v2.d as any) : base.divinecraft,
    divinecraftRefinement: v2.dr ? (v2.dr as any) : base.divinecraftRefinement,
    food: v2.f ? (v2.f as any) : base.food,
    hpFood: v2.hpf ? (v2.hpf as any) : base.hpFood,
    dummyMode: v2.dm === 1,
    useGraduationQiBreak: v2.uqb !== 0,
    shareDebuff5HenZhi: v2.sh5 === 1,
    shareEasyHurt: v2.she === 1,
    graduationBuildId: v2.gb || defaultGraduationBuildId(v2.c) || null,
    bowGear: v2.bg
      ? {
          bow: v2.bg.b
            ? {
                set: v2.bg.b[0] as any,
                level: (v2.bg.b[1] as any) || 100,
                rarity: "legendary" as const,
              }
            : null,
          thumbRing: v2.bg.t
            ? {
                set: v2.bg.t[0] as any,
                level: (v2.bg.t[1] as any) || 100,
                rarity: "legendary" as const,
              }
            : null,
        }
      : base.bowGear,
    mindMethods,
    statOverrides: v2.st,
    activeCustomRotation: v2.cr,
  })

  return {
    v: 2,
    author: v2.a || "",
    title: v2.t || "",
    inputs,
  }
}

export async function encodeSharedBuild(payload: SharedBuildPayload): Promise<string> {
  const compactV2 = encodeToCompactV2(payload)
  const json = JSON.stringify(compactV2)
  const rawBytes = new TextEncoder().encode(json)
  const compressed = await compressBytes(rawBytes)
  return uint8ArrayToBase64Url(compressed)
}

export async function decodeSharedBuild(encoded: string): Promise<SharedBuildPayload> {
  const bytes = base64UrlToUint8Array(encoded.trim())
  const decompressed = await decompressBytes(bytes)
  const json = new TextDecoder().decode(decompressed)
  const parsed = JSON.parse(json) as any

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid shared build payload")
  }

  // Compact v2 format (uses short IDs)
  if (parsed.v === 2 || (parsed.c && parsed.g)) {
    return decodeFromCompactV2(parsed as CompactBuildV2)
  }

  // Legacy v1 format fallback
  if (!parsed.inputs) {
    throw new Error("Invalid shared build payload")
  }
  const inputs = hydrateInputs(parsed.inputs as unknown as Inputs)
  return {
    v: typeof parsed.v === "number" ? parsed.v : 1,
    author: typeof parsed.author === "string" ? parsed.author : "",
    title: typeof parsed.title === "string" ? parsed.title : "",
    inputs,
  }
}
