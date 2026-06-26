/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react"
import { getToken, getUser, saveSession, clearSession } from "../utils/tokenStorage.js"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(() => getUser())

  const login = (newToken, newUser, remember = true) => {
    saveSession(newToken, newUser, remember)
    setToken(newToken)
    setUser(newUser)
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
