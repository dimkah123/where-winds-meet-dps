import { defineInnerWay } from "../../definitions/innerWays/innerWayDef"
import { INNER_WAY_ID, INNER_WAY_LADDER } from "./ids"
import { PARAM } from "../skills/buffs/ids"
import { envigoratedWarriorDamage } from "./envigoratedWarriorBuffs"

export const envigoratedWarrior = defineInnerWay({
  id: INNER_WAY_ID.envigoratedWarrior,
  name: "Envigorated Warrior",
  selectableTiers: [6, 5, 4, 3, 2, 1],
  confirmedBreakthrough: 21,
  buffParam: PARAM.envigoratedWarrior,
  tiers: {
    2: { ladder: INNER_WAY_LADDER.weaponAttackMinFourStar },
    5: { panelStats: { "phys.penetration": 0.051 } },
  },
  buffDefs: [envigoratedWarriorDamage],
})
