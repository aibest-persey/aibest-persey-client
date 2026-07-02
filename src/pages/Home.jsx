import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { useHasOrganisation } from "../hooks/useHasOrganisation.js"
import { useNotifications } from "../hooks/useNotifications.js"
import { listEvents, registerForEvent } from "../services/eventService.js"
import { listClubs } from "../services/clubService.js"
import { requestToJoinOrganisation, getMyJoinRequests } from "../services/organisationService.js"
import { listNews } from "../services/newsService.js"
import {
  Bell, SlidersHorizontal, Plus, Heart, Clock, ArrowRight, Search,
  User, Calendar, Bookmark, Mail, LogOut, CalendarCheck, ShieldCheck,
} from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import { getGradient, getTileColor } from "../utils/colorTiles.js"
import "./Home.css"

function getInitials(name) {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"
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
  const { organisations, hasOrganisation } = useHasOrganisation()
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
  const [bookmarked, setBookmarked] = useState({})

  const [clubs, setClubs] = useState([])
  const [newsItems, setNewsItems] = useState([])

  const [registering, setRegistering] = useState({})
  const [registerError, setRegisterError] = useState("")

  const [orgSearch, setOrgSearch] = useState("")
  const [orgSearchOpen, setOrgSearchOpen] = useState(false)
  const [myJoinRequests, setMyJoinRequests] = useState([])
  const [joining, setJoining] = useState({})

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
    listNews(token, { scope: "public" }).then(setNewsItems).catch(() => setNewsItems([]))
    getMyJoinRequests(token).then(setMyJoinRequests).catch(() => setMyJoinRequests([]))
  }, [token])

  const publishedUpcoming = [...events]
    .filter((evt) => evt.status === "published" && new Date(evt.date).getTime() >= now - 2 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const heroEvent = publishedUpcoming[0] ?? null
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000
  const weekEvents = publishedUpcoming
    .filter((evt) => evt.id !== heroEvent?.id && new Date(evt.date).getTime() <= weekEnd)

  const heroCountdown = useCountdown(heroEvent?.date)

  const orgName = organisations.find((o) => o.isMember)?.name ?? "No organisations yet"

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

  const handleJoinRequest = async (orgId) => {
    if (joining[orgId]) return
    setJoining((prev) => ({ ...prev, [orgId]: true }))
    try {
      await requestToJoinOrganisation(token, orgId)
      setMyJoinRequests((prev) => [...prev, { organisationId: orgId, status: "pending" }])
    } catch (err) {
      setRegisterError(err.message ?? "Could not send join request.")
      setTimeout(() => setRegisterError(""), 3000)
    } finally {
      setJoining((prev) => ({ ...prev, [orgId]: false }))
    }
  }

  const orgSearchResults = orgSearch.trim()
    ? organisations.filter((o) => o.name.toLowerCase().includes(orgSearch.trim().toLowerCase()))
    : []

  const getOrgJoinState = (org) => {
    if (org.isMember) return "member"
    const pending = myJoinRequests.some((r) => r.organisationId === org.id && r.status === "pending")
    return pending ? "requested" : "none"
  }

  // ─── Shared content blocks (same on mobile + desktop, just re-arranged) ───

  const orgSearchBlock = (
    <section className="m2-clubs-section">
      <h2 className="m2-section-title">Find an organisation</h2>
      <div className="clubs-search-pill" style={{ position: "relative", maxWidth: "none" }}>
        <input
          type="text"
          className="clubs-search-input-field"
          placeholder="Search organisations..."
          value={orgSearch}
          onFocus={() => setOrgSearchOpen(true)}
          onBlur={() => setTimeout(() => setOrgSearchOpen(false), 200)}
          onChange={(e) => setOrgSearch(e.target.value)}
        />
        <button className="clubs-search-action-btn" aria-label="Search">
          <Search size={18} color="#ffffff" />
        </button>
        {orgSearchOpen && orgSearch.trim() && (
          <div className="clubs-search-dropdown">
            {orgSearchResults.length === 0 ? (
              <div className="clubs-dropdown-empty">No organisations found</div>
            ) : (
              orgSearchResults.map((org) => {
                const state = getOrgJoinState(org)
                return (
                  <div key={org.id} className="clubs-dropdown-item" style={{ justifyContent: "space-between" }}>
                    <div className="clubs-dropdown-info">
                      <span className="clubs-dropdown-name">{org.name}</span>
                    </div>
                    <button
                      className="clubs-register-action-btn"
                      disabled={state !== "none" || joining[org.id]}
                      onMouseDown={(e) => { e.preventDefault(); handleJoinRequest(org.id) }}
                    >
                      {state === "member" ? "Member" : state === "requested" ? "Requested" : joining[org.id] ? "..." : "Join"}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </section>
  )

  const clubsRailBlock = hasOrganisation ? (
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
  ) : (
    <section className="m2-clubs-section">
      <h2 className="m2-section-title">Clubs</h2>
      <div className="clubs-empty-state-box">
        <div className="clubs-empty-state-icon">🎓</div>
        <h4 className="clubs-empty-state-title">Join an organisation to see its clubs</h4>
        <p className="clubs-empty-state-desc">Search for your school's organisation above and send a join request.</p>
      </div>
    </section>
  )

  const heroBlock = heroEvent ? (
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
  ) : null

  const weekEventsBlock = (
    <section className="m2-section">
      <div className="m2-section-header">
        <h2 className="m2-section-title">Events this week</h2>
        <button className="m2-see-more" onClick={() => navigate("/schedule")}>See more</button>
      </div>
      {loading ? (
        <div className="home-loading">
          <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#5669ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div className="home-error">{error}</div>
      ) : weekEvents.length === 0 ? (
        <div className="clubs-empty-state-box">
          <div className="clubs-empty-state-icon">📅</div>
          <h4 className="clubs-empty-state-title">No Events Scheduled</h4>
          <p className="clubs-empty-state-desc">There are no events planned for this week. Stay tuned!</p>
        </div>
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
      {registerError && <div className="home-error" style={{ margin: "8px 0 0 0" }}>{registerError}</div>}
    </section>
  )

  const newsBlock = (
    <section className="m2-section">
      <div className="m2-section-header">
        <h2 className="m2-section-title">Latest News</h2>
        <button className="m2-see-more">See all</button>
      </div>
      {newsItems.length === 0 ? (
        <div className="clubs-empty-state-box">
          <div className="clubs-empty-state-icon">📰</div>
          <h4 className="clubs-empty-state-title">No News Available</h4>
          <p className="clubs-empty-state-desc">No news articles or updates have been published yet.</p>
        </div>
      ) : (
        <div className="m2-news-grid">
          {newsItems.slice(0, 4).map((item) => (
            <div key={item.id} className="m2-news-card">
              <div className="m2-news-image" style={{ background: getTileColor(item.id) }}>
                <span className="m2-news-tag">See more →</span>
              </div>
              <div className="m2-news-title-bar">
                <p className="m2-news-title">{item.title}</p>
              </div>
            </div>
          ))}
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
          <h1 className="m2-org-name">&ldquo;{orgName}&rdquo;</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            {unreadCount > 0 && <div className="home-notification-badge" />}
          </button>
        </header>

        <div className="m2-desktop-grid">
          <div className="m2-desktop-left">
            <div className="m2-desktop-block">{orgSearchBlock}</div>
            <div className="m2-desktop-block">{clubsRailBlock}</div>
            {heroBlock ? <div className="m2-desktop-block">{heroBlock}</div> : null}
          </div>
          <div className="m2-desktop-right">
            <div className="m2-desktop-widget">{weekEventsBlock}</div>
            <div className="m2-desktop-widget">{newsBlock}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PhoneFrame>
      <div className="home-container--m2">
        {sidebarDrawer}

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
            {unreadCount > 0 && <div className="home-notification-badge" />}
          </button>
        </header>

        {orgSearchBlock}
        {clubsRailBlock}
        {heroBlock}
        {weekEventsBlock}
        {newsBlock}
      </div>
    </PhoneFrame>
  )
}
