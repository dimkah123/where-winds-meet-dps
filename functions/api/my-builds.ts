import { jsonResponse, type EventContext, type Env } from "../types"
import { resolveUserId } from "../auth"

interface MyBuildsBody {
  sessionToken?: string
  googleToken?: string
}

interface UserBuildItem {
  shortId: string
  title: string
  author: string
  classId: string
  dps: number
  lastUpdated: number
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

    const body = (await request.json()) as MyBuildsBody
    const ownerId = await resolveUserId(env, body?.sessionToken, body?.googleToken)

    if (!ownerId) {
      return jsonResponse(
        { error: "Unauthorized: Войдите в аккаунт, чтобы просмотреть свои сборки." },
        { status: 401 },
      )
    }

    const result = await env.DB.prepare(
      `SELECT shortId, title, author, classId, dps, lastUpdated
       FROM builds
       WHERE ownerId = ?
       ORDER BY lastUpdated DESC`,
    )
      .bind(ownerId)
      .all<UserBuildItem>()

    return jsonResponse({ builds: result.results || [] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error"
    console.error("my-builds error:", error)
    return jsonResponse({ error: msg }, { status: 500 })
  }
}
