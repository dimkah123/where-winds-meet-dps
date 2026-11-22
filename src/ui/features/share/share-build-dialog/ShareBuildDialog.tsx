import { useEffect, useId, useRef, useState } from "react"
import { Dialog } from "../../../components/dialog/Dialog"
import { SubTabs } from "../../../components/sub-tabs/SubTabs"
import {
  drawBuildCard,
  formatClassBoostLabel,
  type BuildCardLabels,
} from "../build-showcase/drawBuildCard"
import { encodeSharedBuild } from "../../../../engine/shareBuild"
import type { Inputs, Result } from "../../../../engine/types"
import { useI18n } from "../../../../i18n/i18nContext"
import { attunementKey, classKey, innerWayKey, setKey } from "../../../../i18n/contentKeys"
import { classDefinition } from "../../../../definitions/classes/registry"
import { equippedPiecesFor, withDerivedStats } from "../../../../engine/derivedInputs"
import { applySetBonuses, resolveActiveSets, setPhysDefBonus } from "../../../../engine/setBonuses"
import { effectiveRates, getSchool, resistanceForInputs } from "../../../../engine/panel"
import { finalHitOutcomeRates } from "../../../components/stats-overview-panel/finalHitOutcomeRates"
import { activeRotationName } from "../../rotation/rotationOptions"
import { SET_BY_ID } from "../../../../definitions/sets/registry"
import { BOW_SET_NAME_KEYS } from "../../gear/shared/buildSetKeys"
import { BOW_SET_DEFS } from "../../../../data/sets/bowSets"
import { formatSetBonusValue, setBonusStatKey } from "../../gear/shared/setBonusText"
import { gearLevelForBreakthrough } from "../../../../definitions/baseStats/breakthroughs"
import {
  averageEnhancementBonus,
  effectiveEnhancementLevels,
  enhancedSlotsOf,
  effectiveMaxHp,
  totalFormlessAttack,
  totalMaxHp,
  totalPhysDef,
  totalPlayerAttributes,
} from "../../../../definitions/baseStats"
import { foodPhysAttackBeforeMultiplier } from "../../../../data/consumables/foods"
import { getAttunement } from "../../../../engine/attunements"
import { SCRIPT_LABEL_KEYS } from "../../../../data/skills/buffs/scriptOptions"
import { OPTION_LABEL_KEYS } from "../../overview/encounter-settings-dialog/encounterOptionText"
import {
  attackFoodOptionId,
  divinecraftOptionId,
  refinementOptionId,
} from "../../../../engine/encounterOptions"
import { innerWayName, slotInnerWayId } from "../../../../definitions/innerWays/registry"
import { readPath, statPathLabel } from "../../../utils/statFormatting"
import { saveBuildToCloud, updateBuildInCloud } from "../../../../cloud/cloudBuilds"
import styles from "./ShareBuildDialog.module.scss"

interface Props {
  inputs: Inputs
  result: Result
  defaultAuthor?: string
  defaultTitle?: string
  currentCloudId?: string | null
  onCloudSaved?: (shortId: string) => void
  onClose: () => void
}

type TabKey = "link" | "card"

