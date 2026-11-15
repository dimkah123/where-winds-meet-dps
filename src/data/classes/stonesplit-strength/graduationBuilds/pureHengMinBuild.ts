import { defineGraduationBuild } from "../../../../definitions/graduationBuilds/graduationBuildDef"
import { SET_ID } from "../../../sets/ids"
import { createGraduationGearPiece } from "../../graduationGear"
import pureHengRotation from "../rotations/pureHeng1Min"

const idPrefix = "graduation-stonesplit-strength-pure-heng-min"

export default defineGraduationBuild({
  id: "graduation-stonesplitStrength-pureHeng-min-build",
  name: "Pure Heng Min Build",
  classId: "stonesplitStrength",
  gear: [
    createGraduationGearPiece({
      idPrefix,
      slot: "leftWeapon",
      words: ["minPhys", "minPhys", "agility", "hengDaoBoost", "maxFormless"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "rightWeapon",
      words: ["minPhys", "minPhys", "agility", "crit", "maxFormless"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "helm",
      words: ["crit", "minPhys", "agility", "precision", "maxStonesplit"],
      attunement: "snowpartingVariedCombo",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "armor",
      words: ["crit", "minPhys", "agility", "precision", "maxStonesplit"],
      attunement: "snowpartingVariedCombo",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "disc",
      words: ["minPhys", "minPhys", "agility", "allMartialBoost", "crit"],
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
      slot: "greaves",
      words: ["crit", "minPhys", "agility", "damageVsBoss", "maxStonesplit"],
      attunement: "snowpartingVariedCombo",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "bracer",
      words: ["crit", "minPhys", "agility", "damageVsBoss", "maxStonesplit"],
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
