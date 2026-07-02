import { API_BASE, authHeaders, handle } from "./apiClient.js"

export const sendMessage = (token, { receiverId, subject, content }) =>
  handle(fetch(`${API_BASE}/api/messages`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ receiverId, subject, content }),
  }))

export const getInbox = (token) =>
  handle(fetch(`${API_BASE}/api/messages/inbox`, { headers: authHeaders(token) }))

export const getSent = (token) =>
  handle(fetch(`${API_BASE}/api/messages/sent`, { headers: authHeaders(token) }))

export const markRead = (token, id) =>
  handle(fetch(`${API_BASE}/api/messages/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))
