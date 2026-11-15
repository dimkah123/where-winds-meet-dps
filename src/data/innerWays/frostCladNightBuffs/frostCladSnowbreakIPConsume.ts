import { defineBuff } from "../../../definitions/skills/buffDef"
import { BUFF, PARAM } from "../../skills/buffs/ids"
import { PROP, ROLE } from "../../skills/ids"
import { damageMultiplier } from "../../../engine/effects/effect"

// The bonus lands on a cast that actually spent an Inner Passion stack, so it
// is scoped to that cast rather than opening a window — hence `duration: 0`.
// At tier 6 the exhausted phase is an alternative route to the same bonus.
export const frostCladSnowbreakIPConsume = defineBuff({
  id: BUFF.frostCladSnowbreakIPConsume,
  name: "Frost-Clad Night T4 (IP Consume)",
  requires: { param: PARAM.frostCladNight, minTier: 4 },
  duration: 0,
  perCastConsume: {
    property: PROP.consumesInnerPassion,
    from: BUFF.innerPassion,
    phaseAlternative: {
      phase: "exhausted",
      requires: { param: PARAM.frostCladNight, minTier: 6 },
    },
    grants: [
      {
        whenConsumedFrom: BUFF.innerPassion,
        buffIds: [BUFF.frostCladSnowbreakIPConsume],
        propagate: true,
      },
    ],
  },
  summary: "Snowbreak Spring ×1.76 instead of ×1.36 and Anxi Army Assist ×1.40 on a cast that consumes Inner Passion",
  effects: (ctx) => {
    if (!ctx.self.reachesEvent) return []
    if (ctx.event.kind === "damage" && ctx.event.tags.has(ROLE.anxiSoldier)) {
      return [damageMultiplier(1.4)]
    }
    return [damageMultiplier(1.76 / 1.36)]
  },
})
