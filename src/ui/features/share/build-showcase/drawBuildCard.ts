import { formatCompactDamage, formatNumber } from "../../../utils/numberFormatting"
import { fmtPenetration } from "../../../utils/statFormatting"

export interface BuildCardElement {
  id: string
  name: string
  min: number
  max: number
  isPrimary?: boolean
  penetration?: number
  minLabel?: string
  maxLabel?: string
  penLabel?: string
}

export interface BuildCardData {
  author: string
  title: string
  classDisplayName: string
  breakthroughText: string
  dps: number
  totalDamage: number
  rotationDuration: number
  rotationName: string

  // Attributes
  power?: number
  agility?: number
  momentum?: number
  body?: number
  defense?: number
  physDefense?: number
  baseHp?: number
  effHp?: number

  // Three Rates
  precisionRate: number
  effPrecisionRate?: number
  critRate: number
  effCritRate?: number
  affinityRate: number
  effAffinityRate?: number
  directCritRate?: number
  directAffinityRate?: number
  finalCrit?: number
  finalAffinity?: number
  finalCritAffinity?: number
  finalAbrasion?: number
  finalNormal?: number

  // Physical Attack & Penetration
  minPhys: number
  maxPhys: number
  minPhysEff?: number
  maxPhysEff?: number
  physPenetration?: number

  // Elements & Formless
  elements: BuildCardElement[]
  formlessMin?: number
  formlessMax?: number

  // Key Damage Boosts
  physBoost?: number
  critDamageBoost?: number
  affinityDamageBoost?: number
  attributeDamageBoost?: number
  sustainDamageBoost?: number
  allMartialBoost?: number
  bossBoost?: number
  weaponBoost?: { label: string; value: number }
  topClassBoost?: { label: string; value: number }

  // Gear & Encounter
  armorSetName?: string | null
  bowSetName?: string | null
  bowSetBonus?: string | null
  scriptName?: string | null
  divinecraftName?: string | null
  foodName?: string | null
  innerWays?: string[]
  bossName?: string | null
  resistance?: number
  isTrainingDummy?: boolean
}

export interface BuildCardLabels {
  playerBuildPrefix?: string
  defaultPlayer?: string
  heroDpsTitle?: string
  totalDamage?: string
  duration?: string
  rotation?: string

  panelStatsTitle?: string
  resistanceLabel?: string
  gearTitle?: string

  attributesTitle?: string
  threeRatesTitle?: string
  attackTitle?: string
  damageBoostsTitle?: string

  powerLabel?: string
  agilityLabel?: string
  momentumLabel?: string
  constitutionLabel?: string
  defenseLabel?: string
  maxHpLabel?: string
  physDefenseLabel?: string

  precisionLabel?: string
  critLabel?: string
  affinityLabel?: string
  directCritLabel?: string
  directAffinityLabel?: string
  finalCritLabel?: string
  finalAffinityLabel?: string
  finalCritAffinityLabel?: string
  finalAbrasionLabel?: string
  finalNormalLabel?: string

  physAttackLabel?: string
  minPhysAttackLabel?: string
  maxPhysAttackLabel?: string
  physPenLabel?: string
  attrPenLabel?: string
  minFormlessLabel?: string
  maxFormlessLabel?: string

  physBoostLabel?: string
  critDmgBoostLabel?: string
  affinityDmgBoostLabel?: string
  attributeDmgBoostLabel?: string
  sustainDmgBoostLabel?: string
  allMartialArtsLabel?: string
  bossBoostLabel?: string
  classSkillBoostLabel?: string

  armorSetLabel?: string
  bowSetLabel?: string
  scriptLabel?: string
  divinecraftLabel?: string
  foodLabel?: string
  noScript?: string
  innerWaysLabel?: string
  encounterTitle?: string
  bossLabel?: string
  dummyLabel?: string
  notEquipped?: string

  generated?: string
  locale?: string
}