export function ShareBuildDialog({
  inputs,
  result,
  defaultAuthor = "",
  defaultTitle = "",
  currentCloudId,
  onCloudSaved,
  onClose,
}: Props) {
  const { t, locale } = useI18n()
  const titleId = useId()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [activeTab, setActiveTab] = useState<TabKey>("link")
  const [author, setAuthor] = useState(() => {
    return (
      defaultAuthor ||
      localStorage.getItem("wwm.share.author") ||
      t("share.defaultPlayerName", "Игрок")
    )
  })
  const [title, setTitle] = useState(defaultTitle || "")
  const [encodedData, setEncodedData] = useState<string>("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Cloud Short Link states
  const [cloudShortId, setCloudShortId] = useState<string | null>(currentCloudId || null)
  const [isSavingCloud, setIsSavingCloud] = useState(false)
  const [cloudSaveMessage, setCloudSaveMessage] = useState<string | null>(null)
  const [cloudError, setCloudError] = useState<string | null>(null)
  const [copiedCloudLink, setCopiedCloudLink] = useState(false)

  // Persist author name
  useEffect(() => {
    if (author.trim()) {
      localStorage.setItem("wwm.share.author", author.trim())
    }
  }, [author])

  // Generate encoded payload
  useEffect(() => {
    let cancelled = false
    setIsGenerating(true)

    const timer = setTimeout(() => {
      encodeSharedBuild({
        v: 2,
        author: author.trim(),
        title: title.trim(),
        inputs,
      })
        .then((data) => {
          if (!cancelled) {
            setEncodedData(data)
            setIsGenerating(false)
          }
        })
        .catch((err) => {
          console.error("Failed to generate build link:", err)
          if (!cancelled) setIsGenerating(false)
        })
    }, 100)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [inputs, author, title])

  // Build URL string
  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""
  const shareUrl = `${currentOrigin}#/build?d=${encodedData}`

  // Render canvas card
  useEffect(() => {
    if (activeTab !== "card" || !canvasRef.current) return

    const classDef = classDefinition(inputs.classId)
    const classDisplayName = classDef
      ? t(classKey(classDef.id), classDef.displayName)
      : inputs.classId
    const lvl = gearLevelForBreakthrough(inputs.breakthrough)
    const breakthroughTemplate = t("share.breakthroughText", "Прорыв {count} ({level} ур.)")
    const breakthroughText = breakthroughTemplate
      .replace("{count}", String(inputs.breakthrough))
      .replace("{level}", String(lvl))

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

    const activeSets = resolveActiveSets(inputs)
    const armorDef = activeSets.fourPiece ? SET_BY_ID[activeSets.fourPiece] : null
    const armorSetName = armorDef ? `${t(setKey(armorDef.id), armorDef.name)} (4/4)` : null

    const activeBow = activeSets.bow
    const bowDef = activeBow ? BOW_SET_DEFS[activeBow.set] : null
    const bowSetName = activeBow ? t(BOW_SET_NAME_KEYS[activeBow.set]) : null
    const bowSetBonus =
      bowDef && activeBow
        ? `${formatSetBonusValue(bowDef.stat, bowDef.value[activeBow.level] ?? 0)} ${t(setBonusStatKey(bowDef.stat))}`
        : null

    const school = getSchool(inputs.classId)
    const primaryAttrKey = school.primaryAttribute.toLowerCase()
    const physPenetration = readPath(withSets, "phys.penetration")

    const equippedPieces = equippedPiecesFor(inputs)
    const enhancedSlots = enhancedSlotsOf(inputs)
    const enhancements = effectiveEnhancementLevels(inputs.enhancements, inputs.breakthrough)
    const baseAttrs = totalPlayerAttributes(
      inputs.breakthrough,
      equippedPieces,
      inputs.disabledTalentNodes,
    )
    const power = inputs.statOverrides?.power ?? baseAttrs.power
    const agility = inputs.statOverrides?.agility ?? baseAttrs.agility
    const momentum = inputs.statOverrides?.momentum ?? baseAttrs.momentum
    const body = inputs.statOverrides?.body ?? baseAttrs.body
    const defense = inputs.statOverrides?.defense ?? baseAttrs.defense

    const baseMaxHp = totalMaxHp(
      inputs.breakthrough,
      equippedPieces,
      inputs.disabledTalentNodes,
      enhancements,
      inputs.unclaimedOddityNodes,
      inputs.arsenalScores,
      enhancedSlots,
    )
    const baseHp = Math.round(inputs.statOverrides?.maxHp ?? baseMaxHp)
    const effHp = Math.round(
      inputs.statOverrides?.maxHp !== undefined
        ? baseHp * (1 + averageEnhancementBonus(enhancements).percent)
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
    const physDefense =
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

    const minPhys = readPath(withSets, "phys.min")
    const maxPhys = readPath(withSets, "phys.max")
    const foodPhysAttack = foodPhysAttackBeforeMultiplier(withSets)
    const minPhysEff = foodPhysAttack.min ? minPhys + foodPhysAttack.min : undefined
    const maxPhysEff = foodPhysAttack.max ? maxPhys + foodPhysAttack.max : undefined

    const baseFormless = totalFormlessAttack(inputs, equippedPieces)
    const formless = {
      min: inputs.statOverrides?.["formlessAttack.min"] ?? baseFormless.min,
      max: inputs.statOverrides?.["formlessAttack.max"] ?? baseFormless.max,
    }

    const ALL_ATTR_KEYS = ["Stonesplit", "Bellstrike", "Silkbind", "Bamboocut"] as const
    const sortedAttrKeys = [
      school.primaryAttribute,
      ...ALL_ATTR_KEYS.filter((k) => k !== school.primaryAttribute),
    ]

    const elements = sortedAttrKeys.map((attrKey) => {
      const lower = attrKey.toLowerCase()
      const isPrimary = lower === primaryAttrKey
      const rawMin = readPath(withSets, `${lower}.min`)
      const rawMax = readPath(withSets, `${lower}.max`)
      const minVal = isPrimary ? Math.max(0, rawMin - formless.min) : rawMin
      const maxVal = isPrimary ? Math.max(0, rawMax - formless.max) : rawMax
      const penetration = isPrimary ? readPath(withSets, `${lower}.penetration`) : undefined
      const name = t(`share.card.attrName.${attrKey}`, attrKey)
      const minLabel = statPathLabel(`${lower}.min`, t)
      const maxLabel = statPathLabel(`${lower}.max`, t)
      const penLabel = statPathLabel(`${lower}.penetration`, t)
      return {
        id: lower,
        name,
        min: minVal,
        max: maxVal,
        isPrimary,
        penetration,
        minLabel,
        maxLabel,
        penLabel,
      }
    })

    const physBoost = readPath(withSets, "physBoost")
    const critDamageBoost = readPath(withSets, "critDamageBoost")
    const affinityDamageBoost = readPath(withSets, "affinityDamageBoost")
    const attributeDamageBoost = readPath(withSets, "attributeDamageBoost")
    const sustainDamageBoost = readPath(withSets, "sustainDamageBoost")
    const allMartialBoost = readPath(withSets, "allMartialBoost")
    const bossBoost = readPath(withSets, "bossBoost")

    // Weapon Boost
    const weaponBoostCandidates = [
      "modaoBoost",
      "hengDaoBoost",
      "swordBoost",
      "spearBoost",
      "fanBoost",
      "umbrellaBoost",
      "dualKnivesBoost",
      "ropeDartBoost",
      "gauntletsBoost",
    ]
    let weaponBoost: { label: string; value: number } | undefined
    for (const path of weaponBoostCandidates) {
      const val = readPath(withSets, path)
      if (val > 0) {
        weaponBoost = {
          label: statPathLabel(path, t),
          value: val,
        }
        break
      }
    }

    let topClassBoost: { label: string; value: number } | undefined
    let maxClassVal = 0
    for (const attId of school.classSpecificAttunements) {
      const val = withSets.classSpecificAttunement[attId] ?? 0
      if (val > maxClassVal) {
        maxClassVal = val
        const option = getAttunement(attId)
        topClassBoost = {
          label: formatClassBoostLabel(
            attId,
            option ? t(attunementKey(option.id), option.label) : attId,
          ),
          value: val,
        }
      }
    }

    const encounter = inputs.combatSettings
    const scriptName =
      encounter?.script && SCRIPT_LABEL_KEYS[encounter.script]
        ? t(SCRIPT_LABEL_KEYS[encounter.script])
        : null

    let divinecraftName: string | null = null
    if (inputs.divinecraft) {
      const dcKey = OPTION_LABEL_KEYS[divinecraftOptionId(inputs.divinecraft)]
      const refKey = inputs.divinecraftRefinement
        ? OPTION_LABEL_KEYS[refinementOptionId(inputs.divinecraftRefinement)]
        : null
      const baseDc = dcKey ? t(dcKey) : ""
      let refText = refKey ? t(refKey) : ""
      if (baseDc && refText.startsWith(`${baseDc}: `)) {
        refText = refText.slice(baseDc.length + 2)
      }
      divinecraftName = refText ? `${baseDc} (${refText})` : baseDc || null
    }

    let foodName: string | null = null
    if (inputs.food) {
      const foodKey = OPTION_LABEL_KEYS[attackFoodOptionId(inputs.food)]
      if (foodKey) {
        foodName = t(foodKey)
      }
    }

    const innerWays: string[] = (inputs.mindMethods ?? [])
      .map((slot) => {
        const id = slotInnerWayId(slot)
        if (!id) return ""
        return t(innerWayKey(id), innerWayName(id))
      })
      .filter(Boolean)

    const resistance = resistanceForInputs(inputs)
    const bossKey = inputs.swordTrialBoss ? `content.boss.${inputs.swordTrialBoss}` : null
    const bossName = bossKey ? t(bossKey, inputs.swordTrialBoss) : inputs.swordTrialBoss || null
    const isTrainingDummy = Boolean(inputs.dummyMode)

    const labels: BuildCardLabels = {
      playerBuildPrefix: t("share.card.playerBuildPrefix", "Player Build:"),
      defaultPlayer: t("share.defaultPlayerName", "Player"),
      heroDpsTitle: t("share.card.heroDpsTitle", "FINAL DAMAGE PER SECOND (DPS)"),
      totalDamage: t("share.card.totalDamage", "Total DMG"),
      duration: t("share.card.duration", "Duration"),
      rotation: t("share.card.rotation", "Rotation"),

      panelStatsTitle: t("common.panelStats", "PANEL STATS"),
      resistanceLabel: t("common.resistance", "Resistance"),
      gearTitle: t("share.card.gearTitle", "GEAR SETS & BUFFS"),

      attributesTitle: t("components.statsOverviewPanel.attributes", "ATTRIBUTES"),
      threeRatesTitle: t("components.statsOverviewPanel.threeRates", "THREE RATES"),
      attackTitle: t("components.statsOverviewPanel.attackPenetration", "ATTACK & PENETRATION"),
      damageBoostsTitle: t("components.statsOverviewPanel.damageBoosts", "DAMAGE BOOSTS"),

      powerLabel: t("content.statLine.power", "Power"),
      agilityLabel: t("content.statLine.agility", "Agility"),
      momentumLabel: t("content.statLine.momentum", "Momentum"),
      constitutionLabel: t("content.statLine.body", "Body"),
      defenseLabel: t("content.statLine.defense", "Defense"),
      maxHpLabel: t("content.statLine.maxHp", "Max HP"),
      physDefenseLabel: t("content.statLine.physDef", "Physical Defense"),

      precisionLabel: statPathLabel("precision", t),
      critLabel: statPathLabel("critRate", t),
      affinityLabel: statPathLabel("affinityRate", t),
      directCritLabel: statPathLabel("directCritRate", t),
      directAffinityLabel: statPathLabel("directAffinityRate", t),
      finalCritLabel: t("components.statsOverviewPanel.finalCrit", "Final Crit"),
      finalAffinityLabel: t("components.statsOverviewPanel.finalAffinity", "Final Affinity"),
      finalCritAffinityLabel: t(
        "components.statsOverviewPanel.finalCritAffinity",
        "Final Crit & Affinity",
      ),
      finalAbrasionLabel: t("components.statsOverviewPanel.finalAbrasion", "Final Abrasion"),
      finalNormalLabel: t("components.statsOverviewPanel.finalNormal", "Final Normal"),

      minPhysAttackLabel: statPathLabel("phys.min", t),
      maxPhysAttackLabel: statPathLabel("phys.max", t),
      physPenLabel: statPathLabel("phys.penetration", t),
      minFormlessLabel: t("content.statLine.minFormless", "Min Formless Attack"),
      maxFormlessLabel: t("content.statLine.maxFormless", "Max Formless Attack"),

      physBoostLabel: statPathLabel("physBoost", t),
      critDmgBoostLabel: statPathLabel("critDamageBoost", t),
      affinityDmgBoostLabel: statPathLabel("affinityDamageBoost", t),
      attributeDmgBoostLabel: statPathLabel("attributeDamageBoost", t),
      sustainDmgBoostLabel: statPathLabel("sustainDamageBoost", t),
      allMartialArtsLabel: statPathLabel("allMartialBoost", t),
      bossBoostLabel: statPathLabel("bossBoost", t),
      classSkillBoostLabel: t("share.card.classSkillBoostLabel", "Class Skill Boost"),

      armorSetLabel: t("share.card.armorSetLabel", "Armor Set (4/4):"),
      bowSetLabel: t("share.card.bowSetLabel", "Bow Set (2/2):"),
      scriptLabel: t("share.card.scriptLabel", "Crafting Script:"),
      divinecraftLabel: t("share.card.divinecraftLabel", "Divinecraft / Oil:"),
      foodLabel: t("share.card.foodLabel", "Combat Food:"),
      noScript: t("share.card.noScript", "No Script"),
      innerWaysLabel: t("share.card.innerWaysLabel", "Inner Ways (4/4):"),
      notEquipped: t("share.card.notEquipped", "Not equipped"),

      generated: t("share.card.generated", "Generated:"),
      locale,
    }

    drawBuildCard(
      canvasRef.current,
      {
        author,
        title,
        classDisplayName,
        breakthroughText,
        dps: result.dps,
        totalDamage: result.totalDamage,
        rotationDuration: result.rotationDuration,
        rotationName: activeRotationName(inputs) || "",

        power,
        agility,
        momentum,
        body,
        defense,
        physDefense,
        baseHp,
        effHp,

        precisionRate: withSets.precision,
        effPrecisionRate: eff.precision,
        critRate: withSets.critRate,
        effCritRate: eff.critRate,
        affinityRate: withSets.affinityRate,
        effAffinityRate: eff.affinityRate,
        directCritRate: withSets.directCritRate,
        directAffinityRate: withSets.directAffinityRate,
        finalCrit: finalRates.critRate,
        finalAffinity: finalRates.affinityRate,
        finalCritAffinity: finalRates.critRate + finalRates.affinityRate,
        finalAbrasion: finalRates.abrasionRate,
        finalNormal: finalRates.normalRate,

        minPhys,
        maxPhys,
        minPhysEff,
        maxPhysEff,
        physPenetration,

        elements,
        formlessMin: formless.min,
        formlessMax: formless.max,

        physBoost,
        critDamageBoost,
        affinityDamageBoost,
        attributeDamageBoost,
        sustainDamageBoost,
        allMartialBoost,
        bossBoost,
        weaponBoost,
        topClassBoost,

        armorSetName,
        bowSetName,
        bowSetBonus,
        scriptName,
        divinecraftName,
        foodName,
        innerWays,
        bossName,
        resistance,
        isTrainingDummy,
      },
      labels,
    )
  }, [activeTab, inputs, result, author, title, t, locale])

  async function handleSaveToCloud() {
    if (!encodedData) return
    setIsSavingCloud(true)
    setCloudError(null)
    setCloudSaveMessage(null)

    try {
      if (cloudShortId) {
        await updateBuildInCloud({
          shortId: cloudShortId,
          data: encodedData,
          title: title.trim() || undefined,
          author: author.trim() || undefined,
          classId: inputs.classId,
          dps: result.dps,
        })
        const shortUrl = `${currentOrigin}#/b/${cloudShortId}`
        await navigator.clipboard.writeText(shortUrl)
        setCopiedCloudLink(true)
        setCloudSaveMessage(
          t("share.cloud.updatedSuccess", "✓ Сборка обновлена в облаке и ссылка скопирована!"),
        )
        setTimeout(() => setCopiedCloudLink(false), 2500)
      } else {
        const res = await saveBuildToCloud({
          data: encodedData,
          title: title.trim() || undefined,
          author: author.trim() || undefined,
          classId: inputs.classId,
          dps: result.dps,
        })
        setCloudShortId(res.shortId)
        onCloudSaved?.(res.shortId)
        const shortUrl = `${currentOrigin}#/b/${res.shortId}`
        await navigator.clipboard.writeText(shortUrl)
        setCopiedCloudLink(true)
        setCloudSaveMessage(
          t(
            "share.cloud.savedSuccess",
            "✓ Сборка сохранена в облаке и короткая ссылка скопирована!",
          ),
        )
        setTimeout(() => setCopiedCloudLink(false), 2500)
      }
    } catch (err) {
      setCloudError(err instanceof Error ? err.message : "Ошибка сохранения в облако")
    } finally {
      setIsSavingCloud(false)
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    })
  }

  function handleCopyImage() {
    if (!canvasRef.current) return
    canvasRef.current.toBlob((blob) => {
      if (!blob) return
      try {
        navigator.clipboard
          .write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ])
          .then(() => {
            setCopiedImage(true)
            setTimeout(() => setCopiedImage(false), 2500)
          })
          .catch(() => {
            // Fallback: download
            handleDownloadImage()
          })
      } catch {
        handleDownloadImage()
      }
    }, "image/png")
  }

  function handleDownloadImage() {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL("image/png")
    const anchor = document.createElement("a")
    const safeAuthor = (author.trim() || t("share.defaultPlayerName", "Игрок")).replace(
      /[^\wа-яА-Я\-.]+/g,
      "_",
    )
    anchor.href = url
    const filePrefix = t("share.buildFilePrefix", "Сборка")
    anchor.download = `${filePrefix}_${safeAuthor}.png`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose} surfaceClassName={styles.surface}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.kicker}>{t("share.kicker", "Экспорт и карточка билда")}</span>
          <h2 id={titleId} className={styles.title}>
            {t("share.title", "Поделиться сборкой")}
          </h2>
          <p className={styles.subtitle}>
            {t(
              "share.subtitle",
              "Отправьте ссылку друзьям или скопируйте красивую карточку персонажа для Discord и соцсетей.",
            )}
          </p>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={t("common.close")}
        >
          ✕
        </button>
      </div>

      <div className={styles.fieldsGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("share.playerLabel", "Имя игрока / Никнейм:")}
          </label>
          <input
            type="text"
            className={styles.input}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t("share.playerPlaceholder", "Например: Dimka")}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("share.buildTitleLabel", "Название сборки:")}
          </label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("share.buildTitlePlaceholder", "Например: Мо + Хэн 85к DPS")}
          />
        </div>
      </div>

      <SubTabs
        tabs={[
          { key: "link", label: `🔗 ${t("share.tabLink", "Ссылка на сборку")}` },
          { key: "card", label: `🖼 ${t("share.tabCard", "Карточка персонажа (PNG)")}` },
        ]}
        active={activeTab}
        onSelect={setActiveTab}
      />

      {activeTab === "link" && (
        <div className={styles.linkSection}>
          {/* Cloud Short Link Box */}
          <div className={styles.cloudSection}>
            <div className={styles.cloudHeader}>
              <span className={styles.cloudTitle}>
                ☁️ {t("share.cloud.shortLinkTitle", "Короткая облачная ссылка")}
              </span>
              {cloudShortId && <span className={styles.cloudBadge}>ID: {cloudShortId}</span>}
            </div>
            <div className={styles.linkBox}>
              <input
                type="text"
                readOnly
                className={styles.linkInput}
                value={
                  cloudShortId
                    ? `${currentOrigin}#/b/${cloudShortId}`
                    : isSavingCloud
                      ? t("share.cloud.saving", "Сохранение в облако...")
                      : t(
                          "share.cloud.placeholder",
                          "Нажмите кнопку справа, чтобы сгенерировать короткую ссылку",
                        )
                }
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className="btn primary"
                onClick={handleSaveToCloud}
                disabled={isSavingCloud || isGenerating || !encodedData}
              >
                {copiedCloudLink
                  ? t("share.copiedSuccess", "✓ Скопировано!")
                  : isSavingCloud
                    ? "..."
                    : cloudShortId
                      ? t("share.cloud.updateShortLink", "Обновить и скопировать")
                      : t("share.cloud.createShortLink", "Получить короткую ссылку")}
              </button>
            </div>
            {cloudSaveMessage && <span className={styles.copySuccess}>{cloudSaveMessage}</span>}
            {cloudError && <span className={styles.cloudError}>⚠ {cloudError}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              {t("share.directLinkLabel", "Полная ссылка (без сервера):")}
            </label>
            <div className={styles.linkBox}>
              <input
                type="text"
                readOnly
                className={styles.linkInput}
                value={isGenerating ? t("share.generatingLink", "Генерация ссылки...") : shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className="btn primary"
                onClick={handleCopyLink}
                disabled={isGenerating || !encodedData}
              >
                {copiedLink
                  ? t("share.copiedSuccess", "✓ Скопировано!")
                  : t("share.copyLinkButton", "Копировать ссылку")}
              </button>
            </div>
            {copiedLink && (
              <span className={styles.copySuccess}>
                {t(
                  "share.copyLinkSuccessMsg",
                  "✓ Ссылка скопирована в буфер обмена! При переходе откроется этот билд.",
                )}
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === "card" && (
        <div className={styles.previewContainer}>
          <canvas ref={canvasRef} width={1200} height={675} className={styles.cardCanvas} />
          <div className={styles.cardActions}>
            <button type="button" className="btn primary" onClick={handleCopyImage}>
              {copiedImage
                ? t("share.copiedImageSuccess", "✓ Картинка скопирована!")
                : `📋 ${t("share.copyImageButton", "Скопировать картинку")}`}
            </button>
            <button type="button" className="btn" onClick={handleDownloadImage}>
              💾 {t("share.downloadImageButton", "Скачать PNG")}
            </button>
          </div>
          {copiedImage && (
            <span className={styles.copySuccess}>
              {t(
                "share.copyImageSuccessMsg",
                "✓ Изображение скопировано в буфер обмена! Нажмите Ctrl+V в чате Discord или Telegram.",
              )}
            </span>
          )}
        </div>
      )}
    </Dialog>
  )
}
