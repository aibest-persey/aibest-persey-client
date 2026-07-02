import { API_BASE, authHeaders, handle } from "./apiClient.js"

export const listPosts = (token, clubId) =>
  handle(fetch(`${API_BASE}/api/posts?clubId=${clubId}`, { headers: authHeaders(token) }))

export const createPost = (token, { clubId, content }) =>
  handle(fetch(`${API_BASE}/api/posts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ clubId, content }),
  }))

export const deletePost = (token, id) =>
  handle(fetch(`${API_BASE}/api/posts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }))
