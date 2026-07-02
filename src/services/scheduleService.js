import { API_BASE, authHeaders, handle } from "./apiClient.js"

export const getSchedule = (token, { date } = {}) => {
  const q = new URLSearchParams()
  if (date) q.set("date", date)
  const qs = q.toString() ? `?${q}` : ""
  return handle(fetch(`${API_BASE}/api/schedule${qs}`, { headers: authHeaders(token) }))
}
