import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Changed",
      items: [
        {
          text: "Updated Stonesplit Strength Min Build graduation preset gear stats and attunements to match the latest in-game heirloom setup.",
          authors: ["dimkah123"],
        },
        {
          text: "Cleaned up default 'Mixed Dummy 1 Min' rotation steps to use stock skill distance behavior automatically without artificial overrides.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Accurate staged distance timings for Mo Charged attacks: 1st soldier (MoDown) spawns at 3m (+4% Flute of the Tides bonus), 2nd soldier (MoJump) spawns at 5m (+8% Flute bonus), and the slam lands at 2m (+3% Flute bonus).",
          authors: ["dimkah123"],
        },
        {
          text: "Flute of the Tides damage ticks during Mo Charged attacks now dynamically scale based on the exact distance of each charge phase.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
