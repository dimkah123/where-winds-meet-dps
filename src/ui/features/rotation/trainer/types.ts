export type TrainerMode = "strict" | "timing"

export interface TrainerKeyMap {
  skill1: string // Special / Stance (Default: "~")
  skill2: string // Primary skill Q (Default: "q")
  heavy: string // Heavy / Charged attack (Default: "r")
  swap: string // Dual Skill / Tab Swap (Default: "tab")
  dual: string // Weapon Switch (Default: "wheeldown")
  light: string // Light attack / Varied combo (Default: "lclick")
  deflect: string // Deflect / Parry (Default: "e")
  varied?: string // Legacy fallback for light
  mystic1: string // Mystic 1 / Flute (Default: "f")
  mystic2: string // Mystic 2 / Toad / Bursting Nine (Default: "g")
  mystic?: string // Legacy fallback for mystic1
  dodge: string // Dodge / Sprint (Default: "shift")
}

export interface TrainerSettings {
  mode: TrainerMode
  speed: number // 0.5 | 0.75 | 1.0
  sound: boolean
  keyMap: TrainerKeyMap
}

export interface TrainerStep {
  id: string
  rawName: string
  cleanName: string
  expectedKey: string
  expectedKeyLabel: string
  multiplier: number
  remainingCount: number
  targetTimeSec?: number
  durationSec?: number
}

export interface TrainerInputEvent {
  type: "input"
  action: "down" | "up"
  key: string
  device?: "keyboard" | "mouse"
  time: number
}

export interface TrainerScoreEvent {
  stepIndex: number
  key: string
  result: "perfect" | "good" | "hit" | "miss" | "wrong"
  message?: string
  time: number
}
