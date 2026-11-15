import { defineGraduationBuild } from "../../../../definitions/graduationBuilds/graduationBuildDef"
import { SET_ID } from "../../../sets/ids"
import { createGraduationGearPiece } from "../../graduationGear"
import pureHengRotation from "../rotations/pureHeng1Min"

const idPrefix = "graduation-stonesplit-strength-pure-heng-max"

export default defineGraduationBuild({
  id: "graduation-stonesplitStrength-pureHeng-max-build",
  name: "Pure Heng Max Build",
  classId: "stonesplitStrength",
  gear: [
    createGraduationGearPiece({
      idPrefix,
      slot: "leftWeapon",
      words: ["maxPhys", "maxPhys", "power", "hengDaoBoost", "crit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "rightWeapon",
      words: ["maxPhys", "maxPhys", "power", "agility", "crit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "helm",
      words: ["crit", "maxPhys", "power", "agility", "precision"],
      attunement: "snowpartingVariedCombo",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "armor",
      words: ["crit", "maxPhys", "power", "agility", "precision"],
      attunement: "snowpartingVariedCombo",
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
      slot: "greaves",
      words: ["power", "maxPhys", "power", "damageVsBoss", "crit"],
      attunement: "snowpartingVariedCombo",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "bracer",
      words: ["power", "maxPhys", "power", "damageVsBoss", "crit"],
      attunement: "snowpartingVariedCombo",
    }),
  ],
  set: SET_ID.cleftpeak,
  bowSet: "crit",
  arsenal: "stonesplit",
  rotationId: pureHengRotation.id,
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
