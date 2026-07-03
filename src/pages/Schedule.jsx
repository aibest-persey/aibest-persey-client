import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { useNotifications } from "../hooks/useNotifications.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TicketModal from "../components/TicketModal.jsx"
import { getSchedule } from "../services/scheduleService.js"
import { Bell, ChevronLeft, ChevronRight, User, SlidersHorizontal, Calendar, Bookmark, Mail, LogOut, CalendarCheck, ShieldCheck, Newspaper, Settings as SettingsIcon } from "lucide-react"
import "./Schedule.css"

// Sunday-first — matches the backend's getMonthCalendar grid ordering.
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
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
  const [days, setDays] = useState([])
  const [items, setItems] = useState([])
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
    const anchor = dateKey(new Date(viewYear, viewMonth, 1))
    getSchedule(token, { date: anchor })
      .then((data) => {
        setDays(data.days)
        setItems(data.items)
      })
      .catch((err) => setError(err.message ?? "Failed to load schedule."))
      .finally(() => setLoading(false))
  }, [token, viewYear, viewMonth])

  const ticketDateKeys = new Set(items.filter((i) => i.ticketCode).map((i) => i.date))
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const changeMonth = (delta) => {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setViewYear(y)
    setViewMonth(m)
    // Keep the selected day inside the month we just fetched — the day-agenda
    // below only has data for the currently-displayed month's items.
    setSelectedDate(new Date(y, m, 1))
  }

  const dayEvents = items.filter((i) => i.date === dateKey(selectedDate))

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
        {days.map((day) => {
          const isSelected = day.dateKey === dateKey(selectedDate)
          const hasTicket = ticketDateKeys.has(day.dateKey)
          const [y, m, d] = day.dateKey.split("-").map(Number)
          return (
            <button
              key={day.dateKey}
              className={`sched-day-cell ${isSelected ? "sched-day-cell--selected" : ""} ${hasTicket && !isSelected ? "sched-day-cell--has-ticket" : ""} ${!day.isCurrentMonth ? "sched-day-cell--muted" : ""}`}
              onClick={() => setSelectedDate(new Date(y, m - 1, d))}
            >
              {day.dayNumber}
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
          <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#1d4e89", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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
            const hasTicket = Boolean(evt.ticketCode)
            return (
              <div
                key={evt.id}
                className={`sched-item ${hasTicket ? "sched-item--has-ticket" : "sched-item--static"}`}
                onClick={hasTicket ? () => setTicketEventId(evt.eventId) : undefined}
              >
                <div className="sched-item-time">{evt.timeRange}</div>
                <div className="sched-item-body">
                  <span className={`sched-item-kind sched-item-kind--${evt.kind}`}>{evt.kind === "class" ? "Class" : "Event"}</span>
                  <span className="sched-item-title">{evt.title}</span>
                  {evt.ownerName && <span className="sched-item-sub">{evt.ownerName}</span>}
                  {evt.location && <span className="sched-item-sub">{evt.location}</span>}
                </div>
                {hasTicket && (
                  <button
                    className="sched-ticket-pill"
                    onClick={(e) => { e.stopPropagation(); setTicketEventId(evt.eventId) }}
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
          <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/news") }}>
            <Newspaper size={20} className="sidebar-nav-icon" /><span>News</span>
          </button>
          <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/settings") }}>
            <SettingsIcon size={20} className="sidebar-nav-icon" /><span>Settings</span>
          </button>
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
