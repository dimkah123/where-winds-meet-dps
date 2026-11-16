import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Fixed",
      items: [
        {
          text: "Updated built-in Stonesplit Mixed Dummy 1 Min rotation so SnowpartingSlide Prepull executes before Re-slide Prepull.",
          authors: ["dimkah123"],
        },
        {
          text: "Added automatic migration healing legacy saved and active rotations to put slide before re-slide in prepull.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
