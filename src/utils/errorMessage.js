// Turns a caught service-layer error into UI copy. Every service's handle()
// (see services/apiClient.js) attaches `.status` to the thrown Error, so a
// 403 can be told apart from a validation 400 or a 500 here — this is the
// one place that decides what a permission failure looks like to the user,
// instead of every page inventing its own fallback string.
export function getErrorMessage(err, fallback = "Something went wrong.") {
  if (!err) return fallback

  if (err.status === 403) {
    const hasSpecificMessage = err.message && err.message !== "Something went wrong."
    return hasSpecificMessage ? err.message : "You don't have permission to do that."
  }

  return err.message ?? fallback
}

export function isPermissionError(err) {
  return err?.status === 403
}
