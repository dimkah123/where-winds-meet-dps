import { useEffect, useRef, useState } from "react"
import {
  checkCurrentSession,
  clearStoredSession,
  getStoredSession,
  GOOGLE_CLIENT_ID,
  loadGisScript,
  loginWithCredential,
} from "../../../cloud/auth"
import type { UserProfile } from "../../../cloud/types"
import { useI18n } from "../../../i18n/i18nContext"
import styles from "./UserAuthButton.module.scss"

interface Props {
  onOpenMyBuilds: () => void
  onUserChanged?: (user: UserProfile | null) => void
  inline?: boolean
}

export function UserAuthButton({ onOpenMyBuilds, onUserChanged, inline }: Props) {
  const { t } = useI18n()
  const [user, setUser] = useState<UserProfile | null>(() => getStoredSession().userProfile)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hiddenBtnRef = useRef<HTMLDivElement>(null)

  // Verify session on mount
  useEffect(() => {
    checkCurrentSession().then((verified) => {
      setUser(verified)
      onUserChanged?.(verified)
    })
  }, [onUserChanged])

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isDropdownOpen])

  // Setup Google Identity Services
  useEffect(() => {
    loadGisScript().then(() => {
      if (!window.google?.accounts?.id) return

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (response.credential) {
              setIsLoading(true)
              try {
                const profile = await loginWithCredential(response.credential)
                setUser(profile)
                onUserChanged?.(profile)
              } catch (err) {
                console.error("Login failed:", err)
                alert(
                  "Ошибка входа через Google: " +
                    (err instanceof Error ? err.message : String(err)),
                )
              } finally {
                setIsLoading(false)
              }
            }
          },
        })

        if (hiddenBtnRef.current) {
          window.google.accounts.id.renderButton(hiddenBtnRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
          })
        }
      } catch (e) {
        console.error("GIS init error:", e)
      }
    })
  }, [onUserChanged])

  function handleLoginClick() {
    setIsLoading(true)
    loadGisScript().then(() => {
      setIsLoading(false)
      if (window.google?.accounts?.id?.prompt) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One Tap popup was skipped or blocked, click the rendered Google button
            const realBtn = hiddenBtnRef.current?.querySelector(
              'div[role="button"]',
            ) as HTMLElement | null
            if (realBtn) {
              realBtn.click()
            }
          }
        })
      }
    })
  }

  function handleLogout() {
    clearStoredSession()
    setUser(null)
    setIsDropdownOpen(false)
    onUserChanged?.(null)
  }

  return (
    <div className={styles.authContainer + (inline ? ` ${styles.inline}` : "")} ref={dropdownRef}>
      {/* Hidden button container for GIS fallback */}
      <div ref={hiddenBtnRef} className={styles.hiddenGoogleBtn} />

      {user ? (
        <>
          <button
            type="button"
            className={styles.userBtn}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            title={user.name || user.email}
            aria-label="Профиль пользователя"
          >
            {user.picture ? (
              <img src={user.picture} alt="" className={styles.avatar} />
            ) : (
              <span className={styles.avatarPlaceholder}>
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </span>
            )}
            <span className={styles.userName}>{user.name?.split(" ")[0] || "User"}</span>
            <span className={styles.caret}>▾</span>
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.userInfo}>
                <div className={styles.infoName}>{user.name}</div>
                <div className={styles.infoEmail}>{user.email}</div>
              </div>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  setIsDropdownOpen(false)
                  onOpenMyBuilds()
                }}
              >
                📁 {t("share.cloud.myBuilds", "Мои сборки")}
              </button>
              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                🚪 {t("share.cloud.logout", "Выйти")}
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          className={styles.loginBtn}
          onClick={handleLoginClick}
          disabled={isLoading}
          title="Войти через Google для синхронизации сборок"
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.29 21.43 7.37 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.02-3.09z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.57 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
            />
          </svg>
          <span>{isLoading ? "..." : t("share.cloud.login", "Войти")}</span>
        </button>
      )}
    </div>
  )
}
