import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { getMyRegistrations } from "../services/eventService.js"
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./MyRegistrations.css"

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
]

function getGradient(id) {
  if (!id) return GRADIENTS[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff
  return GRADIENTS[hash % GRADIENTS.length]
}

function formatDate(isoStr) {
  try {
    return new Date(isoStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
  } catch { return isoStr }
}

function formatTime(isoStr) {
  try {
    return new Date(isoStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  } catch { return "" }
}

export default function MyRegistrations() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError("")
    getMyRegistrations(token)
      .then(setRegistrations)
      .catch((err) => setError(err.message ?? "Failed to load registrations."))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <PhoneFrame>
      <div className="myreg-container">
        <header className="myreg-header">
          <button className="myreg-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h1 className="myreg-title">My Registrations</h1>
          <div style={{ width: 36 }} />
        </header>

        {loading ? (
          <div className="myreg-loading">
            <div className="myreg-spinner" />
          </div>
        ) : error ? (
          <div className="myreg-error">{error}</div>
        ) : registrations.length === 0 ? (
          <div className="myreg-empty">
            <div className="myreg-empty-icon">🎫</div>
            <p className="myreg-empty-text">You haven't registered for any events yet.</p>
            <button className="myreg-browse-btn" onClick={() => navigate("/home")}>
              Browse Events
            </button>
          </div>
        ) : (
          <div className="myreg-list">
            {registrations.map((reg) => {
              const evt = reg.event
              if (!evt) return null
              const isCancelled = evt.status === "cancelled"
              return (
                <div
                  key={reg.id}
                  className={`myreg-card ${isCancelled ? "myreg-card--cancelled" : ""}`}
                  onClick={() => navigate(`/events/${reg.eventId}`)}
                >
                  <div className="myreg-card-strip" style={{ background: getGradient(reg.eventId) }} />
                  <div className="myreg-card-body">
                    <div className="myreg-card-top">
                      <h3 className="myreg-card-title">{evt.title}</h3>
                      <span className={`myreg-status myreg-status--${reg.status}`}>
                        {reg.status === "registered" ? "Confirmed" : `Waitlist #${reg.waitlistPosition}`}
                      </span>
                    </div>

                    <div className="myreg-card-meta">
                      <Calendar size={13} />
                      <span>{formatDate(evt.date)}</span>
                      <span className="myreg-meta-dot">·</span>
                      <Clock size={13} />
                      <span>{formatTime(evt.date)}</span>
                    </div>

                    {evt.location && (
                      <div className="myreg-card-meta">
                        <MapPin size={13} />
                        <span>{evt.location}</span>
                      </div>
                    )}

                    {isCancelled && (
                      <span className="myreg-event-cancelled-badge">Event cancelled</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PhoneFrame>
  )
}
