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

export const sendMessage = (token, { receiverId, subject, content }) =>
  handle(fetch(`${API_BASE}/api/messages`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ receiverId, subject, content }),
  }))

export const getInbox = (token) =>
  handle(fetch(`${API_BASE}/api/messages/inbox`, { headers: authHeaders(token) }))

export const getSent = (token) =>
  handle(fetch(`${API_BASE}/api/messages/sent`, { headers: authHeaders(token) }))

export const markRead = (token, id) =>
  handle(fetch(`${API_BASE}/api/messages/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))
