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
import { applySetBonuses, resolveActiveSets } from "../../../../engine/setBonuses"
import { effectiveRates, getSchool } from "../../../../engine/panel"
import { finalHitOutcomeRates } from "../../../components/stats-overview-panel/finalHitOutcomeRates"
import { activeRotationName } from "../../rotation/rotationOptions"
import { SET_BY_ID } from "../../../../definitions/sets/registry"
import { BOW_SET_NAME_KEYS } from "../../gear/shared/buildSetKeys"
import { BOW_SET_DEFS } from "../../../../data/sets/bowSets"
import { formatSetBonusValue, setBonusStatKey } from "../../gear/shared/setBonusText"
import { gearLevelForBreakthrough } from "../../../../definitions/baseStats/breakthroughs"
import {
  totalFormlessAttack,
  totalPlayerAttributes,
} from "../../../../definitions/baseStats"
import { getAttunement } from "../../../../engine/attunements"
import { SCRIPT_LABEL_KEYS } from "../../../../data/skills/buffs/scriptOptions"
import { OPTION_LABEL_KEYS } from "../../overview/encounter-settings-dialog/encounterOptionText"
import {
  attackFoodOptionId,
  divinecraftOptionId,
  refinementOptionId,
} from "../../../../engine/encounterOptions"
import { innerWayName, slotInnerWayId } from "../../../../definitions/innerWays/registry"
import { readPath } from "../../../utils/statFormatting"
import styles from "./ShareBuildDialog.module.scss"

interface Props {
  inputs: Inputs
  result: Result
  defaultAuthor?: string
  defaultTitle?: string
  onClose: () => void
}

type TabKey = "link" | "card"

