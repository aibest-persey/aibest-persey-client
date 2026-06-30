import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { listEvents, registerForEvent } from "../services/eventService.js"
import { listClubs } from "../services/clubService.js"
import { listOrganisations } from "../services/organisationService.js"
import { listNews } from "../services/newsService.js"
import {
  Bell, Search, SlidersHorizontal, MapPin, Bookmark, Plus, Heart, Clock, ArrowRight,
  User, Calendar, Mail, LogOut, CalendarCheck, ShieldCheck,
} from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./Home.css"

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
]

const TILE_COLORS = ["#5669FF", "#F0635A", "#F59762", "#29D697", "#46CDFB", "#7F77DD", "#1D9E75"]

function hashId(id) {
  if (!id) return 0
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff
  return hash
}

function getGradient(id) {
  return CARD_GRADIENTS[hashId(id) % CARD_GRADIENTS.length]
}

function getTileColor(id) {
  return TILE_COLORS[hashId(id) % TILE_COLORS.length]
}

function getInitials(name) {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"
}

function formatCardDate(isoStr) {
  try {
    const d = new Date(isoStr)
    return { day: String(d.getDate()).padStart(2, "0"), month: d.toLocaleString("en-US", { month: "short" }).toUpperCase() }
  } catch { return { day: "--", month: "---" } }
}

function formatEventDateTime(isoStr) {
  try {
    const d = new Date(isoStr)
    const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(" ", "")
    return { dateStr, timeStr }
  } catch { return { dateStr: "--/--/----", timeStr: "--:--" } }
}

