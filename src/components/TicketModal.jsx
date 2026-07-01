import { useEffect, useState } from "react"
import { X, MapPin, Clock } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { getEvent, getTicket } from "../services/eventService.js"
import { getGradient } from "../utils/colorTiles.js"
import "../pages/Ticket.css"
import "./TicketModal.css"

function getInitials(name) {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"
}

function formatDateTime(isoStr) {
  try {
    const d = new Date(isoStr)
    const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(" ", "")
    return `${dateStr} | ${timeStr}`
  } catch { return "--" }
}

export default function TicketModal({ eventId, onClose }) {
  const { user, token } = useAuth()
  const isDesktop = useIsDesktop()

  const [event, setEvent] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    setEvent(null)
    setTicket(null)
    Promise.all([getEvent(token, eventId), getTicket(token, eventId)])
      .then(([eventData, ticketData]) => {
        if (cancelled) return
        setEvent(eventData)
        setTicket(ticketData)
      })
      .catch((err) => { if (!cancelled) setError(err.message ?? "You don't have a valid ticket for this event.") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token, eventId])

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const holderName = user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user?.username ?? "Ticket holder"
  const organiserName = event?.organiser
    ? (event.organiser.firstName ? `${event.organiser.firstName} ${event.organiser.lastName ?? ""}`.trim() : event.organiser.username)
    : null
  const agendaLines = (event?.agenda ?? "").split("\n").map((l) => l.trim()).filter(Boolean)

  return (
    <div
      className={`ticket-modal-overlay ${isDesktop ? "ticket-modal-overlay--desktop" : ""}`}
      onClick={onClose}
    >
      <div className="ticket-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-modal-handle" />
        <button className="ticket-modal-close" aria-label="Close ticket" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="ticket-modal-scroll">
          {loading ? (
            <div className="home-loading">
              <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#5669ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error || !event || !ticket || ticket.status !== "registered" || !ticket.ticketCode ? (
            <div className="clubs-empty-state-box">
              <div className="clubs-empty-state-icon">🎫</div>
              <h4 className="clubs-empty-state-title">No Ticket Available</h4>
              <p className="clubs-empty-state-desc">
                {error || (ticket?.status === "waitlisted"
                  ? `You're on the waitlist${ticket.waitlistPosition ? ` (position ${ticket.waitlistPosition})` : ""} — no ticket until a seat opens up.`
                  : "You don't have a valid registration for this event.")}
              </p>
            </div>
          ) : (
            <>
              <div className="ticket-banner" style={{ background: getGradient(event.id) }}>
                <div className="ticket-banner-shape" />
              </div>

              <div className="ticket-organiser-row">
                <div className="ticket-organiser-avatar">{getInitials(organiserName)}</div>
                <div>
                  <div className="ticket-organiser-name">{organiserName ?? "Organiser"}</div>
                  <span className="ticket-organiser-label">Organiser</span>
                </div>
              </div>

              <div className="ticket-info-row">
                <MapPin size={15} className="ticket-info-icon" />
                <span className="ticket-info-label">Location:</span>
                <span className="ticket-info-value">{event.location || "TBA"}</span>
              </div>
              <div className="ticket-info-row">
                <Clock size={15} className="ticket-info-icon" />
                <span className="ticket-info-label">Date and time:</span>
                <span className="ticket-info-value">{formatDateTime(event.date)}</span>
              </div>

              <h2 className="ticket-event-title">{event.title}</h2>
              {event.description && <p className="ticket-event-desc">{event.description}</p>}

              {agendaLines.length > 0 && (
                <div className="ticket-agenda">
                  <h3 className="ticket-agenda-title">Agenda:</h3>
                  {agendaLines.map((line, i) => (
                    <p key={i} className="ticket-agenda-line">{line}</p>
                  ))}
                </div>
              )}

              <h3 className="ticket-code-heading">Your registration code</h3>
              <div className="ticket-qr-wrap">
                <QRCodeSVG value={ticket.registrationId} size={168} />
              </div>
              <p className="ticket-holder-name">{holderName}</p>
              <p className="ticket-code-value">{ticket.ticketCode}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
