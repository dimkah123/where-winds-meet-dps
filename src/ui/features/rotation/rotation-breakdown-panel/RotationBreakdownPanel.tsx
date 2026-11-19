import { useMemo, useState } from "react"
import type { Result } from "../../../../engine/types"
import { useI18n } from "../../../../i18n/i18nContext"
import { groupByBreakdownName } from "../../../utils/skillBreakdown"
import {
  groupIntoInGameCategories,
  type CompactBreakdownRow,
} from "../../../utils/compactBreakdown"
import styles from "./RotationBreakdownPanel.module.scss"

export type BreakdownViewMode = "detailed" | "compact"

const STORAGE_KEY = "wwm.breakdownMode"

const fmt = (value: number, digits = 2) =>
  Number.isFinite(value)
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : "—"

const PALETTE = [
  "#c0a060",
  "#6a9bd8",
  "#8fbf6a",
  "#d87a7a",
  "#b57ad8",
  "#d8b46a",
  "#6ad8c4",
  "#d86ab0",
  "#9a9a9a",
  "#d8d86a",
  "#7a9ad8",
  "#d89a6a",
]
const colorFor = (index: number) => PALETTE[index % PALETTE.length]

interface Props {
  result: Result
  mode?: BreakdownViewMode
  onModeChange?: (mode: BreakdownViewMode) => void
  hideHeader?: boolean
}

