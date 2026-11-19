import { useEffect, useRef, useState } from "react"
import type { Inputs } from "../../../engine/types"
import { withDerivedStats, equippedPiecesFor } from "../../../engine/derivedInputs"
import {
  averageEnhancementBonus,
  effectiveEnhancementLevels,
  enhancedSlotsOf,
  effectiveMaxHp,
  totalFormlessAttack,
  totalMaxHp,
  totalPhysDef,
  totalPlayerAttributes,
} from "../../../definitions/baseStats"
import { foodPhysAttackBeforeMultiplier } from "../../../data/consumables/foods"
import { getAttunement } from "../../../engine/attunements"
import { effectiveRates, getSchool } from "../../../engine/panel"
import { applySetBonuses, setPhysDefBonus } from "../../../engine/setBonuses"
import { resolveEnginePath } from "../../../engine/statPaths"
import { attunementKey } from "../../../i18n/contentKeys"
import { useI18n } from "../../../i18n/i18nContext"
import { fmt, PERCENT_PATHS, readPath, statPathLabel } from "../../utils/statFormatting"
import { finalHitOutcomeRates } from "./finalHitOutcomeRates"
import styles from "./StatsOverviewPanel.module.scss"

interface Props {
  inputs: Inputs
  onChange?: (next: Inputs) => void
}

const ATTRIBUTE_BLOCKS: ("bellstrike" | "stonesplit" | "silkbind" | "bamboocut")[] = [
  "bellstrike",
  "stonesplit",
  "silkbind",
  "bamboocut",
]

const DAMAGE_BOOST_PATHS = [
  "physBoost",
  "critDamageBoost",
  "affinityDamageBoost",
  "attributeDamageBoost",
  "sustainDamageBoost",
]

const MARTIAL_BOOST_PATHS = [
  "allMartialBoost",
  "swordBoost",
  "spearBoost",
  "fanBoost",
  "umbrellaBoost",
  "modaoBoost",
  "dualKnivesBoost",
  "ropeDartBoost",
  "hengDaoBoost",
  "gauntletsBoost",
]

const TARGET_BOOST_PATHS = [
  "bossBoost",
  "singleMysticBoost",
  "areaMysticBoost",
  "controlMysticBoost",
  "burstMysticBoost",
  "areaDebuffMysticBoost",
  "areaDamageMysticBoost",
  "allMysticBoost",
]

interface RowEntry {
  label: string
  value: number
  effective?: number
  isPercent: boolean
  isPenetration?: boolean
  isInteger?: boolean
  hint?: string
  path?: string
}

function row(
  label: string,
  value: number,
  isPercent: boolean,
  effective?: number,
  isPenetration?: boolean,
  path?: string,
  hint?: string,
  isInteger?: boolean,
): RowEntry {
  return { label, value, isPercent, effective, isPenetration, path, hint, isInteger }
}

