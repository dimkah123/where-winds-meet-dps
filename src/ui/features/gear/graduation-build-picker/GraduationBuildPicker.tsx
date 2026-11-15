import { useEffect, useId, useState } from "react"
import type { GraduationBuild } from "../../../../definitions/graduationBuilds/graduationBuildDef"
import { classDefinition } from "../../../../definitions/classes/registry"
import { SET_BY_ID } from "../../../../definitions/sets/registry"
import { graduationBuildKey, rotationKey, setKey } from "../../../../i18n/contentKeys"
import { useI18n } from "../../../../i18n/i18nContext"
import { BOW_SET_KEYS } from "../shared/buildSetKeys"
import styles from "./GraduationBuildPicker.module.scss"

interface Props {
  builds: readonly GraduationBuild[]
  followedBuildId: string | null
  onFollow(buildId: string): void
}

function isPureHengBuild(build: GraduationBuild): boolean {
  return build.id.includes("pureHeng")
}

export function GraduationBuildPicker({ builds, followedBuildId, onFollow }: Props) {
  const { t } = useI18n()
  const groupName = useId()

  const hasPureHeng = builds.some(isPureHengBuild)
  const isPureHengFollowed = followedBuildId?.includes("pureHeng") ?? false

  const [activeArchetype, setActiveArchetype] = useState<"mix" | "pureHeng">(
    isPureHengFollowed ? "pureHeng" : "mix",
  )

  useEffect(() => {
    if (followedBuildId?.includes("pureHeng")) {
      setActiveArchetype("pureHeng")
    } else if (followedBuildId) {
      setActiveArchetype("mix")
    }
  }, [followedBuildId])

  const mixBuilds = hasPureHeng ? builds.filter((b) => !isPureHengBuild(b)) : builds
  const pureHengBuilds = hasPureHeng ? builds.filter(isPureHengBuild) : []

  const hasMixFollowing = mixBuilds.some((b) => b.id === followedBuildId)
  const hasPureHengFollowing = pureHengBuilds.some((b) => b.id === followedBuildId)

  const displayedBuilds = hasPureHeng
    ? activeArchetype === "pureHeng"
      ? pureHengBuilds
      : mixBuilds
    : builds

  function formatBuildName(build: GraduationBuild): string {
    if (hasPureHeng) {
      if (build.id.endsWith("max-build")) return t("setup.wizard.maxBuild", "Max Build")
      if (build.id.endsWith("min-build") || build.id.endsWith("cleftpeak-crit")) {
        return t("setup.wizard.minBuild", "Min Build")
      }
    }
    return t(graduationBuildKey(build.id), build.name)
  }

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.legend}>{t("gear.graduationBuildPicker.buildToFollow")}</legend>

      {hasPureHeng && (
        <div className={styles.archetypeSelector} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeArchetype === "mix"}
            className={`${styles.archetypeButton} ${
              activeArchetype === "mix" ? styles.active : ""
            }`}
            onClick={() => setActiveArchetype("mix")}
          >
            {t("setup.archetype.mix", "Mix Build")}
            {hasMixFollowing && (
              <span className={styles.tabFollowingPill}>
                {t("gear.graduationBuildPicker.following")}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeArchetype === "pureHeng"}
            className={`${styles.archetypeButton} ${
              activeArchetype === "pureHeng" ? styles.active : ""
            }`}
            onClick={() => setActiveArchetype("pureHeng")}
          >
            {t("setup.archetype.pureHeng", "Pure Heng")}
            {hasPureHengFollowing && (
              <span className={styles.tabFollowingPill}>
                {t("gear.graduationBuildPicker.following")}
              </span>
            )}
          </button>
        </div>
      )}

      <div className={styles.options}>
        {displayedBuilds.map((build) => {
          const followed = build.id === followedBuildId
          const armorSet = build.set ? SET_BY_ID[build.set] : null
          const rotation = classDefinition(build.classId)?.rotations.find(
            (candidate) => candidate.id === build.rotationId,
          )
          return (
            <label
              key={build.id}
              className={followed ? `${styles.option} ${styles.followed}` : styles.option}
            >
              <input
                type="radio"
                name={groupName}
                value={build.id}
                checked={followed}
                onChange={() => onFollow(build.id)}
              />
              <span className={styles.body}>
                <span className={styles.nameRow}>
                  <span className={styles.name}>{formatBuildName(build)}</span>
                  {followed && (
                    <span className={styles.following}>
                      {t("gear.graduationBuildPicker.following")}
                    </span>
                  )}
                </span>
                <span className={styles.facts}>
                  <span>
                    {t("common.armorSet")}{" "}
                    <span className={styles.factValue}>
                      {armorSet ? t(setKey(armorSet.id), armorSet.name) : t("common.unselected")}
                    </span>
                  </span>
                  <span>
                    {t("common.bowSet")}{" "}
                    <span className={styles.factValue}>
                      {build.bowSet ? t(BOW_SET_KEYS[build.bowSet]) : t("common.unselected")}
                    </span>
                  </span>
                  <span>
                    {t("common.rotation")}{" "}
                    <span className={styles.factValue}>
                      {rotation ? t(rotationKey(rotation.id), rotation.name) : build.rotationId}
                    </span>
                  </span>
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
