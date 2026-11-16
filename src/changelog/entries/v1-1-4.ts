import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Automated Heng Q slide in prepull: writing a single Heng Q automatically sets up the full double-slide sequence.",
          authors: ["dimkah123"],
        },
        {
          text: "Added Heng LC quick-action button to rotation quick add palette for one-click insertion.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Unified Heng Q notation: removed duplicate 'Heng Q2 > Heng Q' in favor of clean single 'Heng Q'.",
          authors: ["dimkah123"],
        },
        {
          text: "Streamlined Quick Add palette by removing redundant +Heng Q2 and adding +Deflect.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Prevented duplicate slide execution when importing rotations containing legacy Heng Q2 slide steps.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