export function formatClassBoostLabel(attunementId?: string, label?: string): string {
  const id = attunementId || ""
  if (id === "phalanxChargeDamage" || label?.includes("Phalanxbane Blade - Charged Skill")) {
    return "Mo - Charge Boost"
  }
  if (id === "phalanxbaneQ" || label?.includes("Phalanxbane Blade - Martial Art")) {
    return "Mo - Skill Boost"
  }
  if (id === "snowpartingCharged" || label?.includes("Snowparting Blade - Charged Skill")) {
    return "Heng - Charge Boost"
  }
  if (id === "snowpartingQ" || label?.includes("Snowparting Blade - Martial Art")) {
    return "Heng - Skill Boost"
  }
  if (id === "snowpartingVariedCombo" || label?.includes("Snowparting Blade - Light/Heavy")) {
    return "Heng - Combo Boost"
  }
  if (id === "spearCharged" || label?.includes("Spear - Charged")) {
    return "Spear - Charge Boost"
  }
  if (id === "spearQ" || label?.includes("Spear - Q")) {
    return "Spear - Skill Boost"
  }
  if (id === "swordSpecial" || label?.includes("Sword - Special")) {
    return "Sword - Special Boost"
  }
  if (id === "swordQ" || label?.includes("Sword - Q")) {
    return "Sword - Skill Boost"
  }
  if (id === "bleedingDamage" || label?.includes("Bleed")) {
    return "Bleed DMG Boost"
  }
  return label
    ? label
        .replace(" - Martial Art Skill DMG Boost", " - Skill Boost")
        .replace(" - Charged Skill DMG Boost", " - Charge Boost")
    : "Class Boost"
}

export function fmtRate(v: number): string {
  if (!Number.isFinite(v)) return "0%"
  const pct = v * 100
  const fixed = pct.toFixed(2)
  if (fixed.endsWith(".00")) return `${Math.round(pct)}%`
  if (fixed.endsWith("0")) return `${pct.toFixed(1)}%`
  return `${fixed}%`
}

export function fmtBoost(v: number): string {
  if (!Number.isFinite(v) || v === 0) return "+0%"
  return `+${fmtRate(v)}`
}

export function fmtAtk(v: number): string {
  if (!Number.isFinite(v)) return "0.00"
  return formatNumber(v, 2)
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let truncated = text
  while (truncated.length > 2 && ctx.measureText(truncated + "…").width > maxWidth) {
    truncated = truncated.slice(0, -1)
  }
  return truncated + "…"
}

