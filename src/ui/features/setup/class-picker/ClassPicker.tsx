import { classDefinition } from "../../../../definitions/classes/registry"
import { useI18n } from "../../../../i18n/i18nContext"
import { martialArtKey } from "../../../../i18n/contentKeys"
import styles from "./ClassPicker.module.scss"

interface Props {
  value: string
  onChange(classId: string): void
  selectedBuildId?: string | null
  onSelectBuild?: (buildId: string) => void
}

interface ArchetypeOption {
  id: "mix" | "pureHeng"
  nameKey: string
  defaultName: string
  maxBuildId: string
  minBuildId: string
}

const ARCHETYPES: readonly ArchetypeOption[] = [
  {
    id: "mix",
    nameKey: "setup.archetype.mix",
    defaultName: "Mix Build",
    maxBuildId: "graduation-stonesplitStrength-max-build",
    minBuildId: "graduation-stonesplitStrength-cleftpeak-crit",
  },
  {
    id: "pureHeng",
    nameKey: "setup.archetype.pureHeng",
    defaultName: "Pure Heng",
    maxBuildId: "graduation-stonesplitStrength-pureHeng-max-build",
    minBuildId: "graduation-stonesplitStrength-pureHeng-min-build",
  },
]

export function ClassPicker({ value, onChange, selectedBuildId, onSelectBuild }: Props) {
  const { t } = useI18n()
  const currentClassDef = classDefinition(value || "stonesplitStrength")
  const martialArts = currentClassDef?.martialArts ?? []
  const icon = martialArts.find((martialArt) => martialArt.icon)?.icon

  const isPureHeng =
    selectedBuildId === "graduation-stonesplitStrength-pureHeng-max-build" ||
    selectedBuildId === "graduation-stonesplitStrength-pureHeng-min-build"

  const currentArchetypeId = isPureHeng ? "pureHeng" : "mix"
  const currentArchetype =
    ARCHETYPES.find((arch) => arch.id === currentArchetypeId) ?? ARCHETYPES[0]

  const isMin =
    selectedBuildId === "graduation-stonesplitStrength-cleftpeak-crit" ||
    selectedBuildId === "graduation-stonesplitStrength-pureHeng-min-build"

  function handleSelectArchetype(arch: ArchetypeOption) {
    onChange("stonesplitStrength")
    const nextBuildId = isMin ? arch.minBuildId : arch.maxBuildId
    onSelectBuild?.(nextBuildId)
  }

  function handleSelectVariant(variant: "max" | "min") {
    const nextBuildId =
      variant === "min" ? currentArchetype.minBuildId : currentArchetype.maxBuildId
    onSelectBuild?.(nextBuildId)
  }

  return (
    <div className={styles.pickerRoot}>
      <div className={styles.classTileContainer}>
        {ARCHETYPES.map((arch) => {
          const isSelected = arch.id === currentArchetypeId
          return (
            <button
              type="button"
              key={arch.id}
              className={styles.tile + (isSelected ? ` ${styles.selected}` : "")}
              aria-current={isSelected}
              onClick={() => handleSelectArchetype(arch)}
            >
              {icon ? (
                <img className={styles.icon} src={icon} alt="" />
              ) : (
                <div className={styles.icon} />
              )}
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{t(arch.nameKey, arch.defaultName)}</span>
                </div>
                {martialArts.map((martialArt, index) => (
                  <div key={martialArt.id} className={styles.weaponRow}>
                    <span className={styles.weaponLabel}>
                      {t("common.weapon")} {index + 1}
                    </span>
                    <span className={styles.weaponValue}>
                      {t(martialArtKey(martialArt.id), martialArt.name)}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div className={styles.buildPickerSection}>
        <div className={styles.buildGrid}>
          <button
            type="button"
            className={`${styles.buildTile} ${!isMin ? styles.buildSelected : ""}`}
            onClick={() => handleSelectVariant("max")}
            aria-current={!isMin}
          >
            <span className={styles.buildRadio}>
              <span className={`${styles.radioDot} ${!isMin ? styles.radioDotSelected : ""}`} />
              <span className={styles.buildName}>{t("setup.wizard.maxBuild", "Max Build")}</span>
            </span>
            {!isMin && (
              <span className={styles.buildFollowing}>
                {t("gear.graduationBuildPicker.following")}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.buildTile} ${isMin ? styles.buildSelected : ""}`}
            onClick={() => handleSelectVariant("min")}
            aria-current={isMin}
          >
            <span className={styles.buildRadio}>
              <span className={`${styles.radioDot} ${isMin ? styles.radioDotSelected : ""}`} />
              <span className={styles.buildName}>{t("setup.wizard.minBuild", "Min Build")}</span>
            </span>
            {isMin && (
              <span className={styles.buildFollowing}>
                {t("gear.graduationBuildPicker.following")}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
