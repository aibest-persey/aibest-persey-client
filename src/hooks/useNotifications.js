import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./useAuth.js"
import { listNotifications, markNotificationRead } from "../services/notificationService.js"

// The current user's own notifications — backs both the Notifications page
// and the live unread-count badge shown on bell icons across the app.
export function useNotifications() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    listNotifications(token)
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { refetch() }, [refetch])

  const markRead = useCallback((id) => {
    if (!token) return
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    markNotificationRead(token, id).catch(() => {})
  }, [token])

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    loading,
    markRead,
    refetch,
  }
}
