// Scoped to Stonesplit Strength — see CLAUDE.md § "Implemented classes".
import { describe, expect, it } from "vitest"
import { buffEngineWith } from "../helpers/qiBars"
import { classDefinition } from "../../src/definitions/classes/registry"
import { builtinSkillsForClass } from "../../src/engine/builtinLibrary"
import { makeSkill } from "../../src/engine/skill"
import { WEAPON } from "../../src/data/skills/ids"
import { BUFF } from "../../src/data/skills/buffs/ids"
import { SKILL } from "../../src/data/skills/stonesplit-strength/ids"

const CLASS = "stonesplitStrength"

const stonesplitOwnBuffDefs = () => classDefinition(CLASS)!.classBuffDefs

function skill(receives: string[]) {
  return makeSkill("test", { name: "probe", receives })
}

describe("additional-attack talent — receives wiring, one weapon tag one art buff", () => {
  const skills = builtinSkillsForClass(CLASS)
  const moBladeSkills = skills.filter((candidate) =>
    (candidate.tags ?? []).includes(WEAPON.moBlade),
  )
  const hengBladeSkills = skills.filter((candidate) =>
    (candidate.tags ?? []).includes(WEAPON.hengBlade),
  )

  it("covers a nonzero number of skills on each art", () => {
    expect(moBladeSkills.length).toBeGreaterThan(0)
    expect(hengBladeSkills.length).toBeGreaterThan(0)
  })

  it("every Mo Blade-tagged skill lists the Phalanxbane Blade buff, and no Heng Blade-tagged skill does", () => {
    for (const candidate of moBladeSkills) {
      expect(candidate.receives ?? [], candidate.id).toContain(
        BUFF.phalanxbaneBladeAdditionalAttack,
      )
    }
    for (const candidate of hengBladeSkills) {
      expect(candidate.receives ?? [], candidate.id).not.toContain(
        BUFF.phalanxbaneBladeAdditionalAttack,
      )
    }
  })

  it("every Heng Blade-tagged skill but Break Defense lists the Snowparting Blade buff, and no Mo Blade-tagged skill does", () => {
    for (const candidate of hengBladeSkills.filter(
      (hengBladeSkill) => hengBladeSkill.id !== SKILL.breakDefense,
    )) {
      expect(candidate.receives ?? [], candidate.id).toContain(
        BUFF.snowpartingBladeAdditionalAttack,
      )
    }
    for (const candidate of moBladeSkills) {
      expect(candidate.receives ?? [], candidate.id).not.toContain(
        BUFF.snowpartingBladeAdditionalAttack,
      )
    }
  })

  it("Break Defense lists neither art's additional-attack buff", () => {
    const breakDefense = skills.find((candidate) => candidate.id === SKILL.breakDefense)!
    expect(breakDefense.receives ?? []).not.toContain(BUFF.snowpartingBladeAdditionalAttack)
    expect(breakDefense.receives ?? []).not.toContain(BUFF.phalanxbaneBladeAdditionalAttack)
  })
})

describe("additional-attack talent — Stonesplit Strength coefficient clause reach", () => {
  const factorFor = (breakthrough: number, receives: string[]) =>
    buffEngineWith({ breakthrough }, [], stonesplitOwnBuffDefs()).calculateDamageEffects(
      skill(receives),
      0,
    ).damageFactor

  it("reaches Anxi Soldier Heng skills with the Snowparting Blade coefficient buff", () => {
    const carriers = builtinSkillsForClass(CLASS)
      .filter((candidate) =>
        (candidate.receives ?? []).includes(BUFF.snowpartingBladeAdditionalAttackCoefficient),
      )
      .map((candidate) => candidate.id)
    expect(carriers).toEqual([SKILL.anxisoldierheng, SKILL.anxisoldierhengStab])
  })

  it("reaches Anxi Soldier Mo skills with the Phalanxbane Blade coefficient buff", () => {
    const carriers = builtinSkillsForClass(CLASS)
      .filter((candidate) =>
        (candidate.receives ?? []).includes(BUFF.phalanxbaneBladeAdditionalAttackCoefficient),
      )
      .map((candidate) => candidate.id)
    expect(carriers).toEqual([
      SKILL.anxisoldiermodown,
      SKILL.anxisoldiermojump,
      SKILL.anxisoldiermosweep,
      SKILL.anxisoldiermosweepSupreme,
    ])
  })

  it("contributes nothing at breakthrough 17", () => {
    expect(factorFor(17, [BUFF.snowpartingBladeAdditionalAttackCoefficient])).toBe(1)
    expect(factorFor(17, [BUFF.phalanxbaneBladeAdditionalAttackCoefficient])).toBe(1)
  })

  it("scales ×1.00725 at breakthrough 18", () => {
    expect(factorFor(18, [BUFF.snowpartingBladeAdditionalAttackCoefficient])).toBeCloseTo(
      1.00725,
      10,
    )
    expect(factorFor(18, [BUFF.phalanxbaneBladeAdditionalAttackCoefficient])).toBeCloseTo(
      1.00725,
      10,
    )
  })

  it("scales ×1.03 at breakthrough 21", () => {
    expect(factorFor(21, [BUFF.snowpartingBladeAdditionalAttackCoefficient])).toBeCloseTo(1.03, 10)
    expect(factorFor(21, [BUFF.phalanxbaneBladeAdditionalAttackCoefficient])).toBeCloseTo(1.03, 10)
  })
})