export function StatsOverviewPanel({ inputs, onChange }: Props) {
  const { t } = useI18n()
  const school = getSchool(inputs.classId)

  const derived = withDerivedStats(inputs)
  const withSets = applySetBonuses(derived)

  const eff = effectiveRates(withSets)
  const finalRates = finalHitOutcomeRates({
    precision: eff.precision,
    critRate: eff.critRate,
    directCritRate: withSets.directCritRate,
    affinityRate: eff.affinityRate,
    directAffinityRate: withSets.directAffinityRate,
  })

  const equippedPieces = equippedPiecesFor(inputs)
  const enhancedSlots = enhancedSlotsOf(inputs)
  const enhancements = effectiveEnhancementLevels(inputs.enhancements, inputs.breakthrough)
  const baseAttrs = totalPlayerAttributes(
    inputs.breakthrough,
    equippedPieces,
    inputs.disabledTalentNodes,
  )
  const attrs = {
    power: inputs.statOverrides?.power ?? baseAttrs.power,
    agility: inputs.statOverrides?.agility ?? baseAttrs.agility,
    momentum: inputs.statOverrides?.momentum ?? baseAttrs.momentum,
    body: inputs.statOverrides?.body ?? baseAttrs.body,
    defense: inputs.statOverrides?.defense ?? baseAttrs.defense,
  }
  const baseMaxHp = totalMaxHp(
    inputs.breakthrough,
    equippedPieces,
    inputs.disabledTalentNodes,
    enhancements,
    inputs.unclaimedOddityNodes,
    inputs.arsenalScores,
    enhancedSlots,
  )
  const maxHp = Math.round(inputs.statOverrides?.maxHp ?? baseMaxHp)
  const maxHpEffective = Math.round(
    inputs.statOverrides?.maxHp !== undefined
      ? maxHp * (1 + averageEnhancementBonus(enhancements).percent)
      : effectiveMaxHp(
          inputs.breakthrough,
          equippedPieces,
          inputs.disabledTalentNodes,
          enhancements,
          inputs.unclaimedOddityNodes,
          inputs.arsenalScores,
          enhancedSlots,
        ),
  )
  const physDef =
    inputs.statOverrides?.physDef ??
    totalPhysDef(
      inputs.breakthrough,
      equippedPieces,
      inputs.disabledTalentNodes,
      enhancements,
      inputs.unclaimedOddityNodes,
      setPhysDefBonus(inputs),
      enhancedSlots,
    )
  const attributeRows: RowEntry[] = [
    row(t("content.statLine.power"), attrs.power, false, undefined, false, "power"),
    row(t("content.statLine.agility"), attrs.agility, false, undefined, false, "agility"),
    row(t("content.statLine.momentum"), attrs.momentum, false, undefined, false, "momentum"),
    row(t("content.statLine.body"), attrs.body, false, undefined, false, "body"),
    row(t("content.statLine.defense"), attrs.defense, false, undefined, false, "defense"),
    row(
      t("content.statLine.maxHp"),
      maxHp,
      false,
      maxHpEffective,
      false,
      "maxHp",
      t("components.statsOverviewPanel.maxHpArsenalNote"),
      true,
    ),
    row(t("content.statLine.physDef"), physDef, false, undefined, false, "physDef"),
  ]

  const rateRows: RowEntry[] = [
    row(statPathLabel("precision", t), withSets.precision, true, eff.precision, false, "precision"),
    row(statPathLabel("critRate", t), withSets.critRate, true, eff.critRate, false, "critRate"),
    row(
      statPathLabel("affinityRate", t),
      withSets.affinityRate,
      true,
      eff.affinityRate,
      false,
      "affinityRate",
    ),
    row(
      statPathLabel("directCritRate", t),
      withSets.directCritRate,
      true,
      undefined,
      false,
      "directCritRate",
    ),
    row(
      statPathLabel("directAffinityRate", t),
      withSets.directAffinityRate,
      true,
      undefined,
      false,
      "directAffinityRate",
    ),
    row(t("components.statsOverviewPanel.finalCrit"), finalRates.critRate, true),
    row(t("components.statsOverviewPanel.finalAffinity"), finalRates.affinityRate, true),
    row(
      t("components.statsOverviewPanel.finalCritAffinity"),
      finalRates.critRate + finalRates.affinityRate,
      true,
    ),
    row(t("components.statsOverviewPanel.finalAbrasion"), finalRates.abrasionRate, true),
    row(t("components.statsOverviewPanel.finalNormal"), finalRates.normalRate, true),
  ]

  const physMin = readPath(withSets, "phys.min")
  const physMax = readPath(withSets, "phys.max")
  const foodPhysAttack = foodPhysAttackBeforeMultiplier(withSets)
  const attackRows: RowEntry[] = [
    row(
      statPathLabel("phys.min", t),
      physMin,
      false,
      foodPhysAttack.min ? physMin + foodPhysAttack.min : undefined,
      false,
      "phys.min",
    ),
    row(
      statPathLabel("phys.max", t),
      physMax,
      false,
      foodPhysAttack.max ? physMax + foodPhysAttack.max : undefined,
      false,
      "phys.max",
    ),
  ]
  const penetrationRows: RowEntry[] = [
    row(
      statPathLabel("phys.penetration", t),
      readPath(withSets, "phys.penetration"),
      false,
      undefined,
      true,
      "phys.penetration",
    ),
  ]
  const baseFormless = totalFormlessAttack(inputs, equippedPieces)
  const formless = {
    min: inputs.statOverrides?.["formlessAttack.min"] ?? baseFormless.min,
    max: inputs.statOverrides?.["formlessAttack.max"] ?? baseFormless.max,
  }
  const primaryMinPath = resolveEnginePath("primaryAttr.min", inputs)
  const primaryMaxPath = resolveEnginePath("primaryAttr.max", inputs)
  for (const key of ATTRIBUTE_BLOCKS) {
    const isPrimary = key.toLowerCase() === school.primaryAttribute.toLowerCase()
    const ownMin =
      readPath(withSets, `${key}.min`) - (`${key}.min` === primaryMinPath ? formless.min : 0)
    const ownMax =
      readPath(withSets, `${key}.max`) - (`${key}.max` === primaryMaxPath ? formless.max : 0)
    const pen = readPath(withSets, `${key}.penetration`)
    const hasOverride =
      inputs.statOverrides?.[`${key}.min`] !== undefined ||
      inputs.statOverrides?.[`${key}.max`] !== undefined ||
      inputs.statOverrides?.[`${key}.penetration`] !== undefined
    if (ownMin !== 0 || ownMax !== 0 || hasOverride || isPrimary) {
      attackRows.push(
        row(statPathLabel(`${key}.min`, t), ownMin, false, undefined, false, `${key}.min`),
        row(statPathLabel(`${key}.max`, t), ownMax, false, undefined, false, `${key}.max`),
      )
    }
    if (pen !== 0 || inputs.statOverrides?.[`${key}.penetration`] !== undefined || isPrimary) {
      penetrationRows.push(
        row(
          statPathLabel(`${key}.penetration`, t),
          pen,
          false,
          undefined,
          true,
          `${key}.penetration`,
        ),
      )
    }
  }
  attackRows.push(
    row(
      t("content.statLine.minFormless"),
      formless.min,
      false,
      undefined,
      false,
      "formlessAttack.min",
    ),
    row(
      t("content.statLine.maxFormless"),
      formless.max,
      false,
      undefined,
      false,
      "formlessAttack.max",
    ),
  )

  const damageBoostRows: RowEntry[] = DAMAGE_BOOST_PATHS.map((path) =>
    row(
      statPathLabel(path, t),
      readPath(withSets, path),
      PERCENT_PATHS.has(path),
      undefined,
      false,
      path,
    ),
  )

  const martialBoostRows: RowEntry[] = MARTIAL_BOOST_PATHS.map((path) =>
    row(
      statPathLabel(path, t),
      readPath(withSets, path),
      PERCENT_PATHS.has(path),
      undefined,
      false,
      path,
    ),
  ).filter((entry) => entry.value !== 0 || inputs.statOverrides?.[entry.path ?? ""] !== undefined)

  const targetBoostRows: RowEntry[] = TARGET_BOOST_PATHS.map((path) =>
    row(
      statPathLabel(path, t),
      readPath(withSets, path),
      PERCENT_PATHS.has(path),
      undefined,
      false,
      path,
    ),
  ).filter((entry) => entry.value !== 0 || inputs.statOverrides?.[entry.path ?? ""] !== undefined)

  const classBuffRows: RowEntry[] = school.classSpecificAttunements.map((attunementId) => {
    const option = getAttunement(attunementId)
    const path = `classSpecificAttunement.${attunementId}`
    return row(
      option ? t(attunementKey(option.id), option.label) : attunementId,
      withSets.classSpecificAttunement[attunementId] ?? 0,
      true,
      undefined,
      false,
      path,
    )
  })

  const handleStatChange = (path: string, nextValue: number | undefined) => {
    if (!onChange) return
    const nextOverrides = { ...(inputs.statOverrides ?? {}) }
    if (nextValue === undefined) {
      delete nextOverrides[path]
    } else {
      if (path === primaryMinPath) {
        nextOverrides[path] = nextValue + formless.min
      } else if (path === primaryMaxPath) {
        nextOverrides[path] = nextValue + formless.max
      } else {
        nextOverrides[path] = nextValue
      }
    }
    const finalOverrides = Object.keys(nextOverrides).length > 0 ? nextOverrides : undefined
    onChange({ ...inputs, statOverrides: finalOverrides })
  }

  const statOverrides = inputs.statOverrides

  return (
    <div className={styles.statsOverview}>
      <Section
        title={t("components.statsOverviewPanel.attributes")}
        rows={attributeRows}
        onStatChange={onChange ? handleStatChange : undefined}
        statOverrides={statOverrides}
      />
      <Section
        title={t("components.statsOverviewPanel.threeRates")}
        rows={rateRows}
        onStatChange={onChange ? handleStatChange : undefined}
        statOverrides={statOverrides}
      />
      <Section
        title={t("components.statsOverviewPanel.attackPenetration")}
        rows={[...attackRows, ...penetrationRows]}
        onStatChange={onChange ? handleStatChange : undefined}
        statOverrides={statOverrides}
      />
      <Section
        title={t("components.statsOverviewPanel.damageBoosts")}
        rows={[...damageBoostRows, ...martialBoostRows, ...targetBoostRows]}
        onStatChange={onChange ? handleStatChange : undefined}
        statOverrides={statOverrides}
      />
      {classBuffRows.length > 0 && (
        <Section
          title={t("common.classBuffs")}
          rows={classBuffRows}
          onStatChange={onChange ? handleStatChange : undefined}
          statOverrides={statOverrides}
          singleColumn
        />
      )}
    </div>
  )
}

