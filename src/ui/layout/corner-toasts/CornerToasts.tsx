import type { Result } from "../../../engine/types"
import { QiBreakToast } from "../qi-break-toast/QiBreakToast"
import { WarningsToast } from "../warnings-toast/WarningsToast"
import styles from "./CornerToasts.module.scss"

export function CornerToasts({
  result,
  onCheckRotation,
  now,
  isAlertsDnd,
  onToggleDnd,
}: {
  result: Result
  onCheckRotation: () => void
  now?: () => number
  isAlertsDnd?: boolean
  onToggleDnd?: () => void
}) {
  return (
    <div className={styles.stack}>
      <QiBreakToast onCheckRotation={onCheckRotation} now={now} />
      <WarningsToast result={result} isDnd={isAlertsDnd} onToggleDnd={onToggleDnd} />
    </div>
  )
}
