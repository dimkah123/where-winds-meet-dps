import type { ChangelogEntryDetails } from "../types"

export const details: ChangelogEntryDetails = {
  sections: [
    {
      label: "Added",
      items: [
        {
          text: "Preserved weapon gear sets per slot on equip: equipping an item into weapon slots (weapons, disc, pendant) automatically retains the slot's set, preventing unintended set bonus drops.",
          authors: ["dimkah123"],
        },
        {
          text: "Added visual warning indicators for incomplete sets (e.g. 3/4 or 1/4) and weapon slots without a set directly in the Gear Set strip and slot tiles.",
          authors: ["dimkah123"],
        },
        {
          text: "Added dedicated Gear Set Warnings section in the Alerts tab and corner toast notifications with one-click navigation to the Gear tab.",
          authors: ["dimkah123"],
        },
      ],
    },
    {
      label: "Changed",
      items: [
        {
          text: "Reverted Min Build heirloom setup to 5 Crit and 1 Precision rolls with native stonesplit attack on armor.",
          authors: ["dimkah123"],
        },
      ],
    },
  ],
}
