interface IconProps {
  className?: string
  size?: number
}

export function DownloadIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 2.5v7.5m0 0l-3-3m3 3l3-3" />
      <path d="M2.5 11.5v1a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5v-1.5" />
    </svg>
  )
}

export function TargetIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15" />
    </svg>
  )
}

export function StopwatchIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 1.5h4M8 1.5v2" />
      <circle cx="8" cy="9.5" r="5.5" />
      <path d="M8 9.5V6.5l2 1" />
    </svg>
  )
}

export function GearIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" />
    </svg>
  )
}

export function ResetIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 7.5a5.5 5.5 0 111.3 3.5" />
      <path d="M2.5 3.5v4h4" />
    </svg>
  )
}

export function PlayIcon({ className, size = 13 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <polygon points="4.5,2.5 13.5,8 4.5,13.5" />
    </svg>
  )
}

export function PauseIcon({ className, size = 13 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
    </svg>
  )
}

export function CloseIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  )
}

export function FlameIcon({ className, size = 13 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 1.5c.2 2-1.7 3.2-1.9 5.2-.2 2 1.3 3.3 1.4 3.3s-.3-1.1.5-2.1c1.1 1.4 2.4 2.4 2.4 4.4 0 2.1-1.7 3.3-3.3 3.3-2.6 0-4.6-1.9-4.6-4.7 0-3.3 2.6-5 3.3-7.1.4.9 1 1.6 1.4 1.9.8-1.5 1-3.4.8-4.2z" />
    </svg>
  )
}

export function PopoutIcon({ className, size = 13 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5V9" />
      <path d="M9.5 2h4.5v4.5" />
      <path d="M14 2L7.5 8.5" />
    </svg>
  )
}

export function KeyboardIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="M4.5 6.5h.01M7 6.5h.01M9.5 6.5h.01M11.5 6.5h.01M5 9.5h6" strokeWidth="1.6" />
    </svg>
  )
}

export function PlugIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5.5 2v3M10.5 2v3" />
      <path d="M4 5h8v3a4 4 0 01-8 0V5z" />
      <path d="M8 11v3" />
    </svg>
  )
}

export function ArchiveIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 3.5h11v2.5h-11z" />
      <path d="M3.5 6v7.5h9V6" />
      <path d="M6.5 8.5h3" />
    </svg>
  )
}

export function DocumentIcon({ className, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 2.5h5.5l3.5 3.5V13.5H4z" />
      <path d="M9.5 2.5V6H13" />
      <path d="M6 9h4M6 11.5h3" />
    </svg>
  )
}
