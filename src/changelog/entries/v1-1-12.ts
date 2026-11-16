import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Fixed",
      items: [
        {
          text: "Removed unintended forward pull displacement (1.75m) from Mo Charged attacks and expanded reach to 6m, allowing charged hits, soldiers, and flute ticks to properly scale at 2m and 5m distance bands.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Added",
      items: [
        {
          text: "Added individual cast distance override support (`distanceMeters`) per rotation step in the simulation engine, timeline, and storage.",
          authors: ["dimkah123"],
        },
        {
          text: "Made distance chips interactive in the Rotation Editor table with a quick popover selector (1m, 2m, 3m, 5m, custom input, and batch-apply to all identical skills).",
          authors: ["dimkah123"],
        },
        {
          text: "Added quick distance preset buttons (2m, 3m, 5m) and one-click 'All Charged to 5m' / 'All Charged to 2m' batch buttons in the rotation toolbar.",
          authors: ["dimkah123"],
        },
        {
          text: "Integrated distance tag parsing and generation into readable rotation strings (e.g. `Mo Charged x4 (5m)` or `(2m)`).",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
