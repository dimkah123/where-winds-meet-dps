import { defineSkill, hit, levelScaled } from "../../../definitions/skills/skillDef"
import { applyBuff } from "../../../definitions/skills/triggers"
import { CAST, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL, STATUS } from "./ids"
import { SNOWPARTING_BLADE_RECEIVES } from "./receives"
import {
  bladeMomentumMeter,
  bladeMomentumRequires,
} from "../../classes/stonesplit-strength/bladeMomentumMeter"
import { LEVEL_ROWS } from "./levelRows"

const SHARE_HIT = {
  ...levelScaled(LEVEL_ROWS.snowpartingspecialHit0),
}

// In-game values as of 2026-10-15:
// Cast sideways during prepull so the first 5 hits (frames 51, 73, 79, 85, 91)
// whiff into the air (dealing 0 damage and not triggering combat early).
// Hit 5 (the 6th hit, at frame 109) connects with the boss at 0.00s (fight start).
const FINAL_HIT_FRAME = 121
const dreadApplication = applyBuff({ target: STATUS.dread })

export const snowpartingspecial6Hit = defineSkill({
  id: SKILL.snowpartingspecial6Hit,
  classId: "stonesplitStrength",
  name: "SnowpartingSpecial [6 Hit]",
  shortName: "Heng Special 6 Hit",
  tags: [WEAPON.hengBlade],
  skillType: "weapon",
  weaponOrAttribute: "Hengdao",
  attributeAttack: "Stonesplit",
  castTag: CAST.snowpartingSpecial,
  receives: SNOWPARTING_BLADE_RECEIVES,
  triggersBuffs: [BUFF.innerPassion],
  // In-game values as of 2026-09-25: needs 50, but only 5 is actually spent.
  castConditions: [bladeMomentumRequires("gte", 50)],
  meterCosts: [{ meterId: bladeMomentumMeter.id, amount: 5 }],
  castFrames: 124,
  triggerable: true,
  // In-game values as of 2026-09-28: 6 m approach reach, plus a further
  // 1.75 m shrink-only pull once in range.
  reachMeters: 6,
  displacement: { kind: "towardTarget", referenceMeters: 1.75 },
  hits: [
    // Hits 0..4: Cast sideways / missed into empty air (0 damage, does not start timer)
    hit(0, {
      frame: 51,
      physMultiplier: 0,
      attributeMultiplier: 0,
      physFixed: 0,
      attributeFixed: 0,
    }),
    hit(1, {
      frame: 73,
      physMultiplier: 0,
      attributeMultiplier: 0,
      physFixed: 0,
      attributeFixed: 0,
    }),
    hit(2, {
      frame: 79,
      physMultiplier: 0,
      attributeMultiplier: 0,
      physFixed: 0,
      attributeFixed: 0,
    }),
    hit(3, {
      frame: 85,
      physMultiplier: 0,
      attributeMultiplier: 0,
      physFixed: 0,
      attributeFixed: 0,
    }),
    hit(4, {
      frame: 91,
      physMultiplier: 0,
      attributeMultiplier: 0,
      physFixed: 0,
      attributeFixed: 0,
    }),
    // Hits 5..7: Damaging strikes landing on the boss
    hit(5, {
      frame: 109,
      ...SHARE_HIT,
    }),
    hit(6, {
      frame: 113,
      ...SHARE_HIT,
    }),
    hit(7, {
      frame: 117,
      ...SHARE_HIT,
      triggers: [dreadApplication],
    }),
    hit(8, {
      frame: FINAL_HIT_FRAME,
      ...levelScaled(LEVEL_ROWS.snowpartingspecialHit8),
      triggers: [dreadApplication],
    }),
  ],
  createdAt: "2026-11-16T00:00:00.000Z",
  updatedAt: "2026-11-16T00:00:00.000Z",
})
