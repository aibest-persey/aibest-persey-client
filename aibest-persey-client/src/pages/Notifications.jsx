import { useState } from "react"
import { ArrowLeft, MoreVertical } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./Notifications.css"

// Sample notifications — keep the array empty to show the empty state
const SAMPLE_NOTIFICATIONS = []

export default function Notifications({ onBack }) {
  const [notifications] = useState(SAMPLE_NOTIFICATIONS)

  return (
    <PhoneFrame>
      <div className="notif-container">
        {/* Header */}
        <header className="notif-header">
          <button
            className="notif-back-btn"
            aria-label="Go back"
            onClick={onBack}
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
          {notifications.length === 0 ? (
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
              {notifications.map((n) => (
                <li key={n.id} className={`notif-item ${n.unread ? "notif-item--unread" : ""}`}>
                  <div className="notif-item-icon">{n.icon}</div>
                  <div className="notif-item-content">
                    <p className="notif-item-msg">{n.message}</p>
                    <span className="notif-item-time">{n.time}</span>
                  </div>
                  {n.unread && <div className="notif-item-dot" />}
                </li>
              ))}
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
