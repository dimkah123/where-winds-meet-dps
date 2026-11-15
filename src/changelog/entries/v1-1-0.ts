import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Full Russian localization with in-game verified terminology for attributes, stats, Inner Ways, weapons, skills, and UI.",
          authors: ["dimkah123"],
        },
        {
          text: "Auto-Fallback badge and visual indicators in Rotation Editor on steps where charged attack fallback triggered.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Consolidated rotation auto-fallback occurrences into a single alert item in Alerts tab with multiplicity counter.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Surfaced dynamic simulation warnings and fallback diagnostics directly in the Rotation Editor warnings block.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
