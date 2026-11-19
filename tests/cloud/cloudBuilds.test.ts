import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearStoredSession,
  getStoredSession,
  loginWithCredential,
  setStoredSession,
} from "../../src/cloud/auth"
import {
  deleteBuildFromCloud,
  fetchMyBuilds,
  getEditToken,
  loadBuildFromCloud,
  saveBuildToCloud,
  setEditToken,
  updateBuildInCloud,
} from "../../src/cloud/cloudBuilds"

describe("Cloud Builds & Auth Client", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("manages stored user sessions and edit tokens in localStorage", () => {
    expect(getStoredSession()).toEqual({ sessionToken: null, userProfile: null })

    const sampleProfile = {
      id: "google_123",
      email: "test@example.com",
      name: "Dimka",
      picture: "https://example.com/avatar.jpg",
    }
    setStoredSession("sess_abc123", sampleProfile)

    expect(getStoredSession()).toEqual({
      sessionToken: "sess_abc123",
      userProfile: sampleProfile,
    })

    clearStoredSession()
    expect(getStoredSession()).toEqual({ sessionToken: null, userProfile: null })

    setEditToken("build_999", "token_secret")
    expect(getEditToken("build_999")).toBe("token_secret")
    expect(getEditToken("unknown")).toBeNull()
  })

  it("saveBuildToCloud calls /api/save and stores editToken", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shortId: "abc12345", editToken: "edit_secret_token" }),
    } as Response)

    const res = await saveBuildToCloud({
      data: "encoded_payload_string",
      title: "Mixed 1 Min",
      author: "Dimka",
      classId: "stonesplit-strength",
      dps: 86528,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/save",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    )
    expect(res.shortId).toBe("abc12345")
    expect(getEditToken("abc12345")).toBe("edit_secret_token")
  })

  it("loadBuildFromCloud calls /api/load?id=...", async () => {
    const mockData = {
      shortId: "abc12345",
      title: "Mixed 1 Min",
      author: "Dimka",
      classId: "stonesplit-strength",
      dps: 86528,
      data: "payload_data",
      ownerId: "user_123",
      lastUpdated: 1700000000000,
    }

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response)

    const loaded = await loadBuildFromCloud("abc12345")
    expect(loaded).toEqual(mockData)
  })

  it("updateBuildInCloud passes editToken and sessionToken", async () => {
    setEditToken("abc12345", "saved_edit_token")

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    const res = await updateBuildInCloud({
      shortId: "abc12345",
      data: "updated_payload",
      title: "Updated Title",
      dps: 90000,
    })

    expect(res.success).toBe(true)
    const callBody = JSON.parse(fetchMock.mock.calls[0][1]?.body as string)
    expect(callBody.shortId).toBe("abc12345")
    expect(callBody.editToken).toBe("saved_edit_token")
  })

  it("fetchMyBuilds returns array of builds when session exists", async () => {
    setStoredSession("session_token_123", {
      id: "user_1",
      email: "user@test.com",
      name: "User",
      picture: "",
    })

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        builds: [
          {
            shortId: "b1",
            title: "Build 1",
            author: "User",
            classId: "stonesplit-strength",
            dps: 85000,
            lastUpdated: 1700000000000,
          },
        ],
      }),
    } as Response)

    const builds = await fetchMyBuilds()
    expect(builds.length).toBe(1)
    expect(builds[0].shortId).toBe("b1")
  })

  it("deleteBuildFromCloud calls /api/delete-build", async () => {
    setEditToken("del_123", "secret_edit")

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    const res = await deleteBuildFromCloud("del_123")
    expect(res.success).toBe(true)
    const callBody = JSON.parse(fetchMock.mock.calls[0][1]?.body as string)
    expect(callBody.shortId).toBe("del_123")
    expect(callBody.editToken).toBe("secret_edit")
  })

  it("loginWithCredential stores sessionToken and userProfile", async () => {
    const profile = {
      id: "google_999",
      email: "dimka@test.com",
      name: "Dimka",
      picture: "https://example.com/dimka.png",
    }

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionToken: "session_new_123",
        userProfile: profile,
      }),
    } as Response)

    const res = await loginWithCredential("mock_jwt_credential")
    expect(res).toEqual(profile)
    expect(getStoredSession().sessionToken).toBe("session_new_123")
    expect(getStoredSession().userProfile).toEqual(profile)
  })
})
