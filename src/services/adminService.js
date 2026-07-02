import { API_BASE, authHeaders, handle } from "./apiClient.js"

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

export const verifyOrganisation = (token, id) =>
  handle(fetch(`${API_BASE}/api/admin/organisations/${id}/verify`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))

export const adminDeleteOrganisation = (token, id) =>
  handle(fetch(`${API_BASE}/api/admin/organisations/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }))