export function drawBuildCard(
  canvas: HTMLCanvasElement,
  data: BuildCardData,
  labels?: BuildCardLabels,
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  // 1. Deep charcoal-grey background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  bgGrad.addColorStop(0, "#131313")
  bgGrad.addColorStop(0.4, "#171717")
  bgGrad.addColorStop(1, "#1c1c1c")
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // Subtle radial gold glow behind hero DPS
  const radialGlow = ctx.createRadialGradient(200, 70, 10, 200, 70, 360)
  radialGlow.addColorStop(0, "rgba(192, 160, 96, 0.08)")
  radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)")
  ctx.fillStyle = radialGlow
  ctx.fillRect(0, 0, width, height)

  // 2. Outer decorative charcoal & gold borders
  ctx.strokeStyle = "#383838"
  ctx.lineWidth = 1.5
  ctx.strokeRect(12, 12, width - 24, height - 24)

  ctx.strokeStyle = "rgba(192, 160, 96, 0.45)"
  ctx.lineWidth = 1
  ctx.strokeRect(16, 16, width - 32, height - 32)

  // Ornamental corner brackets in warm gold
  const cornerSize = 22
  ctx.fillStyle = "#c0a060"
  // Top-left
  ctx.fillRect(15, 15, cornerSize, 2)
  ctx.fillRect(15, 15, 2, cornerSize)
  // Top-right
  ctx.fillRect(width - 15 - cornerSize, 15, cornerSize, 2)
  ctx.fillRect(width - 17, 15, 2, cornerSize)
  // Bottom-left
  ctx.fillRect(15, height - 17, cornerSize, 2)
  ctx.fillRect(15, height - 15 - cornerSize, 2, cornerSize)
  // Bottom-right
  ctx.fillRect(width - 15 - cornerSize, height - 17, cornerSize, 2)
  ctx.fillRect(width - 17, height - 15 - cornerSize, 2, cornerSize)

  // 3. Compact Streamlined Header Box (Unified Showcase Header)
  const headerX = 24
  const headerY = 22
  const headerW = width - 48
  const headerH = 76

  ctx.fillStyle = "rgba(22, 22, 22, 0.95)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(headerX, headerY, headerW, headerH, 6)
  } else {
    ctx.rect(headerX, headerY, headerW, headerH)
  }
  ctx.fill()

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.lineWidth = 1
  ctx.stroke()

  // Top antique gold stripe
  ctx.fillStyle = "#c0a060"
  ctx.fillRect(headerX, headerY, headerW, 2)

  // DPS Value with gold gradient
  const dpsText = formatNumber(data.dps, 0)
  ctx.font = "800 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.textAlign = "left"
  const dpsGrad = ctx.createLinearGradient(headerX + 18, headerY + 16, headerX + 18, headerY + 62)
  dpsGrad.addColorStop(0, "#fff5cc")
  dpsGrad.addColorStop(0.5, "#e8c772")
  dpsGrad.addColorStop(1, "#c0a060")
  ctx.fillStyle = dpsGrad
  ctx.fillText(dpsText, headerX + 18, headerY + 52)

  const dpsW = ctx.measureText(dpsText).width
  const badgeX = headerX + 18 + dpsW + 10
  const badgeY = headerY + 30

  // Gold badge "DPS"
  ctx.fillStyle = "rgba(192, 160, 96, 0.15)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(badgeX, badgeY, 36, 20, 3)
  } else {
    ctx.rect(badgeX, badgeY, 36, 20)
  }
  ctx.fill()
  ctx.strokeStyle = "#c0a060"
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.font = "700 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#d8b070"
  ctx.fillText("DPS", badgeX + 7, badgeY + 14)

  // Vertical separator between DPS and Player info
  const sepX = badgeX + 46
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
  ctx.beginPath()
  ctx.moveTo(sepX, headerY + 14)
  ctx.lineTo(sepX, headerY + headerH - 14)
  ctx.stroke()

  // Player Name and Class / Breakthrough
  const authorText = data.author.trim() || labels?.defaultPlayer || "Игрок"
  const isTitleDifferent =
    data.title.trim() &&
    data.title.trim().toLowerCase() !== (data.rotationName || "").trim().toLowerCase()
  const titleText = isTitleDifferent ? ` · «${data.title.trim()}»` : ""

  ctx.font = "700 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#f5f0e6"
  const maxAuthorW = headerW - (sepX - headerX) - 450
  ctx.fillText(truncateText(ctx, `${authorText}${titleText}`, maxAuthorW), sepX + 16, headerY + 34)

  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#c0a060"
  ctx.fillText(`${data.classDisplayName} · ${data.breakthroughText}`, sepX + 16, headerY + 56)

  // Right sub-metric chips (Total DMG, Duration, Rotation)
  const chipW = 135
  const chipH = 50
  const chipY = headerY + 13

  const chipData = [
    {
      label: labels?.totalDamage || "ВСЕГО УРОНА",
      val: formatCompactDamage(data.totalDamage),
      color: "#f0f0f0",
    },
    {
      label: labels?.duration || "ДЛИТЕЛЬНОСТЬ",
      val: `${formatNumber(data.rotationDuration, 1)}s`,
      color: "#f0f0f0",
    },
    {
      label: labels?.rotation || "РОТАЦИЯ",
      val: truncateText(ctx, data.rotationName || "—", chipW - 16),
      color: "#d8b070",
    },
  ]

  chipData.forEach((chip, idx) => {
    const chipX = headerW + 24 - (3 - idx) * (chipW + 8) - 6
    ctx.fillStyle = "#1c1c1c"
    ctx.beginPath()
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(chipX, chipY, chipW, chipH, 4)
    } else {
      ctx.rect(chipX, chipY, chipW, chipH)
    }
    ctx.fill()
    ctx.strokeStyle = "#383838"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = "600 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillStyle = "#8a8a8a"
    ctx.fillText(chip.label, chipX + 10, chipY + 18)

    ctx.font = "700 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillStyle = chip.color
    ctx.fillText(chip.val, chipX + 10, chipY + 39)
  })

  // 4. Two Main Panels: Left (PANEL STATS) & Right (GEAR & ENCOUNTER)
  const panelY = 106
  const panelH = 538

  // Left Panel (PANEL STATS)
  const panel1X = 24
  const panel1W = 736
  drawPanelShell(
    ctx,
    panel1X,
    panelY,
    panel1W,
    panelH,
    labels?.panelStatsTitle || "PANEL STATS",
    `${labels?.resistanceLabel || "Resistance"}:`,
    `${data.resistance ?? 85}%`,
  )

  // Sub-columns for Panel Stats
  const subCol1X = panel1X + 16
  const subColW = (panel1W - 32 - 16) / 2 // 344px
  const subCol2X = subCol1X + subColW + 16

  // Section 1: ATTRIBUTES
  let currentY = panelY + 48
  drawSectionHeading(ctx, subCol1X, currentY, panel1W - 32, labels?.attributesTitle || "ATTRIBUTES")

  // Row 1: Power | Agility
  currentY += 21
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.powerLabel || "Power",
    fmtAtk(data.power ?? 0),
    {
      valColor: "#f0f0f0",
    },
  )
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.agilityLabel || "Agility",
    fmtAtk(data.agility ?? 0),
    {
      valColor: "#e8c772",
    },
  )

  // Row 2: Momentum | Constitution
  currentY += 20
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.momentumLabel || "Momentum",
    fmtAtk(data.momentum ?? 0),
    {
      valColor: "#f0f0f0",
    },
  )
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.constitutionLabel || "Body",
    fmtAtk(data.body ?? 0),
    {
      valColor: "#f0f0f0",
    },
  )

  // Section 2: THREE RATES
  currentY += 25
  drawSectionHeading(
    ctx,
    subCol1X,
    currentY,
    panel1W - 32,
    labels?.threeRatesTitle || "THREE RATES",
  )

  // Row 1: Precision Rate | Critical Rate
  currentY += 21
  const precText =
    data.effPrecisionRate !== undefined &&
    Math.abs(data.precisionRate - data.effPrecisionRate) > 0.0001
      ? `${fmtRate(data.precisionRate)} → ${fmtRate(data.effPrecisionRate)}`
      : fmtRate(data.precisionRate)
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.precisionLabel || "Precision Rate",
    precText,
    {
      valColor: "#f0f0f0",
    },
  )

  const critText =
    data.effCritRate !== undefined && Math.abs(data.critRate - data.effCritRate) > 0.0001
      ? `${fmtRate(data.critRate)} → ${fmtRate(data.effCritRate)}`
      : fmtRate(data.critRate)
  drawStatPair(ctx, subCol2X, currentY, subColW, labels?.critLabel || "Critical Rate", critText, {
    valColor: "#f0f0f0",
  })

  // Row 2: Affinity Rate | Direct Crit
  currentY += 20
  const affText =
    data.effAffinityRate !== undefined &&
    Math.abs(data.affinityRate - data.effAffinityRate) > 0.0001
      ? `${fmtRate(data.affinityRate)} → ${fmtRate(data.effAffinityRate)}`
      : fmtRate(data.affinityRate)
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.affinityLabel || "Affinity Rate",
    affText,
    {
      valColor: "#f0f0f0",
    },
  )

  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.directCritLabel || "Direct Crit",
    fmtRate(data.directCritRate ?? 0),
    { valColor: (data.directCritRate ?? 0) > 0 ? "#e8c772" : "#666666" },
  )

  // Row 3: Direct Affinity | Final Crit
  currentY += 20
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.directAffinityLabel || "Direct Affinity",
    fmtRate(data.directAffinityRate ?? 0),
    { valColor: (data.directAffinityRate ?? 0) > 0 ? "#e8c772" : "#666666" },
  )
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.finalCritLabel || "Final Crit",
    fmtRate(data.finalCrit ?? data.critRate),
    { valColor: "#e8c772" },
  )

  // Row 4: Final Affinity | Final Crit & Affinity
  currentY += 20
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.finalAffinityLabel || "Final Affinity",
    fmtRate(data.finalAffinity ?? data.affinityRate),
    { valColor: "#f0f0f0" },
  )
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.finalCritAffinityLabel || "Final Crit & Affinity",
    fmtRate(data.finalCritAffinity ?? data.critRate + data.affinityRate),
    { valColor: "#e8c772" },
  )

  // Row 5: Final Abrasion | Final Normal
  currentY += 20
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.finalAbrasionLabel || "Final Abrasion",
    fmtRate(data.finalAbrasion ?? 0),
    { valColor: "#8a8a8a" },
  )
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.finalNormalLabel || "Final Normal",
    fmtRate(data.finalNormal ?? 0),
    { valColor: "#8a8a8a" },
  )

  // Section 3: ATTACK & PENETRATION
  currentY += 25
  drawSectionHeading(
    ctx,
    subCol1X,
    currentY,
    panel1W - 32,
    labels?.attackTitle || "ATTACK & PENETRATION",
  )

  // Row 1: Min Physical Attack | Max Physical Attack
  currentY += 21
  const minPhysText =
    data.minPhysEff && Math.abs(data.minPhys - data.minPhysEff) > 0.1
      ? `${fmtAtk(data.minPhys)} → ${fmtAtk(data.minPhysEff)}`
      : fmtAtk(data.minPhys)
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.minPhysAttackLabel || "Min Physical Attack",
    minPhysText,
    {
      valColor: "#f0f0f0",
    },
  )

  const maxPhysText =
    data.maxPhysEff && Math.abs(data.maxPhys - data.maxPhysEff) > 0.1
      ? `${fmtAtk(data.maxPhys)} → ${fmtAtk(data.maxPhysEff)}`
      : fmtAtk(data.maxPhys)
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.maxPhysAttackLabel || "Max Physical Attack",
    maxPhysText,
    {
      valColor: "#f0f0f0",
    },
  )

  // Primary element & Foreign elements
  const primaryElem = data.elements.find((e) => e.isPrimary) || data.elements[0]
  const foreignElems = data.elements.filter((e) => !e.isPrimary)

  // Row 2: Min Primary Attack | Max Primary Attack
  currentY += 20
  const primaryMinLabel = primaryElem?.minLabel || `Min ${primaryElem?.name || "Attr"} Attack`
  const primaryMaxLabel = primaryElem?.maxLabel || `Max ${primaryElem?.name || "Attr"} Attack`
  drawStatPair(ctx, subCol1X, currentY, subColW, primaryMinLabel, fmtAtk(primaryElem?.min ?? 0), {
    valColor: "#e8c772",
  })
  drawStatPair(ctx, subCol2X, currentY, subColW, primaryMaxLabel, fmtAtk(primaryElem?.max ?? 0), {
    valColor: "#e8c772",
  })

  // Rows 3, 4, 5: Foreign Elements
  foreignElems.forEach((elem) => {
    currentY += 20
    const hasMin = elem.min > 0
    const hasMax = elem.max > 0
    const minLbl = elem.minLabel || `Min ${elem.name} Attack`
    const maxLbl = elem.maxLabel || `Max ${elem.name} Attack`
    drawStatPair(ctx, subCol1X, currentY, subColW, minLbl, fmtAtk(elem.min), {
      valColor: hasMin ? "#f0f0f0" : "#555555",
      dimmed: !hasMin,
    })
    drawStatPair(ctx, subCol2X, currentY, subColW, maxLbl, fmtAtk(elem.max), {
      valColor: hasMax ? "#f0f0f0" : "#555555",
      dimmed: !hasMax,
    })
  })

  // Row 6: Min Formless Attack | Max Formless Attack
  currentY += 20
  const formlessMin = data.formlessMin ?? 0
  const formlessMax = data.formlessMax ?? 0
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.minFormlessLabel || "Min Formless Attack",
    fmtAtk(formlessMin),
    {
      valColor: formlessMin > 0 ? "#f0f0f0" : "#555555",
      dimmed: formlessMin <= 0,
    },
  )
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.maxFormlessLabel || "Max Formless Attack",
    fmtAtk(formlessMax),
    {
      valColor: formlessMax > 0 ? "#f0f0f0" : "#555555",
      dimmed: formlessMax <= 0,
    },
  )

  // Row 7: Physical Penetration | Primary Penetration
  currentY += 20
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.physPenLabel || "Physical Penetration",
    fmtPenetration(data.physPenetration ?? 0),
    { valColor: "#f0f0f0" },
  )
  const penLbl = primaryElem?.penLabel || `${primaryElem?.name || "Attr"} Penetration`
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    penLbl,
    fmtPenetration(primaryElem?.penetration ?? 0),
    {
      valColor: "#e8c772",
    },
  )

  // Section 4: DAMAGE BOOSTS & CLASS BUFFS
  currentY += 25
  drawSectionHeading(
    ctx,
    subCol1X,
    currentY,
    panel1W - 32,
    labels?.damageBoostsTitle || "DAMAGE BOOSTS & CLASS BUFFS",
  )

  // Row 1: All Martial Arts Boost | Crit Damage Boost
  currentY += 21
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.allMartialArtsLabel || "All Martial Arts Boost",
    fmtBoost(data.allMartialBoost ?? 0),
    { valColor: "#e8c772" },
  )
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.critDmgBoostLabel || "Crit Damage Boost",
    fmtBoost(data.critDamageBoost ?? 0),
    { valColor: "#e8c772" },
  )

  // Row 2: Attribute Damage Boost | Combat Boost Against Boss Units
  currentY += 20
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.attributeDmgBoostLabel || "Attribute Damage Boost",
    fmtBoost(data.attributeDamageBoost ?? 0),
    { valColor: "#e8c772" },
  )
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.bossBoostLabel || "Combat Boost Against Boss Units",
    fmtBoost(data.bossBoost ?? 0),
    { valColor: "#e8c772" },
  )

  // Row 3: Affinity Damage Boost | Weapon Boost
  currentY += 20
  drawStatPair(
    ctx,
    subCol1X,
    currentY,
    subColW,
    labels?.affinityDmgBoostLabel || "Affinity Damage Boost",
    fmtBoost(data.affinityDamageBoost ?? 0),
    { valColor: (data.affinityDamageBoost ?? 0) > 0 ? "#e8c772" : "#666666" },
  )
  const weaponLabel =
    data.weaponBoost?.label || labels?.sustainDmgBoostLabel || "Sustain Damage Boost"
  const weaponVal = data.weaponBoost
    ? fmtBoost(data.weaponBoost.value)
    : fmtBoost(data.sustainDamageBoost ?? 0)
  drawStatPair(ctx, subCol2X, currentY, subColW, weaponLabel, weaponVal, {
    valColor: "#e8c772",
  })

  // Row 4: Top Class Boost | Physical Damage Boost
  currentY += 20
  const classLabel =
    data.topClassBoost?.label || labels?.classSkillBoostLabel || "Class Skill Boost"
  const classVal = data.topClassBoost ? fmtBoost(data.topClassBoost.value) : "+0%"
  drawStatPair(ctx, subCol1X, currentY, subColW, classLabel, classVal, {
    valColor: "#e8c772",
  })
  drawStatPair(
    ctx,
    subCol2X,
    currentY,
    subColW,
    labels?.physBoostLabel || "Physical Damage Boost",
    fmtBoost(data.physBoost ?? 0),
    { valColor: (data.physBoost ?? 0) > 0 ? "#e8c772" : "#666666" },
  )

  // ==========================================
  // Right Panel: GEAR SETS & BUFFS
  // ==========================================
  const panel2X = 776
  const panel2W = 400
  drawPanelShell(ctx, panel2X, panelY, panel2W, panelH, labels?.gearTitle || "GEAR SETS & BUFFS")

  let setY = panelY + 54

  // Armor Set
  ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.armorSetLabel || "Armor Set (4/4):", panel2X + 16, setY)

  setY += 12
  drawGoldBadge(
    ctx,
    panel2X + 16,
    setY,
    data.armorSetName || labels?.notEquipped || "Not equipped",
    panel2W - 32,
    32,
  )

  setY += 52
  // Bow Set
  ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.bowSetLabel || "Bow Set (2/2):", panel2X + 16, setY)

  setY += 12
  const bowText = data.bowSetName
    ? `${data.bowSetName}${data.bowSetBonus ? ` (${data.bowSetBonus})` : ""}`
    : labels?.notEquipped || "Not equipped"
  drawGoldBadge(ctx, panel2X + 16, setY, bowText, panel2W - 32, 32)

  setY += 52
  // Separator
  drawSubtleDivider(ctx, panel2X + 16, setY, panel2W - 32)

  // Crafting Script
  setY += 22
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.scriptLabel || "Crafting Script:", panel2X + 16, setY)

  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = data.scriptName ? "#f0f0f0" : "#666666"
  ctx.textAlign = "right"
  ctx.fillText(
    truncateText(ctx, data.scriptName || labels?.noScript || "No script", 210),
    panel2X + panel2W - 16,
    setY,
  )
  ctx.textAlign = "left"

  // Separator
  setY += 16
  drawSubtleDivider(ctx, panel2X + 16, setY, panel2W - 32)

  // Divinecraft
  setY += 22
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.divinecraftLabel || "Divinecraft / Oil:", panel2X + 16, setY)

  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = data.divinecraftName ? "#d8b070" : "#666666"
  ctx.textAlign = "right"
  ctx.fillText(truncateText(ctx, data.divinecraftName || "—", 210), panel2X + panel2W - 16, setY)
  ctx.textAlign = "left"

  // Separator
  setY += 16
  drawSubtleDivider(ctx, panel2X + 16, setY, panel2W - 32)

  // Food Buff
  setY += 22
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.foodLabel || "Combat Food:", panel2X + 16, setY)

  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = data.foodName ? "#d8b070" : "#666666"
  ctx.textAlign = "right"
  ctx.fillText(truncateText(ctx, data.foodName || "—", 210), panel2X + panel2W - 16, setY)
  ctx.textAlign = "left"

  // Separator
  setY += 16
  drawSubtleDivider(ctx, panel2X + 16, setY, panel2W - 32)

  // Inner Ways
  setY += 24
  ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.innerWaysLabel || "Inner Ways (4/4):", panel2X + 16, setY)

  setY += 14
  const ways = data.innerWays && data.innerWays.length > 0 ? data.innerWays : ["—"]
  drawInnerWayPills(ctx, panel2X + 16, setY, panel2W - 32, ways)

  // 5. Footer
  ctx.font = "400 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#707070"
  ctx.textAlign = "left"
  const dateLocale = labels?.locale === "ru" ? "ru-RU" : "en-US"
  const dateStr = new Date().toLocaleDateString(dateLocale)
  const genLabel = labels?.generated || "Generated:"
  ctx.fillText(`${genLabel} ${dateStr} · Where Winds Meet DPS`, 32, height - 20)

  ctx.textAlign = "right"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText("https://wwm-dps.pages.dev", width - 32, height - 20)
}

