import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Changed",
      items: [
        {
          text: "Updated Stonesplit Strength main rotation ('Mixed Dummy 1 Min') to the optimized 42-step sequence with Heng Special 6-Hit opener, Bursting Nine, and Qi-break Mo Charged alignment.",
          authors: ["dimkah123"],
        },
        {
          text: "Preserved the previous triple-combo rotation as a separate selectable built-in rotation named '3 Heng Charge'.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Corrected Bursting Nine [7 hits] repeated arrow diminishing returns (30% on 2nd arrow, 20% on arrows 3-7) to match exact in-game mechanics and editor coefficients.",
          authors: ["dimkah123"],
        },
        {
          text: "Fixed potential undefined stepId access in readable rotation generator.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
