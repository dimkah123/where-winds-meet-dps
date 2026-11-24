import { defineBuff } from "../../definitions/skills/buffDef"
import { BUFF, PARAM } from "../skills/buffs/ids"
import { stat } from "../../engine/effects/effect"

export const envigoratedWarriorDamage = defineBuff({
  id: BUFF.envigoratedWarriorDamage,
  name: "Envigorated Warrior",
  requires: { param: PARAM.envigoratedWarrior },
  affectsAll: true,
  alwaysActive: true,
  duration: 9999,
  summary: "allDamageBoost +5%, +8% from tier 4 when not disabled",
  effects: (ctx) =>
    !ctx.status.isActive(BUFF.envigoratedDisabled)
      ? [stat("allDamageBoost", ctx.build.paramTier(PARAM.envigoratedWarrior) >= 4 ? 0.08 : 0.05)]
      : [],
})

export const envigoratedDisabled = defineBuff({
  id: BUFF.envigoratedDisabled,
  name: "Envigorated Warrior Disabled",
  requires: { param: PARAM.envigoratedWarrior },
  duration: 5,
  summary: "Disables Envigorated Warrior damage and healing bonus",
  effects: () => [],
})
