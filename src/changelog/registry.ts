import type { ChangelogEntry } from "./types"

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "1.1.10",
    date: "2026-11-16",
    headline: "Heng Special 6 Hit Variant & Opener Support",
    loadDetails: () => import("./entries/v1-1-10").then((module) => module.details),
  },
  {
    version: "1.1.9",
    date: "2026-11-16",
    headline: "Explicit Heng Q and Heng Q2 Prepull Steps",
    loadDetails: () => import("./entries/v1-1-9").then((module) => module.details),
  },
  {
    version: "1.1.8",
    date: "2026-11-16",
    headline: "Grouped Quick Add Rows & Stance Backdrops",
    loadDetails: () => import("./entries/v1-1-8").then((module) => module.details),
  },
  {
    version: "1.1.7",
    date: "2026-11-16",
    headline: "Stonesplit Rotation Slide Order & Storage Healing",
    loadDetails: () => import("./entries/v1-1-7").then((module) => module.details),
  },
  {
    version: "1.1.6",
    date: "2026-11-16",
    headline: "Bursting Nine Mystic Art & Pre-pull Slide Automation Order",
    loadDetails: () => import("./entries/v1-1-6").then((module) => module.details),
  },
  {
    version: "1.1.5",
    date: "2026-11-16",
    headline: "Consecutive Skill Auto-Collapse (x2, x3) & Smart Add",
    loadDetails: () => import("./entries/v1-1-5").then((module) => module.details),
  },
  {
    version: "1.1.4",
    date: "2026-11-16",
    headline: "Heng Q Slide Automation & Quick Add Streamlining",
    loadDetails: () => import("./entries/v1-1-4").then((module) => module.details),
  },
  {
    version: "1.1.3",
    date: "2026-11-16",
    headline: "Interactive Rotation Editor, T9 Input & Alert Polish",
    loadDetails: () => import("./entries/v1-1-3").then((module) => module.details),
  },
  {
    version: "1.1.2",
    date: "2026-11-15",
    headline: "Qi Break Terminology & Layout Polish, Clean Rotation Rows",
    loadDetails: () => import("./entries/v1-1-2").then((module) => module.details),
  },
  {
    version: "1.1.1",
    date: "2026-11-15",
    headline: "Talents Localization & Setup Wizard Experience Improvements",
    loadDetails: () => import("./entries/v1-1-1").then((module) => module.details),
  },
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
