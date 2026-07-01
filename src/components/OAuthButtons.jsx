import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { getOAuthUrl } from "../services/authService.js"

const PROVIDERS = [
  { id: "google", label: "Google", icon: GoogleIcon, enabled: true },
  { id: "microsoft", label: "Microsoft", icon: MicrosoftIcon, enabled: false },
  { id: "apple", label: "Apple", icon: AppleIcon, enabled: false },
]

const OAUTH_ERROR_MESSAGES = {
  access_denied: "Sign-in was cancelled.",
  not_configured: "That sign-in option isn't available yet.",
  invalid_state: "Something went wrong, please try again.",
  oauth_failed: "Something went wrong, please try again.",
}

export default function OAuthButtons() {
  const [message, setMessage] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const oauthError = searchParams.get("oauthError")
    if (!oauthError) return
    setMessage(OAUTH_ERROR_MESSAGES[oauthError] ?? "Something went wrong, please try again.")
    const next = new URLSearchParams(searchParams)
    next.delete("oauthError")
    next.delete("provider")
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(""), 2200)
    return () => clearTimeout(timer)
  }, [message])

  const handleClick = (id, label, enabled) => {
    if (enabled) {
      window.location.assign(getOAuthUrl(id))
      return
    }
    setMessage(`${label} sign-in is coming soon.`)
  }

  return (
    <div className="oauth-wrap">
      <div className="oauth-row">
        {PROVIDERS.map(({ id, label, icon: Icon, enabled }) => (
          <button
            key={id}
            type="button"
            className="oauth-btn"
            aria-label={enabled ? `Continue with ${label}` : `Continue with ${label} (coming soon)`}
            onClick={() => handleClick(id, label, enabled)}
          >
            <Icon />
          </button>
        ))}
      </div>
      {message ? <div className="oauth-toast" role="status">{message}</div> : null}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F35325" />
      <rect x="12" y="1" width="10" height="10" fill="#81BC06" />
      <rect x="1" y="12" width="10" height="10" fill="#05A6F0" />
      <rect x="12" y="12" width="10" height="10" fill="#FFBA08" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width={20} height={22} viewBox="0 0 24 24" fill="#000000" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.014-.1-.04-.31-.04-.52 0-1.14.572-2.27 1.206-2.98.804-.94 2.147-1.64 3.248-1.68.03.13.05.34.05.56zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.926 2.71-3.463 2.71-1.537 0-1.93-.94-3.72-.94-1.741 0-2.35.97-3.759.97-1.409 0-2.436-1.32-3.386-2.65-1.966-2.77-3.462-7.83-1.443-11.25 1.004-1.71 2.804-2.79 4.76-2.82 1.44-.02 2.35.98 3.548.98 1.166 0 1.933-.98 3.72-.98 1.19 0 2.485.68 3.478 1.85-3.058 1.68-2.56 6.02.783 8.01z" />
    </svg>
  )
}
