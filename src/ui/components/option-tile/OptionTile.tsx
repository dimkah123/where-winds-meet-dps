import type { OptionTileTone } from "./optionTileTone"
import styles from "./OptionTile.module.scss"

const TONE_CLASS: Record<OptionTileTone, string> = {
  neutral: "",
  positive: styles.positive,
  negative: styles.negative,
  current: styles.current,
}

export function OptionTile({
  label,
  headMeta,
  note,
  detail,
  tone = "neutral",
  selected,
  onClick,
  title,
}: {
  label: string
  headMeta?: string
  note?: string
  detail: string
  tone?: OptionTileTone
  selected: boolean
  onClick: () => void
  title?: string
}) {
  const toneClass = TONE_CLASS[tone]
  return (
    <button
      type="button"
      className={styles.tile + (selected ? ` ${styles.selected}` : "")}
      aria-current={selected}
      title={title}
      onClick={onClick}
    >
      <div className={styles.tileTitleRow}>
        <span className={styles.tileLabel}>{label}</span>
      </div>
      <div className={styles.tileMetaRow}>
        <span className={styles.tileDetail + (toneClass ? ` ${toneClass}` : "")}>{detail}</span>
        {headMeta && <span className={styles.tileHeadMeta}>{headMeta}</span>}
      </div>
      {note && (
        <div className={styles.tileNoteRow}>
          <span className={styles.tileNote}>{note}</span>
        </div>
      )}
    </button>
  )
}
