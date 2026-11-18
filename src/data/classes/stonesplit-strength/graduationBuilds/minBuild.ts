import { defineGraduationBuild } from "../../../../definitions/graduationBuilds/graduationBuildDef"
import { SET_ID } from "../../../sets/ids"
import { createGraduationGearPiece } from "../../graduationGear"
import graduationRotation from "../rotations/mixedDummy1Min"

const idPrefix = "graduation-stonesplit-strength"

export default defineGraduationBuild({
  id: "graduation-stonesplitStrength-cleftpeak-crit",
  name: "Min Build",
  classId: "stonesplitStrength",
  gear: [
    createGraduationGearPiece({
      idPrefix,
      slot: "leftWeapon",
      words: ["minPhys", "minPhys", "agility", "precision", "maxFormless"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "rightWeapon",
      words: ["minPhys", "minPhys", "agility", "modaoBoost", "maxFormless"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "disc",
      words: ["minPhys", "minPhys", "agility", "allMartialBoost", "maxStonesplit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "pendant",
      words: ["minPhys", "minPhys", "agility", "allMartialBoost", "maxStonesplit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "helm",
      words: ["crit", "minPhys", "agility", "precision", "maxStonesplit"],
      attunement: "phalanxChargeDamage",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "armor",
      words: ["crit", "minPhys", "agility", "minBellstrike", "maxStonesplit"],
      attunement: "phalanxChargeDamage",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "greaves",
      words: ["crit", "minPhys", "agility", "damageVsBoss", "maxStonesplit"],
      attunement: "phalanxChargeDamage",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "bracer",
      words: ["crit", "minPhys", "agility", "damageVsBoss", "maxStonesplit"],
      attunement: "phalanxChargeDamage",
    }),
  ],
  set: SET_ID.cleftpeak,
  bowSet: "crit",
  arsenal: "stonesplit",
  rotationId: graduationRotation.id,
  standardized: {
    encounter: {
      dummyMode: true,
      food: "bestAvailable",
      script: "wraithstrikeScript",
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