function StatInput({
  value,
  isPercent,
  isPenetration,
  isInteger,
  isOverridden,
  effective,
  onCommit,
  onClear,
  title,
}: {
  value: number
  isPercent: boolean
  isPenetration: boolean
  isInteger?: boolean
  isOverridden: boolean
  effective?: number
  onCommit: (val: number) => void
  onClear: () => void
  title?: string
}) {
  const formatValue = (v: number) => {
    if (!Number.isFinite(v)) return ""
    if (isInteger) return String(Math.round(v))
    if (isPenetration) return String(Math.round(v * 1000) / 10)
    if (isPercent) return String(+(v * 100).toFixed(2))
    if (Math.abs(v) < 0.01 && v !== 0) return v.toFixed(4)
    return v.toFixed(2)
  }

  const [text, setText] = useState(() => formatValue(value))
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) {
      setText(formatValue(value))
    }
  }, [value, isPercent, isPenetration, isInteger])

  const commitText = (str: string) => {
    const trimmed = str.trim()
    if (trimmed === "") {
      onClear()
      return
    }
    const num = Number(trimmed)
    if (Number.isFinite(num)) {
      if (isInteger) onCommit(Math.round(num))
      else if (isPenetration) onCommit(num / 1000)
      else if (isPercent) onCommit(num / 100)
      else onCommit(num)
    } else {
      setText(formatValue(value))
    }
  }

  // Dynamic compact width: adapts cleanly to text length without bulky fixed boxes
  const inputWidth = Math.max(34, Math.min(68, text.length * 7.5 + 8))

  return (
    <div className={styles.statValueGroup}>
      <input
        type="number"
        step={isInteger ? "1" : "any"}
        className={`${styles.statInput} ${isOverridden ? styles.statInputOverridden : ""}`}
        style={{ width: `${inputWidth}px` }}
        value={text}
        title={title}
        onFocus={() => {
          focusedRef.current = true
        }}
        onChange={(e) => {
          const raw = e.target.value
          setText(raw)
          if (raw.trim() === "") return
          const num = Number(raw)
          if (Number.isFinite(num)) {
            if (isInteger) onCommit(Math.round(num))
            else if (isPenetration) onCommit(num / 1000)
            else if (isPercent) onCommit(num / 100)
            else onCommit(num)
          }
        }}
        onBlur={() => {
          focusedRef.current = false
          commitText(text)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur()
          } else if (e.key === "Escape") {
            focusedRef.current = false
            onClear()
          }
        }}
      />
      {isPercent && <span className={styles.statPercentSign}>%</span>}
      {effective !== undefined && (
        <span className={styles.statsOverviewEff}>
          {" → "}
          {isInteger ? String(Math.round(effective)) : fmt(effective, isPercent, isPenetration)}
        </span>
      )}
    </div>
  )
}

