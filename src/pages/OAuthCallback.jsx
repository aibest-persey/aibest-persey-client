import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { fetchCurrentUser } from "../services/authService.js"

// AuthContext.jsx has an identical, unexported decodeToken helper — the app's own JWTs
// carry `role`, which none of the /api/auth/* response bodies include, so the redirect
// decision here needs it decoded directly rather than read off the fetched user object.
function decodeRole(token) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64))
    return payload?.role
  } catch {
    return null
  }
}

export default function OAuthCallback() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const run = async () => {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash
      const token = new URLSearchParams(hash).get("token")

      // Scrub the token out of the URL immediately so it never lingers in browser history.
      window.history.replaceState(null, "", window.location.pathname)

      if (!token) {
        navigate("/sign-in?oauthError=missing_token", { replace: true })
        return
      }

      try {
        const user = await fetchCurrentUser(token)
        login(token, user, true)
        navigate(decodeRole(token) === "admin" ? "/admin" : "/home", { replace: true })
      } catch {
        navigate("/sign-in?oauthError=session_failed", { replace: true })
      }
    }

    run()
  }, [navigate, login])

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8f9fc",
      fontFamily: "sans-serif",
      color: "#747688"
    }}>
      <div style={{
        width: "32px",
        height: "32px",
        border: "3.5px solid #e2e5f1",
        borderTopColor: "#5669ff",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        marginBottom: "12px"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span>Signing you in...</span>
    </div>
  )
}
