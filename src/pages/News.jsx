import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { useNotifications } from "../hooks/useNotifications.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import { listNews } from "../services/newsService.js"
import { listOrganisations } from "../services/organisationService.js"
import { listClubs } from "../services/clubService.js"
import { getGradient } from "../utils/colorTiles.js"
import { SCOPE_LABELS } from "../utils/newsScope.js"
import {
  Bell, Search, ArrowRight,
  User, SlidersHorizontal, Calendar, Bookmark, Mail, LogOut, CalendarCheck, ShieldCheck, Newspaper, Settings as SettingsIcon,
} from "lucide-react"
import "./News.css"

function dedupeById(items) {
  const seen = new Set()
  const result = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}

function isToday(isoStr) {
  const d = new Date(isoStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

function formatDate(isoStr) {
  try {
    return new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch { return "" }
}

function snippetOf(content) {
  if (!content) return ""
  const trimmed = content.trim()
  return trimmed.length > 110 ? `${trimmed.slice(0, 110).trim()}…` : trimmed
}

export default function News() {
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
  const [scopeTab, setScopeTab] = useState("public")
  const [myOrganisations, setMyOrganisations] = useState([])
  const [myClubs, setMyClubs] = useState([])
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!token) return
    Promise.all([listOrganisations(token), listClubs(token)])
      .then(([orgs, clubs]) => {
        setMyOrganisations(orgs.filter((o) => o.isMember))
        setMyClubs(clubs.filter((c) => c.isMember))
      })
      .catch(() => { setMyOrganisations([]); setMyClubs([]) })
  }, [token])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError("")

    if (scopeTab === "public") {
      listNews(token, { scope: "public" })
        .then(setNewsItems)
        .catch((err) => setError(err.message ?? "Failed to load news."))
        .finally(() => setLoading(false))
      return
    }

    if (scopeTab === "org") {
      const org = myOrganisations[0]
      if (!org) { setNewsItems([]); setLoading(false); return }
      listNews(token, { scope: "org", organisationId: org.id })
        .then(setNewsItems)
        .catch((err) => setError(err.message ?? "Failed to load news."))
        .finally(() => setLoading(false))
      return
    }

    // scopeTab === "club" — the API only accepts one clubId per call, so merge across every club the user belongs to.
    if (myClubs.length === 0) { setNewsItems([]); setLoading(false); return }
    Promise.all(myClubs.map((c) => listNews(token, { scope: "club", clubId: c.id }).catch(() => [])))
      .then((lists) => {
        const merged = dedupeById(lists.flat()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setNewsItems(merged)
      })
      .catch((err) => setError(err.message ?? "Failed to load news."))
      .finally(() => setLoading(false))
  }, [token, scopeTab, myOrganisations, myClubs])

  const filteredNews = newsItems.filter((n) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return n.title.toLowerCase().includes(q) || (n.content ?? "").toLowerCase().includes(q)
  })

  const todayNews = filteredNews.filter((n) => isToday(n.createdAt))
  const otherNews = filteredNews.filter((n) => !isToday(n.createdAt))

  const headerOrgLabel = myOrganisations[0]?.name ?? "News"

  const NewsCard = ({ item }) => (
    <button className="news-card" onClick={() => navigate(`/news/${item.id}`)}>
      <div
        className="news-card-image"
        style={item.coverImage ? { backgroundImage: `url(${item.coverImage})` } : { background: getGradient(item.id) }}
      >
        <span className="news-see-more-pill">See more <ArrowRight size={11} /></span>
        <span className={`news-scope-badge news-scope-badge--${item.scope}`}>{SCOPE_LABELS[item.scope] ?? item.scope}</span>
        <div className="news-card-overlay">
          <span className="news-card-title">{item.title}</span>
          <span className="news-card-date">{formatDate(item.createdAt)}</span>
        </div>
      </div>
    </button>
  )

  const scopeTabsBlock = (
    <div className="news-scope-tabs">
      {["public", "org", "club"].map((s) => (
        <button
          key={s}
          className={`news-scope-tab ${scopeTab === s ? "news-scope-tab--active" : ""}`}
          onClick={() => setScopeTab(s)}
        >
          {SCOPE_LABELS[s]}
        </button>
      ))}
    </div>
  )

  const searchBlock = (
    <div className="clubs-search-pill" style={{ maxWidth: "none" }}>
      <input
        type="text"
        className="clubs-search-input-field"
        placeholder={`Search in ${headerOrgLabel}`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="clubs-search-action-btn" aria-label="Search">
        <Search size={18} color="#ffffff" />
      </button>
    </div>
  )

  const listBlock = (
    <>
      {loading ? (
        <div className="home-loading">
          <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#1d4e89", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div className="clubs-empty-state-box"><p className="clubs-empty-state-desc">{error}</p></div>
      ) : filteredNews.length === 0 ? (
        <div className="clubs-empty-state-box">
          <div className="clubs-empty-state-icon">📰</div>
          <h4 className="clubs-empty-state-title">No News Available</h4>
          <p className="clubs-empty-state-desc">
            {scopeTab === "org" && myOrganisations.length === 0
              ? "You're not part of an organisation yet."
              : scopeTab === "club" && myClubs.length === 0
                ? "You're not part of any club yet."
                : "No news articles or updates have been published yet."}
          </p>
        </div>
      ) : (
        <>
          {todayNews.length > 0 && (
            <section className="m2-section">
              <div className="m2-section-header">
                <h2 className="m2-section-title">All news today</h2>
              </div>
              <div className="news-scroll-row">
                {todayNews.map((item) => <NewsCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {otherNews.length > 0 && (
            <section className="m2-section">
              <div className="m2-section-header">
                <h2 className="m2-section-title">Other news</h2>
              </div>
              <div className="news-grid">
                {otherNews.map((item) => <NewsCard key={item.id} item={item} />)}
              </div>
            </section>
          )}
        </>
      )}
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

  if (isDesktop) {
    return (
      <div className="home-container--m2">
        <header className="m2-desktop-header">
          <button className="m2-avatar-btn" aria-label="My profile" onClick={() => navigate("/profile")}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="m2-avatar-img" />
            ) : (
              <span className="m2-avatar-fallback">{(profile.nickname || "?").charAt(0).toUpperCase()}</span>
            )}
          </button>
          <h1 className="m2-org-name">News this week &lsquo;{headerOrgLabel}&rsquo;</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            {unreadCount > 0 && <div className="home-notification-badge" />}
          </button>
        </header>

        <div className="m2-desktop-block">
          {scopeTabsBlock}
          {searchBlock}
          <div style={{ marginTop: 20 }}>{listBlock}</div>
        </div>
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
              <span className="m2-avatar-fallback">{(profile.nickname || "?").charAt(0).toUpperCase()}</span>
            )}
          </button>
          <h1 className="m2-org-name">News this week &lsquo;{headerOrgLabel}&rsquo;</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            {unreadCount > 0 && <div className="home-notification-badge" />}
          </button>
        </header>

        {scopeTabsBlock}
        {searchBlock}
        {listBlock}
      </div>
    </PhoneFrame>
  )
}