function Section({
  title,
  rows,
  onStatChange,
  statOverrides,
  singleColumn,
}: {
  title: string
  rows: RowEntry[]
  onStatChange?: (path: string, value: number | undefined) => void
  statOverrides?: Record<string, number>
  singleColumn?: boolean
}) {
  if (rows.length === 0) return null
  return (
    <div>
      <div className={styles.statsOverviewSectionHead}>{title}</div>
      <div
        className={`${styles.statsOverviewGrid} ${singleColumn ? styles.statsOverviewGridSingle : ""}`}
      >
        {rows.map((entry, index) => {
          const isOverridden = Boolean(entry.path && statOverrides?.[entry.path] !== undefined)
          return (
            <div key={index} className={styles.statsOverviewRow}>
              <div className={styles.statsOverviewLabel} title={entry.hint ?? entry.label}>
                {entry.label}
              </div>
              <div className={styles.statsOverviewLeader} />
              <div className={styles.statsOverviewValue}>
                {onStatChange && entry.path ? (
                  <StatInput
                    value={entry.value}
                    isPercent={entry.isPercent}
                    isPenetration={Boolean(entry.isPenetration)}
                    isInteger={Boolean(entry.isInteger)}
                    isOverridden={isOverridden}
                    effective={entry.effective}
                    onCommit={(val) => onStatChange(entry.path!, val)}
                    onClear={() => onStatChange(entry.path!, undefined)}
                    title={
                      isOverridden
                        ? "Manual override. Clear to restore gear value."
                        : "Click to edit manually"
                    }
                  />
                ) : (
                  <>
                    {entry.isInteger
                      ? String(Math.round(entry.value))
                      : fmt(entry.value, entry.isPercent, entry.isPenetration)}
                    {entry.effective !== undefined && (
                      <span className={styles.statsOverviewEff}>
                        {" → "}
                        {entry.isInteger
                          ? String(Math.round(entry.effective))
                          : fmt(entry.effective, entry.isPercent, entry.isPenetration)}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
