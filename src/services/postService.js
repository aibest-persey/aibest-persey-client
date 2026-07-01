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
