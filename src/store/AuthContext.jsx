/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from "react"
import { getToken, getUser, saveSession, clearSession } from "../utils/tokenStorage.js"
import { fetchCurrentUser } from "../services/authService.js"

export const AuthContext = createContext(null)

function decodeToken(token) {
  if (!token) return null
  try {
    const base64Url = token.split(".")[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error("Token decoding failed:", e)
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(() => {
    const u = getUser()
    const t = getToken()
    if (u && t) {
      const decoded = decodeToken(t)
      if (decoded?.role) {
        return { ...u, role: decoded.role }
      }
    }
    return u
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = (newToken, newUser, remember = true) => {
    const decoded = decodeToken(newToken)
    const userWithRole = { ...newUser, role: decoded?.role || "student" }
    saveSession(newToken, userWithRole, remember)
    setToken(newToken)
    setUser(userWithRole)
  }

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const syncUserSession = async () => {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const userData = await fetchCurrentUser(token)
        const decoded = decodeToken(token)
        const userWithRole = { ...userData, role: decoded?.role || "student" }
        saveSession(token, userWithRole)
        setUser(userWithRole)
      } catch (err) {
        console.error("Sync user session failed:", err)
        setError(err.message || "Failed to retrieve user profile.")
        if (err.status === 401 || err.status === 403) {
          logout()
        }
      } finally {
        setLoading(false)
      }
    }

    syncUserSession()
  }, [token, logout])

  const isAuthenticated = Boolean(token)

  /**
   * 🎯 TICKET #31 Acceptance Criteria: UI reads effective permissions from the session/me endpoint
   * Determines effective permissions globally across components based on current user session role strings
   */
  const getEffectivePermissions = () => {
    if (!user) {
      return {
        canCreateEvent: false,
        canManageMembers: false,
        canVerifyOrg: false,
        canDeleteEvent: false,
        isAdmin: false,
        isOrganiser: false,
      }
    }

    const role = user.role

    return {
      canCreateEvent: role === "organiser" || role === "admin",
      canManageMembers: role === "organiser" || role === "admin",
      canDeleteEvent: role === "organiser" || role === "admin",
      canVerifyOrg: role === "admin", // Admin-only management surfaces gated
      isAdmin: role === "admin",
      isOrganiser: role === "organiser",
    }
  }

  const permissions = getEffectivePermissions()

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, loading, error, ...permissions }}>
      {children}
    </AuthContext.Provider>
  )
}
