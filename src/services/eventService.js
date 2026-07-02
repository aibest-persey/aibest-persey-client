import { API_BASE, authHeaders, handle } from "./apiClient.js"

export const listEvents = (token, params = {}) => {
  const q = new URLSearchParams()
  if (params.upcoming) q.set("upcoming", "true")
  if (params.status) q.set("status", params.status)
  if (params.clubId) q.set("clubId", params.clubId)
  const qs = q.toString() ? `?${q}` : ""
  return handle(fetch(`${API_BASE}/api/events${qs}`, { headers: authHeaders(token) }))
}

export const getEvent = (token, id) =>
  handle(fetch(`${API_BASE}/api/events/${id}`, { headers: authHeaders(token) }))

export const createEvent = (token, data) =>
  handle(fetch(`${API_BASE}/api/events`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }))

export const updateEvent = (token, id, data) =>
  handle(fetch(`${API_BASE}/api/events/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }))

export const publishEvent = (token, id) =>
  handle(fetch(`${API_BASE}/api/events/${id}/publish`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))

export const unpublishEvent = (token, id) =>
  handle(fetch(`${API_BASE}/api/events/${id}/unpublish`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))

export const cancelEvent = (token, id) =>
  handle(fetch(`${API_BASE}/api/events/${id}/cancel`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))

export const deleteEvent = (token, id) =>
  handle(fetch(`${API_BASE}/api/events/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }))

export const registerForEvent = (token, id) =>
  handle(fetch(`${API_BASE}/api/events/${id}/register`, {
    method: "POST",
    headers: authHeaders(token),
  }))

export const cancelRegistration = (token, id) =>
  handle(fetch(`${API_BASE}/api/events/${id}/register`, {
    method: "DELETE",
    headers: authHeaders(token),
  }))

export const getMyRegistrations = (token) =>
  handle(fetch(`${API_BASE}/api/events/my-registrations`, { headers: authHeaders(token) }))

export const getTicket = (token, id) =>
  handle(fetch(`${API_BASE}/api/events/${id}/ticket`, { headers: authHeaders(token) }))

export const getParticipants = (token, id) =>
  handle(fetch(`${API_BASE}/api/events/${id}/participants`, { headers: authHeaders(token) }))
