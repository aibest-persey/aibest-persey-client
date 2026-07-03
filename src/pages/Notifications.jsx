import { useState } from "react"
import {
  ArrowLeft, MoreVertical, UserPlus, CheckCircle2, XCircle, Check, X,
  Calendar, Newspaper, ShieldCheck, UserCog, Ticket, Clock, ArrowUpCircle, CalendarX,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import PhoneFrame from "../components/PhoneFrame.jsx"
import { useAuth } from "../hooks/useAuth.js"
import { useNotifications } from "../hooks/useNotifications.js"
import { approveRoleRequest, rejectRoleRequest } from "../services/roleRequestService.js"
import "./Notifications.css"

const TYPE_ICON = {
  role_request_submitted: UserPlus,
  role_request_approved: CheckCircle2,
  role_request_rejected: XCircle,
  event_published: Calendar,
  news_posted: Newspaper,
  organisation_verified: ShieldCheck,
  role_changed: UserCog,
  registration_confirmed: Ticket,
  registration_waitlisted: Clock,
  registration_promoted: ArrowUpCircle,
  registration_cancelled: XCircle,
  event_cancelled: CalendarX,
}

function formatTime(isoStr) {
  try {
    return new Date(isoStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  } catch { return "" }
}

export default function Notifications({ onBack }) {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { notifications, loading, markRead } = useNotifications()
  const handleBack = onBack || (() => navigate("/home"))

  const [resolvedIds, setResolvedIds] = useState(new Set())
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState({})

  const handleDecision = async (n, decision) => {
    if (busyId) return
    setBusyId(n.id)
    setActionError((prev) => ({ ...prev, [n.id]: "" }))
    try {
      if (decision === "approve") await approveRoleRequest(token, n.relatedId)
      else await rejectRoleRequest(token, n.relatedId)
      setResolvedIds((prev) => new Set(prev).add(n.relatedId))
      if (!n.isRead) markRead(n.id)
    } catch (err) {
      setActionError((prev) => ({ ...prev, [n.id]: err.message ?? "Something went wrong." }))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PhoneFrame>
      <div className="notif-container">
        {/* Header */}
        <header className="notif-header">
          <button
            className="notif-back-btn"
            aria-label="Go back"
            onClick={handleBack}
          >

            <ArrowLeft size={20} />
          </button>
          <h1 className="notif-title">Notification</h1>
          <button className="notif-more-btn" aria-label="More options">
            <MoreVertical size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="notif-body">
          {loading ? (
            <div className="home-loading">
              <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#1d4e89", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              {/* Animated bell illustration */}
              <div className="notif-bell-wrap">
                <BellIllustration />
                <span className="notif-count-badge">
                  {notifications.length}
                </span>
              </div>
              <p className="notif-empty-text">No Notifications!</p>
            </div>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? UserPlus
                const showActions = n.type === "role_request_submitted" && !resolvedIds.has(n.relatedId)
                return (
                  <li
                    key={n.id}
                    className={`notif-item ${!n.isRead ? "notif-item--unread" : ""}`}
                    onClick={() => !n.isRead && markRead(n.id)}
                    style={{ cursor: n.isRead ? "default" : "pointer" }}
                  >
                    <div className="notif-item-icon"><Icon size={18} /></div>
                    <div className="notif-item-content">
                      <p className="notif-item-msg">{n.body}</p>
                      <span className="notif-item-time">{formatTime(n.createdAt)}</span>
                      {actionError[n.id] && <span className="notif-item-error">{actionError[n.id]}</span>}
                    </div>
                    {showActions ? (
                      <div className="notif-item-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="notif-action-btn notif-action-btn--approve"
                          aria-label="Approve request"
                          disabled={busyId === n.id}
                          onClick={() => handleDecision(n, "approve")}
                        >
                          <Check size={15} />
                        </button>
                        <button
                          className="notif-action-btn notif-action-btn--reject"
                          aria-label="Reject request"
                          disabled={busyId === n.id}
                          onClick={() => handleDecision(n, "reject")}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      !n.isRead && <div className="notif-item-dot" />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </PhoneFrame>
  )
}

/* ─── Bell SVG illustration ──────────────────────────────────────── */
function BellIllustration() {
  return (
    <svg
      className="notif-bell-svg"
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Ripple arcs above the bell */}
      <path
        className="notif-ripple notif-ripple--1"
        d="M36 28 Q60 10 84 28"
        stroke="#d0d3f5"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="notif-ripple notif-ripple--2"
        d="M26 18 Q60 -4 94 18"
        stroke="#e4e5f8"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bell body */}
      <path
        d="M60 40
           C40 40 28 54 28 72
           L28 88
           L20 96
           L100 96
           L92 88
           L92 72
           C92 54 80 40 60 40Z"
        fill="#dde0f8"
      />

      {/* Bell top knob */}
      <circle cx="60" cy="38" r="5" fill="#c7cbf0" />

      {/* Bell clapper / smile face */}
      <circle cx="46" cy="76" r="4" fill="#c3c7ed" />
      <circle cx="74" cy="76" r="4" fill="#c3c7ed" />
      <path
        d="M46 88 Q60 98 74 88"
        stroke="#9da2e0"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bottom clapper bar */}
      <rect x="48" y="96" width="24" height="6" rx="3" fill="#c7cbf0" />

      {/* Clapper hanging dot */}
      <ellipse cx="60" cy="107" rx="8" ry="5" fill="#dde0f8" />
    </svg>
  )
}
