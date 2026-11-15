import { defineSkill, hit, levelScaled } from "../../../definitions/skills/skillDef"
import { castSkill } from "../../../definitions/skills/triggers"
import { ATTUNE, CAST, PROP, ROLE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"
import { PHALANXBANE_BLADE_RECEIVES } from "./receives"
import { LEVEL_ROWS } from "./levelRows"

export const phalanxqSoul = defineSkill({
  id: SKILL.phalanxqSoul,
  classId: "stonesplitStrength",
  name: "PhalanxQ (Soul)",
  breakdownName: "Total Annihilation - Soul",
  tags: [WEAPON.moBlade, ATTUNE.phalanxbaneQ, PROP.cleftpeakBoost, ROLE.phalanxQ],
  skillType: "weapon",
  weaponOrAttribute: "Modao",
  attributeAttack: "Stonesplit",
  castTag: CAST.phalanxQSoul,
  receives: [BUFF.cleftpeakDeflect, ...PHALANXBANE_BLADE_RECEIVES, BUFF.starweaveMartialBoost],
  triggersBuffs: [BUFF.ironGuards, BUFF.throatPierced, BUFF.totalAnnihilationSupremeShield, BUFF.jadeware],
  triggersBuffsAtFrame: { [BUFF.totalAnnihilationSupremeShield]: 49, [BUFF.jadeware]: 7 },
  castConditions: [{ buffId: BUFF.ironGuards, op: "gte", stacks: 1, source: "buffEngine" }],
  castFrames: 49,
  triggerable: true,
  hits: [
    hit(0, {
      frame: 25.65,
      ...levelScaled(LEVEL_ROWS.phalanxqSupremeHit0),
      triggers: [
        castSkill({
          target: SKILL.anxisoldiermosweepSupreme,
          stacks: 0,
          condition: { buffId: BUFF.ironGuards, op: "gte", stacks: 1, source: "buffEngine" },
        }),
      ],
    }),
  ],
  createdAt: "2026-11-14T00:00:00.000Z",
  updatedAt: "2026-11-14T00:00:00.000Z",
})
