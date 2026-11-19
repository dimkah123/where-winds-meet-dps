import {
  generateShortId,
  generateToken,
  jsonResponse,
  type EventContext,
  type Env,
} from "../types"
import { resolveUserId } from "../auth"

interface SaveBody {
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

    const body = (await request.json()) as SaveBody
    if (!body || !body.data) {
      return jsonResponse({ error: "Build data is required." }, { status: 400 })
    }

    const shortId = generateShortId(8)
    const editToken = generateToken(20)
    const now = Date.now()

    const ownerId = await resolveUserId(env, body.sessionToken, body.googleToken)

    await env.DB.prepare(
      `INSERT INTO builds (shortId, editToken, title, author, classId, dps, data, ownerId, createdAt, lastUpdated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        shortId,
        editToken,
        body.title?.slice(0, 100) ?? "Build",
        body.author?.slice(0, 100) ?? "",
        body.classId ?? "",
        body.dps ?? 0,
        body.data,
        ownerId,
        now,
        now,
      )
      .run()

    return jsonResponse({ shortId, editToken })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error"
    console.error("Save error:", error)
    return jsonResponse({ error: msg }, { status: 500 })
  }
}
