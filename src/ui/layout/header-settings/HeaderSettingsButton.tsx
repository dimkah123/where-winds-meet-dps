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
        ⚙️
      </button>

      {open && (
        <div
          className={styles.popover}
          role="dialog"
          aria-label={t("app.settings.title", "Настройки интерфейса")}
        >
          <div className={styles.popoverHeader}>
            <span className={styles.popoverTitle}>
              ⚙️ {t("app.settings.title", "Настройки интерфейса")}
            </span>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label={t("common.close", "Закрыть")}
            >
              ✕
            </button>
          </div>

          <div className={styles.sectionTitle}>
            {t("app.settings.toolbarElements", "Отображение в шапке")}
          </div>

          <div className={styles.sectionBody}>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showProfile}
                onChange={(e) => onUpdateSetting("showProfile", e.target.checked)}
              />
              <span className={styles.settingLabel}>
                {t("app.settings.showProfile", "Профиль и вход в аккаунт")}
              </span>
            </label>

            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showShare}
                onChange={(e) => onUpdateSetting("showShare", e.target.checked)}
              />
              <span className={styles.settingLabel}>
                {t("app.settings.showShare", "Кнопка «Поделиться» (🔗)")}
              </span>
            </label>

            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showUndoRedo}
                onChange={(e) => onUpdateSetting("showUndoRedo", e.target.checked)}
              />
              <span className={styles.settingLabel}>
                {t("app.settings.showUndoRedo", "Кнопки отмены и повтора (↶ ↷ Ctrl+Z)")}
              </span>
            </label>

            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showSaveReset}
                onChange={(e) => onUpdateSetting("showSaveReset", e.target.checked)}
              />
              <span className={styles.settingLabel}>
                {t("app.settings.showSaveReset", "Кнопки сохранения и сброса (💾 ↺)")}
              </span>
            </label>
          </div>

          <div className={styles.note}>
            ℹ️{" "}
            {t(
              "app.settings.shortcutsNote",
              "Горячие клавиши Ctrl+Z, Ctrl+Y и Ctrl+S активны всегда.",
            )}
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
