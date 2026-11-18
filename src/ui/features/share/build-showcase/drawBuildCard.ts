import { formatCompactDamage, formatNumber } from "../../../utils/numberFormatting"
import { fmtPenetration } from "../../../utils/statFormatting"

export interface BuildCardData {
  author: string
  title: string
  classDisplayName: string
  breakthroughText: string
  dps: number
  totalDamage: number
  rotationDuration: number
  rotationName: string

  // Physical & Attributes
  minPhys: number
  maxPhys: number
  physPenetration?: number
  primaryAttributeName?: string
  primaryAttributeMin?: number
  primaryAttributeMax?: number
  primaryAttributePenetration?: number
  foreignAttributeMin?: number
  foreignAttributeMax?: number

  // Core Rates
  critRate: number
  critDamageBoost: number
  precisionRate: number
  affinityRate: number
  directCritRate?: number

  // Key Damage Boosts
  allMartialBoost?: number
  attributeDamageBoost?: number
  bossBoost?: number
  topClassBoost?: { label: string; value: number }

  // Player Attributes & Defense
  agility?: number
  power?: number
  physDefense?: number
  maxHp?: number

  // Gear & Encounter
  armorSetName?: string | null
  bowSetName?: string | null
  bowSetBonus?: string | null
  scriptName?: string | null
  divinecraftName?: string | null
  foodName?: string | null
  innerWays?: string[]
}

export interface BuildCardLabels {
  playerBuildPrefix?: string
  defaultPlayer?: string
  heroDpsTitle?: string
  totalDamage?: string
  duration?: string
  rotation?: string

  attackTitle?: string
  ratesTitle?: string
  gearTitle?: string

  physAttackLabel?: string
  physPenLabel?: string
  attrAttackLabel?: string
  attrPenLabel?: string
  foreignAttrLabel?: string
  agilityLabel?: string
  powerLabel?: string
  physDefenseLabel?: string
  maxHpLabel?: string

  critLabel?: string
  critDmgLabel?: string
  precisionLabel?: string
  affinityLabel?: string
  directCritLabel?: string
  allMartialArtsLabel?: string
  attributeDmgLabel?: string
  bossBoostLabel?: string
  classSkillBoostLabel?: string

  armorSetLabel?: string
  bowSetLabel?: string
  scriptLabel?: string
  divinecraftLabel?: string
  foodLabel?: string
  noScript?: string
  innerWaysLabel?: string
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
  return label ? label.replace(" - Martial Art Skill DMG Boost", " - Skill Boost").replace(" - Charged Skill DMG Boost", " - Charge Boost") : "Class Boost"
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

  // 1. Deep charcoal-grey background matching the site
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
  const headerX = 32
  const headerY = 24
  const headerW = width - 64
  const headerH = 78

  // Panel background
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
  ctx.font = "800 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.textAlign = "left"
  const dpsGrad = ctx.createLinearGradient(headerX + 20, headerY + 16, headerX + 20, headerY + 64)
  dpsGrad.addColorStop(0, "#fff5cc")
  dpsGrad.addColorStop(0.5, "#e8c772")
  dpsGrad.addColorStop(1, "#c0a060")
  ctx.fillStyle = dpsGrad
  ctx.fillText(dpsText, headerX + 20, headerY + 54)

  const dpsW = ctx.measureText(dpsText).width
  const badgeX = headerX + 20 + dpsW + 10
  const badgeY = headerY + 31

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
  const sepX = badgeX + 48
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

  ctx.font = "700 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#f5f0e6"
  const maxAuthorW = headerW - (sepX - headerX) - 470
  ctx.fillText(truncateText(ctx, `${authorText}${titleText}`, maxAuthorW), sepX + 16, headerY + 35)

  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#c0a060"
  ctx.fillText(`${data.classDisplayName} · ${data.breakthroughText}`, sepX + 16, headerY + 58)

