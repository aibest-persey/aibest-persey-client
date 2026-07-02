import { API_BASE, authHeaders, handle } from "./apiClient.js"

export const listClubs = (token) =>
  handle(fetch(`${API_BASE}/api/clubs`, { headers: authHeaders(token) }))

export const getClub = (token, id) =>
  handle(fetch(`${API_BASE}/api/clubs/${id}`, { headers: authHeaders(token) }))

export const createClub = (token, data) =>
  handle(fetch(`${API_BASE}/api/clubs`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }))

export const updateClub = (token, id, data) =>
  handle(fetch(`${API_BASE}/api/clubs/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }))

export const joinClub = (token, id) =>
  handle(fetch(`${API_BASE}/api/clubs/${id}/join`, {
    method: "POST",
    headers: authHeaders(token),
  }))

export const leaveClub = (token, id) =>
  handle(fetch(`${API_BASE}/api/clubs/${id}/join`, {
    method: "DELETE",
    headers: authHeaders(token),
  }))
