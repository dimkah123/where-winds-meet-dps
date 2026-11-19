import { useEffect, useRef, useState } from "react"
import type { UserProfile } from "../../../cloud/types"
import { useI18n } from "../../../i18n/i18nContext"
import type { HeaderSettings } from "../../hooks/useHeaderSettings"
import styles from "./HeaderSettingsButton.module.scss"

interface Props {
  settings: HeaderSettings
  onUpdateSetting: <K extends keyof HeaderSettings>(key: K, value: HeaderSettings[K]) => void
  onResetSettings: () => void
  user?: UserProfile | null
  onOpenMyBuilds?: () => void
}

interface ToggleRowProps {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleRow({ label, hint, checked, onChange }: ToggleRowProps) {
  return (
    <label className={styles.settingRow}>
      <div className={styles.settingInfo}>
        <span className={styles.settingLabel}>{label}</span>
        {hint && <span className={styles.settingHint}>{hint}</span>}
      </div>
      <div className={styles.switchTrack + (checked ? ` ${styles.checked}` : "")}>
        <div className={styles.switchKnob}>
          <div className={styles.knobDot} />
        </div>
      </div>
      <input
        type="checkbox"
        className={styles.hiddenInput}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

export function HeaderSettingsButton({
  settings,
  onUpdateSetting,
  onResetSettings,
  user,
  onOpenMyBuilds,
}: Props) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.settingsTrigger + (open ? ` ${styles.active}` : "")}
        onClick={() => setOpen((prev) => !prev)}
        title={t("app.settings.title", "Настройки интерфейса")}
        aria-label={t("app.settings.title", "Настройки интерфейса")}
        aria-expanded={open}
      >
        <svg className={styles.gearIcon} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          className={styles.popover}
          role="dialog"
          aria-label={t("app.settings.title", "Настройки интерфейса")}
        >
          <div className={styles.popoverHeader}>
            <div className={styles.popoverTitleRow}>
              <svg
                className={styles.headerGearIcon}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={styles.popoverTitle}>
                {t("app.settings.title", "Настройки интерфейса")}
              </span>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label={t("common.close", "Закрыть")}
            >
              ✕
            </button>
          </div>

          <div className={styles.sectionTitle}>{t("app.settings.layout", "Макет интерфейса")}</div>
          <div className={styles.sectionBody}>
            <ToggleRow
              label={t("app.settings.collapseHeader", "Свернуть шапку (компактный вид)")}
              hint={t(
                "app.settings.collapseHeaderHint",
                "Скрывает блок DPS и название; DPS отображается у алертов.",
              )}
              checked={settings.collapseHeader}
              onChange={(v) => onUpdateSetting("collapseHeader", v)}
            />
          </div>

          <div className={styles.sectionTitle}>
            {t("app.settings.toolbarElements", "Отображение в шапке")}
          </div>

          <div className={styles.sectionBody}>
            <ToggleRow
              label={t("app.settings.showProfile", "Профиль и вход в аккаунт")}
              checked={settings.showProfile}
              onChange={(v) => onUpdateSetting("showProfile", v)}
            />

            <ToggleRow
              label={t("app.settings.showShare", "Кнопка «Поделиться» (🔗)")}
              checked={settings.showShare}
              onChange={(v) => onUpdateSetting("showShare", v)}
            />

            <ToggleRow
              label={t("app.settings.showUndoRedo", "Кнопки отмены и повтора (↶ ↷ Ctrl+Z)")}
              checked={settings.showUndoRedo}
              onChange={(v) => onUpdateSetting("showUndoRedo", v)}
            />

            <ToggleRow
              label={t("app.settings.showSaveReset", "Кнопки сохранения и сброса (💾 ↺)")}
              checked={settings.showSaveReset}
              onChange={(v) => onUpdateSetting("showSaveReset", v)}
            />
          </div>

          <div className={styles.note}>
            <span className={styles.noteIcon}>✦</span>
            <span>
              {t(
                "app.settings.shortcutsNote",
                "Горячие клавиши Ctrl+Z, Ctrl+Y и Ctrl+S активны всегда.",
              )}
            </span>
          </div>

          {!settings.showProfile && user && (
            <div className={styles.accountSection}>
              <div className={styles.sectionTitle}>{t("app.settings.account", "Аккаунт")}</div>
              <div className={styles.userRow}>
                {user.picture ? (
                  <img src={user.picture} alt="" className={styles.userAvatar} />
                ) : (
                  <span className={styles.avatarPlaceholder}>
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className={styles.userNameText} title={user.name || user.email}>
                  {user.name || user.email}
                </span>
                {onOpenMyBuilds && (
                  <button
                    type="button"
                    className={styles.myBuildsBtn}
                    onClick={() => {
                      setOpen(false)
                      onOpenMyBuilds()
                    }}
                  >
                    📁 {t("share.cloud.myBuilds", "Мои сборки")}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={styles.popoverFooter}>
            <button type="button" className={styles.resetBtn} onClick={onResetSettings}>
              {t("app.settings.resetDefaults", "Сбросить по умолчанию")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
