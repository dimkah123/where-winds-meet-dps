import { getStoredSession } from "./auth"
import type { CloudBuildSummary, LoadedCloudBuild } from "./types"

const EDIT_TOKEN_PREFIX = "wwm.cloud.edit_"

export function getEditToken(shortId: string): string | null {
  if (typeof localStorage === "undefined") return null
  return localStorage.getItem(EDIT_TOKEN_PREFIX + shortId)
}

export function setEditToken(shortId: string, token: string): void {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(EDIT_TOKEN_PREFIX + shortId, token)
}

export async function saveBuildToCloud(params: {
  data: string
  title?: string
  author?: string
  classId?: string
  dps?: number
}): Promise<{ shortId: string; editToken: string }> {
  const { sessionToken } = getStoredSession()

  const response = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: params.data,
      title: params.title,
      author: params.author,
      classId: params.classId,
      dps: params.dps,
      sessionToken: sessionToken || undefined,
    }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || `Save failed: ${response.status}`)
  }

  const result = (await response.json()) as { shortId: string; editToken: string }
  if (result.shortId && result.editToken) {
    setEditToken(result.shortId, result.editToken)
  }

  return result
}

export async function updateBuildInCloud(params: {
  shortId: string
  data: string
  title?: string
  author?: string
  classId?: string
  dps?: number
  editToken?: string
}): Promise<{ success: boolean }> {
  const { sessionToken } = getStoredSession()
  const token = params.editToken || getEditToken(params.shortId) || undefined

  const response = await fetch("/api/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shortId: params.shortId,
      data: params.data,
      title: params.title,
      author: params.author,
      classId: params.classId,
      dps: params.dps,
      editToken: token,
      sessionToken: sessionToken || undefined,
    }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || `Update failed: ${response.status}`)
  }

  return { success: true }
}

export async function loadBuildFromCloud(shortId: string): Promise<LoadedCloudBuild> {
  const response = await fetch(`/api/load?id=${encodeURIComponent(shortId)}`)

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || `Load failed: ${response.status}`)
  }

  return (await response.json()) as LoadedCloudBuild
}

export async function fetchMyBuilds(): Promise<CloudBuildSummary[]> {
  const { sessionToken } = getStoredSession()
  if (!sessionToken) {
    return []
  }

  const response = await fetch("/api/my-builds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionToken }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || `Failed to fetch builds: ${response.status}`)
  }

  const data = (await response.json()) as { builds: CloudBuildSummary[] }
  return data.builds || []
}

export async function deleteBuildFromCloud(shortId: string): Promise<{ success: boolean }> {
  const { sessionToken } = getStoredSession()
  const editToken = getEditToken(shortId) || undefined

  const response = await fetch("/api/delete-build", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shortId,
      sessionToken: sessionToken || undefined,
      editToken,
    }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || `Failed to delete: ${response.status}`)
  }

  return { success: true }
}
