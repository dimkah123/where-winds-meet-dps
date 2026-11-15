import { defineGraduationBuild } from "../../../../definitions/graduationBuilds/graduationBuildDef"
import { SET_ID } from "../../../sets/ids"
import { createGraduationGearPiece } from "../../graduationGear"
import graduationRotation from "../rotations/mixedDummy1Min"

const idPrefix = "graduation-stonesplit-strength-max"

export default defineGraduationBuild({
  id: "graduation-stonesplitStrength-max-build",
  name: "Max Build",
  classId: "stonesplitStrength",
  gear: [
    createGraduationGearPiece({
      idPrefix,
      slot: "leftWeapon",
      words: ["maxPhys", "maxPhys", "power", "agility", "minPhys"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "rightWeapon",
      words: ["maxPhys", "maxPhys", "power", "modaoBoost", "minPhys"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "disc",
      words: ["maxPhys", "maxPhys", "power", "allMartialBoost", "crit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "pendant",
      words: ["maxPhys", "maxPhys", "power", "allMartialBoost", "crit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "helm",
      words: ["crit", "maxPhys", "power", "agility", "precision"],
      attunement: "phalanxChargeDamage",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "armor",
      words: ["crit", "maxPhys", "power", "agility", "precision"],
      attunement: "phalanxChargeDamage",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "greaves",
      words: ["power", "maxPhys", "agility", "damageVsBoss", "crit"],
      attunement: "phalanxChargeDamage",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "bracer",
      words: ["power", "maxPhys", "agility", "damageVsBoss", "crit"],
      attunement: "phalanxChargeDamage",
    }),
  ],
  set: SET_ID.cleftpeak,
  bowSet: "crit",
  arsenal: "stonesplit",
  rotationId: graduationRotation.id,
  standardized: {
    encounter: {
      food: "bestAvailable",
      divinecraft: "fire",
    },
    innerWays: [
      { id: "frostCladNight", tier: 6 },
      { id: "moraleChant", tier: 6 },
      { id: "steadfastDevotion", tier: 6 },
      { id: "throatPierce", tier: 6 },
    ],
  },
})
