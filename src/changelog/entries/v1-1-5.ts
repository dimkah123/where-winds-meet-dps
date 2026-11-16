import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Auto-collapsing consecutive identical skills into multiplier format (x2, x3, etc.) when typing or using Quick Add.",
          authors: ["dimkah123"],
        },
        {
          text: "Smart Quick Add repetition: clicking the same skill button automatically increments its multiplier.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Updated rotation editor input handling to automatically collapse consecutive duplicates on typing, blur, and paste.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
