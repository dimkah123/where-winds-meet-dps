import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Exclusive Stonesplit Strength support: calculator is now dedicated to Stonesplit Strength (Mo Dao & Hengdao).",
          authors: ["Dimka"],
        },
        {
          text: "Interactive Panel Stats: manual stat editing directly in the character panel for instant DPS recalculation.",
          authors: ["Dimka"],
        },
        {
          text: "'Reset to gear' button in Panel Stats to instantly restore calculated equipment stats.",
          authors: ["Dimka"],
        },
        {
          text: "Frame-accurate Stonesplit combat rotation featuring Total Annihilation: Soul with exact skill timings.",
          authors: ["Dimka"],
        },
        {
          text: "Precise animation cancels: Toad cancel, Deflect cancel, and Flute cancel.",
          authors: ["Dimka"],
        },
        {
          text: "Heirloom gear matching now recognizes any foreign off-spec elemental attack (not only Bellstrike).",
          authors: ["Dimka"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Default equipment enhancement level increased to 70 across all gear slots.",
          authors: ["Dimka"],
        },
        {
          text: "Compact dynamic stat input fields with clean integer rounding for Max HP.",
          authors: ["Dimka"],
        },
        {
          text: "Streamlined interface: hidden obsolete enhancement chances, removed redundant subtitles and external links.",
          authors: ["Dimka"],
        },
        {
          text: "Hidden all other classes from selectors and pickers to focus strictly on Stonesplit Strength.",
          authors: ["Dimka"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Fixed stat override propagation so custom values correctly scale DPS and rate formulas in real-time.",
          authors: ["Dimka"],
        },
        {
          text: "Fixed Anxi Soldier skill rotation timing and cancel chain execution.",
          authors: ["Dimka"],
        },
      ],
    },
  ],
}
