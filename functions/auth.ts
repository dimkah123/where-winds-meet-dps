import type { Env } from "./types"

export interface UserProfile {
  id: string
  email: string
  name: string
  picture: string
}

export async function resolveUserId(
  env: Env,
  sessionToken?: string | null,
  googleToken?: string | null,
): Promise<string | null> {
  if (sessionToken) {
    try {
      const now = Date.now()
      const session = await env.DB.prepare(
        "SELECT userId FROM sessions WHERE id = ? AND expiresAt > ?",
      )
        .bind(sessionToken, now)
        .first<{ userId: string }>()
      if (session?.userId) return session.userId
    } catch (e) {
      console.error("Session lookup error:", e)
    }
  }

  if (googleToken) {
    try {
      const tokenRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(googleToken)}`,
      )
      if (tokenRes.ok) {
        const tokenData = (await tokenRes.json()) as { sub?: string }
        if (tokenData.sub) return tokenData.sub
      }
    } catch (e) {
      console.error("Google token verification error:", e)
    }
  }

  return null
}

export async function resolveUserProfile(
  env: Env,
  sessionToken: string,
): Promise<UserProfile | null> {
  try {
    const now = Date.now()
    const session = await env.DB.prepare(
      "SELECT userId FROM sessions WHERE id = ? AND expiresAt > ?",
    )
      .bind(sessionToken, now)
      .first<{ userId: string }>()

    if (!session?.userId) return null

    const user = await env.DB.prepare(
      "SELECT id, email, name, picture FROM users WHERE id = ?",
    )
      .bind(session.userId)
      .first<UserProfile>()

    return user || null
  } catch (e) {
    console.error("resolveUserProfile error:", e)
    return null
  }
}
