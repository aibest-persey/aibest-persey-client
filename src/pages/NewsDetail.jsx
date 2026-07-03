import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { useNotifications } from "../hooks/useNotifications.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import { getNews } from "../services/newsService.js"
import { getGradient } from "../utils/colorTiles.js"
import { SCOPE_LABELS } from "../utils/newsScope.js"
import {
  Bell, ArrowLeft, Calendar,
  User, SlidersHorizontal, Bookmark, Mail, LogOut, CalendarCheck, ShieldCheck, Newspaper, Settings as SettingsIcon,
} from "lucide-react"
import "./News.css"

function formatDate(isoStr) {
  try {
    return new Date(isoStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  } catch { return "" }
}

export default function NewsDetail() {
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
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadNews = useCallback(() => {
    if (!token || !id) return
    setLoading(true)
    setError("")
    getNews(token, id)
      .then(setNews)
      .catch((err) => setError(err.message ?? "Failed to load this news item."))
      .finally(() => setLoading(false))
  }, [token, id])

  useEffect(() => { loadNews() }, [loadNews])

  const content = loading ? (
    <div className="home-loading">
      <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#1d4e89", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ) : error || !news ? (
    <div className="clubs-empty-state-box">
      <p className="clubs-empty-state-desc">{error || "News item not found."}</p>
      <button className="club-list-join-btn" style={{ marginTop: 16 }} onClick={() => navigate("/news")}>Back to News</button>
    </div>
  ) : (
    <>
      <div
        className="news-detail-banner"
        style={news.coverImage ? { backgroundImage: `url(${news.coverImage})` } : { background: getGradient(news.id) }}
      >
        <span className={`news-scope-badge news-scope-badge--${news.scope}`}>{SCOPE_LABELS[news.scope] ?? news.scope}</span>
      </div>

      <div className="news-detail-meta">
        <Calendar size={13} /> <span>{formatDate(news.createdAt)}</span>
      </div>

      <h2 className="news-detail-title">{news.title}</h2>
      <p className="news-detail-body">{news.content}</p>
    </>
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

  const header = (
    <header className={isDesktop ? "m2-desktop-header" : "m2-header"}>
      <button className="m2-avatar-btn" aria-label={isDesktop ? "Back to News" : "Open menu"} onClick={() => (isDesktop ? navigate("/news") : setSidebarOpen(true))}>
        {isDesktop ? <ArrowLeft size={18} /> : (
          profile.avatar ? <img src={profile.avatar} alt="" className="m2-avatar-img" /> : <span className="m2-avatar-fallback">{(profile.nickname || "?").charAt(0).toUpperCase()}</span>
        )}
      </button>
      <h1 className="m2-org-name">News</h1>
      <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
        <Bell size={18} />
        {unreadCount > 0 && <div className="home-notification-badge" />}
      </button>
    </header>
  )

  if (isDesktop) {
    return (
      <div className="home-container--m2">
        {header}
        <div className="m2-desktop-block">{content}</div>
      </div>
    )
  }

  return (
    <PhoneFrame>
      <div className="home-container--m2 news-detail-page">
        {sidebarDrawer}
        {header}
        {content}
      </div>
    </PhoneFrame>
  )
}
