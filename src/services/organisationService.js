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

export const listOrganisations = (token) =>
  handle(fetch(`${API_BASE}/api/organisations`, { headers: authHeaders(token) }))

export const getOrganisation = (token, id) =>
  handle(fetch(`${API_BASE}/api/organisations/${id}`, { headers: authHeaders(token) }))
