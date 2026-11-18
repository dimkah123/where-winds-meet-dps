import { formatCompactDamage, formatNumber } from "../../../utils/numberFormatting"

export interface BuildCardData {
  author: string
  title: string
  classDisplayName: string
  breakthroughText: string
  dps: number
  totalDamage: number
  rotationDuration: number
  rotationName: string
  minPhys: number
  maxPhys: number
  critRate: number
  critDamageBoost: number
  precisionRate: number
  affinityRate: number
  armorSetName?: string | null
  bowSetName?: string | null
  bowSetBonus?: string | null
}

export function drawBuildCard(canvas: HTMLCanvasElement, data: BuildCardData) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  // 1. Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height)
  bgGrad.addColorStop(0, "#0c0e12")
  bgGrad.addColorStop(0.5, "#12151c")
  bgGrad.addColorStop(1, "#181d26")
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 2. Outer decorative gold borders
  ctx.strokeStyle = "#4a3c1e"
  ctx.lineWidth = 3
  ctx.strokeRect(16, 16, width - 32, height - 32)

  ctx.strokeStyle = "#caa34c"
  ctx.lineWidth = 1
  ctx.strokeRect(20, 20, width - 40, height - 40)

  // Corner accents
  const cornerSize = 24
  ctx.fillStyle = "#caa34c"
  // Top-left
  ctx.fillRect(18, 18, cornerSize, 3)
  ctx.fillRect(18, 18, 3, cornerSize)
  // Top-right
  ctx.fillRect(width - 18 - cornerSize, 18, cornerSize, 3)
  ctx.fillRect(width - 21, 18, 3, cornerSize)
  // Bottom-left
  ctx.fillRect(18, height - 21, cornerSize, 3)
  ctx.fillRect(18, height - 18 - cornerSize, 3, cornerSize)
  // Bottom-right
  ctx.fillRect(width - 18 - cornerSize, height - 21, cornerSize, 3)
  ctx.fillRect(width - 21, height - 18 - cornerSize, 3, cornerSize)

  // 3. Header
  // Brand watermark
  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#8a96a8"
  ctx.textAlign = "right"
  ctx.fillText("WHERE WINDS MEET · DPS CALCULATOR", width - 46, 52)

  // Player & Title
  ctx.textAlign = "left"
  ctx.font = "400 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#9fa9b8"
  ctx.fillText("Сборка игрока:", 46, 50)

  const authorText = data.author.trim() || "Игрок"
  ctx.font = "700 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#f5d77f"
  ctx.fillText(authorText, 175, 52)

  // Subtitle / Class info
  ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#c2cbd6"
  const buildTitle = data.title.trim() ? `«${data.title.trim()}» · ` : ""
  ctx.fillText(`${buildTitle}${data.classDisplayName} · ${data.breakthroughText}`, 46, 84)

  // 4. Hero DPS Card
  const heroY = 112
  const heroH = 158
  const heroW = width - 92

  // Background for hero box
  ctx.fillStyle = "rgba(22, 26, 35, 0.75)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(46, heroY, heroW, heroH, 8)
  } else {
    ctx.rect(46, heroY, heroW, heroH)
  }
  ctx.fill()
  ctx.strokeStyle = "rgba(202, 163, 76, 0.35)"
  ctx.lineWidth = 1
  ctx.stroke()

  // DPS Label
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#d4af37"
  ctx.fillText("ИТОГОВЫЙ УРОН В СЕКУНДУ (DPS)", 72, heroY + 36)

  // Large DPS Value with gold gradient
  const dpsText = formatNumber(data.dps, 0)
  ctx.font = "800 68px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  const dpsGrad = ctx.createLinearGradient(72, heroY + 50, 72, heroY + 115)
  dpsGrad.addColorStop(0, "#fff5cc")
  dpsGrad.addColorStop(0.5, "#ffd54f")
  dpsGrad.addColorStop(1, "#c99a2c")
  ctx.fillStyle = dpsGrad
  ctx.fillText(dpsText, 72, heroY + 104)

  const dpsMetrics = ctx.measureText(dpsText)
  ctx.font = "700 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#e5c158"
  ctx.fillText("DPS", 72 + dpsMetrics.width + 12, heroY + 98)

  // Total damage / duration / rotation
  ctx.font = "400 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#9fa9b8"
  const rotText = data.rotationName ? ` · Ротация: ${data.rotationName}` : ""
  ctx.fillText(
    `Всего урона: ${formatCompactDamage(data.totalDamage)} · Длительность: ${formatNumber(data.rotationDuration, 1)}с${rotText}`,
    72,
    heroY + 138,
  )

  // 5. Two Columns: Stats & Gear Sets
  const colY = 292
  const colH = 310
  const colW = (width - 92 - 24) / 2

  // Column 1: Stats
  drawSectionBox(ctx, 46, colY, colW, colH, "ХАРАКТЕРИСТИКИ ПЕРСОНАЖА")
  const statsList = [
    {
      label: "Физ. атака (Мин – Макс)",
      val: `${formatNumber(data.minPhys, 0)} – ${formatNumber(data.maxPhys, 0)}`,
    },
    {
      label: "Крит. шанс / Крит. урон",
      val: `${formatNumber(data.critRate * 100, 1)}% / +${formatNumber(data.critDamageBoost * 100, 1)}%`,
    },
    { label: "Точность (Precision)", val: `${formatNumber(data.precisionRate * 100, 1)}%` },
    { label: "Сокрушение (Affinity)", val: `${formatNumber(data.affinityRate * 100, 1)}%` },
  ]
  let statRowY = colY + 70
  for (const st of statsList) {
    ctx.font = "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillStyle = "#9fa9b8"
    ctx.fillText(st.label, 70, statRowY)

    ctx.font = "600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillStyle = "#f3f5f8"
    ctx.textAlign = "right"
    ctx.fillText(st.val, 46 + colW - 24, statRowY)
    ctx.textAlign = "left"

    // separator line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
    ctx.beginPath()
    ctx.moveTo(70, statRowY + 14)
    ctx.lineTo(46 + colW - 24, statRowY + 14)
    ctx.stroke()

    statRowY += 56
  }

  // Column 2: Sets & Gear
  const col2X = 46 + colW + 24
  drawSectionBox(ctx, col2X, colY, colW, colH, "КОМПЛЕКТЫ И СНАРЯЖЕНИЕ")

  let setRowY = colY + 70
  // Armor Set
  ctx.font = "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#9fa9b8"
  ctx.fillText("Комплект брони (4/4):", col2X + 24, setRowY)

  setRowY += 28
  drawBadge(ctx, col2X + 24, setRowY - 18, data.armorSetName || "Не надет", "#28a745")

  setRowY += 54
  // Bow Set
  ctx.font = "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#9fa9b8"
  ctx.fillText("Комплект лука (2/2):", col2X + 24, setRowY)

  setRowY += 28
  const bowText = data.bowSetName
    ? `${data.bowSetName}${data.bowSetBonus ? ` (${data.bowSetBonus})` : ""}`
    : "Не надет"
  drawBadge(ctx, col2X + 24, setRowY - 18, bowText, "#28a745")

  setRowY += 56
  ctx.font = "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#717e91"
  ctx.fillText("Готово к проверке и тестированию в калькуляторе.", col2X + 24, setRowY)

  // 6. Footer
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#636e7f"
  ctx.textAlign = "left"
  const dateStr = new Date().toLocaleDateString("ru-RU")
  ctx.fillText(`Сгенерировано: ${dateStr}`, 46, height - 32)

  ctx.textAlign = "right"
  ctx.fillText("https://dimkah123.github.io/where-winds-meet-dps", width - 46, height - 32)
}

function drawSectionBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
) {
  ctx.fillStyle = "rgba(18, 22, 30, 0.75)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, 8)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.fill()

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.lineWidth = 1
  ctx.stroke()

  // Title
  ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillStyle = "#caa34c"
  ctx.textAlign = "left"
  ctx.fillText(title, x + 24, y + 32)
}

function drawBadge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) {
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  const textW = ctx.measureText(text).width
  const paddingX = 10
  const h = 26
  const w = textW + paddingX * 2

  ctx.fillStyle = "rgba(40, 167, 69, 0.12)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, 4)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.fill()

  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = "#48d56b"
  ctx.fillText(text, x + paddingX, y + 18)
}
