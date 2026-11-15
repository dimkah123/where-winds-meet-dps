import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Proper Russian pluralization for skill hit counts in the rotation timeline (1 удар, 2 удара, 5 ударов).",
          authors: ["dimkah123"],
        },
        {
          text: "Localization for pre-pull skills, Blade Momentum meter, and crafting script items (Purewrath Script, Convergence Script).",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Redesigned Qi Break row layout in the Rotation Editor with multi-column span and clean separator to eliminate text overlap.",
          authors: ["dimkah123"],
        },
        {
          text: "Standardized all Qi-related terminology in Russian from 'дух' to 'Ци' (Истощение Ци, Окно истощения Ци, damage alerts).",
          authors: ["dimkah123"],
        },
        {
          text: "Restructured rotation preset list into clean row items with dedicated title line and non-wrapping DPS and default badges.",
          authors: ["dimkah123"],
        },
        {
          text: "Expanded rotation options panel width to 250px for better readability of rotation names.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
