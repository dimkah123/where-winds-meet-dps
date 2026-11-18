import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Shareable build URLs with compressed payload, custom player name ('Сборка игрока...'), and one-click import.",
          authors: ["dimkah123"],
        },
        {
          text: "Build showcase card generator rendering high-resolution PNG with DPS, stats, gear sets, and copy-to-clipboard.",
          authors: ["dimkah123"],
        },
        {
          text: "Top banner for incoming shared builds with instant one-click save into custom profile library.",
          authors: ["dimkah123"],
        },
        {
          text: "History of changes with Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z), plus quick toolbar buttons.",
          authors: ["dimkah123"],
        },
        {
          text: "Russian language OCR recognition support for gear screenshots (stats, levels, slots, retunes, and attunements).",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
