import { describe, expect, it } from "vitest"
import {
  compressBytes,
  decodeSharedBuild,
  encodeSharedBuild,
  uint8ArrayToBase64Url,
  type SharedBuildPayload,
} from "../../src/engine/shareBuild"
import { defaultInputs } from "../../src/engine/defaults"

describe("shareBuild engine", () => {
  it("decodes user payload from production and restores graduation build", async () => {
    const userPayload =
      "vZNNbtswEIWvIrz1RCAli6K4TZGdkwLpTuCCtmlbqCwFFOG2CLTsAbruJXqU5EYFJcdQ_BN01Q1BzBDve_NIPmMPlRCWUOh829juqa78o3e22fgtCAsoLgkbqGewsNRQnDHCN6iyTATJLOaahl0RF5pKnhKLmZCaylTSTMYiFCnL4xlxrQkdFJa1Xfsna76CYKAYweyhWMwT2RP4NZA4iqaJpjILJClnB344QMEMF4OFQlzCOSh-Cs17QvIRdBAscjkhaSplqKapHAdM40JcnvASMsyZ_n_k7Aw54RwUA5ERiznLk9Noj5HrCYPnbxAWksz-kTHVTZPjrabZYXsFIYqeIK4w-PSxjbL5-CzH5N7iTGIZ9M_N5x-aH0WyPKgU547fDXU1oX4o4eX366_Xny9_QPBQmFff7Sri0bxqQFhBYV05C8J6uFrz42Fvm7va-IWzZhWO7Ab1xfA3F1Allq7yIM6YHiSnhZ6w24VpcOfazt_c1mYV3VebrQ_4yrpIQFOJeetMbaPbrWlOOo_emtXadD76ZPetr9rmff_L1rXG33yurFvaSUv3fwE"
    const decoded = await decodeSharedBuild(userPayload)
    expect(decoded.author).toBe("Лёха")
    expect(decoded.title).toBe("Mixed 1 Min")
    expect(decoded.inputs.classId).toBe("stonesplitStrength")
    expect(decoded.inputs.breakthrough).toBe(18)
    expect(decoded.inputs.inventory.length).toBe(8)
    expect(decoded.inputs.graduationBuildId).toBe("graduation-stonesplitStrength-max-build")

    const { followedGraduationBuild } = await import("../../src/engine/graduation")
    const followed = followedGraduationBuild(decoded.inputs)
    expect(followed).toBeDefined()
    expect(followed?.id).toBe("graduation-stonesplitStrength-max-build")
  })

  it("decodes user payload from request 10 (Witness: 3 Heng + Bow)", async () => {
    const userPayload =
      "tZRLi9swFIX_ijnb3hjJivzQrp0ydNMHTKEL44USK46pYw-ymqEM-e9FdmfqiRNwFtXCmHOFzncf3GccoSLCFgq961rTPza1e3DWtJXbg7CB4imhgnoG858GijNGeILK8yimlIXrgnJOMgkFmx4vx8RClsUFDVfTMPNXhReTdVEQeihsG7Nzj0b_BEFDMYI-QrGQR-mJwC-aypDHIvt3Xq2SRGZvdZHSOg1FNEKKMJPTGy9oswcXwUVL4VIPJ0Q6lTNZUC59IE1F_D_wxFI8EQ014vKM7tZsLmawCHU9Q73Wz2spiMspCHlZv4aqoXjywsaSE0EuR8teR-1aRW_s8ZwmntFMR-hGWz52Uib8vJPLgZIr5eFjUyQf98PoFLPZihg2x_qvZRSm0zi_ZHkaJPyoXWv6HgQHBRF8Mm0VvAs-dE8gVBsoVFaXv7Sru3Y1322r13lcbW3tQCihsKut8b_WD2zdlsa-7_0a3A0DrH9_PZr2vtFuY40u_cUDFCdshv24gcoxPsYZKwawqXAiHA6-QLi3Xe9Wd40ugy91tffurjY2iFFQjs-d1Y0J7va6PYt839tOu9W32titeRt6cEaXO9274KM5dj7pSbw4_QE"
    const decoded = await decodeSharedBuild(userPayload)
    expect(decoded.author).toBe("Witness")
    expect(decoded.title).toBe("3 Heng + Bow")
    expect(decoded.inputs.classId).toBe("stonesplitStrength")
    expect(decoded.inputs.breakthrough).toBe(18)
    expect(decoded.inputs.food).toBe("clayOvenFlatbread")
    expect(decoded.inputs.divinecraft).toBe("fire")
    expect(decoded.inputs.divinecraftRefinement).toBe("cinderAsh")

    const { withDerivedStats } = await import("../../src/engine/derivedInputs")
    const { applySetBonuses } = await import("../../src/engine/setBonuses")
    const { runEngine } = await import("../../src/engine/dps")
    const readyInputs = applySetBonuses(withDerivedStats(decoded.inputs))
    const dps = runEngine(readyInputs)
    console.log(
      "Calculated DPS for Witness 3 Heng + Bow:",
      dps.dps,
      "totalDamage:",
      dps.totalDamage,
    )
    expect(dps.dps).toBeGreaterThan(60000)
  })

  it("round-trips crafting script, combatSettings, and enforces max arsenal, oddities and enhancements", async () => {
    const payload: SharedBuildPayload = {
      v: 2,
      author: "Lekha",
      title: "Full Encounter Mo Build",
      inputs: {
        ...defaultInputs,
        classId: "stonesplitStrength",
        breakthrough: 18,
        combatSettings: {
          dragonsBreath: true,
          healerBuff: true,
          healerPanaceaFan: false,
          breakExtension: true,
          script: "wraithstrikeScript",
          dragonHeadFullStacks: false,
          dragonHeadLowHpMaxBonus: false,
          fragrantOrchidBathBean: false,
        },
      },
    }

    const encoded = await encodeSharedBuild(payload)
    const decoded = await decodeSharedBuild(encoded)

    // Script & Combat Settings preserved
    expect(decoded.inputs.combatSettings?.script).toBe("wraithstrikeScript")
    expect(decoded.inputs.combatSettings?.dragonsBreath).toBe(true)
    expect(decoded.inputs.combatSettings?.healerBuff).toBe(true)
    expect(decoded.inputs.combatSettings?.breakExtension).toBe(true)
    expect(decoded.inputs.combatSettings?.healerPanaceaFan).toBe(false)

    // Max defaults enforced
    expect(decoded.inputs.arsenal).toBe("stonesplit")
    expect(decoded.inputs.unclaimedOddityNodes).toEqual({})
    expect(decoded.inputs.disabledTalentNodes).toEqual([])
    expect(decoded.inputs.arsenalScores[1]).toBeGreaterThan(0)
    expect(decoded.inputs.enhancements.leftWeapon).toBeGreaterThanOrEqual(70)
  })

  it("encodes and decodes a shared build payload accurately with compact v2 format", async () => {
    const payload: SharedBuildPayload = {
      v: 2,
      author: "Dimka",
      title: "Stonesplit 85k DPS",
      inputs: {
        ...defaultInputs,
        classId: "stonesplitStrength",
        breakthrough: 18,
      },
    }

    const encoded = await encodeSharedBuild(payload)
    expect(typeof encoded).toBe("string")
    // Extremely compact: default build is around ~200-300 characters
    expect(encoded.length).toBeLessThan(400)

    const decoded = await decodeSharedBuild(encoded)
    expect(decoded.v).toBe(2)
    expect(decoded.author).toBe("Dimka")
    expect(decoded.title).toBe("Stonesplit 85k DPS")
    expect(decoded.inputs.classId).toBe("stonesplitStrength")
    expect(decoded.inputs.breakthrough).toBe(18)
  })

  it("decodes legacy v1 payloads for backward compatibility", async () => {
    const legacyPayload = {
      v: 1,
      author: "LegacyAuthor",
      title: "LegacyBuild",
      inputs: {
        ...defaultInputs,
        classId: "stonesplitStrength",
        breakthrough: 16,
      },
    }

    const json = JSON.stringify(legacyPayload)
    const rawBytes = new TextEncoder().encode(json)
    const compressed = await compressBytes(rawBytes)
    const encodedV1 = uint8ArrayToBase64Url(compressed)

    const decoded = await decodeSharedBuild(encodedV1)
    expect(decoded.v).toBe(1)
    expect(decoded.author).toBe("LegacyAuthor")
    expect(decoded.title).toBe("LegacyBuild")
    expect(decoded.inputs.classId).toBe("stonesplitStrength")
    expect(decoded.inputs.breakthrough).toBe(16)
  })

  it("handles Cyrillic player names and build titles without corruption", async () => {
    const payload: SharedBuildPayload = {
      v: 2,
      author: "Димка",
      title: "Сборка Расколотый пик (Мо + Хэн) 85к УВС",
      inputs: defaultInputs,
    }

    const encoded = await encodeSharedBuild(payload)
    const decoded = await decodeSharedBuild(encoded)
    expect(decoded.author).toBe("Димка")
    expect(decoded.title).toBe("Сборка Расколотый пик (Мо + Хэн) 85к УВС")
  })

  it("throws a descriptive error on corrupted base64url data", async () => {
    await expect(decodeSharedBuild("not-a-valid-payload")).rejects.toThrow()
  })

  it("rapidly encodes and decodes heavy builds with many gear pieces without hanging or deadlocking", async () => {
    const dummyPieces = Array.from({ length: 80 }, (_, i) => ({
      id: `piece-${i}`,
      slot: "helm" as const,
      level: 100 as const,
      rarity: "legendary" as const,
      minPhys: 50,
      maxPhys: 80,
      hp: 1000,
      physDef: 200,
      words: [
        { word: "crit", value: 0.032, retuned: false },
        { word: "minPhys", value: 45, retuned: false },
        { word: "maxPhys", value: 75, retuned: false },
        { word: "agility", value: 48, retuned: false },
        { word: "crit", value: 0.032, retuned: true },
      ] as any,
      attunement: "phalanxbaneQ",
      attunementValue: 0.058,
      relayed: false,
    }))

    const heavyInputs = {
      ...defaultInputs,
      inventory: dummyPieces,
      equipped: {
        ...defaultInputs.equipped,
        helm: "piece-0",
      },
    }

    const payload: SharedBuildPayload = {
      v: 2,
      author: "HeavyTester",
      title: "Massive Inventory Build",
      inputs: heavyInputs,
    }

    const start = Date.now()
    const encoded = await encodeSharedBuild(payload)
    const duration = Date.now() - start

    expect(typeof encoded).toBe("string")
    expect(duration).toBeLessThan(1000) // Encodes in well under 1 second

    const decoded = await decodeSharedBuild(encoded)
    expect(decoded.author).toBe("HeavyTester")
    // Only equipped pieces are retained in shared inventory and assigned generated IDs
    expect(decoded.inputs.inventory.length).toBe(1)
    expect(decoded.inputs.equipped.helm).toBe(decoded.inputs.inventory[0].id)
    expect(decoded.inputs.inventory[0].words[0].word).toBe("crit")
    expect(decoded.inputs.inventory[0].words[4].retuned).toBe(true)
  })

  it("automatically equips graduation gear when saving/loading a build following graduation build with empty inventory", async () => {
    const payload: SharedBuildPayload = {
      v: 2,
      author: "GraduationTester",
      title: "3 Heng + Bow",
      inputs: {
        ...defaultInputs,
        classId: "stonesplitStrength",
        breakthrough: 18,
        graduationBuildId: "graduation-stonesplitStrength-max-build",
        inventory: [],
        equipped: { ...defaultInputs.equipped },
      },
    }

    const encoded = await encodeSharedBuild(payload)
    const decoded = await decodeSharedBuild(encoded)

    expect(decoded.title).toBe("3 Heng + Bow")
    expect(decoded.inputs.inventory.length).toBe(8)
    expect(decoded.inputs.equipped.leftWeapon).toBeTruthy()
    expect(decoded.inputs.bowGear?.bow).toBeTruthy()
    expect(decoded.inputs.bowGear?.thumbRing).toBeTruthy()
  })
})
