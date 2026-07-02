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

export const listNotifications = (token) =>
  handle(fetch(`${API_BASE}/api/notifications`, { headers: authHeaders(token) }))

export const markNotificationRead = (token, id) =>
  handle(fetch(`${API_BASE}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))
