import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Interactive readable rotation format editor with live syntax highlights, chip badges, and one-click copy.",
          authors: ["dimkah123"],
        },
        {
          text: "Smart T9 autocomplete for fast rotation typing with skill prefixes, brackets, and quick-add palette.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Replaced temporary rotation Qi break reminders with a permanent 'Don't show again' action.",
          authors: ["dimkah123"],
        },
        {
          text: "Dynamic translation of patch notes and changelog based on the currently active language.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Removed pre-fight countdown times from readable format for cleaner sequence overview.",
          authors: ["dimkah123"],
        },
        {
          text: "Fixed Stonesplit heirloom attribute matching and weapon affixes in min build.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
