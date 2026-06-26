const TOKEN_KEY = "persey_auth_token"
const USER_KEY = "persey_auth_user"

/**
 * Persist the token and user object after a successful login.
 * @param {string} token  JWT returned by the backend
 * @param {object} user   Public user object returned by the backend
 * @param {boolean} remember  If true, use localStorage (survives tab close).
 *                            If false, use sessionStorage (cleared when tab closes).
 */
export function saveSession(token, user, remember = true) {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Retrieve the stored JWT (checks localStorage first, then sessionStorage).
 * @returns {string | null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

/**
 * Retrieve the stored user object.
 * @returns {object | null}
 */
export function getUser() {
  const raw =
    localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Clear the session from both storages (logout).
 */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

/**
 * Returns true if a token exists in any storage.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Boolean(getToken())
}
