import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Cloud build saving and short links (/#/b/...) powered by Cloudflare D1 with instant sharing.",
          authors: ["dimkah123"],
        },
        {
          text: "Google Sign-In integration and 'My Builds' cloud dialog to manage and synchronize builds across devices.",
          authors: ["dimkah123"],
        },
        {
          text: "Full Russian keyboard layout support for Undo/Redo shortcuts (Ctrl+Я and Ctrl+Н) with atomic state tracking.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Expanded Overview stats column width and optimized stat rows to prevent Mo charged attack buffs from truncating.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
