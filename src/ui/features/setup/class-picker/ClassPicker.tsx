import { SELECTABLE_CLASS_DEFS, classDefinition } from "../../../../definitions/classes/registry"
import { graduationBuildsFor } from "../../../../definitions/graduationBuilds/registry"
import { useI18n } from "../../../../i18n/i18nContext"
import { classKey, graduationBuildKey, martialArtKey } from "../../../../i18n/contentKeys"
import styles from "./ClassPicker.module.scss"

interface Props {
  value: string
  onChange(classId: string): void
  selectedBuildId?: string | null
  onSelectBuild?: (buildId: string) => void
}

export function ClassPicker({ value, onChange, selectedBuildId, onSelectBuild }: Props) {
  const { t } = useI18n()
  const classDefs = SELECTABLE_CLASS_DEFS()
  const builds = graduationBuildsFor(value)

  return (
    <div className={styles.pickerRoot}>
      <div className={styles.classTileContainer}>
        {classDefs.map((classDef) => {
          const martialArts = classDefinition(classDef.id)!.martialArts
          const icon = martialArts.find((martialArt) => martialArt.icon)?.icon
          const selected = classDef.id === value
          return (
            <button
              type="button"
              key={classDef.id}
              className={styles.tile + (selected ? ` ${styles.selected}` : "")}
              aria-current={selected}
              onClick={() => onChange(classDef.id)}
            >
              {icon ? (
                <img className={styles.icon} src={icon} alt="" />
              ) : (
                <div className={styles.icon} />
              )}
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>
                    {t(classKey(classDef.id), classDef.displayName)}
                  </span>
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

      {builds.length > 0 && (
        <div className={styles.buildPickerSection}>
          <div className={styles.buildGrid}>
            {builds.map((build) => {
              const isSelected = selectedBuildId
                ? build.id === selectedBuildId
                : build.id === builds[0]?.id
              return (
                <button
                  type="button"
                  key={build.id}
                  className={`${styles.buildTile} ${isSelected ? styles.buildSelected : ""}`}
                  onClick={() => onSelectBuild?.(build.id)}
                  aria-current={isSelected}
                >
                  <span className={styles.buildRadio}>
                    <span
                      className={`${styles.radioDot} ${isSelected ? styles.radioDotSelected : ""}`}
                    />
                    <span className={styles.buildName}>
                      {t(graduationBuildKey(build.id), build.name)}
                    </span>
                  </span>
                  {isSelected && (
                    <span className={styles.buildFollowing}>
                      {t("gear.graduationBuildPicker.following")}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
