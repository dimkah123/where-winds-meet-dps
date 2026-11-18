import { Fragment } from "react"
import type { GearLevel, Inputs } from "../../../../engine/types"
import { WEAPON_SLOTS } from "../../../../engine/types"
import { resolveActiveSets, setTierLevel } from "../../../../engine/setBonuses"
import {
  equippedSetBearingPieces,
  FOUR_PIECE_SIZE,
  TWO_PIECE_SIZE,
} from "../../../../engine/setPieces"
import { GEAR_SET_DEFS } from "../../../../definitions/sets/registry"
import { BOW_SET_DEFS } from "../../../../data/sets/bowSets"
import { setKey } from "../../../../i18n/contentKeys"
import { useI18n } from "../../../../i18n/i18nContext"
import { BOW_SET_NAME_KEYS } from "../shared/buildSetKeys"
import { formatSetBonusValue, setBonusStatKey } from "../shared/setBonusText"
import styles from "./GearSetStrip.module.scss"

interface Props {
  inputs: Inputs
}

export function GearSetStrip({ inputs }: Props) {
  const { t } = useI18n()
  const activeSets = resolveActiveSets(inputs)
  const equippedPieces = equippedSetBearingPieces(inputs)

  const equippedSets = GEAR_SET_DEFS.map((definition) => {
    const levels = equippedPieces
      .filter((piece) => piece.set === definition.id)
      .map((piece) => piece.level)
    return { definition, levels }
  })
    .filter(({ levels }) => levels.length > 0)
    .sort((left, right) => right.levels.length - left.levels.length)

  const activeBow = activeSets.bow
  const bowDefinition = activeBow ? BOW_SET_DEFS[activeBow.set] : null

  const equippedWeapons = WEAPON_SLOTS.map((slot) => {
    const id = inputs.equipped[slot]
    return id ? inputs.inventory.find((piece) => piece.id === id) : null
  }).filter((piece): piece is NonNullable<typeof piece> => !!piece)

  const weaponsWithoutSet = equippedWeapons.filter((piece) => !piece.set)

  return (
    <div className={styles.setStrip}>
      <div className={styles.group}>
        <span className={styles.groupName}>{t("common.armorSet")}</span>
        {equippedSets.length === 0 && <span className={styles.dim}>{t("gear.noneShort")}</span>}
        {equippedSets.map(({ definition, levels }, index) => {
          const count = levels.length
          const bonus = definition.panelBonus
          const tierLevel =
            activeSets.twoPiece.find((entry) => entry.setId === definition.id)?.level ??
            (bonus ? setTierLevel(levels, 1, Object.keys(bonus.value).map(Number)) : null)
          const bonusValue =
            bonus && tierLevel !== null ? bonus.value[tierLevel as GearLevel] : undefined
          const isIncomplete = count > 0 && count < FOUR_PIECE_SIZE && count !== TWO_PIECE_SIZE
          return (
            <Fragment key={definition.id}>
              {index > 0 && <span className={styles.separator} />}
              <span className={styles.setName}>{t(setKey(definition.id), definition.name)}</span>
              <span className={styles.count}>
                {count}/{FOUR_PIECE_SIZE}
              </span>
              <span className={styles.tierChip + (count >= TWO_PIECE_SIZE ? ` ${styles.on}` : "")}>
                {t("common.twoPiece")}
                {bonus && bonusValue !== undefined
                  ? ` ${formatSetBonusValue(bonus.stat, bonusValue)} ${t(setBonusStatKey(bonus.stat))}`
                  : ""}
              </span>
              <span className={styles.tierChip + (count >= FOUR_PIECE_SIZE ? ` ${styles.on}` : "")}>
                {t("common.fourPiece")}
              </span>
              {isIncomplete && (
                <span
                  className={styles.warningChip}
                  title={t("gear.setWarningIncomplete").replace("{count}", `${count}/${FOUR_PIECE_SIZE}`)}
                >
                  ⚠️ {t("gear.setWarningIncomplete").replace("{count}", `${count}/${FOUR_PIECE_SIZE}`)}
                </span>
              )}
            </Fragment>
          )
        })}
        {weaponsWithoutSet.length > 0 && equippedSets.length > 0 && (
          <span
            className={styles.warningChip}
            title={t("gear.setWarningNoSet").replace("{count}", String(weaponsWithoutSet.length))}
          >
            ⚠️ {t("gear.setWarningNoSet").replace("{count}", String(weaponsWithoutSet.length))}
          </span>
        )}
      </div>
      <span className={styles.separator} />
      <div className={styles.group}>
        <span className={styles.groupName}>{t("common.bowSet")}</span>
        {activeBow && bowDefinition ? (
          <>
            <span className={styles.setName}>{t(BOW_SET_NAME_KEYS[activeBow.set])}</span>
            <span className={styles.count}>
              {t("common.levelShort").replace("{n}", String(activeBow.level))}
            </span>
            <span className={`${styles.tierChip} ${styles.on}`}>
              {formatSetBonusValue(bowDefinition.stat, bowDefinition.value[activeBow.level] ?? 0)}{" "}
              {t(setBonusStatKey(bowDefinition.stat))}
            </span>
          </>
        ) : (
          <span className={styles.dim}>{t("gear.setStrip.bowUnpaired")}</span>
        )}
      </div>
    </div>
  )
}
