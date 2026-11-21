import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Floating Picture-in-Picture Rotation Trainer overlay (PiP & In-Page) running on top of Where Winds Meet with live queue, cast tracking, and combo scoring.",
          authors: ["dimkah123"],
        },
        {
          text: "In-Game Companion app (WWM-Companion.exe) with non-blocking Windows RawInput streaming game mouse wheel down inputs over local WebSocket.",
          authors: ["dimkah123"],
        },
        {
          text: "Acoustic mechanical switch click audio synthesis (Cherry MX Blue / Kailh Box White tactile click leaf + housing bottom-out clack + harmonic resonance).",
          authors: ["dimkah123"],
        },
        {
          text: "Live cast time execution tracking and cooldown monitoring per skill directly from Actual game data with input buffering during cast animation.",
          authors: ["dimkah123"],
        },
        {
          text: "Custom key remap configuration dialog with interactive key recording for mouse buttons (Wheel Down, LClick, RClick, M4, M5) and keyboard.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Ultra-compact HUD dimensions (760x165px default) with dedicated bottom timing row for cooldowns and cast execution times.",
          authors: ["dimkah123"],
        },
        {
          text: "Varied Combo and Light Attack unified to Left Click by default; Deflect mapped to E by default.",
          authors: ["dimkah123"],
        },
        {
          text: "Clean English key display labels without Cyrillic artifacts in EN locale and full Russian keyboard layout normalization in RU locale.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Eliminated WH_MOUSE_LL low-level Windows hook, completely resolving mouse lag, cursor stuttering, or game input interception.",
          authors: ["dimkah123"],
        },
        {
          text: "Preserved multiplier count (×4, ×5) and scaled full cast duration (~3.3–3.4s) for charged hold attacks (Mo Charged x4) instead of single 0.82s ticks.",
          authors: ["dimkah123"],
        },
        {
          text: "Configured instant 0s cast time and 0.6s internal cooldown for weapon swap via mouse wheel, preventing unwanted cast state locks.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
