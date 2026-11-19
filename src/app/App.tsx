import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  HashRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { runEngine } from "../engine/dps"
import { applySetBonuses } from "../engine/setBonuses"
import { withCustomContent } from "../engine/customContent"
import { withDerivedStats } from "../engine/derivedInputs"
import type { EngineRunOptions, Inputs, StoredProfile } from "../engine/types"
import { OverviewTab } from "../ui/features/overview/overview-tab/OverviewTab"
import { MetricsCard } from "../ui/layout/output-panel/OutputPanel"
import { CornerToasts } from "../ui/layout/corner-toasts/CornerToasts"
import { EncounterSettingsTrigger } from "../ui/features/overview/encounter-settings-trigger/EncounterSettingsTrigger"
import { EncounterSettingsDialog } from "../ui/features/overview/encounter-settings-dialog/EncounterSettingsDialog"
import type { EncounterCategory } from "../engine/encounterOptions"
import { ChangelogButton } from "../ui/layout/changelog-button/ChangelogButton"
import { LanguageSelect } from "../ui/layout/language-select/LanguageSelect"
import { RotationTab } from "../ui/features/rotation/rotation-tab/RotationTab"
import { RotationEditorPanel } from "../ui/features/rotation/rotation-editor-panel/RotationEditorPanel"
import { SimulationTab } from "../ui/features/simulation/simulation-tab/SimulationTab"
import { ProfilePanel } from "../ui/features/profile/profile-panel/ProfilePanel"
import { GearTab } from "../ui/features/gear/gear-tab/GearTab"
import { TalentsOdditiesTab } from "../ui/features/talents/talents-oddities-tab/TalentsOdditiesTab"
import { SkillsTab } from "../ui/features/skills/skills-tab/SkillsTab"
import { AlertsTab } from "../ui/features/alerts/alerts-tab/AlertsTab"
import { getAllAlertKeys } from "../ui/features/alerts/alertKeys"
import { useGraduationRate } from "../ui/hooks/useGraduationRate"
import { useGraduationQiLog } from "../ui/hooks/useGraduationQiLog"
import { useParseSimulation, type ParseSimulationRequest } from "../ui/hooks/useParseSimulation"
import { SimulationToast, SIMULATION_PATH } from "../ui/layout/simulation-toast/SimulationToast"
import { DpsActivityToast } from "../ui/layout/dps-activity-toast/DpsActivityToast"
import { GraduationBuildDialog } from "../ui/features/gear/graduation-build-dialog/GraduationBuildDialog"
import { SetupWizard, type SetupMode } from "../ui/features/setup/setup-wizard/SetupWizard"
import { BreakthroughDataDialog } from "../ui/layout/breakthrough-data-dialog/BreakthroughDataDialog"
import { breakthroughDataRequestFor } from "../ui/layout/breakthrough-data-dialog/breakthroughDataRequest"
import { activeRotationName } from "../ui/features/rotation/rotationOptions"
import { useUndoRedo } from "../ui/hooks/useUndoRedo"
import { ShareBuildDialog } from "../ui/features/share/share-build-dialog/ShareBuildDialog"
import { SharedBuildBanner } from "../ui/layout/shared-build-banner/SharedBuildBanner"
import { UpdateBanner } from "../ui/layout/update-banner/UpdateBanner"
import { useAppUpdateChecker } from "../ui/hooks/useAppUpdateChecker"
import { decodeSharedBuild, encodeSharedBuild } from "../engine/shareBuild"
import { UserAuthButton } from "../ui/layout/user-auth-button/UserAuthButton"
import { HeaderSettingsButton } from "../ui/layout/header-settings/HeaderSettingsButton"
import { useHeaderSettings } from "../ui/hooks/useHeaderSettings"
import type { UserProfile } from "../cloud/types"
import { formatNumber, formatCompactDamage } from "../ui/utils/numberFormatting"
import { MyBuildsDialog } from "../ui/layout/my-builds-dialog/MyBuildsDialog"
import { loadBuildFromCloud, getEditToken, updateBuildInCloud } from "../cloud/cloudBuilds"
import { getStoredSession } from "../cloud/auth"
import { followedGraduationBuild } from "../engine/graduation"
import { graduationBuildKey } from "../i18n/contentKeys"
import { useI18n } from "../i18n/i18nContext"
import { I18nProvider } from "../i18n/I18nProvider"
import { ConfirmProvider } from "../ui/components/confirm-dialog/ConfirmDialog"
import { useConfirm } from "../ui/components/confirm-dialog/confirmContext"
import {
  loadProfiles,
  saveProfiles,
  newProfileId,
  loadCustomSkills,
  loadCustomBuffs,
  loadCustomDebuffs,
  loadCustomGraduationBuilds,
  migrateSeededSkillIds,
  migrateDotStandinOverrides,
  type ProfilesState,
} from "../storage"
import type { CustomGraduationBuild } from "../engine/customGraduationBuild"
import type { Skill } from "../engine/skill"
import type { Buff } from "../engine/buff"
import type { Debuff } from "../engine/debuff"
import { blankInputs } from "../engine/defaults"
import styles from "./App.module.scss"

