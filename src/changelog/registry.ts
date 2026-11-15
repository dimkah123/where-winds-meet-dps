import type { ChangelogEntry } from "./types"

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "1.1.0",
    date: "2026-11-15",
    headline: "Russian Localization & Rotation Auto-Fallback Badges",
    loadDetails: () => import("./entries/v1-1-0").then((module) => module.details),
  },
  {
    version: "1.0.4",
    date: "2026-11-15",
    headline: "Skill Editor Path Filters & Pure Heng Break Fixes",
    loadDetails: () => import("./entries/v1-0-4").then((module) => module.details),
  },
  {
    version: "1.0.3",
    date: "2026-11-15",
    headline: "Charged Attack Auto-Fallback & Build Polish",
    loadDetails: () => import("./entries/v1-0-3").then((module) => module.details),
  },
  {
    version: "1.0.2",
    date: "2026-11-15",
    headline: "Pure Heng Archetype, Builds & Standard Rotation",
    loadDetails: () => import("./entries/v1-0-2").then((module) => module.details),
  },
  {
    version: "1.0.1",
    date: "2026-11-15",
    headline: "Max Build Graduation & Alerts Tab",
    loadDetails: () => import("./entries/v1-0-1").then((module) => module.details),
  },
  {
    version: "1.0.0",
    date: "2026-11-15",
    headline: "Stonesplit Strength DPS Calculator Release",
    loadDetails: () => import("./entries/v1-0-0").then((module) => module.details),
  },
]
