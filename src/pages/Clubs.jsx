import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import { listClubs, joinClub, leaveClub } from "../services/clubService.js"
import { getTileColor } from "../utils/colorTiles.js"
import {
  Bell, Search, Users,
  User, SlidersHorizontal, Calendar, Bookmark, Mail, LogOut, CalendarCheck, ShieldCheck,
} from "lucide-react"
import "./Clubs.css"

function getInitials(name) {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"
}

export default function Clubs() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const [profile] = useState(() => {
    const saved = localStorage.getItem("persey_user_profile")
    if (saved) { try { return JSON.parse(saved) } catch { /* fall through */ } }
    return { nickname: user ? (user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User") : "User", avatar: "" }
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError("")
    listClubs(token)
      .then(setClubs)
      .catch((err) => setError(err.message ?? "Failed to load clubs."))
      .finally(() => setLoading(false))
  }, [token])

  const filteredClubs = clubs.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q)
  })

  const handleToggleMembership = async (club) => {
    if (busyId) return
    setBusyId(club.id)
    setError("")
    try {
      if (club.isMember) {
        await leaveClub(token, club.id)
        setClubs((prev) => prev.map((c) => (
          c.id === club.id ? { ...c, isMember: false, memberCount: Math.max(0, c.memberCount - 1) } : c
        )))
      } else {
        await joinClub(token, club.id)
        setClubs((prev) => prev.map((c) => (
          c.id === club.id ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c
        )))
      }
    } catch (err) {
      setError(err.message ?? "Something went wrong.")
    } finally {
      setBusyId(null)
    }
  }

  const searchBlock = (
    <div className="clubs-search-pill" style={{ maxWidth: "none" }}>
      <input
        type="text"
        className="clubs-search-input-field"
        placeholder="Search clubs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="clubs-search-action-btn" aria-label="Search">
        <Search size={18} color="#ffffff" />
      </button>
    </div>
  )

  const listBlock = loading ? (
    <div className="home-loading">
      <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#5669ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ) : error ? (
    <div className="clubs-empty-state-box"><p className="clubs-empty-state-desc">{error}</p></div>
  ) : filteredClubs.length === 0 ? (
    <div className="clubs-empty-state-box">
      <div className="clubs-empty-state-icon">🎓</div>
      <h4 className="clubs-empty-state-title">No Clubs Found</h4>
      <p className="clubs-empty-state-desc">
        {clubs.length === 0 ? "No clubs have been created yet." : "Try a different search."}
      </p>
    </div>
  ) : (
    <div className="club-list-grid">
      {filteredClubs.map((club) => (
        <div key={club.id} className="club-list-card">
          <div className="club-list-avatar" style={{ background: getTileColor(club.id) }}>
            {getInitials(club.name)}
          </div>
          <div className="club-list-info">
            <h3 className="club-list-name">{club.name}</h3>
            {club.description && <p className="club-list-desc">{club.description}</p>}
            <span className="club-list-meta"><Users size={12} /> {club.memberCount} member{club.memberCount === 1 ? "" : "s"}</span>
          </div>
          <button
            className={`club-list-join-btn ${club.isMember ? "club-list-join-btn--joined" : ""}`}
            disabled={busyId === club.id}
            onClick={() => handleToggleMembership(club)}
          >
            {busyId === club.id ? "..." : club.isMember ? "Leave" : "Join"}
          </button>
        </div>
      ))}
    </div>
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
          <h1 className="m2-org-name">Clubs</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            <div className="home-notification-badge" />
          </button>
        </header>

        <div className="m2-desktop-block">
          {searchBlock}
          <div style={{ marginTop: "20px" }}>{listBlock}</div>
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
              <span className="m2-avatar-fallback">{getInitials(profile.nickname)}</span>
            )}
          </button>
          <h1 className="m2-org-name">Clubs</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            <div className="home-notification-badge" />
          </button>
        </header>

        <div style={{ marginBottom: "20px" }}>{searchBlock}</div>
        {listBlock}
      </div>
    </PhoneFrame>
  )
}
