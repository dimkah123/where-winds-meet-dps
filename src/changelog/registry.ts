import type { ChangelogEntry } from "./types"

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
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
