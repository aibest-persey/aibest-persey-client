import { API_BASE, authHeaders, handle } from "./apiClient.js"

export const listOrganisations = (token) =>
  handle(fetch(`${API_BASE}/api/organisations`, { headers: authHeaders(token) }))

export const getOrganisation = (token, id) =>
  handle(fetch(`${API_BASE}/api/organisations/${id}`, { headers: authHeaders(token) }))

export const createOrganisation = (token, data) =>
  handle(fetch(`${API_BASE}/api/organisations`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }))

export const updateOrganisation = (token, id, data) =>
  handle(fetch(`${API_BASE}/api/organisations/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }))

export const requestToJoinOrganisation = (token, orgId) =>
  handle(fetch(`${API_BASE}/api/organisations/${orgId}/join-requests`, {
    method: "POST",
    headers: authHeaders(token),
  }))

export const getMyJoinRequests = (token) =>
  handle(fetch(`${API_BASE}/api/organisations/join-requests/my`, { headers: authHeaders(token) }))

export const listOrgJoinRequests = (token, orgId) =>
  handle(fetch(`${API_BASE}/api/organisations/${orgId}/join-requests`, { headers: authHeaders(token) }))

export const approveJoinRequest = (token, orgId, reqId) =>
  handle(fetch(`${API_BASE}/api/organisations/${orgId}/join-requests/${reqId}/approve`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))

export const rejectJoinRequest = (token, orgId, reqId) =>
  handle(fetch(`${API_BASE}/api/organisations/${orgId}/join-requests/${reqId}/reject`, {
    method: "PATCH",
    headers: authHeaders(token),
  }))
