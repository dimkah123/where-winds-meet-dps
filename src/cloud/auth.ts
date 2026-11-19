import type { UserProfile } from "./types"

export const GOOGLE_CLIENT_ID =
  "64823134414-44hmn7s4ro6bhdu9ub82a5gi092pq0nj.apps.googleusercontent.com"

const SESSION_TOKEN_KEY = "wwm.cloud.sessionToken"
const USER_PROFILE_KEY = "wwm.cloud.userProfile"

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean
              isSkippedMoment: () => boolean
            }) => void,
          ) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon"
              theme?: "outline" | "filled_blue" | "filled_black"
              size?: "large" | "medium" | "small"
              text?: "signin_with" | "signup_with" | "continue_with" | "signin"
              shape?: "rectangular" | "pill" | "circle" | "square"
              logo_alignment?: "left" | "center"
              width?: number
              locale?: string
            },
          ) => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

export function getStoredSession(): {
  sessionToken: string | null
  userProfile: UserProfile | null
} {
  if (typeof localStorage === "undefined") {
    return { sessionToken: null, userProfile: null }
  }
  const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY)
  const profileRaw = localStorage.getItem(USER_PROFILE_KEY)
  let userProfile: UserProfile | null = null
  if (profileRaw) {
    try {
      userProfile = JSON.parse(profileRaw) as UserProfile
    } catch {
      userProfile = null
    }
  }
  return { sessionToken, userProfile }
}

export function setStoredSession(sessionToken: string, userProfile: UserProfile): void {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(SESSION_TOKEN_KEY, sessionToken)
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile))
}

export function clearStoredSession(): void {
  if (typeof localStorage === "undefined") return
  localStorage.removeItem(SESSION_TOKEN_KEY)
  localStorage.removeItem(USER_PROFILE_KEY)
  if (typeof window !== "undefined" && window.google?.accounts?.id?.disableAutoSelect) {
    window.google.accounts.id.disableAutoSelect()
  }
}

export function loadGisScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("google-gsi-script") as HTMLScriptElement | null
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve()
      } else {
        existing.addEventListener("load", () => resolve())
        existing.addEventListener("error", (e) => reject(e))
      }
      return
    }
    const script = document.createElement("script")
    script.id = "google-gsi-script"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = (e) => reject(e)
    document.head.appendChild(script)
  })
}

export async function loginWithCredential(credential: string): Promise<UserProfile> {
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  })

  if (!response.ok) {
    const errData = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(errData.error || `Login failed: ${response.status}`)
  }

  const result = (await response.json()) as {
    sessionToken: string
    userProfile: UserProfile
  }

  setStoredSession(result.sessionToken, result.userProfile)
  return result.userProfile
}

export async function checkCurrentSession(): Promise<UserProfile | null> {
  const { sessionToken } = getStoredSession()
  if (!sessionToken) return null

  try {
    const response = await fetch("/api/auth/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ sessionToken }),
    })

    if (!response.ok) {
      clearStoredSession()
      return null
    }

    const data = (await response.json()) as { userProfile: UserProfile }
    if (data.userProfile) {
      setStoredSession(sessionToken, data.userProfile)
      return data.userProfile
    }
    return null
  } catch {
    return null
  }
}
