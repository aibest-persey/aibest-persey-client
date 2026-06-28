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

export const submitRoleRequest = (token, reason) =>
  handle(fetch(`${API_BASE}/api/role-requests`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  }))

export const getMyRoleRequests = (token) =>
  handle(fetch(`${API_BASE}/api/role-requests/my`, { headers: authHeaders(token) }))

export const listPendingRequests = (token) =>
  handle(fetch(`${API_BASE}/api/role-requests/pending`, { headers: authHeaders(token) }))

export const listAllRoleRequests = (token) =>
  handle(fetch(`${API_BASE}/api/role-requests`, { headers: authHeaders(token) }))

export const approveRoleRequest = (token, id) =>
  handle(fetch(`${API_BASE}/api/role-requests/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))

export const rejectRoleRequest = (token, id) =>
  handle(fetch(`${API_BASE}/api/role-requests/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))
