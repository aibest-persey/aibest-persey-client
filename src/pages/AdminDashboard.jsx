import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { listUsers, setUserRole, listAllEvents, adminCancelEvent, adminDeleteEvent } from "../services/adminService.js"
import { listAllRoleRequests, approveRoleRequest, rejectRoleRequest } from "../services/roleRequestService.js"
import { useNotifications } from "../hooks/useNotifications.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { Users, Calendar, ClipboardList, Trash2, Ban, Check, X, Bell } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./AdminDashboard.css"

const ROLE_COLORS = { student: "#5669ff", organiser: "#29d697", admin: "#f59762" }
const STATUS_COLORS = { draft: "#9a9cae", published: "#29d697", cancelled: "#f0635a" }
const REQ_COLORS = { pending: "#f59762", approved: "#29d697", rejected: "#f0635a" }

function Badge({ label, color }) {
  return <span className="adm-badge" style={{ background: color + "22", color }}>{label}</span>
}

export default function AdminDashboard() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const isDesktop = useIsDesktop()
  const [tab, setTab] = useState("users")

  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [actionMsg, setActionMsg] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(null)

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000) }

  const loadUsers = useCallback(async () => {
    setLoading(true); setError("")
    try { setUsers(await listUsers(token)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token])

  const loadEvents = useCallback(async () => {
    setLoading(true); setError("")
    try { setEvents(await listAllEvents(token)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token])

  const loadRequests = useCallback(async () => {
    setLoading(true); setError("")
    try { setRequests(await listAllRoleRequests(token)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => {
    if (tab === "users") loadUsers()
    else if (tab === "events") loadEvents()
    else loadRequests()
  }, [tab])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await setUserRole(token, userId, newRole)
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
      flash(`Role updated to ${newRole}.`)
    } catch (e) { flash(e.message) }
  }

  const handleCancelEvent = async (id) => {
    try {
      await adminCancelEvent(token, id)
      setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: "cancelled" } : e))
      flash("Event cancelled.")
    } catch (e) { flash(e.message) }
  }

  const handleDeleteEvent = async (id) => {
    try {
      await adminDeleteEvent(token, id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
      setConfirmDelete(null)
      flash("Event deleted.")
    } catch (e) { flash(e.message) }
  }

  const handleApprove = async (id) => {
    try {
      await approveRoleRequest(token, id)
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r))
      flash("Request approved.")
    } catch (e) { flash(e.message) }
  }

  const handleReject = async (id) => {
    try {
      await rejectRoleRequest(token, id)
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r))
      flash("Request rejected.")
    } catch (e) { flash(e.message) }
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length

  return (
    <PhoneFrame>
      <div className="adm-container">
        <header className="adm-header">
          <h1 className="adm-title">Admin Dashboard</h1>
          {!isDesktop && (
            <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
              <Bell size={18} />
              {unreadCount > 0 && <div className="home-notification-badge" />}
            </button>
          )}
        </header>

        {actionMsg && <div className="adm-flash">{actionMsg}</div>}

        <div className="adm-tabs">
          <button className={`adm-tab ${tab === "users" ? "adm-tab--active" : ""}`} onClick={() => setTab("users")}>
            <Users size={15} /> Users
          </button>
          <button className={`adm-tab ${tab === "events" ? "adm-tab--active" : ""}`} onClick={() => setTab("events")}>
            <Calendar size={15} /> Events
          </button>
          <button className={`adm-tab ${tab === "requests" ? "adm-tab--active" : ""}`} onClick={() => setTab("requests")}>
            <ClipboardList size={15} /> Role Requests
            {pendingCount > 0 && <span className="adm-badge-count">{pendingCount}</span>}
          </button>
        </div>

        {loading ? (
          <div className="adm-loading"><div className="adm-spinner" /></div>
        ) : error ? (
          <div className="adm-error">{error}</div>
        ) : (
          <div className="adm-content">

            {/* USERS TAB */}
            {tab === "users" && (
              <div className="adm-list">
                {users.map((u) => (
                  <div key={u.id} className="adm-card">
                    <div className="adm-card-avatar" style={{ background: u.color || "#5669ff" }}>
                      {(u.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="adm-card-body">
                      <div className="adm-card-name">{u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u.username}</div>
                      <div className="adm-card-sub">{u.email}</div>
                      <Badge label={u.role} color={ROLE_COLORS[u.role] || "#9a9cae"} />
                    </div>
                    <select
                      className="adm-role-select"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="student">student</option>
                      <option value="organiser">organiser</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* EVENTS TAB */}
            {tab === "events" && (
              <div className="adm-list">
                {events.map((evt) => (
                  <div key={evt.id} className="adm-card">
                    <div className="adm-card-body">
                      <div className="adm-card-name">{evt.title}</div>
                      <div className="adm-card-sub">{evt.organiser?.username || "—"} · {evt.date ? new Date(evt.date).toLocaleDateString() : "No date"}</div>
                      <Badge label={evt.status} color={STATUS_COLORS[evt.status] || "#9a9cae"} />
                    </div>
                    <div className="adm-card-actions">
                      {evt.status !== "cancelled" && (
                        <button className="adm-action-btn adm-action-btn--warn" onClick={() => handleCancelEvent(evt.id)} title="Cancel event">
                          <Ban size={15} />
                        </button>
                      )}
                      {confirmDelete === evt.id ? (
                        <>
                          <button className="adm-action-btn adm-action-btn--danger" onClick={() => handleDeleteEvent(evt.id)} title="Confirm delete">
                            <Check size={15} />
                          </button>
                          <button className="adm-action-btn" onClick={() => setConfirmDelete(null)} title="Cancel">
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <button className="adm-action-btn adm-action-btn--danger" onClick={() => setConfirmDelete(evt.id)} title="Delete event">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ROLE REQUESTS TAB */}
            {tab === "requests" && (
              <div className="adm-list">
                {requests.length === 0 && (
                  <div className="adm-empty">No role change requests.</div>
                )}
                {requests.map((r) => (
                  <div key={r.id} className="adm-card adm-card--request">
                    <div className="adm-card-avatar" style={{ background: r.student?.color || "#5669ff" }}>
                      {(r.student?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="adm-card-body">
                      <div className="adm-card-name">
                        {r.student?.firstName ? `${r.student.firstName} ${r.student.lastName || ""}`.trim() : r.student?.username}
                      </div>
                      <div className="adm-card-sub">Requesting: <strong>{r.requestedRole}</strong></div>
                      {r.reason && <div className="adm-request-reason">"{r.reason}"</div>}
                      <Badge label={r.status} color={REQ_COLORS[r.status] || "#9a9cae"} />
                    </div>
                    {r.status === "pending" && (
                      <div className="adm-card-actions">
                        <button className="adm-action-btn adm-action-btn--approve" onClick={() => handleApprove(r.id)} title="Approve">
                          <Check size={15} />
                        </button>
                        <button className="adm-action-btn adm-action-btn--danger" onClick={() => handleReject(r.id)} title="Reject">
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </PhoneFrame>
  )
}