export function RotationBreakdownPanel({
  result,
  mode: controlledMode,
  onModeChange,
  hideHeader = false,
}: Props) {
  const { t } = useI18n()

  const [internalMode, setInternalMode] = useState<BreakdownViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "compact" || stored === "detailed") return stored
    } catch {
      // ignore
    }
    return "detailed"
  })

  const mode = controlledMode ?? internalMode

  function handleSetMode(nextMode: BreakdownViewMode) {
    if (onModeChange) {
      onModeChange(nextMode)
    } else {
      setInternalMode(nextMode)
      try {
        localStorage.setItem(STORAGE_KEY, nextMode)
      } catch {
        // ignore
      }
    }
  }

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set())

  function toggleExpandCategory(categoryId: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const detailedRows = useMemo(() => groupByBreakdownName(result.perSkill), [result.perSkill])
  const compactRows: CompactBreakdownRow[] = useMemo(
    () => groupIntoInGameCategories(result.perSkill, result.rotationDuration),
    [result.perSkill, result.rotationDuration],
  )

  if (detailedRows.length === 0) {
    return <div className="empty-tab">{t("common.none")}</div>
  }

  const maxDetailedDmg = detailedRows[0]?.expectedDamage || 1
  const maxCompactDmg = compactRows[0]?.expectedDamage || 1

  const dpsOverRotation = (damage: number) =>
    result.rotationDuration > 0 ? damage / result.rotationDuration : Number.NaN

  return (
    <div>
      {!hideHeader && (
        <div className={styles.panelHeader}>
          <h2>{t("rotation.dpsBreakdown")}</h2>
          <div className={styles.viewToggle} role="group" aria-label={t("rotation.dpsBreakdown")}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${mode === "detailed" ? styles.active : ""}`}
              onClick={() => handleSetMode("detailed")}
              title={t("rotation.breakdown.detailedHint")}
            >
              {t("rotation.breakdown.detailed")}
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${mode === "compact" ? styles.active : ""}`}
              onClick={() => handleSetMode("compact")}
              title={t("rotation.breakdown.compactHint")}
            >
              🗜️ {t("rotation.breakdown.compactInGame")}
            </button>
          </div>
        </div>
      )}

      {mode === "detailed" ? (
        <table className="ranking-table skill-table">
          <thead>
            <tr>
              <th>{t("common.skill")}</th>
              <th className="bar-col" />
              <th>{t("rotation.breakdown.hitCount")}</th>
              <th>{t("common.share")}</th>
              <th>{t("common.dps")}</th>
              <th>{t("common.totalDamage")}</th>
            </tr>
          </thead>
          <tbody>
            {detailedRows.map((row, index) => {
              const ratio = row.expectedDamage / maxDetailedDmg
              return (
                <tr key={row.name}>
                  <td>{t(row.nameKey, row.name)}</td>
                  <td className="bar-col">
                    <div className="skill-bar-track">
                      <div
                        className="skill-bar-fill"
                        style={{
                          width: (ratio * 100).toFixed(2) + "%",
                          background: colorFor(index),
                        }}
                      />
                    </div>
                  </td>
                  <td>{row.count}</td>
                  <td className={styles.percentCell}>{(row.percentOfTotal * 100).toFixed(1)}%</td>
                  <td>{fmt(dpsOverRotation(row.expectedDamage), 1)}</td>
                  <td>{fmt(row.expectedDamage, 0)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <table className="ranking-table skill-table">
          <thead>
            <tr>
              <th>{t("rotation.breakdown.inGameSkills")}</th>
              <th className="bar-col" />
              <th>{t("rotation.breakdown.attempt")}</th>
              <th>{t("common.share")}</th>
              <th>{t("common.dps")}</th>
              <th>{t("common.totalDamage")}</th>
            </tr>
          </thead>
          <tbody>
            {compactRows.map((row, index) => {
              const ratio = row.expectedDamage / maxCompactDmg
              const hasSubSkills = row.subSkills.length > 1
              const isExpanded = expandedCategories.has(row.categoryId)

              return (
                <CompactRowGroup
                  key={row.categoryId}
                  row={row}
                  index={index}
                  ratio={ratio}
                  hasSubSkills={hasSubSkills}
                  isExpanded={isExpanded}
                  onToggle={() => hasSubSkills && toggleExpandCategory(row.categoryId)}
                  t={t}
                />
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

function CompactRowGroup({
  row,
  index,
  ratio,
  hasSubSkills,
  isExpanded,
  onToggle,
  t,
}: {
  row: CompactBreakdownRow
  index: number
  ratio: number
  hasSubSkills: boolean
  isExpanded: boolean
  onToggle: () => void
  t: (key: string, fallback?: string) => string
}) {
  return (
    <>
      <tr
        className={`${styles.categoryRow} ${hasSubSkills ? styles.clickable : ""}`}
        onClick={onToggle}
        title={hasSubSkills ? (isExpanded ? "Свернуть" : "Развернуть детализацию") : undefined}
      >
        <td>
          <div className={styles.categoryNameCell}>
            {hasSubSkills && (
              <span className={`${styles.expandChevron} ${isExpanded ? styles.open : ""}`}>▶</span>
            )}
            <span>{t(row.nameKey, row.name)}</span>
            {hasSubSkills && (
              <span className={styles.subSkillCountBadge}>{row.subSkills.length}</span>
            )}
          </div>
        </td>
        <td className="bar-col">
          <div className="skill-bar-track">
            <div
              className="skill-bar-fill"
              style={{ width: (ratio * 100).toFixed(2) + "%", background: colorFor(index) }}
            />
          </div>
        </td>
        <td>{row.attempt}</td>
        <td className={styles.percentCell}>{(row.percentOfTotal * 100).toFixed(1)}%</td>
        <td>{fmt(row.dps, 1)}</td>
        <td>{fmt(row.expectedDamage, 0)}</td>
      </tr>

      {hasSubSkills &&
        isExpanded &&
        row.subSkills.map((sub) => {
          const categoryTitle = t(row.nameKey, row.name)
          const translatedName = t(sub.nameKey, sub.name)
          const displayName =
            translatedName === categoryTitle && sub.name !== row.name ? sub.name : translatedName

          return (
            <tr key={sub.name} className={styles.subSkillRow}>
              <td>
                <div className={styles.subSkillName}>
                  <span>{displayName}</span>
                </div>
              </td>
              <td className="bar-col" />
              <td>
                {sub.count} {sub.count === 1 ? "hit" : "hits"}
              </td>
              <td className={styles.percentCell}>{(sub.percentOfTotal * 100).toFixed(1)}%</td>
              <td>{fmt(sub.dps, 1)}</td>
              <td>{fmt(sub.expectedDamage, 0)}</td>
            </tr>
          )
        })}
    </>
  )
}
