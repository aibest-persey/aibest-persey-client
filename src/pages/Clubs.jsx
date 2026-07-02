import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { useNotifications } from "../hooks/useNotifications.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import { listClubs, createClub } from "../services/clubService.js"
import { listOrganisations } from "../services/organisationService.js"
import { getTileColor } from "../utils/colorTiles.js"
import {
  Bell, Search, Plus,
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
  const { unreadCount } = useNotifications()

  const [profile] = useState(() => {
    const saved = localStorage.getItem("persey_user_profile")
    if (saved) { try { return JSON.parse(saved) } catch { /* fall through */ } }
    return { nickname: user ? (user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User") : "User", avatar: "" }
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clubs, setClubs] = useState([])
  const [myOrganisations, setMyOrganisations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({ name: "", description: "", organisationId: "" })
  const [createBusy, setCreateBusy] = useState(false)
  const [createError, setCreateError] = useState("")

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError("")
    Promise.all([listClubs(token), listOrganisations(token)])
      .then(([clubsData, orgsData]) => {
        setClubs(clubsData)
        const mine = orgsData.filter((o) => o.isMember)
        setMyOrganisations(mine)
        if (mine.length === 1) setCreateForm((f) => ({ ...f, organisationId: mine[0].id }))
      })
      .catch((err) => setError(err.message ?? "Failed to load clubs."))
      .finally(() => setLoading(false))
  }, [token])

  const filteredClubs = clubs.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q)
  })

  const handleCreateClub = async (e) => {
    e.preventDefault()
    if (createBusy || !createForm.name.trim() || !createForm.organisationId) return
    setCreateBusy(true)
    setCreateError("")
    try {
      const club = await createClub(token, {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        organisationId: createForm.organisationId,
      })
      setClubs((prev) => [...prev, club])
      setShowCreateForm(false)
      setCreateForm((f) => ({ ...f, name: "", description: "" }))
      navigate(`/clubs/${club.id}`)
    } catch (err) {
      setCreateError(err.message ?? "Failed to create club.")
    } finally {
      setCreateBusy(false)
    }
  }

  const searchBlock = (
    <div className="clubs-search-pill" style={{ maxWidth: "none" }}>
      <input
        type="text"
        className="clubs-search-input-field"
        placeholder="Search Club"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="clubs-search-action-btn" aria-label="Search">
        <Search size={18} color="#ffffff" />
      </button>
    </div>
  )

  const createFormBlock = showCreateForm && (
    <div className="club-create-overlay" onClick={() => setShowCreateForm(false)}>
      <form className="club-create-form" onClick={(e) => e.stopPropagation()} onSubmit={handleCreateClub}>
        <h3 className="club-create-title">Create a club</h3>
        {myOrganisations.length > 1 && (
          <select
            className="club-create-select"
            value={createForm.organisationId}
            onChange={(e) => setCreateForm((f) => ({ ...f, organisationId: e.target.value }))}
            required
          >
            <option value="" disabled>Choose your organisation</option>
            {myOrganisations.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        )}
        <input
          className="club-create-input"
          placeholder="Club name"
          value={createForm.name}
          onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <textarea
          className="club-create-textarea"
          placeholder="Short description (optional)"
          rows={3}
          value={createForm.description}
          onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
        />
        {createError && <p className="club-create-error">{createError}</p>}
        <div className="club-create-actions">
          <button type="button" className="club-create-cancel-btn" onClick={() => setShowCreateForm(false)}>Cancel</button>
          <button type="submit" className="club-create-submit-btn" disabled={createBusy || !createForm.organisationId}>
            {createBusy ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  )

  const listBlock = (
    <section className="m2-section">
      <div className="m2-section-header">
        <h2 className="m2-section-title">Clubs</h2>
        <span className="m2-see-more" style={{ cursor: "default" }}>
          {filteredClubs.length} club{filteredClubs.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <div className="home-loading">
          <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#5669ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div className="clubs-empty-state-box"><p className="clubs-empty-state-desc">{error}</p></div>
      ) : filteredClubs.length === 0 && !myOrganisations.length ? (
        <div className="clubs-empty-state-box">
          <div className="clubs-empty-state-icon">🎓</div>
          <h4 className="clubs-empty-state-title">No Clubs Found</h4>
          <p className="clubs-empty-state-desc">No clubs have been created yet.</p>
        </div>
      ) : (
        <div className="club-tile-grid">
          {myOrganisations.length > 0 && (
            <button className="club-tile club-tile--add" onClick={() => setShowCreateForm(true)}>
              <div className="club-tile-avatar club-tile-avatar--add"><Plus size={26} /></div>
              <span className="club-tile-name">Add club</span>
            </button>
          )}
          {filteredClubs.map((club) => (
            <button key={club.id} className="club-tile" onClick={() => navigate(`/clubs/${club.id}`)}>
              <div className="club-tile-avatar" style={{ background: getTileColor(club.id) }}>
                {getInitials(club.name)}
              </div>
              <span className="club-tile-name">{club.name}</span>
              {club.description && <span className="club-tile-desc">{club.description}</span>}
            </button>
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
          <h1 className="m2-org-name">All Clubs</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            {unreadCount > 0 && <div className="home-notification-badge" />}
          </button>
        </header>

        <div className="m2-desktop-block">
          {searchBlock}
          {listBlock}
        </div>
        {createFormBlock}
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
          <h1 className="m2-org-name">All Clubs</h1>
          <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            {unreadCount > 0 && <div className="home-notification-badge" />}
          </button>
        </header>

        {searchBlock}
        {listBlock}
        {createFormBlock}
      </div>
    </PhoneFrame>
  )
}
