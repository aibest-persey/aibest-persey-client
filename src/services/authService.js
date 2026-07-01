// In dev, Vite proxies /api/* → http://localhost:3000 (see vite.config.js).
// In production the backend serves the frontend from the same origin, so
// relative paths work natively. No hardcoded host needed.
const API_BASE = import.meta.env.VITE_API_URL ?? ""

/**
 * Register a new user.
 * @param {{ firstName?: string, lastName?: string, username: string, email: string, password: string }} data
 * @returns {Promise<{ message: string }>}
 * @throws {Error} with a human-readable message on 4xx / 5xx
 */
export async function registerUser(data) {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json.message ?? "Something went wrong. Please try again.")
  }

  return json
}

/**
 * Log in an existing user.
 * @param {{ identifier: string, password: string }} data
 * @returns {Promise<{ message: string, token: string, user: object }>}
 * @throws {Error} with a human-readable message on 4xx / 5xx
 */
export async function loginUser(data) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json.message ?? "Something went wrong. Please try again.")
  }

  return json
}

/**
 * Retrieve the current authenticated user's details.
 * @param {string} token JWT token
 * @returns {Promise<object>}
 * @throws {Error}
 */
export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(json.message ?? "Failed to fetch user session.")
    error.status = response.status
    throw error
  }

  return json
}

/**
 * Update the current user's profile details on the backend.
 * @param {string} token JWT token
 * @param {{ firstName?: string, lastName?: string, bio?: string, logoUrl?: string }} data
 * @returns {Promise<object>}
 */
export async function updateUserProfile(token, data) {
  const response = await fetch(`${API_BASE}/api/organisers/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json.message ?? "Failed to update profile.")
  }

  return json
}


