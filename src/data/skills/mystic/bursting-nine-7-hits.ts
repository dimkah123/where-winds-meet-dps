import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { MYSTIC_ARTS_CLASS_ID } from "../../../engine/skill"
import { CAST, MYSTIC } from "../ids"
import { WINEBOUND_MYSTIC_RECEIVES } from "../wineboundReceives"
import { SKILL } from "./ids"

const HIT_COEFFICIENTS = {
  physMultiplier: 2.5463082,
  attributeMultiplier: 2.5463082,
  physFixed: 402.3166956,
  attributeFixed: 0,
}

export const burstingNine7Hits = defineSkill({
  id: SKILL.burstingNine7Hits,
  classId: MYSTIC_ARTS_CLASS_ID,
  name: "Bursting Nine [7 hits]",
  shortName: "Bursting Nine",
  tags: [MYSTIC.burst],
  skillType: "mystic",
  weaponOrAttribute: "",
  attributeAttack: "",
  castTag: CAST.burstingNine7Hits,
  castFrames: 84,
  triggerable: true,
  vitalityCost: 20,
  reachMeters: 8,
  approach: "stationary",
  receives: WINEBOUND_MYSTIC_RECEIVES,
  hits: [
    hit(0, { frame: 69.75, ...HIT_COEFFICIENTS }),
    hit(1, { frame: 69.75, ...HIT_COEFFICIENTS }),
    hit(2, { frame: 69.75, ...HIT_COEFFICIENTS }),
    hit(3, { frame: 69.75, ...HIT_COEFFICIENTS }),
    hit(4, { frame: 69.75, ...HIT_COEFFICIENTS }),
    hit(5, { frame: 69.75, ...HIT_COEFFICIENTS }),
    hit(6, { frame: 69.75, ...HIT_COEFFICIENTS }),
  ],
  createdAt: "2026-11-16T00:00:00.000Z",
  updatedAt: "2026-11-16T00:00:00.000Z",
})
