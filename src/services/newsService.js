const API_BASE = import.meta.env.VITE_API_URL ?? ""

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

async function handle(promise) {
  const response = await promise
  const json = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(json.message ?? "Something went wrong.")
  return json
}

export const listNews = (token, params = {}) => {
  const q = new URLSearchParams()
  if (params.scope) q.set("scope", params.scope)
  if (params.organisationId) q.set("organisationId", params.organisationId)
  if (params.clubId) q.set("clubId", params.clubId)
  const qs = q.toString() ? `?${q}` : ""
  return handle(fetch(`${API_BASE}/api/news${qs}`, { headers: authHeaders(token) }))
}
