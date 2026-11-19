import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Live server update detection with a top banner prompting to reload and apply the latest release.",
          authors: ["dimkah123"],
        },
        {
          text: "Unified monolithic header toolbar connecting language, account, sharing, undo/redo, save/discard, and settings.",
          authors: ["dimkah123"],
        },
        {
          text: "Interface Settings menu with animated golden tumblers to toggle toolbar buttons and collapse the main header.",
          authors: ["dimkah123"],
        },
        {
          text: "Collapsible header mode with a live DPS badge placed directly beside the Alerts tab for maximum vertical space.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Rebalanced Overview column widths, giving Gear-Stat Lift more room to eliminate awkward stat line word wrapping.",
          authors: ["dimkah123"],
        },
        {
          text: "Subtle dot leaders connecting stat labels to values in Panel Stats with row hover highlights and compact spacing.",
          authors: ["dimkah123"],
        },
        {
          text: "Visual vertical separator between the application title and version badge in both regular and collapsed modes.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Replaced emojis with crisp SVG vector icons for undo, redo, save, discard, and gear, with aligned toolbar baselines.",
          authors: ["dimkah123"],
        },
        {
          text: "Enforced strict minmax column bounds in Panel Stats, preventing long class buff names from overflowing the card.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
