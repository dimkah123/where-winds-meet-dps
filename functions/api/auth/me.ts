import { jsonResponse, type EventContext, type Env } from "../../types"
import { resolveUserProfile } from "../../auth"

interface MeBody {
  sessionToken?: string
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

    const authHeader = request.headers.get("Authorization")
    let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

    if (!token) {
      const body = (await request.json().catch(() => ({}))) as MeBody
      token = body?.sessionToken ?? null
    }

    if (!token) {
      return jsonResponse({ error: "Missing session token." }, { status: 401 })
    }

    const profile = await resolveUserProfile(env, token)
    if (!profile) {
      return jsonResponse({ error: "Session expired or invalid." }, { status: 401 })
    }

    return jsonResponse({ userProfile: profile })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error"
    console.error("Auth me error:", error)
    return jsonResponse({ error: msg }, { status: 500 })
  }
}
