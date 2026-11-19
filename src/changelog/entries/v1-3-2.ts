import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Ergonomic 3-zone header layout grouping actions into Editing Workspace, Main Share CTA, and System Settings.",
          authors: ["dimkah123"],
        },
        {
          text: "Integrated alerts indicator into Settings menu with an eye-catching animated red pulse when warnings exist.",
          authors: ["dimkah123"],
        },
        {
          text: "Stylized gaming and Wuxia font typography option toggleable directly from the Interface Settings popover.",
          authors: ["dimkah123"],
        },
        {
          text: "Full multilingual localization (EN, RU, ZH, KO) and rich explanatory tooltips for history and build state actions.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Streamlined Share Build dialog by removing the raw base64 code box, keeping instant cloud links and showcase cards.",
          authors: ["dimkah123"],
        },
        {
          text: "Clean integer number display without decimals for compact DPS badges and tabs.",
          authors: ["dimkah123"],
        },
        {
          text: "Attached compact DPS badge directly as a tab widget when the header is collapsed for optimal screen space.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Fixed",
      items: [
        {
          text: "Mathematically centered text and vector chain icon vertically inside the golden Share CTA button.",
          authors: ["dimkah123"],
        },
        {
          text: "Prevented stat line word-wrapping and trimmed redundant 'Boost' suffixes in Overview gear rankings.",
          authors: ["dimkah123"],
        },
        {
          text: "Prevented percent (%) symbol from breaking onto a separate line in DPS Breakdown share columns.",
          authors: ["dimkah123"],
        },
        {
          text: "Mobile interface polish: responsive header button packing and compact touch layout.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
