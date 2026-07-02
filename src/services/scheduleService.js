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

export const getSchedule = (token, { date } = {}) => {
  const q = new URLSearchParams()
  if (date) q.set("date", date)
  const qs = q.toString() ? `?${q}` : ""
  return handle(fetch(`${API_BASE}/api/schedule${qs}`, { headers: authHeaders(token) }))
}
