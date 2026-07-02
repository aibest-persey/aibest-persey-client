import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { useNotifications } from "../hooks/useNotifications.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TicketModal from "../components/TicketModal.jsx"
import { listEvents } from "../services/eventService.js"
import { Bell, ChevronLeft, ChevronRight, User, SlidersHorizontal, Calendar, Bookmark, Mail, LogOut, CalendarCheck, ShieldCheck } from "lucide-react"
import "./Schedule.css"

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7 // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const gridStart = new Date(year, month, 1 - startOffset)

  return Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    return { date, isCurrentMonth: date.getMonth() === month }
  })
}

function getInitials(name) {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"
}

export default function Schedule() {
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
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ticketEventId, setTicketEventId] = useState(null)

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError("")
    listEvents(token)
      .then((data) => setEvents(data.filter((e) => e.status !== "draft")))
      .catch((err) => setError(err.message ?? "Failed to load schedule."))
      .finally(() => setLoading(false))
  }, [token])

  const ticketDateKeys = new Set(events.filter((e) => e.isRegistered).map((e) => dateKey(new Date(e.date))))
  const grid = buildMonthGrid(viewYear, viewMonth)
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const changeMonth = (delta) => {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setViewYear(y)
    setViewMonth(m)
  }

  const dayEvents = events
    .filter((e) => dateKey(new Date(e.date)) === dateKey(selectedDate))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const selectedDateLabel = `${String(selectedDate.getDate()).padStart(2, "0")}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${selectedDate.getFullYear()}`

  const calendarBlock = (
    <section className="sched-calendar">
      <div className="sched-month-row">
        <button className="sched-month-nav" onClick={() => changeMonth(-1)} aria-label="Previous month"><ChevronLeft size={18} /></button>
        <span className="sched-month-label">{monthLabel}</span>
        <button className="sched-month-nav" onClick={() => changeMonth(1)} aria-label="Next month"><ChevronRight size={18} /></button>
      </div>
      <div className="sched-weekday-row">
        {WEEKDAY_LABELS.map((d) => <span key={d} className="sched-weekday-label">{d}</span>)}
      </div>
      <div className="sched-day-grid">
        {grid.map(({ date, isCurrentMonth }) => {
          const isSelected = dateKey(date) === dateKey(selectedDate)
          const hasTicket = ticketDateKeys.has(dateKey(date))
          return (
            <button
              key={date.toISOString()}
              className={`sched-day-cell ${isSelected ? "sched-day-cell--selected" : ""} ${hasTicket && !isSelected ? "sched-day-cell--has-ticket" : ""} ${!isCurrentMonth ? "sched-day-cell--muted" : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </section>
  )

  const listBlock = (
    <section className="sched-list-section">
      <h3 className="sched-list-date">{selectedDateLabel}</h3>
      {loading ? (
        <div className="home-loading">
          <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#5669ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div className="home-error">{error}</div>
      ) : dayEvents.length === 0 ? (
        <div className="clubs-empty-state-box">
          <div className="clubs-empty-state-icon">🗓️</div>
          <h4 className="clubs-empty-state-title">Nothing Scheduled</h4>
          <p className="clubs-empty-state-desc">No events on this day.</p>
        </div>
      ) : (
        <div className="sched-item-list">
          {dayEvents.map((evt) => {
            const time = new Date(evt.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            return (
              <div
                key={evt.id}
                className={`sched-item ${evt.isRegistered ? "sched-item--has-ticket" : "sched-item--static"}`}
                onClick={evt.isRegistered ? () => setTicketEventId(evt.id) : undefined}
              >
                <div className="sched-item-time">{time}</div>
                <div className="sched-item-body">
                  <span className="sched-item-title">{evt.title}</span>
                  {evt.location && <span className="sched-item-sub">{evt.location}</span>}
                </div>
                {evt.isRegistered && (
                  <button
                    className="sched-ticket-pill"
                    onClick={(e) => { e.stopPropagation(); setTicketEventId(evt.id) }}
                  >
                    See your ticket
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )

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
          <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/home") }}>
            <User size={20} className="sidebar-nav-icon" /><span>Home</span>
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
          <button className="sidebar-nav-item"><Calendar size={20} className="sidebar-nav-icon" /><span>Calendar</span></button>
          <button className="sidebar-nav-item"><Bookmark size={20} className="sidebar-nav-icon" /><span>Bookmark</span></button>
          <button className="sidebar-nav-item"><Mail size={20} className="sidebar-nav-icon" /><span>Contact Us</span></button>
          <button className="sidebar-nav-item sidebar-nav-item--signout" onClick={() => { logout(); navigate("/sign-in", { replace: true }) }}>
            <LogOut size={20} className="sidebar-nav-icon" /><span>Sign Out</span>
          </button>
        </nav>
      </aside>
    </>
  )

  if (isDesktop) {
    return (
      <div className="home-container--m2">
        <header className="m2-desktop-header">
          <button className="m2-avatar-btn" aria-label="My profile" onClick={() => navigate("/profile")}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="m2-avatar-img" />
            ) : (
              <span className="m2-avatar-fallback">{getInitials(profile.nickname)}</span>
            )}
          </button>
          <h1 className="m2-org-name">Schedule</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            {unreadCount > 0 && <div className="home-notification-badge" />}
          </button>
        </header>

        <div className="sched-desktop-grid">
          <div className="m2-desktop-block">{calendarBlock}</div>
          <div className="m2-desktop-block">{listBlock}</div>
        </div>

        {ticketEventId && <TicketModal eventId={ticketEventId} onClose={() => setTicketEventId(null)} />}
      </div>
    )
  }

  return (
    <PhoneFrame>
      <div className="home-container--m2">
        {sidebarDrawer}

        <header className="m2-header">
          <button className="m2-avatar-btn" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="m2-avatar-img" />
            ) : (
              <span className="m2-avatar-fallback">{getInitials(profile.nickname)}</span>
            )}
          </button>
          <h1 className="m2-org-name">Schedule</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            {unreadCount > 0 && <div className="home-notification-badge" />}
          </button>
        </header>

        {calendarBlock}
        {listBlock}

        {ticketEventId && <TicketModal eventId={ticketEventId} onClose={() => setTicketEventId(null)} />}
      </div>
    </PhoneFrame>
  )
}
