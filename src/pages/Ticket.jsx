import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { useNotifications } from "../hooks/useNotifications.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import { getEvent, getTicket } from "../services/eventService.js"
import { getGradient } from "../utils/colorTiles.js"
import { Bell, MapPin, Clock, User, SlidersHorizontal, Calendar, Bookmark, Mail, LogOut, CalendarCheck, ShieldCheck } from "lucide-react"
import "./Ticket.css"

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

export default function Ticket() {
  const { id } = useParams()
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const { unreadCount } = useNotifications()

  const [profile] = useState(() => {
    const saved = localStorage.getItem("persey_user_profile")
    if (saved) { try { return JSON.parse(saved) } catch { /* fall through */ } }
    return { nickname: user ? (user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User") : "User", avatar: "" }
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [event, setEvent] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    Promise.all([getEvent(token, id), getTicket(token, id)])
      .then(([eventData, ticketData]) => {
        if (cancelled) return
        setEvent(eventData)
        setTicket(ticketData)
      })
      .catch((err) => { if (!cancelled) setError(err.message ?? "You don't have a valid ticket for this event.") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token, id])

  const holderName = user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user?.username ?? "Ticket holder"
  const organiserName = event?.organiser
    ? (event.organiser.firstName ? `${event.organiser.firstName} ${event.organiser.lastName ?? ""}`.trim() : event.organiser.username)
    : null
  const agendaLines = (event?.agenda ?? "").split("\n").map((l) => l.trim()).filter(Boolean)

  const sidebarDrawer = (
    <>
      <div className={`sidebar-overlay ${sidebarOpen ? "sidebar-overlay--visible" : ""}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar-drawer ${sidebarOpen ? "sidebar-drawer--open" : ""}`}>
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="sidebar-avatar-img" />
            ) : (
              <User size={32} color="#9a9cae" />
            )}
          </div>
          <span className="sidebar-username">{profile.nickname}</span>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/schedule") }}>
            <Calendar size={20} className="sidebar-nav-icon" /><span>Schedule</span>
          </button>
          {user?.role === "organiser" && (
            <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/organiser-dashboard") }}>
              <SlidersHorizontal size={20} className="sidebar-nav-icon" /><span>Organiser Dashboard</span>
            </button>
          )}
          <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/inbox") }}>
            <Mail size={20} className="sidebar-nav-icon" /><span>Inbox</span>
          </button>
          {user?.role === "admin" && (
            <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/admin") }}>
              <ShieldCheck size={20} className="sidebar-nav-icon" /><span>Admin Dashboard</span>
            </button>
          )}
          {user?.role !== "organiser" && (
            <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/my-registrations") }}>
              <CalendarCheck size={20} className="sidebar-nav-icon" /><span>My Registrations</span>
            </button>
          )}
          <button className="sidebar-nav-item"><Bookmark size={20} className="sidebar-nav-icon" /><span>Bookmark</span></button>
          <button className="sidebar-nav-item"><Mail size={20} className="sidebar-nav-icon" /><span>Contact Us</span></button>
          <button className="sidebar-nav-item sidebar-nav-item--signout" onClick={() => { logout(); navigate("/sign-in", { replace: true }) }}>
            <LogOut size={20} className="sidebar-nav-icon" /><span>Sign Out</span>
          </button>
        </nav>
      </aside>
    </>
  )

  const header = (
    <header className={isDesktop ? "m2-desktop-header" : "m2-header"}>
      <button className="m2-avatar-btn" aria-label={isDesktop ? "My profile" : "Open menu"} onClick={() => (isDesktop ? navigate("/profile") : setSidebarOpen(true))}>
        {profile.avatar ? (
          <img src={profile.avatar} alt="" className="m2-avatar-img" />
        ) : (
          <span className="m2-avatar-fallback">{getInitials(profile.nickname)}</span>
        )}
      </button>
      <h1 className="m2-org-name">Ticket</h1>
      <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
        <Bell size={18} />
        {unreadCount > 0 && <div className="home-notification-badge" />}
      </button>
    </header>
  )

  const content = loading ? (
    <div className="home-loading">
      <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#1d4e89", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ) : error || !ticket || ticket.status !== "registered" || !ticket.ticketCode ? (
    <div className="clubs-empty-state-box">
      <div className="clubs-empty-state-icon">🎫</div>
      <h4 className="clubs-empty-state-title">No Ticket Available</h4>
      <p className="clubs-empty-state-desc">
        {error || (ticket?.status === "waitlisted"
          ? `You're on the waitlist${ticket.waitlistPosition ? ` (position ${ticket.waitlistPosition})` : ""} — no ticket until a seat opens up.`
          : "You don't have a valid registration for this event.")}
      </p>
      <button className="club-list-join-btn" style={{ marginTop: 16 }} onClick={() => navigate("/schedule")}>Back to Schedule</button>
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
  )

  const body = (
    <div className="home-container--m2 ticket-page">
      {!isDesktop && sidebarDrawer}
      {header}
      {content}
    </div>
  )

  if (isDesktop) return body

  return <PhoneFrame>{body}</PhoneFrame>
}