function drawPanelShell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  metaLabel?: string,
  metaVal?: string,
) {
  ctx.fillStyle = "rgba(22, 22, 22, 0.95)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, 6)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.fill()

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.lineWidth = 1
  ctx.stroke()

  // Top antique-gold edge
  ctx.fillStyle = "#c0a060"
  ctx.fillRect(x + 16, y, w - 32, 2)

  // Title with diamond symbol
  ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#c0a060"
  ctx.textAlign = "left"
  ctx.fillText(`◆  ${title}`, x + 16, y + 26)

  // Meta if present (e.g. Resistance: 85%)
  if (metaLabel && metaVal) {
    ctx.textAlign = "right"
    ctx.font = "400 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillStyle = "#8a8a8a"
    const valW = ctx.measureText(` ${metaVal}`).width
    ctx.fillText(metaLabel, x + w - 16 - valW, y + 26)

    ctx.font = "700 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillStyle = "#d8b070"
    ctx.fillText(metaVal, x + w - 16, y + 26)
    ctx.textAlign = "left"
  }

  // Subtle separator line under title
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.beginPath()
  ctx.moveTo(x + 16, y + 36)
  ctx.lineTo(x + w - 16, y + 36)
  ctx.stroke()
}

function drawSectionHeading(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  title: string,
) {
  ctx.font = "700 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#c0a060"
  ctx.textAlign = "left"
  ctx.fillText(title.toUpperCase(), x, y)

  ctx.strokeStyle = "rgba(192, 160, 96, 0.22)"
  ctx.beginPath()
  ctx.moveTo(x, y + 4)
  ctx.lineTo(x + w, y + 4)
  ctx.stroke()
}

