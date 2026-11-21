import { useI18n } from "../../../../i18n/i18nContext"
import type { Inputs, Result } from "../../../../engine/types"
import { RotationOptionsPanel } from "../rotation-options-panel/RotationOptionsPanel"
import { RotationBreakdownPanel } from "../rotation-breakdown-panel/RotationBreakdownPanel"
import { RotationDpsGraphPanel } from "../rotation-dps-graph-panel/RotationDpsGraphPanel"
import { RotationTimelinePanel } from "../rotation-timeline-panel/RotationTimelinePanel"
import { BlossomTimelinePanel } from "../blossom-timeline-panel/BlossomTimelinePanel"
import { BlossomPanel } from "../../overview/blossom-panel/BlossomPanel"
import { RotationTrainerHost } from "../trainer/RotationTrainerHost"
import styles from "./RotationTab.module.scss"

export function RotationTab({
  inputs,
  engineInputs,
  onChange,
  result,
}: {
  inputs: Inputs
  engineInputs: Inputs
  onChange: (next: Inputs) => void
  result: Result
}) {
  const { t } = useI18n()
  return (
    <RotationTrainerHost inputs={inputs} result={result}>
      {(openTrainer, isTrainerActive) => (
        <div className={styles.rotationLayout}>
          <div className={`panel ${styles.optionsPanel}`}>
            <div className={styles.optionsHeader}>
              <h2>{t("common.rotations")}</h2>
              <button
                type="button"
                className={`btn ${isTrainerActive ? "is-on" : "primary"} ${styles.trainerCtaBtn}`}
                onClick={openTrainer}
                title={t("trainer.openPipTooltip")}
              >
                {t("trainer.pipButton")}
              </button>
            </div>
            <RotationOptionsPanel
              inputs={inputs}
              engineInputs={engineInputs}
              onChange={onChange}
              currentDps={result.dps}
            />
          </div>
          <div className={styles.outputGrid}>
            <div className="panel">
              <RotationBreakdownPanel result={result} />
            </div>
            <div className="panel">
              <h2>{t("rotation.dpsGraph")}</h2>
              <RotationDpsGraphPanel result={result} />
            </div>
            {inputs.classId === "silkbindJade" && (
              <div className={`panel ${styles.spanColumns}`}>
                <BlossomTimelinePanel result={result} />
                <details>
                  <summary>{t("overview.blossoms.assumptions")}</summary>
                  <BlossomPanel inputs={inputs} onChange={onChange} />
                </details>
              </div>
            )}
            <div className={`panel ${styles.spanColumns}`}>
              <h2>{t("rotation.castTimeline")}</h2>
              <RotationTimelinePanel result={result} />
            </div>
          </div>
        </div>
      )}
    </RotationTrainerHost>
  )
}
