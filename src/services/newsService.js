import { API_BASE, authHeaders, handle } from "./apiClient.js"

export const listNews = (token, params = {}) => {
  const q = new URLSearchParams()
  if (params.scope) q.set("scope", params.scope)
  if (params.organisationId) q.set("organisationId", params.organisationId)
  if (params.clubId) q.set("clubId", params.clubId)
  const qs = q.toString() ? `?${q}` : ""
  return handle(fetch(`${API_BASE}/api/news${qs}`, { headers: authHeaders(token) }))
}

export const getNews = (token, id) =>
  handle(fetch(`${API_BASE}/api/news/${id}`, { headers: authHeaders(token) }))
