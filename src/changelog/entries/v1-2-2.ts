import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Quick bow set dropdown in set strip with one-click selector and live stat bonus preview.",
          authors: ["dimkah123"],
        },
        {
          text: "Smart bow and thumb ring auto-pairing when choosing a set, while preserving manual overrides.",
          authors: ["dimkah123"],
        },
        {
          text: "Built-in '3 Heng + Bow' 1-minute Stonesplit rotation with 43 optimized steps and dual cancels.",
          authors: ["dimkah123"],
        },
        {
          text: "In-game compact DPS breakdown view with categorized skills and accurate attempt hit counts.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Renamed default rotation 'Mixed Dummy 1 Min' to 'Mixed 1 Min' across all supported languages.",
          authors: ["dimkah123"],
        },
        {
          text: "Calibrated Mo Charged middle phase in 'Mixed 1 Min' to 7 charged attacks to match in-game logs.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
