import { jsonResponse, type EventContext, type Env } from "../types"
import { resolveUserId } from "../auth"

interface DeleteBuildBody {
  shortId: string
  sessionToken?: string
  googleToken?: string
  editToken?: string
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

    const body = (await request.json()) as DeleteBuildBody
    if (!body || !body.shortId) {
      return jsonResponse({ error: "shortId is required." }, { status: 400 })
    }

    const ownerId = await resolveUserId(env, body.sessionToken, body.googleToken)

    let deleteRes
    if (ownerId) {
      deleteRes = await env.DB.prepare(
        `DELETE FROM builds WHERE shortId = ? AND (ownerId = ? OR editToken = ?)`,
      )
        .bind(body.shortId, ownerId, body.editToken || "")
        .run()
    } else if (body.editToken) {
      deleteRes = await env.DB.prepare(`DELETE FROM builds WHERE shortId = ? AND editToken = ?`)
        .bind(body.shortId, body.editToken)
        .run()
    } else {
      return jsonResponse(
        { error: "Unauthorized: требуется авторизация или токен" },
        { status: 401 },
      )
    }

    const changes = (deleteRes.meta as { changes?: number })?.changes ?? 1
    if (changes === 0) {
      return jsonResponse(
        { error: "Доступ запрещен: вы не можете удалить эту сборку" },
        { status: 403 },
      )
    }

    return jsonResponse({ success: true, message: "Сборка удалена" })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error"
    console.error("delete-build error:", error)
    return jsonResponse({ error: msg }, { status: 500 })
  }
}
