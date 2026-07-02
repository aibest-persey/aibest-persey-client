import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { useNotifications } from "../hooks/useNotifications.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import { getClub, joinClub, leaveClub } from "../services/clubService.js"
import { listPosts, createPost } from "../services/postService.js"
import { listEvents, createEvent } from "../services/eventService.js"
import { listNews } from "../services/newsService.js"
import { getGradient, getTileColor } from "../utils/colorTiles.js"
import {
  Bell, Users, MessageSquare, Calendar, Megaphone, MapPin, Clock,
  User, SlidersHorizontal, Bookmark, Mail, LogOut, CalendarCheck, ShieldCheck,
} from "lucide-react"
import "./ClubDetail.css"

function getInitials(name) {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"
}

function authorName(author) {
  if (!author) return "Unknown"
  return author.firstName ? `${author.firstName} ${author.lastName ?? ""}`.trim() : author.username
}

function formatTimestamp(isoStr) {
  try {
    return new Date(isoStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  } catch { return "" }
}

function formatEventDateTime(isoStr) {
  try {
    const d = new Date(isoStr)
    return {
      date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
  } catch { return { date: "--", time: "" } }
}

const EMPTY_EVENT_FORM = { title: "", description: "", location: "", start: "", end: "", capacity: "" }

export default function ClubDetail() {
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
  const [club, setClub] = useState(null)
  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [membershipBusy, setMembershipBusy] = useState(false)

  const [showPostForm, setShowPostForm] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [postBusy, setPostBusy] = useState(false)
  const [postError, setPostError] = useState("")

  const [showEventForm, setShowEventForm] = useState(false)
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM)
  const [eventBusy, setEventBusy] = useState(false)
  const [eventError, setEventError] = useState("")
  const [feedLoadError, setFeedLoadError] = useState("")

  const loadAll = useCallback(() => {
    if (!token || !id) return
    setLoading(true)
    setError("")
    setFeedLoadError("")

    getClub(token, id)
      .then((clubData) => {
        setClub(clubData)

        // Feed/events/news are independent, supplementary sections — one failing
        // (e.g. the feed 403ing for a non-member) shouldn't take down the whole page.
        listPosts(token, id)
          .then(setPosts)
          .catch((err) => setFeedLoadError(err.message ?? "Unable to load the feed."))
        listEvents(token, { clubId: id }).then(setEvents).catch(() => setEvents([]))
        listNews(token, { scope: "club", clubId: id }).then(setNews).catch(() => setNews([]))
      })
      .catch((err) => setError(err.message ?? "Failed to load this club."))
      .finally(() => setLoading(false))
  }, [token, id])

  useEffect(() => { loadAll() }, [loadAll])

  const handleToggleMembership = async () => {
    if (!club || membershipBusy) return
    setMembershipBusy(true)
    setError("")
    try {
      if (club.isMember) {
        const res = await leaveClub(token, club.id)
        setClub((c) => ({ ...c, isMember: false, myRole: null, memberCount: res.memberCount }))
      } else {
        const res = await joinClub(token, club.id)
        setClub((c) => ({ ...c, isMember: true, myRole: "member", memberCount: res.memberCount }))
      }
    } catch (err) {
      setError(err.message ?? "Something went wrong.")
    } finally {
      setMembershipBusy(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!postContent.trim() || postBusy) return
    setPostBusy(true)
    setPostError("")
    try {
      const post = await createPost(token, { clubId: id, content: postContent.trim() })
      setPosts((prev) => [post, ...prev])
      setPostContent("")
      setShowPostForm(false)
    } catch (err) {
      setPostError(err.message ?? "Failed to post.")
    } finally {
      setPostBusy(false)
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (eventBusy) return
    setEventBusy(true)
    setEventError("")
    try {
      const created = await createEvent(token, {
        title: eventForm.title,
        description: eventForm.description || undefined,
        location: eventForm.location || undefined,
        start: eventForm.start ? new Date(eventForm.start).toISOString() : undefined,
        end: eventForm.end ? new Date(eventForm.end).toISOString() : undefined,
        capacity: eventForm.capacity ? Number(eventForm.capacity) : undefined,
        ownerScope: "club",
        clubId: id,
      })
      setEvents((prev) => [...prev, created].sort((a, b) => new Date(a.date) - new Date(b.date)))
      setEventForm(EMPTY_EVENT_FORM)
      setShowEventForm(false)
    } catch (err) {
      setEventError(err.message ?? "Failed to create event.")
    } finally {
      setEventBusy(false)
    }
  }

  const canPost = club?.myRole !== null && club?.myRole !== undefined
  const canManageClub = club?.myRole === "owner" || club?.myRole === "manager"
  const canCreateEvent = canManageClub && user?.role === "organiser"
  const showEventGateHint = canManageClub && user?.role !== "organiser"

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
          <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/clubs") }}>
            <Users size={20} className="sidebar-nav-icon" /><span>Clubs</span>
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

  const header = (
    <header className={isDesktop ? "m2-desktop-header" : "m2-header"}>
      <button className="m2-avatar-btn" aria-label={isDesktop ? "My profile" : "Open menu"} onClick={() => (isDesktop ? navigate("/profile") : setSidebarOpen(true))}>
        {profile.avatar ? (
          <img src={profile.avatar} alt="" className="m2-avatar-img" />
        ) : (
          <span className="m2-avatar-fallback">{getInitials(profile.nickname)}</span>
        )}
      </button>
      <h1 className="m2-org-name">Club</h1>
      <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
        <Bell size={18} />
        {unreadCount > 0 && <div className="home-notification-badge" />}
      </button>
    </header>
  )

  const loadingOrErrorBlock = loading ? (
    <div className="home-loading">
      <div style={{ width: 28, height: 28, border: "3px solid #e2e5f1", borderTopColor: "#5669ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ) : error && !club ? (
    <div className="clubs-empty-state-box">
      <p className="clubs-empty-state-desc">{error}</p>
      <button className="club-list-join-btn" style={{ marginTop: 16 }} onClick={() => navigate("/clubs")}>Back to Clubs</button>
    </div>
  ) : null

  const topBlock = !club ? null : (
    <>
      <div className="clubdetail-banner" style={{ background: getGradient(club.id) }}>
        <div className="clubdetail-banner-shape" />
      </div>

      <div className="clubdetail-header-row">
        <div className="clubdetail-avatar" style={{ background: getTileColor(club.id) }}>
          {getInitials(club.name)}
        </div>
        <div className="clubdetail-header-info">
          <h2 className="clubdetail-name">{club.name}</h2>
          <span className="clubdetail-meta"><Users size={13} /> {club.memberCount} member{club.memberCount === 1 ? "" : "s"}</span>
        </div>
        <button
          className={`club-list-join-btn ${club.isMember ? "club-list-join-btn--joined" : ""}`}
          disabled={membershipBusy}
          onClick={handleToggleMembership}
        >
          {membershipBusy ? "..." : club.isMember ? "Leave" : "Join"}
        </button>
      </div>

      {club.description && <p className="clubdetail-desc">{club.description}</p>}
      {error && <div className="clubdetail-error">{error}</div>}
    </>
  )

  const feedBlock = !club ? null : (
    <>
      {/* Feed */}
      <section className="clubdetail-section">
        <div className="clubdetail-section-header">
          <h3 className="clubdetail-section-title"><MessageSquare size={16} /> Feed</h3>
          {canPost && (
            <button className="clubdetail-new-btn" onClick={() => setShowPostForm((v) => !v)}>
              {showPostForm ? "Cancel" : "New Post"}
            </button>
          )}
        </div>

        {showPostForm && (
          <form className="clubdetail-post-form" onSubmit={handleCreatePost}>
            <textarea
              className="clubdetail-post-textarea"
              placeholder="Share something with the club..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={3}
            />
            {postError && <div className="clubdetail-form-error">{postError}</div>}
            <button type="submit" className="clubdetail-new-btn" disabled={postBusy || !postContent.trim()}>
              {postBusy ? "Posting..." : "Post"}
            </button>
          </form>
        )}

        {feedLoadError ? (
          <p className="clubdetail-empty-text">{feedLoadError}</p>
        ) : posts.length === 0 ? (
          <p className="clubdetail-empty-text">No posts yet.</p>
        ) : (
          <div className="clubdetail-feed-list">
            {posts.map((post) => (
              <div key={post.id} className="clubdetail-feed-card">
                <div className="clubdetail-feed-avatar" style={{ background: getTileColor(post.authorId) }}>
                  {getInitials(authorName(post.author))}
                </div>
                <div className="clubdetail-feed-body">
                  <div className="clubdetail-feed-top">
                    <span className="clubdetail-feed-author">{authorName(post.author)}</span>
                    <span className="clubdetail-feed-time">{formatTimestamp(post.createdAt)}</span>
                  </div>
                  <p className="clubdetail-feed-content">{post.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )

  const eventsBlock = !club ? null : (
    <>
      {/* Events */}
      <section className="clubdetail-section">
        <div className="clubdetail-section-header">
          <h3 className="clubdetail-section-title"><Calendar size={16} /> Events</h3>
          {canCreateEvent && (
            <button className="clubdetail-new-btn" onClick={() => setShowEventForm((v) => !v)}>
              {showEventForm ? "Cancel" : "New Event"}
            </button>
          )}
        </div>

        {showEventGateHint && (
          <p className="clubdetail-hint">Only organisers can create events for this club.</p>
        )}

        {showEventForm && (
          <form className="clubdetail-event-form" onSubmit={handleCreateEvent}>
            <input
              className="clubdetail-input"
              placeholder="Event title"
              value={eventForm.title}
              onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <textarea
              className="clubdetail-post-textarea"
              placeholder="Description (optional)"
              value={eventForm.description}
              onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
            <input
              className="clubdetail-input"
              placeholder="Location (optional)"
              value={eventForm.location}
              onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
            />
            <div className="clubdetail-form-row">
              <label className="clubdetail-input-label">
                Start
                <input
                  className="clubdetail-input"
                  type="datetime-local"
                  value={eventForm.start}
                  onChange={(e) => setEventForm((f) => ({ ...f, start: e.target.value }))}
                  required
                />
              </label>
              <label className="clubdetail-input-label">
                End
                <input
                  className="clubdetail-input"
                  type="datetime-local"
                  value={eventForm.end}
                  onChange={(e) => setEventForm((f) => ({ ...f, end: e.target.value }))}
                  required
                />
              </label>
            </div>
            <input
              className="clubdetail-input"
              type="number"
              min="1"
              placeholder="Capacity (optional)"
              value={eventForm.capacity}
              onChange={(e) => setEventForm((f) => ({ ...f, capacity: e.target.value }))}
            />
            {eventError && <div className="clubdetail-form-error">{eventError}</div>}
            <button type="submit" className="clubdetail-new-btn" disabled={eventBusy}>
              {eventBusy ? "Creating..." : "Create Event"}
            </button>
          </form>
        )}

        {events.length === 0 ? (
          <p className="clubdetail-empty-text">No upcoming events.</p>
        ) : (
          <div className="clubdetail-feed-list">
            {events.map((evt) => {
              const { date, time } = formatEventDateTime(evt.date)
              return (
                <div key={evt.id} className="clubdetail-event-card" onClick={() => navigate(`/events/${evt.id}`)}>
                  <div className="clubdetail-event-body">
                    <span className="clubdetail-event-title">{evt.title}</span>
                    <div className="clubdetail-feed-top">
                      <Clock size={12} /><span className="clubdetail-feed-time">{date} · {time}</span>
                    </div>
                    {evt.location && (
                      <div className="clubdetail-feed-top">
                        <MapPin size={12} /><span className="clubdetail-feed-time">{evt.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )

  const newsBlock = !club ? null : (
    <>
      {/* News */}
      <section className="clubdetail-section">
        <div className="clubdetail-section-header">
          <h3 className="clubdetail-section-title"><Megaphone size={16} /> News</h3>
        </div>

        {news.length === 0 ? (
          <p className="clubdetail-empty-text">No news yet.</p>
        ) : (
          <div className="clubdetail-feed-list">
            {news.map((item) => (
              <div key={item.id} className="clubdetail-feed-card">
                <div className="clubdetail-feed-body">
                  <div className="clubdetail-feed-top">
                    <span className="clubdetail-feed-author">{item.title}</span>
                    <span className="clubdetail-feed-time">{formatTimestamp(item.createdAt)}</span>
                  </div>
                  <p className="clubdetail-feed-content">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )

  if (isDesktop) {
    return (
      <div className="home-container--m2">
        {header}
        {loadingOrErrorBlock && <div className="m2-desktop-block">{loadingOrErrorBlock}</div>}
        {club && (
          <>
            <div className="m2-desktop-block">{topBlock}</div>
            <div className="m2-desktop-grid">
              <div className="m2-desktop-left">
                <div className="m2-desktop-block">{feedBlock}</div>
              </div>
              <div className="m2-desktop-right">
                <div className="m2-desktop-widget">{eventsBlock}</div>
                <div className="m2-desktop-widget">{newsBlock}</div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <PhoneFrame>
      <div className="home-container--m2 clubdetail-page">
        {sidebarDrawer}
        {header}
        {loadingOrErrorBlock}
        {topBlock}
        {feedBlock}
        {eventsBlock}
        {newsBlock}
      </div>
    </PhoneFrame>
  )
}
