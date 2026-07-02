import { API_BASE, authHeaders, handle } from "./apiClient.js"

export const listNotifications = (token) =>
  handle(fetch(`${API_BASE}/api/notifications`, { headers: authHeaders(token) }))

export const markNotificationRead = (token, id) =>
  handle(fetch(`${API_BASE}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))
