import { jsonResponse, type EventContext, type Env } from "../types"

interface StoredBuildRow {
  shortId: string
  title: string
  author: string
  classId: string
  dps: number
  data: string
  ownerId: string | null
  lastUpdated: number
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

export async function onRequestGet(context: EventContext<Env>): Promise<Response> {
  try {
    const { request, env } = context
    if (!env.DB) {
      return jsonResponse({ error: "Database binding DB is missing." }, { status: 500 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get("id") || url.searchParams.get("b")
    if (!id) {
      return jsonResponse({ error: "Missing build id parameter." }, { status: 400 })
    }

    const row = await env.DB.prepare(
      `SELECT shortId, title, author, classId, dps, data, ownerId, lastUpdated
       FROM builds WHERE shortId = ?`,
    )
      .bind(id)
      .first<StoredBuildRow>()

    if (!row) {
      return jsonResponse({ error: "Сборка не найдена / Build not found" }, { status: 404 })
    }

    return jsonResponse({
      shortId: row.shortId,
      title: row.title,
      author: row.author,
      classId: row.classId,
      dps: row.dps,
      data: row.data,
      ownerId: row.ownerId,
      lastUpdated: row.lastUpdated,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error"
    console.error("Load error:", error)
    return jsonResponse({ error: msg }, { status: 500 })
  }
}