function drawStatPair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  label: string,
  val: string,
  options: {
    valColor?: string
    dimmed?: boolean
  } = {},
) {
  const labelColor = options.dimmed ? "#555555" : "#9c9c9c"
  const valColor = options.valColor || (options.dimmed ? "#555555" : "#f0f0f0")

  ctx.font = "400 11.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = labelColor
  ctx.textAlign = "left"
  ctx.fillText(truncateText(ctx, label, w - 110), x, y)

  ctx.font = "600 11.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = valColor
  ctx.textAlign = "right"
  ctx.fillText(val, x + w, y)
  ctx.textAlign = "left"

  // Separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)"
  ctx.beginPath()
  ctx.moveTo(x, y + 4)
  ctx.lineTo(x + w, y + 4)
  ctx.stroke()
}

function drawSubtleDivider(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.stroke()
}

function drawGoldBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  maxW: number,
  height = 28,
) {
  ctx.font = "600 12.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  const textTruncated = truncateText(ctx, text, maxW - 24)
  const textW = ctx.measureText(textTruncated).width
  const paddingX = 10
  const w = Math.min(maxW, textW + paddingX * 2)

  ctx.fillStyle = "rgba(192, 160, 96, 0.12)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, height, 4)
  } else {
    ctx.rect(x, y, w, height)
  }
  ctx.fill()

  ctx.strokeStyle = "rgba(192, 160, 96, 0.55)"
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = "#d8b070"
  ctx.textAlign = "left"
  ctx.fillText(textTruncated, x + paddingX, y + height / 2 + 4)
}

function drawInnerWayPills(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  ways: string[],
) {
  const pillW = (w - 8) / 2
  const pillH = 30
  ways.slice(0, 4).forEach((way, idx) => {
    const col = idx % 2
    const row = Math.floor(idx / 2)
    const px = x + col * (pillW + 8)
    const py = y + row * (pillH + 6)

    ctx.fillStyle = "#1e1e1e"
    ctx.beginPath()
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(px, py, pillW, pillH, 4)
    } else {
      ctx.rect(px, py, pillW, pillH)
    }
    ctx.fill()

    ctx.strokeStyle = "#383838"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = "600 11.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillStyle = "#d0d0d0"
    ctx.textAlign = "center"
    ctx.fillText(truncateText(ctx, way, pillW - 12), px + pillW / 2, py + 19)
  })
}
