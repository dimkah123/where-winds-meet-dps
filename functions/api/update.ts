import { jsonResponse, type EventContext, type Env } from "../types"
import { resolveUserId } from "../auth"

interface UpdateBody {
  shortId: string
  editToken?: string
  data: string
  title?: string
  author?: string
  classId?: string
  dps?: number
  sessionToken?: string
  googleToken?: string
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

export async function onRequestPost(context: EventContext<Env>): Promise<Response> {
  try {
    const { request, env } = context
    if (!env.DB) {
      return jsonResponse({ error: "Database binding DB is missing." }, { status: 500 })
    }

    const body = (await request.json()) as UpdateBody
    if (!body || !body.shortId || !body.data) {
      return jsonResponse({ error: "shortId and data are required." }, { status: 400 })
    }

    const now = Date.now()
    const ownerId = await resolveUserId(env, body.sessionToken, body.googleToken)

    let updateRes
    if (ownerId) {
      updateRes = await env.DB.prepare(
        `UPDATE builds
         SET data = ?, title = ?, author = ?, classId = ?, dps = ?, lastUpdated = ?
         WHERE shortId = ? AND (ownerId = ? OR editToken = ?)`,
      )
        .bind(
          body.data,
          body.title?.slice(0, 100) ?? "Build",
          body.author?.slice(0, 100) ?? "",
          body.classId ?? "",
          body.dps ?? 0,
          now,
          body.shortId,
          ownerId,
          body.editToken || "",
        )
        .run()
    } else {
      if (!body.editToken) {
        return jsonResponse(
          { error: "Доступ запрещен: требуется токен редактирования или авторизация" },
          { status: 403 },
        )
      }
      updateRes = await env.DB.prepare(
        `UPDATE builds
         SET data = ?, title = ?, author = ?, classId = ?, dps = ?, lastUpdated = ?
         WHERE shortId = ? AND editToken = ?`,
      )
        .bind(
          body.data,
          body.title?.slice(0, 100) ?? "Build",
          body.author?.slice(0, 100) ?? "",
          body.classId ?? "",
          body.dps ?? 0,
          now,
          body.shortId,
          body.editToken,
        )
        .run()
    }

    // In Cloudflare D1, update result has meta.changes (or rowsWritten)
    const changes = (updateRes.meta as { changes?: number })?.changes ?? 1
    if (changes === 0) {
      return jsonResponse(
        { error: "Доступ запрещен: вы не являетесь владельцем этой сборки" },
        { status: 403 },
      )
    }

    return jsonResponse({ success: true, message: "Сборка обновлена / Build updated" })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error"
    console.error("Update error:", error)
    return jsonResponse({ error: msg }, { status: 500 })
  }
}
