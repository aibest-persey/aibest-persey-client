const API_BASE = import.meta.env.VITE_API_URL ?? ""

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

async function handle(promise) {
  const res = await promise
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message ?? "Something went wrong.")
  return json
}

export const listUsers = (token) =>
  handle(fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders(token) }))

export const setUserRole = (token, id, role) =>
  handle(fetch(`${API_BASE}/api/admin/users/${id}/role`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ role }),
  }))

export const listAllEvents = (token) =>
  handle(fetch(`${API_BASE}/api/admin/events`, { headers: authHeaders(token) }))

export const adminCancelEvent = (token, id) =>
  handle(fetch(`${API_BASE}/api/admin/events/${id}/cancel`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))

export const adminDeleteEvent = (token, id) =>
  handle(fetch(`${API_BASE}/api/admin/events/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }))
