import { useState } from "react"
import type { ItemRankingRow } from "../../../../engine/types"
import { useI18n } from "../../../../i18n/i18nContext"
import styles from "./ItemRankingTable.module.scss"

interface Props {
  rows: ItemRankingRow[]
}

export function getRuStatWord(count: number): string {
  const abs = Math.abs(count) % 100
  const rem = abs % 10
  if (abs >= 11 && abs <= 19) return "статов"
  if (rem === 1) return "стат"
  if (rem >= 2 && rem <= 4) return "стата"
  return "статов"
}

function fmtDpsDelta(dpsDelta: number): string {
  const rounded = Math.round(dpsDelta * 100) / 100
  const formatted = rounded.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return rounded > 0 ? `+${formatted}` : formatted
}

function deltaSignClass(dpsDelta: number): string {
  const rounded = Math.round(dpsDelta * 100) / 100
  if (rounded > 0) return "is-positive"
  if (rounded < 0) return "is-negative"
  return "is-zero"
}

export function ItemRankingTable({ rows }: Props) {
  const { t, locale } = useI18n()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!rows.length) return null

  const sorted = [...rows].sort((rowA, rowB) => rowB.liftPercent - rowA.liftPercent)

  const fmt = (value: number, digits = 2) =>
    Number.isFinite(value)
      ? value.toLocaleString("en-US", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })
      : "—"

  // Lead >= 1 stats are considered primary / high-impact.
  // Stats with Lead < 1 or "(none)" are collapsed behind "Show {count} more stats".
  const thresholdRows = sorted.filter(
    (row) => typeof row.leadVsMin === "number" && row.leadVsMin >= 1,
  )
  const primaryRows =
    thresholdRows.length > 0 ? thresholdRows : sorted.slice(0, Math.min(sorted.length, 5))
  const hiddenCount = sorted.length - primaryRows.length
  const displayRows = isExpanded || hiddenCount <= 0 ? sorted : primaryRows

  const toggleLabel = isExpanded
    ? t(
        "overview.itemRankingTable.showLess",
        locale === "ru" ? "Скрыть дополнительные статы" : "Show less",
      )
    : t(
        "overview.itemRankingTable.showMore",
        locale === "ru" ? "Показать ещё {count} {word}" : "Show {count} more stats",
      )
        .replace("{count}", String(hiddenCount))
        .replace("{word}", getRuStatWord(hiddenCount))

  return (
    <div className={styles.tableWrapper}>
      <table className={`ranking-table ${styles.rankingTable}`}>
        <thead>
          <tr>
            <th>{t("overview.itemRankingTable.statLine")}</th>
            <th>{t("common.amount")}</th>
            <th>{t("common.dpsDelta")}</th>
            <th>{t("overview.itemRankingTable.lift")}</th>
            <th className={styles.leadCol}>{t("overview.itemRankingTable.lead")}</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row) => {
            const rank = sorted.indexOf(row) + 1
            return (
              <tr key={row.statLineId + "_" + rank}>
                <td className={styles.labelCell}>
                  <span
                    className={`${styles.rankBadge} ${
                      rank === 1
                        ? styles.rankBadge1
                        : rank === 2
                          ? styles.rankBadge2
                          : rank === 3
                            ? styles.rankBadge3
                            : styles.rankBadgeDim
                    }`}
                  >
                    {rank}
                  </span>
                  {t(row.labelKey, row.label)}
                </td>
                <td>{row.unit === "percent" ? fmt(row.amount * 100, 2) + "%" : fmt(row.amount, 2)}</td>
                <td
                  className={`${styles.dpsDelta} ${deltaSignClass(row.dpsDelta)}`}
                  title={`${t("overview.itemRankingTable.expectedDps")}: ${fmt(row.expectedDps, 2)}`}
                >
                  {fmtDpsDelta(row.dpsDelta)}
                </td>
                <td>{(row.liftPercent * 100).toFixed(2) + "%"}</td>
                <td
                  className={styles.leadCol}
                  style={{ color: row.leadVsMin === "(none)" ? "#666" : "#d8b070" }}
                >
                  {typeof row.leadVsMin === "number" ? row.leadVsMin.toFixed(2) : t("common.none")}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {hiddenCount > 0 && (
        <div className={styles.toggleRow}>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            <span className={styles.toggleIcon}>{isExpanded ? "▲" : "▼"}</span>
            <span>{toggleLabel}</span>
          </button>
        </div>
      )}
    </div>
  )
}
