import { kvStore } from "../../../../kvStore"
import type { TrainerKeyMap, TrainerSettings } from "./types"

const STORAGE_KEY = "wwm.trainer.settings.v1"

export const DEFAULT_KEY_MAP: TrainerKeyMap = {
  skill1: "~",
  skill2: "q",
  heavy: "r",
  swap: "tab",
  light: "lclick",
  varied: "e",
  mystic: "f",
  dodge: "shift",
}

export const DEFAULT_TRAINER_SETTINGS: TrainerSettings = {
  mode: "strict",
  speed: 1.0,
  sound: true,
  keyMap: DEFAULT_KEY_MAP,
}

export function loadTrainerSettings(): TrainerSettings {
  try {
    const raw = kvStore.get(STORAGE_KEY)
    if (!raw) return DEFAULT_TRAINER_SETTINGS
    const parsed = JSON.parse(raw) as Partial<TrainerSettings>
    return {
      mode: parsed.mode === "timing" ? "timing" : "strict",
      speed: typeof parsed.speed === "number" ? parsed.speed : 1.0,
      sound: typeof parsed.sound === "boolean" ? parsed.sound : true,
      keyMap: {
        ...DEFAULT_KEY_MAP,
        ...(parsed.keyMap ?? {}),
      },
    }
  } catch {
    return DEFAULT_TRAINER_SETTINGS
  }
}

export function saveTrainerSettings(settings: TrainerSettings): void {
  try {
    kvStore.set(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignored
  }
}
