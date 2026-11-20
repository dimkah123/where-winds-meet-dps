export type TrainerMode = "strict" | "timing"

export interface TrainerKeyMap {
  skill1: string // Special / Stance (Default: "~")
  skill2: string // Primary skill Q (Default: "q")
  heavy: string // Heavy / Charged attack (Default: "r")
  swap: string // Weapon swap (Default: "tab")
  dual: string // Dual Weapon attack / switch without tab (Default: "mclick")
  light: string // Light attack (Default: "lclick")
  varied: string // Varied combo (Default: "e")
  mystic: string // Mystic / Flute (Default: "f")
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
