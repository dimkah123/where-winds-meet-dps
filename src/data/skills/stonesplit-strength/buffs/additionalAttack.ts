import {
  ADDITIONAL_ATTACK_RANKS,
  additionalAttackClassBuff,
} from "../../buffs/additionalAttackRanks"
import { BUFF } from "../../buffs/ids"

export const phalanxbaneBladeAdditionalAttack = additionalAttackClassBuff({
  id: BUFF.phalanxbaneBladeAdditionalAttack,
  name: "Phalanxbane Blade — Additional Attack Up",
  summary: "physFixed/attributeFixed +7.25% to +50% by breakthrough",
  ladder: ADDITIONAL_ATTACK_RANKS,
  clause: "main",
})

export const phalanxbaneBladeAdditionalAttackCoefficient = additionalAttackClassBuff({
  id: BUFF.phalanxbaneBladeAdditionalAttackCoefficient,
  name: "Phalanxbane Blade — Anxi Soldier Coefficient",
  summary: "Anxi Soldier Mo skills ×1.00725 to ×1.05 by breakthrough",
  ladder: ADDITIONAL_ATTACK_RANKS,
  clause: "coefficient",
})

export const snowpartingBladeAdditionalAttack = additionalAttackClassBuff({
  id: BUFF.snowpartingBladeAdditionalAttack,
  name: "Snowparting Blade — Additional Attack Up",
  summary: "physFixed/attributeFixed +7.25% to +50% by breakthrough",
  ladder: ADDITIONAL_ATTACK_RANKS,
  clause: "main",
})

export const snowpartingBladeAdditionalAttackCoefficient = additionalAttackClassBuff({
  id: BUFF.snowpartingBladeAdditionalAttackCoefficient,
  name: "Snowparting Blade — Anxi Soldier Coefficient",
  summary: "Anxi Soldier Heng skills ×1.00725 to ×1.05 by breakthrough",
  ladder: ADDITIONAL_ATTACK_RANKS,
  clause: "coefficient",
})
