/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react"
import { getToken, getUser, saveSession, clearSession } from "../utils/tokenStorage.js"

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

  const login = (newToken, newUser, remember = true) => {
    const decoded = decodeToken(newToken)
    const userWithRole = { ...newUser, role: decoded?.role || "student" }
    saveSession(newToken, userWithRole, remember)
    setToken(newToken)
    setUser(userWithRole)
  }

  const logout = () => {
    clearSession()
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = Boolean(token)

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