  // Right sub-metric chips (Total DMG, Duration, Rotation)
  const chipW = 140
  const chipH = 52
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
    const chipX = headerW + 32 - (3 - idx) * (chipW + 8) - 10
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
    ctx.fillText(chip.label, chipX + 10, chipY + 19)

    ctx.font = "700 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillStyle = chip.color
    ctx.fillText(chip.val, chipX + 10, chipY + 41)
  })

  // 4. Three Columns: Attack & Attributes, Rates & Boosts, Gear & Encounter
  const colY = 116
  const colH = 518
  const colW = (headerW - 24) / 3

  // Column 1: Attack & Attributes
  const col1X = 32
  drawSectionBox(ctx, col1X, colY, colW, colH, labels?.attackTitle || "АТАКА И ХАРАКТЕРИСТИКИ")

  const attrAttackLabel = data.primaryAttributeName
    ? (labels?.attrAttackLabel || `Атака: ${data.primaryAttributeName}`).replace("{attr}", data.primaryAttributeName)
    : "Атака атрибута"
  const attrPenLabel = data.primaryAttributeName
    ? (labels?.attrPenLabel || `Пробитие: ${data.primaryAttributeName}`).replace("{attr}", data.primaryAttributeName)
    : "Пробитие атрибута"

  const col1Rows = [
    {
      label: labels?.physAttackLabel || "Физ. атака (Мин – Макс)",
      val: `${formatNumber(data.minPhys, 0)} – ${formatNumber(data.maxPhys, 0)}`,
      highlight: false,
    },
    {
      label: labels?.physPenLabel || "Физ. пробитие",
      val: fmtPenetration(data.physPenetration ?? 0),
      highlight: false,
    },
    {
      label: attrAttackLabel,
      val: `${formatNumber(data.primaryAttributeMin ?? 0, 0)} – ${formatNumber(data.primaryAttributeMax ?? 0, 0)}`,
      highlight: true,
    },
    {
      label: attrPenLabel,
      val: fmtPenetration(data.primaryAttributePenetration ?? 0),
      highlight: true,
    },
    {
      label: labels?.foreignAttrLabel || "Чужая атака атрибута",
      val: `${formatNumber(data.foreignAttributeMin ?? 0, 0)} – ${formatNumber(data.foreignAttributeMax ?? 0, 0)}`,
      highlight: (data.foreignAttributeMin ?? 0) > 0 || (data.foreignAttributeMax ?? 0) > 0,
    },
    {
      label: labels?.agilityLabel || "Ловкость (Agility)",
      val: formatNumber(data.agility ?? 0, 1),
      highlight: true,
    },
    {
      label: labels?.powerLabel || "Сила (Power)",
      val: formatNumber(data.power ?? 0, 0),
      highlight: false,
    },
    {
      label: labels?.physDefenseLabel || "Физ. защита",
      val: formatNumber(data.physDefense ?? 0, 1),
      highlight: false,
    },
    {
      label: labels?.maxHpLabel || "Макс. здоровье (HP)",
      val: formatNumber(data.maxHp ?? 0, 0),
      highlight: false,
      color: "#5fb86b",
    },
  ]

  let rowY = colY + 68
  const rowStep = 47
  col1Rows.forEach((r) => {
    drawStatRow(ctx, col1X + 16, rowY, colW - 32, r.label, r.val, r.highlight ? "#d8b070" : r.color || "#f0f0f0")
    rowY += rowStep
  })

  // Column 2: Rates & Damage Boosts
  const col2X = col1X + colW + 12
  drawSectionBox(ctx, col2X, colY, colW, colH, labels?.ratesTitle || "ТОЧНОСТЬ И УСИЛЕНИЯ УРОНА")

  const col2Rows = [
    {
      label: labels?.critLabel || "Крит. шанс",
      val: `${formatNumber(data.critRate * 100, 1)}%`,
      highlight: false,
    },
    {
      label: labels?.critDmgLabel || "Крит. урон",
      val: `+${formatNumber(data.critDamageBoost * 100, 1)}%`,
      highlight: false,
    },
    {
      label: labels?.precisionLabel || "Точность (Precision)",
      val: `${formatNumber(data.precisionRate * 100, 1)}%`,
      highlight: false,
    },
    {
      label: labels?.affinityLabel || "Сокрушение (Affinity)",
      val: `${formatNumber(data.affinityRate * 100, 1)}%`,
      highlight: false,
    },
    {
      label: labels?.allMartialArtsLabel || "Все боевые искусства",
      val: `+${formatNumber((data.allMartialBoost ?? 0) * 100, 1)}%`,
      highlight: true,
    },
    {
      label: labels?.attributeDmgLabel || "Урон атрибута",
      val: `+${formatNumber((data.attributeDamageBoost ?? 0) * 100, 1)}%`,
      highlight: true,
    },
    {
      label: labels?.bossBoostLabel || "Урон против боссов",
      val: `+${formatNumber((data.bossBoost ?? 0) * 100, 1)}%`,
      highlight: true,
    },
    {
      label: data.topClassBoost ? data.topClassBoost.label : (labels?.classSkillBoostLabel || "Навык класса"),
      val: data.topClassBoost ? `+${formatNumber(data.topClassBoost.value * 100, 1)}%` : "+0.0%",
      highlight: true,
    },
    {
      label: labels?.directCritLabel || "Прямой крит (Direct Crit)",
      val: `${formatNumber((data.directCritRate ?? 0) * 100, 1)}%`,
      highlight: false,
    },
  ]

  rowY = colY + 68
  col2Rows.forEach((r) => {
    drawStatRow(ctx, col2X + 16, rowY, colW - 32, r.label, r.val, r.highlight ? "#d8b070" : "#f0f0f0")
    rowY += rowStep
  })

  // Column 3: Gear Sets & Encounter
  const col3X = col2X + colW + 12
  drawSectionBox(ctx, col3X, colY, colW, colH, labels?.gearTitle || "КОМПЛЕКТЫ И СТОЛКНОВЕНИЕ")

  let setY = colY + 66
  // Armor Set
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.armorSetLabel || "Комплект брони (4/4):", col3X + 16, setY)

  setY += 24
  drawGoldBadge(ctx, col3X + 16, setY - 18, data.armorSetName || labels?.notEquipped || "Не надет", colW - 32)

  setY += 38
  // Bow Set
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.bowSetLabel || "Комплект лука (2/2):", col3X + 16, setY)

  setY += 24
  const bowText = data.bowSetName
    ? `${data.bowSetName}${data.bowSetBonus ? ` (${data.bowSetBonus})` : ""}`
    : labels?.notEquipped || "Не надет"
  drawGoldBadge(ctx, col3X + 16, setY - 18, bowText, colW - 32)

  setY += 40
  // Separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
  ctx.beginPath()
  ctx.moveTo(col3X + 16, setY - 8)
  ctx.lineTo(col3X + colW - 16, setY - 8)
  ctx.stroke()

  // Crafting Script
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.scriptLabel || "Крафтовый свиток:", col3X + 16, setY + 10)

  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = data.scriptName ? "#f0f0f0" : "#777777"
  ctx.textAlign = "right"
  ctx.fillText(truncateText(ctx, data.scriptName || labels?.noScript || "Без свитка", 200), col3X + colW - 16, setY + 10)
  ctx.textAlign = "left"

  setY += 34
  // Separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
  ctx.beginPath()
  ctx.moveTo(col3X + 16, setY - 8)
  ctx.lineTo(col3X + colW - 16, setY - 8)
  ctx.stroke()

  // Divinecraft
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.divinecraftLabel || "Ремесло / Масло:", col3X + 16, setY + 10)

  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = data.divinecraftName ? "#d8b070" : "#777777"
  ctx.textAlign = "right"
  ctx.fillText(truncateText(ctx, data.divinecraftName || "—", 200), col3X + colW - 16, setY + 10)
  ctx.textAlign = "left"

  setY += 34
  // Separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
  ctx.beginPath()
  ctx.moveTo(col3X + 16, setY - 8)
  ctx.lineTo(col3X + colW - 16, setY - 8)
  ctx.stroke()

  // Food Buff
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.foodLabel || "Боевая еда:", col3X + 16, setY + 10)

  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = data.foodName ? "#d8b070" : "#777777"
  ctx.textAlign = "right"
  ctx.fillText(truncateText(ctx, data.foodName || "—", 200), col3X + colW - 16, setY + 10)
  ctx.textAlign = "left"

  setY += 34
  // Separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
  ctx.beginPath()
  ctx.moveTo(col3X + 16, setY - 8)
  ctx.lineTo(col3X + colW - 16, setY - 8)
  ctx.stroke()

  // Inner Ways
  setY += 16
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText(labels?.innerWaysLabel || "Внутренние пути (4/4):", col3X + 16, setY)

  setY += 16
  const ways = data.innerWays && data.innerWays.length > 0 ? data.innerWays : ["—"]
  drawInnerWayPills(ctx, col3X + 16, setY, colW - 32, ways)

  // 5. Footer
  ctx.font = "400 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#707070"
  ctx.textAlign = "left"
  const dateLocale = labels?.locale === "ru" ? "ru-RU" : "en-US"
  const dateStr = new Date().toLocaleDateString(dateLocale)
  const genLabel = labels?.generated || "Сгенерировано:"
  ctx.fillText(`${genLabel} ${dateStr} · Where Winds Meet DPS`, 36, height - 26)

  ctx.textAlign = "right"
  ctx.fillStyle = "#8c8c8c"
  ctx.fillText("https://wwm-dps.pages.dev", width - 36, height - 26)
}

function drawSectionBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
) {
  // Charcoal panel background
  ctx.fillStyle = "rgba(22, 22, 22, 0.94)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, 6)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.fill()

  ctx.strokeStyle = "rgba(255, 255, 255, 0.07)"
  ctx.lineWidth = 1
  ctx.stroke()

  // Top antique-gold edge
  ctx.fillStyle = "#c0a060"
  ctx.fillRect(x + 16, y, w - 32, 2)

  // Title with diamond symbol
  ctx.font = "700 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#c0a060"
  ctx.textAlign = "left"
  ctx.fillText(`◆  ${title}`, x + 16, y + 28)

  // Subtle separator line under title
  ctx.strokeStyle = "rgba(192, 160, 96, 0.2)"
  ctx.beginPath()
  ctx.moveTo(x + 16, y + 40)
  ctx.lineTo(x + w - 16, y + 40)
  ctx.stroke()
}

function drawStatRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  label: string,
  val: string,
  valColor: string,
) {
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#9c9c9c"
  ctx.textAlign = "left"
  ctx.fillText(truncateText(ctx, label, w - 105), x, y)

  ctx.font = "700 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = valColor
  ctx.textAlign = "right"
  ctx.fillText(val, x + w, y)

  // Separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
  ctx.beginPath()
  ctx.moveTo(x, y + 11)
  ctx.lineTo(x + w, y + 11)
  ctx.stroke()
}

function drawGoldBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  maxW: number,
) {
  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  const textTruncated = truncateText(ctx, text, maxW - 24)
  const textW = ctx.measureText(textTruncated).width
  const paddingX = 10
  const h = 26
  const w = Math.min(maxW, textW + paddingX * 2)

  ctx.fillStyle = "rgba(192, 160, 96, 0.12)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, 4)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.fill()

  ctx.strokeStyle = "rgba(192, 160, 96, 0.55)"
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = "#d8b070"
  ctx.textAlign = "left"
  ctx.fillText(textTruncated, x + paddingX, y + 18)
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
    const py = y + row * (pillH + 8)

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

    ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillStyle = "#d0d0d0"
    ctx.textAlign = "center"
    ctx.fillText(truncateText(ctx, way, pillW - 12), px + pillW / 2, py + 19)
  })
}
