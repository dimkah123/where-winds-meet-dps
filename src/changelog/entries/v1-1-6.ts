import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Added Bursting Nine [7 hits] Mystic Art with 20 vitality cost, 1.4s cast time, and 7 hits at 1.1625s.",
          authors: ["dimkah123"],
        },
        {
          text: "Added Bursting Nine alias and autocomplete suggestions to the readable rotation editor and palette.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Corrected prepull slide automation order: SnowpartingSlide Prepull now executes before Re-slide Prepull.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