migrateSeededSkillIds()
migrateDotStandinOverrides()

const OWN_QI_BAR: EngineRunOptions = { qiBar: "own" }

function extractSharedData(search: string): string | null {
  if (search) {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
    const val = params.get("d") || params.get("data")
    if (val) return val
  }
  if (typeof window !== "undefined" && window.location.hash) {
    const qIdx = window.location.hash.indexOf("?")
    if (qIdx >= 0) {
      const params = new URLSearchParams(window.location.hash.slice(qIdx + 1))
      const val = params.get("d") || params.get("data")
      if (val) return val
    }
  }
  if (typeof window !== "undefined" && window.location.search) {
    const params = new URLSearchParams(
      window.location.search.startsWith("?")
        ? window.location.search.slice(1)
        : window.location.search,
    )
    const val = params.get("d") || params.get("data")
    if (val) return val
  }
  return null
}

function extractCloudShortId(search: string, hash: string): string | null {
  if (hash) {
    const bMatch = hash.match(/#\/b\/([A-Za-z0-9_-]+)/)
    if (bMatch) return bMatch[1]
    const qIdx = hash.indexOf("?")
    if (qIdx >= 0) {
      const params = new URLSearchParams(hash.slice(qIdx + 1))
      const val = params.get("b") || params.get("id")
      if (val) return val
    }
  }
  if (search) {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
    const val = params.get("b") || params.get("id")
    if (val) return val
  }
  if (typeof window !== "undefined" && window.location.search) {
    const params = new URLSearchParams(window.location.search)
    const val = params.get("b") || params.get("id")
    if (val) return val
  }
  return null
}

function AppInner() {
  const simulation = useParseSimulation()
  const [startedRunCount, setStartedRunCount] = useState(0)
  const [acknowledgedRunCount, setAcknowledgedRunCount] = useState(0)
  const isSimulationRunning = simulation.status === "running"
  const location = useLocation()
  const pathname = location.pathname
  const isOnSimulationTab = pathname === SIMULATION_PATH
  const areInputsLocked = isSimulationRunning && !isOnSimulationTab
  const navigate = useNavigate()
  const lastLoadedDataRef = useRef<string | null>(null)

  const startParseSimulation = simulation.start
  const startSimulation = useCallback(
    (request: ParseSimulationRequest) => {
      setStartedRunCount((count) => count + 1)
      startParseSimulation(request)
    },
    [startParseSimulation],
  )
  const acknowledgeSimulation = useCallback(
    () => setAcknowledgedRunCount(startedRunCount),
    [startedRunCount],
  )

  const initial = useState(() => loadProfiles())[0]
  const [committed, setCommitted] = useState<ProfilesState>({
    profiles: initial.profiles,
    activeId: initial.activeId,
  })
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    () => getStoredSession().userProfile,
  )
  const {
    settings: headerSettings,
    updateSetting: updateHeaderSetting,
    resetSettings: resetHeaderSettings,
  } = useHeaderSettings()
  const initialActive = committed.profiles.find((profile) => profile.id === committed.activeId)!
  const {
    state: activeDraft,
    set: setActiveDraft,
    reset: resetActiveDraft,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
  } = useUndoRedo<Inputs>(initialActive.inputs)
  const inputs = activeDraft

  function setInputs(next: Inputs) {
    if (isSimulationRunning) return
    setActiveDraft(next)
  }
  const [lastSavedJson, setLastSavedJson] = useState(() => JSON.stringify(initialActive.inputs))
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [wizard, setWizard] = useState<{ mode: SetupMode; defaultName: string } | null>(() =>
    initial.firstRun ? { mode: "first-run", defaultName: "" } : null,
  )
  const [graduationDialogOpen, setGraduationDialogOpen] = useState(false)
  const [encounterDialogOpen, setEncounterDialogOpen] = useState(false)
  const [encounterCategory, setEncounterCategory] = useState<EncounterCategory>("food")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareTargetProfile, setShareTargetProfile] = useState<StoredProfile | null>(null)
  const [sharedBannerInfo, setSharedBannerInfo] = useState<{
    author: string
    title: string
    inputs: Inputs
  } | null>(null)
  const [currentCloudId, setCurrentCloudId] = useState<string | null>(null)
  const [myBuildsDialogOpen, setMyBuildsDialogOpen] = useState(false)
  const lastLoadedCloudIdRef = useRef<string | null>(null)
  const {
    hasUpdate,
    serverVersion,
    dismissed: updateDismissed,
    dismiss: dismissUpdate,
    reload: reloadApp,
  } = useAppUpdateChecker()

  useEffect(() => {
    const hashStr = typeof window !== "undefined" ? window.location.hash : ""
    const shortId = extractCloudShortId(location.search, hashStr)
    if (!shortId || shortId === lastLoadedCloudIdRef.current) return
    lastLoadedCloudIdRef.current = shortId

    loadBuildFromCloud(shortId)
      .then(async (loaded) => {
        let inputsData: Inputs | null = null
        let authorName = loaded.author || ""
        let titleName = loaded.title || ""

        try {
          const payload = await decodeSharedBuild(loaded.data)
          inputsData = payload.inputs
          if (!authorName) authorName = payload.author
          if (!titleName) titleName = payload.title
        } catch {
          try {
            inputsData = JSON.parse(loaded.data) as Inputs
          } catch (e) {
            console.error("Failed to parse cloud build data", e)
          }
        }

        if (!inputsData) return

        const editToken = getEditToken(shortId)
        const user = getStoredSession().userProfile
        const isOwner = Boolean((user && loaded.ownerId && user.id === loaded.ownerId) || editToken)

        setCurrentCloudId(shortId)
        setWizard(null)
        resetActiveDraft(inputsData)
        setLastSavedJson(JSON.stringify(inputsData))

        if (!isOwner) {
          setSharedBannerInfo({
            author: authorName,
            title: titleName,
            inputs: inputsData,
          })
        } else {
          setSharedBannerInfo(null)
        }
        navigate("/overview", { replace: true })
      })
      .catch((err) => {
        console.error("Failed to load cloud build:", err)
      })
  }, [location.pathname, location.search, navigate])

  useEffect(() => {
    const data = extractSharedData(location.search)
    if (!data || data === lastLoadedDataRef.current) return
    lastLoadedDataRef.current = data

    decodeSharedBuild(data)
      .then((payload) => {
        const author = payload.author || ""
        const title = payload.title || ""
        setWizard(null)
        resetActiveDraft(payload.inputs)
        setLastSavedJson(JSON.stringify(payload.inputs))
        setSharedBannerInfo({
          author,
          title,
          inputs: payload.inputs,
        })
        navigate("/overview", { replace: true })
      })
      .catch((err) => {
        console.error("Failed to load shared build:", err)
      })
  }, [location.pathname, location.search, navigate])

  function handleSaveSharedToProfiles() {
    if (!sharedBannerInfo) return
    const authorName = sharedBannerInfo.author.trim() || t("share.defaultPlayerName", "Игрок")
    const buildTitle = sharedBannerInfo.title.trim()
    const template = buildTitle
      ? t("share.profileNameWithTitle", "Сборка игрока {author}: {title}")
      : t("share.profileName", "Сборка игрока {author}")
    const name = template.replace("{author}", authorName).replace("{title}", buildTitle)
    const newId = newProfileId()
    const newProf: StoredProfile = {
      id: newId,
      name,
      inputs: activeDraft,
    }
    const nextProfiles = [...committed.profiles, newProf]
    const nextState: ProfilesState = {
      profiles: nextProfiles,
      activeId: newId,
    }
    persist(nextState)
    resetActiveDraft(activeDraft)
    setLastSavedJson(JSON.stringify(activeDraft))
    setSharedBannerInfo(null)
  }

  function handleDismissShared() {
    setSharedBannerInfo(null)
    const active = committed.profiles.find((profile) => profile.id === committed.activeId)
    if (active) {
      resetActiveDraft(active.inputs)
      setLastSavedJson(JSON.stringify(active.inputs))
      setSavedAt(null)
    }
  }

  const [breakthroughAskedClassIds, setBreakthroughAskedClassIds] = useState<readonly string[]>([])
  const breakthroughRequest = useMemo(
    () => (initial.firstRun ? null : breakthroughDataRequestFor(activeDraft.classId)),
    [initial.firstRun, activeDraft.classId],
  )
  const breakthroughAsk =
    breakthroughRequest && !breakthroughAskedClassIds.includes(breakthroughRequest.classId)
      ? breakthroughRequest
      : null

  const draftJson = useMemo(() => JSON.stringify(activeDraft), [activeDraft])
  const isDirty = draftJson !== lastSavedJson

  const [customSkills, setCustomSkills] = useState<Skill[]>(() => loadCustomSkills())

  function changeCustomSkills(next: Skill[]) {
    if (isSimulationRunning) return
    setCustomSkills(next)
  }

  const [customBuffs] = useState<Buff[]>(() => loadCustomBuffs())
  const [customDebuffs] = useState<Debuff[]>(() => loadCustomDebuffs())
  const [customGraduationBuilds, setCustomGraduationBuilds] = useState<CustomGraduationBuild[]>(
    () => loadCustomGraduationBuilds(),
  )

  const customGraduationBuild = useMemo(
    () => customGraduationBuilds.find((build) => build.classId === inputs.classId) ?? null,
    [customGraduationBuilds, inputs.classId],
  )

  const configuredInputs = useMemo(
    () => ({
      ...withCustomContent(inputs, customSkills, customBuffs, customDebuffs),
      customGraduationBuild,
    }),
    [inputs, customSkills, customBuffs, customDebuffs, customGraduationBuild],
  )

  const engineInputs = useMemo(() => {
    const derived = withDerivedStats(configuredInputs)
    return applySetBonuses(derived)
  }, [configuredInputs])

  const graduationQiLog = useGraduationQiLog(configuredInputs)
  const result = useMemo(
    () => runEngine(engineInputs, graduationQiLog ? { qiDamageLog: graduationQiLog } : OWN_QI_BAR),
    [engineInputs, graduationQiLog],
  )
  const graduation = useGraduationRate(configuredInputs)
  const followedBuild = followedGraduationBuild(configuredInputs)
  const mustChooseGraduationBuild = !followedBuild && !wizard && !isSimulationRunning
  const headerResult = useMemo(
    () => ({ ...result, graduationRate: graduation.rate }),
    [result, graduation.rate],
  )

  const rotationName = useMemo(() => activeRotationName(inputs), [inputs])
  const goToRotationTab = useCallback(() => navigate("/rotation"), [navigate])
  const goToRotationEditorTab = useCallback(() => navigate("/rotation-editor"), [navigate])

  const { t } = useI18n()
  const confirm = useConfirm()

  function persist(next: ProfilesState) {
    setCommitted(next)
    saveProfiles(next)
  }

  const handleSave = useCallback(() => {
    if (sharedBannerInfo) return
    const next: ProfilesState = {
      ...committed,
      profiles: committed.profiles.map((profile) =>
        profile.id === committed.activeId ? { ...profile, inputs: activeDraft } : profile,
      ),
    }
    persist(next)
    setLastSavedJson(draftJson)
    // eslint-disable-next-line react-hooks/purity
    setSavedAt(Date.now())

    if (currentCloudId) {
      const activeProf = committed.profiles.find((p) => p.id === committed.activeId)
      encodeSharedBuild({
        v: 2,
        author: localStorage.getItem("wwm.share.author") || "",
        title: activeProf?.name || "",
        inputs: activeDraft,
      })
        .then((encoded) => {
          updateBuildInCloud({
            shortId: currentCloudId,
            data: encoded,
            title: activeProf?.name,
            dps: headerResult.dps,
            classId: activeDraft.classId,
          }).catch((e) => console.error("Cloud auto-update error:", e))
        })
        .catch(() => {})
    }
  }, [activeDraft, committed, currentCloudId, draftJson, headerResult.dps, sharedBannerInfo])
  async function handleReset() {
    if (isSimulationRunning) return
    if (!isDirty) return
    if (!(await confirm(t("app.discardUnsavedChanges")))) return
    const active = committed.profiles.find((profile) => profile.id === committed.activeId)
    if (!active) return
    const restored = JSON.parse(JSON.stringify(active.inputs)) as Inputs
    resetActiveDraft(restored)
    setLastSavedJson(JSON.stringify(restored))
    setSavedAt(null)
    setSharedBannerInfo(null)
  }

  async function selectProfile(id: string) {
    if (isSimulationRunning) return
    if (id === committed.activeId && !sharedBannerInfo) return
    if (isDirty && !(await confirm(t("app.youHaveUnsavedChangesSwitch")))) return
    const target = committed.profiles.find((profile) => profile.id === id)
    if (!target) return
    const next: ProfilesState = { ...committed, activeId: id }
    persist(next)
    resetActiveDraft(target.inputs)
    setLastSavedJson(JSON.stringify(target.inputs))
    setSavedAt(null)
    setSharedBannerInfo(null)
  }

  async function createProfile() {
    if (isSimulationRunning) return
    if (isDirty && !(await confirm(t("app.youHaveUnsavedChangesSwitch")))) return
    setWizard({
      mode: "new-profile",
      defaultName: `${t("common.newProfile")} ${committed.profiles.length + 1}`,
    })
  }

  function handleWizardFinish(name: string, finishedInputs: Inputs) {
    if (isSimulationRunning) return
    const profile: StoredProfile = {
      id: newProfileId(),
      name,
      inputs: finishedInputs,
    }
    const next: ProfilesState =
      wizard?.mode === "first-run"
        ? { profiles: [profile], activeId: profile.id }
        : { profiles: [...committed.profiles, profile], activeId: profile.id }
    persist(next)
    resetActiveDraft(profile.inputs)
    setLastSavedJson(JSON.stringify(profile.inputs))
    setSavedAt(null)
    setWizard(null)
  }

  function renameProfile(id: string, name: string) {
    const next: ProfilesState = {
      ...committed,
      profiles: committed.profiles.map((profile) =>
        profile.id === id ? { ...profile, name } : profile,
      ),
    }
    persist(next)
  }

  function duplicateProfile(id: string) {
    const sourceProfile = committed.profiles.find((profile) => profile.id === id)
    if (!sourceProfile) return
    const copy: StoredProfile = {
      id: newProfileId(),
      name: `${sourceProfile.name} ${t("common.copy")}`,
      inputs: sourceProfile.inputs,
    }
    const next: ProfilesState = {
      ...committed,
      profiles: [...committed.profiles, copy],
    }
    persist(next)
  }

  async function handleImportProfile(imported: StoredProfile) {
    if (isSimulationRunning) return
    if (isDirty && !(await confirm(t("app.youHaveUnsavedChangesSwitch")))) return
    const next: ProfilesState = {
      profiles: [...committed.profiles, imported],
      activeId: imported.id,
    }
    persist(next)
    resetActiveDraft(imported.inputs)
    setLastSavedJson(JSON.stringify(imported.inputs))
    setSavedAt(null)
  }

  async function deleteProfile(id: string) {
    if (committed.profiles.length <= 1) return
    if (!(await confirm(t("app.deleteThisProfile")))) return
    const remaining = committed.profiles.filter((profile) => profile.id !== id)
    let nextActive = committed.activeId
    if (id === committed.activeId) {
      nextActive = remaining[0].id
      resetActiveDraft(remaining[0].inputs)
      setLastSavedJson(JSON.stringify(remaining[0].inputs))
      setSavedAt(null)
    }
    const next: ProfilesState = { profiles: remaining, activeId: nextActive }
    persist(next)
  }

  useEffect(() => {
    if (!savedAt) return
    const id = setTimeout(() => setSavedAt(null), 2500)
    return () => clearTimeout(id)
  }, [savedAt])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      if (!isCtrlOrCmd) return

      const isS = e.code === "KeyS" || e.key.toLowerCase() === "s" || e.key.toLowerCase() === "ы"
      if (!isS) return

      const target = e.target as HTMLElement | null
      const isTextEntry =
        target &&
        ((target.tagName === "INPUT" &&
          (target as HTMLInputElement).type !== "checkbox" &&
          (target as HTMLInputElement).type !== "radio" &&
          (target as HTMLInputElement).type !== "range" &&
          (target as HTMLInputElement).type !== "button" &&
          (target as HTMLInputElement).type !== "submit") ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)

      if (isTextEntry) {
        return
      }

      e.preventDefault()
      if (isDirty && !sharedBannerInfo && !isSimulationRunning) {
        handleSave()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleSave, isDirty, sharedBannerInfo, isSimulationRunning])

  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  useEffect(() => {
    tabRefs.current[pathname]?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [pathname])

  const [isAlertsDnd, setIsAlertsDnd] = useState(() => {
    return localStorage.getItem("wwm.alertsDnd") === "true"
  })

  const toggleAlertsDnd = useCallback(() => {
    setIsAlertsDnd((prev) => {
      const next = !prev
      localStorage.setItem("wwm.alertsDnd", String(next))
      return next
    })
  }, [])

  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("wwm.acknowledgedAlerts")
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  const toggleAcknowledgeAlert = useCallback((key: string) => {
    setAcknowledgedAlerts((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      try {
        localStorage.setItem("wwm.acknowledgedAlerts", JSON.stringify([...next]))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const activeAlertKeys = useMemo(() => getAllAlertKeys(result, inputs), [result, inputs])

  const acknowledgeAllAlerts = useCallback(() => {
    setAcknowledgedAlerts((prev) => {
      const next = new Set(prev)
      for (const k of activeAlertKeys) next.add(k)
      try {
        localStorage.setItem("wwm.acknowledgedAlerts", JSON.stringify([...next]))
      } catch {
        // ignore
      }
      return next
    })
  }, [activeAlertKeys])

  const unacknowledgedAlertsCount = useMemo(() => {
    return activeAlertKeys.filter((key) => !acknowledgedAlerts.has(key)).length
  }, [activeAlertKeys, acknowledgedAlerts])

  const hasUnacknowledgedAlerts = unacknowledgedAlertsCount > 0

  const TABS: {
    path: string
    label: string
    shortLabel?: string
    align?: "right"
    gapBefore?: true
    badge?: number
    pulsing?: boolean
  }[] = [
    { path: "/overview", label: t("common.overview") },
    { path: "/gear", label: t("app.gear") },
    { path: "/rotation", label: t("common.rotation") },
    { path: "/rotation-editor", label: t("rotation.rotationEditor") },
    { path: "/simulation", label: t("app.simulation") },
    { path: "/skills", label: t("app.skillEditor") },
    {
      path: "/talents",
      label: t("common.enhancementOdditiesTalents"),
      shortLabel: t("common.talentsShort", "Таланты"),
      align: "right",
    },
    { path: "/profile", label: t("common.profiles"), gapBefore: true },
  ]

  const isJustSaved = Boolean(savedAt && !isDirty)

  return (
    <div className={styles.app + (headerSettings.gameFonts ? ` ${styles.gameFonts}` : "")}>
      <DpsActivityToast hidden={isSimulationRunning} />
      <CornerToasts
        result={result}
        inputs={inputs}
        onCheckRotation={goToRotationEditorTab}
        isAlertsDnd={isAlertsDnd}
        onToggleDnd={toggleAlertsDnd}
        acknowledgedAlerts={acknowledgedAlerts}
        onAcknowledgeAlerts={acknowledgeAllAlerts}
      />
      <SimulationToast
        status={simulation.status}
        done={simulation.progress.done}
        total={simulation.progress.total}
        hasUnacknowledgedRun={acknowledgedRunCount < startedRunCount}
        onCancel={simulation.cancel}
        onAcknowledge={acknowledgeSimulation}
      />
      {wizard && (
        <SetupWizard
          mode={wizard.mode}
          initialName={wizard.defaultName}
          initialInputs={blankInputs}
          onFinish={handleWizardFinish}
          onCancel={wizard.mode === "new-profile" ? () => setWizard(null) : undefined}
        />
      )}
      {breakthroughAsk && (
        <BreakthroughDataDialog
          request={breakthroughAsk}
          onClose={() =>
            setBreakthroughAskedClassIds((asked) => [...asked, breakthroughAsk.classId])
          }
        />
      )}
      {encounterDialogOpen && (
        <EncounterSettingsDialog
          inputs={inputs}
          engineInputs={engineInputs}
          category={encounterCategory}
          onCategoryChange={setEncounterCategory}
          onChange={setInputs}
          onClose={() => setEncounterDialogOpen(false)}
        />
      )}
      {(graduationDialogOpen || mustChooseGraduationBuild) && (
        <GraduationBuildDialog
          inputs={configuredInputs}
          currentDps={graduation.currentDps}
          theoreticalDps={graduation.theoreticalDps}
          relayedTheoreticalDps={graduation.relayedTheoreticalDps}
          onFollowBuild={(graduationBuildId) => setInputs({ ...inputs, graduationBuildId })}
          onCustomBuildsChanged={setCustomGraduationBuilds}
          onClose={mustChooseGraduationBuild ? undefined : () => setGraduationDialogOpen(false)}
        />
      )}
      {shareDialogOpen && (
        <ShareBuildDialog
          inputs={shareTargetProfile ? shareTargetProfile.inputs : inputs}
          result={
            shareTargetProfile
              ? runEngine(applySetBonuses(withDerivedStats(shareTargetProfile.inputs)))
              : headerResult
          }
          defaultAuthor={
            shareTargetProfile
              ? shareTargetProfile.name.split(":")[0]?.replace(/^Сборка игрока\s*/, "")
              : undefined
          }
          defaultTitle={
            shareTargetProfile ? shareTargetProfile.name : activeRotationName(inputs) || ""
          }
          currentCloudId={currentCloudId}
          onCloudSaved={(shortId) => setCurrentCloudId(shortId)}
          onClose={() => {
            setShareDialogOpen(false)
            setShareTargetProfile(null)
          }}
        />
      )}
      {myBuildsDialogOpen && (
        <MyBuildsDialog
          onClose={() => setMyBuildsDialogOpen(false)}
          onSelectBuild={(shortId) => {
            lastLoadedCloudIdRef.current = null
            window.location.hash = `#/b/${shortId}`
          }}
        />
      )}
      <div className={styles.appHeader}>
        {hasUpdate && !updateDismissed && (
          <UpdateBanner version={serverVersion} onReload={reloadApp} onDismiss={dismissUpdate} />
        )}
        <header
          className={
            styles.appTitlebar +
            (headerSettings.collapseHeader ? ` ${styles.appTitlebarCollapsed}` : "")
          }
        >
          <div className={styles.appTitle}>
            {!headerSettings.collapseHeader ? (
              <>
                <h1>{t("app.whereWindsMeetDps")}</h1>
                <span className={styles.titleSeparator} aria-hidden="true">
                  |
                </span>
                <ChangelogButton />
              </>
            ) : (
              <div className={styles.collapsedTitleGroup}>
                <button
                  type="button"
                  className={styles.expandHeaderBtn}
                  onClick={() => updateHeaderSetting("collapseHeader", false)}
                  title={t("app.settings.expandHeader", "Развернуть шапку")}
                  aria-label={t("app.settings.expandHeader", "Развернуть шапку")}
                >
                  <span className={styles.expandChevron}>▾</span>
                  <span className={styles.collapsedTitleText}>WWM DPS</span>
                </button>
                <span className={styles.titleSeparator} aria-hidden="true">
                  |
                </span>
                <ChangelogButton />
              </div>
            )}
            {sharedBannerInfo && (
              <SharedBuildBanner
                author={sharedBannerInfo.author}
                title={sharedBannerInfo.title}
                onSave={handleSaveSharedToProfiles}
                onDismiss={handleDismissShared}
              />
            )}
          </div>
          <div className={styles.appTitlebarActions}>
            {/* Group 1: Editing & History (Work Zone) */}
            {(headerSettings.showUndoRedo || headerSettings.showSaveReset) && (
              <div className={styles.editGroup}>
                {headerSettings.showUndoRedo && (
                  <>
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      onClick={handleUndo}
                      disabled={!canUndo || isSimulationRunning}
                      title={
                        canUndo
                          ? "Отменить последнее действие (Ctrl+Z)"
                          : "История изменений пуста (Ctrl+Z)"
                      }
                      aria-label="Отменить (Ctrl+Z)"
                    >
                      <svg
                        className={styles.toolbarIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9 14 4 9l5-5" />
                        <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      onClick={handleRedo}
                      disabled={!canRedo || isSimulationRunning}
                      title={
                        canRedo
                          ? "Повторить отменённое действие (Ctrl+Y или Ctrl+Shift+Z)"
                          : "Нет действий для повтора"
                      }
                      aria-label="Повторить (Ctrl+Y)"
                    >
                      <svg
                        className={styles.toolbarIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m15 14 5-5-5-5" />
                        <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
                      </svg>
                    </button>
                  </>
                )}
                {headerSettings.showUndoRedo && headerSettings.showSaveReset && (
                  <span className={styles.groupDivider} aria-hidden="true" />
                )}
                {headerSettings.showSaveReset && (
                  <>
                    <button
                      type="button"
                      className={
                        styles.toolbarBtn +
                        ` ${styles.saveBtn}` +
                        (isDirty && !sharedBannerInfo
                          ? ` ${styles.saveBtnDirty}`
                          : isJustSaved
                            ? ` ${styles.saveBtnSaved}`
                            : "")
                      }
                      onClick={handleSave}
                      disabled={!isDirty || !!sharedBannerInfo}
                      aria-label={t("common.save")}
                      title={
                        sharedBannerInfo
                          ? t(
                              "app.saveDisabledSharedBuild",
                              "Нельзя перезаписать свой профиль чужим билдом. Сохраните его в профили с помощью кнопки «Сохранить в мои профили».",
                            )
                          : isDirty
                            ? `${t("common.save")} (Ctrl+S)`
                            : isJustSaved
                              ? t("app.saved")
                              : t("app.saved2")
                      }
                    >
                      <svg
                        className={styles.toolbarIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolbarBtn} ${styles.discardBtn}`}
                      onClick={handleReset}
                      disabled={!isDirty || isSimulationRunning}
                      aria-label={t("app.discardChanges")}
                      title={
                        isDirty
                          ? t("app.discardEditsSinceTheLast")
                          : t("app.noChangesToDiscard", "Нет несохранённых изменений")
                      }
                    >
                      <svg
                        className={styles.toolbarIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Group 2: Main Call-To-Action (Share) */}
            {headerSettings.showShare && (
              <button
                type="button"
                className={styles.shareCtaBtn}
                onClick={() => {
                  setShareTargetProfile(null)
                  setShareDialogOpen(true)
                }}
                title={t("common.shareBuild")}
                aria-label={t("common.shareBuild")}
              >
                <svg
                  className={styles.shareIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className={styles.shareBtnText}>{t("common.shareBuild")}</span>
              </button>
            )}

            {/* Group 3: Global / System Settings & User Profile (Right Edge) */}
            <div className={styles.systemGroup}>
              {headerSettings.showLanguage && <LanguageSelect inline />}
              <HeaderSettingsButton
                settings={headerSettings}
                onUpdateSetting={updateHeaderSetting}
                onResetSettings={resetHeaderSettings}
                user={currentUser}
                onOpenMyBuilds={() => setMyBuildsDialogOpen(true)}
                alertCount={unacknowledgedAlertsCount}
                hasAlerts={hasUnacknowledgedAlerts && !isAlertsDnd}
                onOpenAlerts={() => navigate("/alerts")}
              />
              {headerSettings.showProfile && (
                <UserAuthButton
                  inline
                  onOpenMyBuilds={() => setMyBuildsDialogOpen(true)}
                  onUserChanged={setCurrentUser}
                />
              )}
            </div>
          </div>
        </header>

        {!headerSettings.collapseHeader && (
          <MetricsCard
            result={headerResult}
            className={styles.headerMetrics}
            graduationPending={graduation.isPending}
            theoreticalDps={graduation.theoreticalDps}
            onGraduationClick={() => setGraduationDialogOpen(true)}
            graduationDisabled={isSimulationRunning}
            graduationBuildName={
              followedBuild
                ? followedBuild.id === customGraduationBuild?.id
                  ? `${t("gear.customGraduationBuild.custom")} - ${followedBuild.name}`
                  : t(graduationBuildKey(followedBuild.id), followedBuild.name)
                : null
            }
            rotationName={rotationName}
            onRotationClick={goToRotationTab}
            encounterTrigger={
              <EncounterSettingsTrigger
                inputs={inputs}
                onOpen={() => setEncounterDialogOpen(true)}
                disabled={isSimulationRunning}
              />
            }
          />
        )}

        <nav className={styles.tabs} role="tablist">
          {TABS.map((tab) => (
            <Fragment key={tab.path}>
              <NavLink
                to={tab.path}
                role="tab"
                ref={(node) => {
                  tabRefs.current[tab.path] = node
                }}
                className={({ isActive }) =>
                  styles.tab +
                  (isActive ? ` ${styles.active}` : "") +
                  (tab.align === "right" ? ` ${styles.tabRight}` : "") +
                  (tab.gapBefore ? ` ${styles.tabGapBefore}` : "") +
                  (tab.pulsing ? ` ${styles.tabPulsing}` : "")
                }
              >
                {tab.shortLabel ? (
                  <>
                    <span className={styles.tabFullLabel}>{tab.label}</span>
                    <span className={styles.tabShortLabel}>{tab.shortLabel}</span>
                  </>
                ) : (
                  tab.label
                )}
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <span className={styles.alertBadge}>{tab.badge}</span>
                )}
              </NavLink>
              {tab.path === "/skills" && headerSettings.collapseHeader && (
                <div
                  className={styles.compactDpsWidget}
                  title={`${t("common.totalDamage")}: ${formatCompactDamage(headerResult.totalDamage)} · ${formatNumber(headerResult.rotationDuration, 2)}s ${rotationName ? `· ${rotationName}` : ""}`}
                >
                  <span className={styles.compactDpsLabel}>DPS</span>
                  <span className={styles.compactDpsValue}>
                    {formatNumber(headerResult.dps, 0)}
                  </span>
                </div>
              )}
            </Fragment>
          ))}
        </nav>
      </div>
      <div className={styles.tabPanel}>
        <fieldset className={styles.routeFields} disabled={areInputsLocked}>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route
              path="/build"
              element={
                <OverviewTab
                  inputs={inputs}
                  configuredInputs={configuredInputs}
                  engineInputs={engineInputs}
                  onChange={setInputs}
                  result={result}
                />
              }
            />
            <Route
              path="/overview"
              element={
                <OverviewTab
                  inputs={inputs}
                  configuredInputs={configuredInputs}
                  engineInputs={engineInputs}
                  onChange={setInputs}
                  result={result}
                />
              }
            />
            <Route
              path="/gear"
              element={
                <GearTab
                  inputs={inputs}
                  configuredInputs={configuredInputs}
                  engineInputs={engineInputs}
                  customGraduationBuild={customGraduationBuild}
                  onChange={setInputs}
                  currentDps={result.dps}
                />
              }
            />
            <Route
              path="/rotation"
              element={
                <RotationTab
                  inputs={inputs}
                  engineInputs={engineInputs}
                  onChange={setInputs}
                  result={result}
                />
              }
            />
            <Route
              path="/rotation-editor"
              element={<RotationEditorPanel inputs={inputs} onChange={setInputs} result={result} />}
            />
            <Route
              path="/simulation"
              element={
                <SimulationTab
                  inputs={inputs}
                  engineInputs={engineInputs}
                  expectedDps={result.dps}
                  simulation={{ ...simulation, start: startSimulation }}
                />
              }
            />
            <Route
              path="/skills"
              element={
                <SkillsTab
                  inputs={inputs}
                  engineInputs={engineInputs}
                  customSkills={customSkills}
                  onCustomSkillsChange={changeCustomSkills}
                  customBuffs={customBuffs}
                  customDebuffs={customDebuffs}
                />
              }
            />
            <Route
              path="/alerts"
              element={
                <AlertsTab
                  result={result}
                  inputs={inputs}
                  isDnd={isAlertsDnd}
                  onToggleDnd={toggleAlertsDnd}
                  acknowledgedAlerts={acknowledgedAlerts}
                  onToggleAcknowledge={toggleAcknowledgeAlert}
                  onAcknowledgeAll={acknowledgeAllAlerts}
                />
              }
            />
            <Route path="/buffs" element={<Navigate to="/skills" replace />} />
            <Route path="/debuffs" element={<Navigate to="/skills" replace />} />
            <Route
              path="/talents"
              element={<TalentsOdditiesTab inputs={inputs} onChange={setInputs} />}
            />
            <Route path="/oddities" element={<Navigate to="/talents" replace />} />
            <Route
              path="/profile"
              element={
                <div className="panel">
                  <ProfilePanel
                    profiles={committed.profiles}
                    activeId={committed.activeId}
                    customSkills={customSkills}
                    customBuffs={customBuffs}
                    customDebuffs={customDebuffs}
                    onCreate={createProfile}
                    onSelect={selectProfile}
                    onRename={renameProfile}
                    onDuplicate={duplicateProfile}
                    onDelete={deleteProfile}
                    onImport={handleImportProfile}
                    onShare={(prof) => {
                      setShareTargetProfile(prof)
                      setShareDialogOpen(true)
                    }}
                  />
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </fieldset>
      </div>
    </div>
  )
}

export function App() {
  return (
    <HashRouter>
      <I18nProvider>
        <ConfirmProvider>
          <AppInner />
        </ConfirmProvider>
      </I18nProvider>
    </HashRouter>
  )
}