export function ShareBuildDialog({
  inputs,
  result,
  defaultAuthor = "",
  defaultTitle = "",
  onClose,
}: Props) {
  const { t, locale } = useI18n()
  const titleId = useId()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [activeTab, setActiveTab] = useState<TabKey>("link")
  const [author, setAuthor] = useState(() => {
    return defaultAuthor || localStorage.getItem("wwm.share.author") || t("share.defaultPlayerName", "Игрок")
  })
  const [title, setTitle] = useState(defaultTitle || "")
  const [encodedData, setEncodedData] = useState<string>("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

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
    const classDisplayName = classDef ? t(classKey(classDef.id), classDef.displayName) : inputs.classId
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
    const baseAttrs = totalPlayerAttributes(
      inputs.breakthrough,
      equippedPieces,
      inputs.disabledTalentNodes,
    )
    const power = inputs.statOverrides?.power ?? baseAttrs.power
    const agility = inputs.statOverrides?.agility ?? baseAttrs.agility

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
      return {
        id: lower,
        name,
        min: minVal,
        max: maxVal,
        isPrimary,
        penetration,
      }
    })

    const allMartialBoost = readPath(withSets, "allMartialBoost")
    const bossBoost = readPath(withSets, "bossBoost")

    let topClassBoost: { label: string; value: number } | undefined
    let maxClassVal = 0
    for (const attId of school.classSpecificAttunements) {
      const val = withSets.classSpecificAttunement[attId] ?? 0
      if (val > maxClassVal) {
        maxClassVal = val
        const option = getAttunement(attId)
        topClassBoost = {
          label: formatClassBoostLabel(attId, option ? t(attunementKey(option.id), option.label) : attId),
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

    const labels: BuildCardLabels = {
      playerBuildPrefix: t("share.card.playerBuildPrefix", "Сборка игрока:"),
      defaultPlayer: t("share.defaultPlayerName", "Игрок"),
      heroDpsTitle: t("share.card.heroDpsTitle", "ИТОГОВЫЙ УРОН В СЕКУНДУ (DPS)"),
      totalDamage: t("share.card.totalDamage", "Всего урона"),
      duration: t("share.card.duration", "Длительность"),
      rotation: t("share.card.rotation", "Ротация"),

      attackTitle: t("share.card.attackTitle", "АТАКА И СТИХИИ"),
      ratesTitle: t("share.card.ratesTitle", "ПАРАМЕТРЫ И УСИЛЕНИЯ"),
      gearTitle: t("share.card.gearTitle", "КОМПЛЕКТЫ И СТОЛКНОВЕНИЕ"),

      physAttackLabel: t("share.card.physAttackLabel", "Физ. атака (Мин – Макс)"),
      physPenLabel: t("share.card.physPenLabel", "Физ. пробитие"),
      attrAttackLabel: t("share.card.attrAttackLabel", "Атака: {attr}"),
      attrPenLabel: t("share.card.attrPenLabel", "Пробитие: {attr}"),
      formlessLabel: t("share.card.formlessLabel", "Бесформенная атака"),
      agilityLabel: t("share.card.agilityLabel", "Ловкость (Agility)"),
      powerLabel: t("share.card.powerLabel", "Сила (Power)"),

      critLabel: t("share.card.critLabel", "Крит. шанс"),
      critCombinedLabel: t("share.card.critCombinedLabel", "Крит. шанс (+ Прямой)"),
      precisionLabel: t("share.card.precisionLabel", "Точность (Precision)"),
      affinityLabel: t("share.card.affinityLabel", "Сокрушение (Affinity)"),
      allMartialArtsLabel: t("share.card.allMartialArtsLabel", "Все боевые искусства"),
      bossBoostLabel: t("share.card.bossBoostLabel", "Урон против боссов"),
      classSkillBoostLabel: t("share.card.classSkillBoostLabel", "Навык класса"),

      armorSetLabel: t("share.card.armorSetLabel", "Комплект брони (4/4):"),
      bowSetLabel: t("share.card.bowSetLabel", "Комплект лука (2/2):"),
      scriptLabel: t("share.card.scriptLabel", "Крафтовый свиток:"),
      divinecraftLabel: t("share.card.divinecraftLabel", "Ремесло / Масло:"),
      foodLabel: t("share.card.foodLabel", "Боевая еда:"),
      noScript: t("share.card.noScript", "Без свитка"),
      innerWaysLabel: t("share.card.innerWaysLabel", "Внутренние пути (4/4):"),
      notEquipped: t("share.card.notEquipped", "Не надет"),

      generated: t("share.card.generated", "Сгенерировано:"),
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

        minPhys: readPath(withSets, "phys.min"),
        maxPhys: readPath(withSets, "phys.max"),
        physPenetration,

        elements,
        formlessMin: formless.min,
        formlessMax: formless.max,

        critRate: finalRates.critRate,
        directCritRate: withSets.directCritRate,
        precisionRate: eff.precision,
        affinityRate: finalRates.affinityRate,
        agility,
        power,

        allMartialBoost,
        bossBoost,
        topClassBoost,

        armorSetName,
        bowSetName,
        bowSetBonus,
        scriptName,
        divinecraftName,
        foodName,
        innerWays,
      },
      labels,
    )
  }, [activeTab, inputs, result, author, title, t, locale])

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    })
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(encodedData).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2500)
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
    const safeAuthor = (author.trim() || t("share.defaultPlayerName", "Игрок")).replace(/[^\wа-яА-Я\-.]+/g, "_")
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
          <label className={styles.fieldLabel}>{t("share.playerLabel", "Имя игрока / Никнейм:")}</label>
          <input
            type="text"
            className={styles.input}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t("share.playerPlaceholder", "Например: Dimka")}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{t("share.buildTitleLabel", "Название сборки:")}</label>
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
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t("share.directLinkLabel", "Прямая ссылка на билд:")}</label>
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
                {copiedLink ? t("share.copiedSuccess", "✓ Скопировано!") : t("share.copyLinkButton", "Копировать ссылку")}
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

          <div className={styles.fieldGroup} style={{ marginTop: 8 }}>
            <label className={styles.fieldLabel}>{t("share.rawCodeLabel", "Текстовый код сборки:")}</label>
            <div className={styles.linkBox}>
              <input
                type="text"
                readOnly
                className={styles.linkInput}
                value={encodedData}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className="btn"
                onClick={handleCopyCode}
                disabled={isGenerating || !encodedData}
              >
                {copiedCode ? t("share.copiedSuccess", "✓ Скопировано!") : t("share.copyCodeButton", "Копировать код")}
              </button>
            </div>
            {copiedCode && (
              <span className={styles.copySuccess}>
                {t("share.copyCodeSuccessMsg", "✓ Код сборки скопирован!")}
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === "card" && (
        <div className={styles.previewContainer}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={675}
            className={styles.cardCanvas}
          />
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
