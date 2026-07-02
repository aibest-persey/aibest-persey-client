import { API_BASE, handle } from "./apiClient.js"

// Distinct from apiClient's handle() callers — this one sends multipart
// FormData, not JSON, so it can't use authHeaders() (that sets
// Content-Type: application/json, which would break the multipart boundary).
export const uploadImage = (token, file) => {
  const formData = new FormData()
  formData.append("image", file)
  return handle(fetch(`${API_BASE}/api/uploads/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }))
}

// Resolves a possibly-relative image URL (e.g. "/uploads/xxx.jpg" from our
// own server) against API_BASE, while leaving already-absolute URLs
// (https://picsum.photos/...) untouched.
export function resolveImageUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `${API_BASE}${url}`
}
