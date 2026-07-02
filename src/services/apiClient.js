export const API_BASE = import.meta.env.VITE_API_URL ?? ""

export function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

// Shared fetch-response handler for every resource service (events, clubs,
// organisations, admin, etc). Attaches the HTTP status to the thrown Error so
// callers can distinguish a 403 (permission denied) from a validation 400 or
// a 500 — see utils/errorMessage.js for the shared "graceful 403" copy.
export async function handle(promise) {
  const response = await promise
  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(json.message ?? "Something went wrong.")
    error.status = response.status
    throw error
  }
  return json
}