function useCountdown(targetDate) {
  const [label, setLabel] = useState("")
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (!targetDate) return
    const target = new Date(targetDate).getTime()
    const tick = () => {
      const diff = target - Date.now()
      const live = diff <= 0 && diff > -2 * 60 * 60 * 1000
      setIsLive(live)
      if (live) { setLabel("LIVE"); return }
      if (diff <= 0) { setLabel("Ended"); return }
      const totalMin = Math.floor(diff / 60000)
      const days = Math.floor(totalMin / 1440)
      const hours = Math.floor((totalMin % 1440) / 60)
      const minutes = totalMin % 60
      const seconds = Math.floor((diff % 60000) / 1000)
      if (days > 0) setLabel(`${days}d ${hours}h`)
      else if (hours > 0) setLabel(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`)
      else setLabel(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return { label, isLive }
}

export default function Home() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const [profile] = useState(() => {
    const saved = localStorage.getItem("persey_user_profile")
    if (saved) { try { return JSON.parse(saved) } catch { /* fall through */ } }
    return { nickname: user ? (user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User") : "User", avatar: "" }
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [bookmarked, setBookmarked] = useState({})

  const [clubs, setClubs] = useState([])
  const [organisations, setOrganisations] = useState([])
  const [newsItems, setNewsItems] = useState([])

  const [registering, setRegistering] = useState({})
  const [registerError, setRegisterError] = useState("")

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError("")
    listEvents(token)
      .then(setEvents)
      .catch((err) => setError(err.message ?? "Failed to load events."))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!token) return
    listClubs(token).then(setClubs).catch(() => setClubs([]))
    listOrganisations(token).then(setOrganisations).catch(() => setOrganisations([]))
    listNews(token, { scope: "public" }).then(setNewsItems).catch(() => setNewsItems([]))
  }, [token])

  const filteredEvents = events.filter((evt) => {
    if (evt.status === "draft") return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return evt.title.toLowerCase().includes(q) || (evt.location ?? "").toLowerCase().includes(q)
  })

  const trendingEvents = [...filteredEvents].sort((a, b) => (b.registrationCount ?? 0) - (a.registrationCount ?? 0))
  const nearbyEvents = [...filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date))

  const publishedUpcoming = [...events]
    .filter((evt) => evt.status === "published" && new Date(evt.date).getTime() >= now - 2 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const heroEvent = publishedUpcoming[0] ?? null
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000
  const weekEvents = publishedUpcoming
    .filter((evt) => evt.id !== heroEvent?.id && new Date(evt.date).getTime() <= weekEnd)

  const heroCountdown = useCountdown(heroEvent?.date)

  const orgName = organisations[0]?.name ?? "Persey"

  const toggleBookmark = (id) => setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleRegister = async (id) => {
    if (registering[id]) return
    setRegistering((prev) => ({ ...prev, [id]: true }))
    try {
      await registerForEvent(token, id)
      setEvents((prev) => prev.map((e) => (
        e.id === id ? { ...e, isRegistered: true, registrationCount: (e.registrationCount ?? 0) + 1 } : e
      )))
    } catch (err) {
      setRegisterError(err.message ?? "Could not register.")
      setTimeout(() => setRegisterError(""), 3000)
    } finally {
      setRegistering((prev) => ({ ...prev, [id]: false }))
    }
  }

  const renderEventCard = (evt) => {
    const { day, month } = formatCardDate(evt.date)
    const isBookmarked = bookmarked[evt.id] ?? false
    return (
      <div key={evt.id} className="event-card" onClick={() => navigate(`/events/${evt.id}`)} style={{ cursor: "pointer" }}>
        <div className="event-card-img-wrapper" style={{ background: getGradient(evt.id) }}>
          <div className="card-date-badge">
            <span className="card-date-day">{day}</span>
            <span className="card-date-month">{month}</span>
          </div>
          <button className="card-bookmark-btn" onClick={(e) => { e.stopPropagation(); toggleBookmark(evt.id) }} aria-label="Bookmark event">
            <Bookmark size={14} className="card-bookmark-icon" style={{ fill: isBookmarked ? "#f0635a" : "none", color: "#f0635a" }} />
          </button>
        </div>
        <div className="event-card-info">
          <h3 className="event-card-title">{evt.title}</h3>
          <div className="event-card-location">
            <MapPin size={14} className="event-card-location-icon" />
            <span className="event-card-location-text">{evt.location || "Location TBA"}</span>
          </div>
        </div>
      </div>
    )
  }

  const emptyCard = (
    <div className="event-card-empty"><p>No events found.</p></div>
  )

  const eventSections = loading ? (
    <div className="home-loading">
      <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#5669ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ) : error ? (
    <div className="home-error">{error}</div>
  ) : (
    <>
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Trending Events</h2>
          <button className="home-see-all-btn"><span>See All</span><span className="home-see-all-arrow">▶</span></button>
        </div>
        <div className={isDesktop ? "home-events-grid" : "home-events-scroll"}>
          {trendingEvents.length > 0 ? trendingEvents.map(renderEventCard) : emptyCard}
        </div>
      </section>
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Upcoming Near You</h2>
          <button className="home-see-all-btn"><span>See All</span><span className="home-see-all-arrow">▶</span></button>
        </div>
        <div className={isDesktop ? "home-events-grid" : "home-events-scroll"}>
          {nearbyEvents.length > 0 ? nearbyEvents.map(renderEventCard) : emptyCard}
        </div>
      </section>
    </>
  )

  if (isDesktop) {
    return (
      <PhoneFrame>
        <div className="home-container">
          {/* Desktop topbar */}
          <div className="home-desktop-topbar">
            <div className="home-desktop-topbar-left">
              <h1 className="home-desktop-title">Discover Events</h1>
              <div className="home-desktop-location">
                <MapPin size={14} />
                <span>Burgas, Bulgaria</span>
              </div>
            </div>
            <div className="home-desktop-topbar-right">
              <div className="home-desktop-searchbox">
                <Search size={18} className="home-desktop-search-icon" />
                <input
                  type="text"
                  className="home-desktop-search-input"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="home-notification-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
                <Bell size={20} />
                <div className="home-notification-badge" />
              </button>
            </div>
          </div>

          {eventSections}
        </div>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <div className="home-container home-container--m2">
        {/* Mobile sidebar overlay + drawer (avatar in header opens this) */}
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
            <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/profile") }}>
              <User size={20} className="sidebar-nav-icon" /><span>My Profile</span>
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

        {/* Header: avatar opens sidebar, org name, notifications */}
        <header className="m2-header">
          <button className="m2-avatar-btn" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="m2-avatar-img" />
            ) : (
              <span className="m2-avatar-fallback">{getInitials(profile.nickname)}</span>
            )}
          </button>
          <h1 className="m2-org-name">&ldquo;{orgName}&rdquo;</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            <div className="home-notification-badge" />
          </button>
        </header>

        {/* Clubs rail */}
        <section className="m2-clubs-section">
          <h2 className="m2-section-title">Clubs</h2>
          <div className="m2-clubs-scroll">
            <button className="m2-club-add" onClick={() => navigate("/clubs")} aria-label="Browse clubs">
              <Plus size={22} />
            </button>
            {clubs.map((club) => (
              <button
                key={club.id}
                className="m2-club-avatar"
                title={club.name}
                style={{ background: getTileColor(club.id) }}
                onClick={() => navigate("/clubs")}
              >
                {getInitials(club.name)}
              </button>
            ))}
          </div>
        </section>

        {/* Featured/hero event */}
        {heroEvent && (
          <section className="m2-hero-wrap">
            <div
              className="m2-hero-card"
              style={{ background: getGradient(heroEvent.id) }}
              onClick={() => navigate(`/events/${heroEvent.id}`)}
            >
              <div className="m2-hero-top">
                {heroCountdown.isLive ? (
                  <span className="m2-live-pill"><span className="m2-live-dot" />Live</span>
                ) : <span />}
                <span className="m2-hero-timer"><Clock size={12} />{heroCountdown.label}</span>
              </div>
              <h3 className="m2-hero-title">{heroEvent.title}</h3>
              <p className="m2-hero-desc">
                Join us on <strong>{formatEventDateTime(heroEvent.date).dateStr}</strong>
                {heroEvent.location ? ` at ${heroEvent.location}` : ""}.
              </p>
              <button
                className="m2-hero-join"
                onClick={(e) => { e.stopPropagation(); navigate(`/events/${heroEvent.id}`) }}
              >
                Join
              </button>
            </div>
          </section>
        )}

        {/* Events this week */}
        <section className="m2-section">
          <div className="m2-section-header">
            <h2 className="m2-section-title">Events this week</h2>
            <button className="m2-see-more">See more</button>
          </div>
          {loading ? (
            <div className="home-loading">
              <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#5669ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div className="home-error">{error}</div>
          ) : weekEvents.length === 0 ? (
            <div className="event-card-empty"><p>No events this week.</p></div>
          ) : (
            <div className="m2-week-scroll">
              {weekEvents.map((evt) => {
                const { dateStr, timeStr } = formatEventDateTime(evt.date)
                const isBookmarked = bookmarked[evt.id] ?? false
                const capacityLabel = evt.maxCapacity ? `${evt.registrationCount ?? 0}/${evt.maxCapacity}` : "Open"
                return (
                  <div key={evt.id} className="m2-week-card" onClick={() => navigate(`/events/${evt.id}`)}>
                    <div className="m2-week-card-img" style={{ background: getGradient(evt.id) }}>
                      <button
                        className="m2-week-heart"
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(evt.id) }}
                        aria-label="Save event"
                      >
                        <Heart size={14} style={{ fill: isBookmarked ? "#ffffff" : "none" }} />
                      </button>
                      <div className="m2-week-actions">
                        <span className="m2-week-capacity">{capacityLabel}</span>
                        {user?.role === "student" && (
                          <button
                            className="m2-week-register"
                            disabled={evt.isRegistered || registering[evt.id]}
                            onClick={(e) => { e.stopPropagation(); handleRegister(evt.id) }}
                          >
                            {evt.isRegistered ? "Registered" : registering[evt.id] ? "..." : "Register"}
                            {!evt.isRegistered && <ArrowRight size={12} />}
                          </button>
                        )}
                      </div>
                      <div className="m2-week-footer">
                        <span className="m2-week-name">{evt.title}</span>
                        <span className="m2-week-datetime">{dateStr}&nbsp;&nbsp;{timeStr}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {registerError && <div className="home-error" style={{ margin: "8px 20px" }}>{registerError}</div>}
        </section>

        {/* Latest news */}
        <section className="m2-section">
          <div className="m2-section-header">
            <h2 className="m2-section-title">Latest News</h2>
            <button className="m2-see-more">See all</button>
          </div>
          {newsItems.length === 0 ? (
            <div className="event-card-empty"><p>No news yet.</p></div>
          ) : (
            <div className="m2-news-grid">
              {newsItems.slice(0, 4).map((item) => (
                <div key={item.id} className="m2-news-card" style={{ background: getTileColor(item.id) }}>
                  <span className="m2-news-tag">See more →</span>
                  <span className="m2-news-title">{item.title}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PhoneFrame>
  )
}
