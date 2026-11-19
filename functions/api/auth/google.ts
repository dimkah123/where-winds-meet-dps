import { generateToken, jsonResponse, type EventContext, type Env } from "../../types"

const DEFAULT_CLIENT_ID = "64823134414-44hmn7s4ro6bhdu9ub82a5gi092pq0nj.apps.googleusercontent.com"

interface GoogleAuthBody {
  credential?: string
  code?: string
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

export async function onRequestPost(context: EventContext<Env>): Promise<Response> {
  try {
    const { request, env } = context
    if (!env.DB) {
      return jsonResponse({ error: "Database binding DB is missing." }, { status: 500 })
    }

    const body = (await request.json()) as GoogleAuthBody
    let userInfo: { sub: string; email?: string; name?: string; picture?: string } | null = null

    // 1. Direct ID token (GIS credential) verification (does not require client secret)
    if (body?.credential) {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`,
      )
      if (!verifyRes.ok) {
        const errText = await verifyRes.text()
        return jsonResponse(
          { error: `Google token verification failed: ${verifyRes.status} ${errText}` },
          { status: 401 },
        )
      }
      userInfo = (await verifyRes.json()) as {
        sub: string
        email?: string
        name?: string
        picture?: string
      }
    } else if (body?.code && env.GOOGLE_CLIENT_SECRET) {
      // 2. Code exchange if secret is configured
      const clientId = env.GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: body.code,
          client_id: clientId,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: "postmessage",
          grant_type: "authorization_code",
        }),
      })

      if (!tokenRes.ok) {
        const errData = await tokenRes.text()
        return jsonResponse({ error: `Token exchange failed: ${errData}` }, { status: 400 })
      }

      const tokenData = (await tokenRes.json()) as { id_token?: string }
      if (!tokenData.id_token) {
        return jsonResponse({ error: "Missing id_token in Google response" }, { status: 400 })
      }

      const idRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`,
      )
      if (!idRes.ok) throw new Error("Failed to verify ID token")
      userInfo = (await idRes.json()) as {
        sub: string
        email?: string
        name?: string
        picture?: string
      }
    } else {
      return jsonResponse({ error: "No valid Google credential or code provided." }, { status: 400 })
    }

    if (!userInfo || !userInfo.sub) {
      return jsonResponse({ error: "Invalid Google user data." }, { status: 400 })
    }

    const userId = userInfo.sub
    const now = Date.now()

    // Upsert user in D1
    await env.DB.prepare(
      `INSERT INTO users (id, email, name, picture, createdAt)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         picture = excluded.picture`,
    )
      .bind(
        userId,
        userInfo.email ?? "",
        userInfo.name ?? "User",
        userInfo.picture ?? "",
        now,
      )
      .run()

    // Create session (30 days validity)
    const sessionId = generateToken(32)
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000

    await env.DB.prepare(
      `INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)`,
    )
      .bind(sessionId, userId, expiresAt)
      .run()

    return jsonResponse({
      sessionToken: sessionId,
      userProfile: {
        id: userId,
        email: userInfo.email ?? "",
        name: userInfo.name ?? "User",
        picture: userInfo.picture ?? "",
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error"
    console.error("Google Auth error:", error)
    return jsonResponse({ error: msg }, { status: 500 })
  }
}
