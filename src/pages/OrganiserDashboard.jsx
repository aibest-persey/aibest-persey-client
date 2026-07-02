import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import {
  listEvents,
  createEvent,
  publishEvent,
  unpublishEvent,
  cancelEvent,
  deleteEvent,
} from "../services/eventService.js"
import { ArrowLeft, Calendar, MapPin, Plus, X, ListTodo, FileText, Users, ClipboardList, Check, Building2 } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import { listAllRoleRequests, approveRoleRequest, rejectRoleRequest } from "../services/roleRequestService.js"
import {
  listOrganisations, createOrganisation, updateOrganisation, listOrgJoinRequests, approveJoinRequest, rejectJoinRequest,
} from "../services/organisationService.js"
import { canAccessOrganiserDashboard, canManageOrganisation } from "../utils/permissions.js"
import { getErrorMessage } from "../utils/errorMessage.js"
import ImageUploadField from "../components/ImageUploadField.jsx"
import { resolveImageUrl } from "../services/uploadService.js"
import "./OrganiserDashboard.css"

export default function OrganiserDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useAuth()

  const [activeTab, setActiveTab] = useState(location.state?.tab ?? "events")
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [roleRequests, setRoleRequests] = useState([])
  const [reqLoading, setReqLoading] = useState(false)
  const [reqMsg, setReqMsg] = useState("")

  // Organisations tab
  const [myOrgs, setMyOrgs] = useState([])
  const [orgsLoading, setOrgsLoading] = useState(false)
  const [orgJoinRequests, setOrgJoinRequests] = useState({})
  const [orgActionId, setOrgActionId] = useState(null)
  const [orgForm, setOrgForm] = useState({ name: "", description: "" })
  const [orgFieldErrors, setOrgFieldErrors] = useState({})
  const [orgCreateLoading, setOrgCreateLoading] = useState(false)
  const [orgMsg, setOrgMsg] = useState("")
  const [editingOrgId, setEditingOrgId] = useState(null)
  const [editOrgForm, setEditOrgForm] = useState({ name: "", description: "", logoUrl: null, bannerUrl: null })
  const [editOrgLoading, setEditOrgLoading] = useState(false)

  // Per-card action state
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Event creation form
  const [form, setForm] = useState({ title: "", description: "", agenda: "", location: "", start: "", end: "", maxCapacity: "", coverImage: null })
  const [fieldErrors, setFieldErrors] = useState({})
  const [createLoading, setCreateLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await listEvents(token)
      // Show only organiser's own events
      setEvents(data.filter((e) => e.isOwner))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadEvents() }, [loadEvents])

  const loadRoleRequests = useCallback(async () => {
    setReqLoading(true)
    try { setRoleRequests(await listAllRoleRequests(token)) }
    catch (e) { setReqMsg(getErrorMessage(e)) }
    finally { setReqLoading(false) }
  }, [token])

  useEffect(() => { if (activeTab === "requests") loadRoleRequests() }, [activeTab])

  const handleApprove = async (id) => {
    try {
      await approveRoleRequest(token, id)
      setRoleRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r))
    } catch (e) { setReqMsg(getErrorMessage(e)) }
  }

  const handleReject = async (id) => {
    try {
      await rejectRoleRequest(token, id)
      setRoleRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r))
    } catch (e) { setReqMsg(getErrorMessage(e)) }
  }

  const loadOrganisations = useCallback(async () => {
    setOrgsLoading(true)
    setOrgMsg("")
    try {
      const orgs = await listOrganisations(token)
      const mine = orgs.filter((o) => o.isMember)
      setMyOrgs(mine)
      const requestsByOrg = {}
      await Promise.all(mine.map(async (org) => {
        try { requestsByOrg[org.id] = await listOrgJoinRequests(token, org.id) }
        catch { requestsByOrg[org.id] = [] }
      }))
      setOrgJoinRequests(requestsByOrg)
    } catch (e) {
      setOrgMsg(getErrorMessage(e))
    } finally {
      setOrgsLoading(false)
    }
  }, [token])

  useEffect(() => { if (activeTab === "organisations") loadOrganisations() }, [activeTab])

  const handleCreateOrganisation = async (e) => {
    e.preventDefault()
    setOrgMsg("")
    const errors = {}
    if (!orgForm.name.trim()) errors.name = "Name is required"
    if (Object.keys(errors).length > 0) { setOrgFieldErrors(errors); return }
    setOrgCreateLoading(true)
    try {
      await createOrganisation(token, {
        name: orgForm.name.trim(),
        description: orgForm.description.trim() || undefined,
      })
      setOrgMsg("Organisation created — pending admin verification.")
      setOrgForm({ name: "", description: "" })
      setOrgFieldErrors({})
      loadOrganisations()
    } catch (err) {
      setOrgMsg(getErrorMessage(err))
    } finally {
      setOrgCreateLoading(false)
    }
  }

  const startEditOrg = (org) => {
    setEditingOrgId(org.id)
    setEditOrgForm({ name: org.name, description: org.description ?? "", logoUrl: org.logoUrl ?? null, bannerUrl: org.bannerUrl ?? null })
    setOrgMsg("")
  }

  const handleSaveOrgEdit = async (e) => {
    e.preventDefault()
    if (!editOrgForm.name.trim()) { setOrgMsg("Name is required"); return }
    setEditOrgLoading(true)
    setOrgMsg("")
    try {
      await updateOrganisation(token, editingOrgId, {
        name: editOrgForm.name.trim(),
        description: editOrgForm.description.trim() || null,
        logoUrl: editOrgForm.logoUrl,
        bannerUrl: editOrgForm.bannerUrl,
      })
      setOrgMsg("Organisation updated.")
      setEditingOrgId(null)
      loadOrganisations()
    } catch (err) {
      setOrgMsg(getErrorMessage(err))
    } finally {
      setEditOrgLoading(false)
    }
  }

  const handleApproveJoin = async (orgId, reqId) => {
    setOrgActionId(reqId)
    try {
      await approveJoinRequest(token, orgId, reqId)
      setOrgJoinRequests((prev) => ({
        ...prev,
        [orgId]: prev[orgId].filter((r) => r.id !== reqId),
      }))
    } catch (e) { setOrgMsg(getErrorMessage(e)) }
    setOrgActionId(null)
  }

  const handleRejectJoin = async (orgId, reqId) => {
    setOrgActionId(reqId)
    try {
      await rejectJoinRequest(token, orgId, reqId)
      setOrgJoinRequests((prev) => ({
        ...prev,
        [orgId]: prev[orgId].filter((r) => r.id !== reqId),
      }))
    } catch (e) { setOrgMsg(getErrorMessage(e)) }
    setOrgActionId(null)
  }

  const updateForm = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const errors = {}
    if (!form.title.trim()) errors.title = "Title is required"
    if (!form.location.trim()) errors.location = "Location is required"
    if (!form.start) errors.start = "Start date and time are required"
    if (!form.end) errors.end = "End date and time are required"
    if (form.start && form.end && new Date(form.end) <= new Date(form.start)) {
      errors.end = "End must be after start"
    }
    if (form.maxCapacity && (isNaN(+form.maxCapacity) || +form.maxCapacity < 1))
      errors.maxCapacity = "Must be a positive number"
    return errors
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    setSuccessMsg("")
    setError("")
    const errors = validateForm()
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setCreateLoading(true)
    try {
      await createEvent(token, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        agenda: form.agenda.trim() || undefined,
        location: form.location.trim(),
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
        maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity, 10) : undefined,
        coverImage: form.coverImage || undefined,
      })
      setSuccessMsg("Event created!")
      setForm({ title: "", description: "", agenda: "", location: "", start: "", end: "", maxCapacity: "", coverImage: null })
      loadEvents()
      setTimeout(() => { setIsModalOpen(false); setSuccessMsg("") }, 1400)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCreateLoading(false)
    }
  }

  const handlePublish = async (id) => {
    setActionLoadingId(id)
    try { await publishEvent(token, id); await loadEvents() } catch (err) { setError(getErrorMessage(err)) }
    setActionLoadingId(null)
  }

  const handleUnpublish = async (id) => {
    setActionLoadingId(id)
    try { await unpublishEvent(token, id); await loadEvents() } catch (err) { setError(getErrorMessage(err)) }
    setActionLoadingId(null)
  }

  const handleCancel = async (id) => {
    setActionLoadingId(id)
    try { await cancelEvent(token, id); await loadEvents() } catch (err) { setError(getErrorMessage(err)) }
    setActionLoadingId(null)
  }

  const handleDelete = async (id) => {
    setActionLoadingId(id)
    setConfirmDeleteId(null)
    try { await deleteEvent(token, id); await loadEvents() } catch (err) { setError(getErrorMessage(err)) }
    setActionLoadingId(null)
  }

  const formatEventDate = (isoStr) => {
    try {
      return new Date(isoStr).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    } catch { return isoStr }
  }

  const STATUS_LABELS = { draft: "Draft", published: "Published", cancelled: "Cancelled" }

  return (
    <PhoneFrame>
      <div className="org-container">
        <header className="org-header">
          <button className="org-back-btn" aria-label="Go back" onClick={() => navigate("/home")}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="org-title">My Events</h1>
          {canAccessOrganiserDashboard(user) && (
            <button className="org-add-btn" aria-label="Create Event" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
            </button>
          )}
        </header>

        {/* Tab bar */}
        <div className="org-tabs">
          <button className={`org-tab ${activeTab === "events" ? "org-tab--active" : ""}`} onClick={() => setActiveTab("events")}>
            <ListTodo size={15} /> My Events
          </button>
          <button className={`org-tab ${activeTab === "requests" ? "org-tab--active" : ""}`} onClick={() => setActiveTab("requests")}>
            <ClipboardList size={15} /> Role Requests
            {roleRequests.filter((r) => r.status === "pending").length > 0 && (
              <span className="org-tab-badge">{roleRequests.filter((r) => r.status === "pending").length}</span>
            )}
          </button>
          <button className={`org-tab ${activeTab === "organisations" ? "org-tab--active" : ""}`} onClick={() => setActiveTab("organisations")}>
            <Building2 size={15} /> Organisations
            {Object.values(orgJoinRequests).flat().length > 0 && (
              <span className="org-tab-badge">{Object.values(orgJoinRequests).flat().length}</span>
            )}
          </button>
        </div>

        <div className="org-body">
          {activeTab === "requests" && (
            <div className="org-req-list">
              {reqLoading && <div className="org-loading-state"><div className="spinner" /></div>}
              {reqMsg && <div className="org-banner org-banner--error">{reqMsg}</div>}
              {!reqLoading && roleRequests.length === 0 && (
                <div className="org-empty-state"><p>No role change requests.</p></div>
              )}
              {roleRequests.map((r) => (
                <div key={r.id} className="org-req-card">
                  <div className="org-req-avatar" style={{ background: r.student?.color || "#5669ff" }}>
                    {(r.student?.username || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="org-req-body">
                    <div className="org-req-name">{r.student?.firstName ? `${r.student.firstName} ${r.student.lastName || ""}`.trim() : r.student?.username}</div>
                    <div className="org-req-sub">Requesting: <strong>{r.requestedRole}</strong></div>
                    {r.reason && <div className="org-req-reason">"{r.reason}"</div>}
                    <span className={`org-req-status org-req-status--${r.status}`}>{r.status}</span>
                  </div>
                  {r.status === "pending" && (
                    <div className="org-req-actions">
                      <button className="org-req-btn org-req-btn--approve" onClick={() => handleApprove(r.id)}><Check size={14} /></button>
                      <button className="org-req-btn org-req-btn--reject" onClick={() => handleReject(r.id)}><X size={14} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "organisations" && (
            <div className="org-req-list">
              {orgMsg && <div className="org-banner" style={{ marginBottom: 16 }}>{orgMsg}</div>}

              <form onSubmit={handleCreateOrganisation} className="org-modal-form" noValidate style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700, color: "#111638" }}>Create an organisation</h3>
                <TextField icon={Building2} name="name" placeholder="Organisation name" value={orgForm.name}
                  onChange={(e) => { setOrgForm((f) => ({ ...f, name: e.target.value })); setOrgFieldErrors({}) }}
                  error={orgFieldErrors.name} />
                <div className="org-form-field">
                  <textarea
                    className="org-textarea"
                    placeholder="Description (optional)"
                    rows={2}
                    value={orgForm.description}
                    onChange={(e) => setOrgForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="org-form-action">
                  <PrimaryButton type="submit" loading={orgCreateLoading}>Create Organisation</PrimaryButton>
                </div>
              </form>

              {orgsLoading && <div className="org-loading-state"><div className="spinner" /></div>}
              {!orgsLoading && myOrgs.length === 0 && (
                <div className="org-empty-state"><p>You're not part of any organisation yet.</p></div>
              )}
              {myOrgs.map((org) => (
                <div key={org.id} style={{ marginBottom: 16 }}>
                  <div className="org-req-card" style={{ marginBottom: (orgJoinRequests[org.id]?.length ?? 0) > 0 ? 8 : 0 }}>
                    <div
                      className="org-req-avatar"
                      style={org.logoUrl ? { backgroundImage: `url(${resolveImageUrl(org.logoUrl)})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "#5669ff" }}
                    >
                      {!org.logoUrl && org.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="org-req-body">
                      <div className="org-req-name">{org.name}</div>
                      <span className={`org-req-status org-req-status--${org.status === "verified" ? "approved" : "pending"}`}>{org.status}</span>
                    </div>
                    {canManageOrganisation(org.myRole) && (
                      <button type="button" className="org-req-edit-btn" onClick={() => startEditOrg(org)}>Edit</button>
                    )}
                  </div>

                  {editingOrgId === org.id && (
                    <form onSubmit={handleSaveOrgEdit} className="org-modal-form" style={{ margin: "8px 0 16px 0", padding: 14, background: "#f6f7fb", borderRadius: 14 }}>
                      <div style={{ display: "flex", gap: 16 }}>
                        <ImageUploadField shape="circle" label="Logo" value={editOrgForm.logoUrl} onChange={(url) => setEditOrgForm((f) => ({ ...f, logoUrl: url }))} />
                        <div style={{ flex: 1 }}>
                          <ImageUploadField shape="banner" label="Banner" value={editOrgForm.bannerUrl} onChange={(url) => setEditOrgForm((f) => ({ ...f, bannerUrl: url }))} />
                        </div>
                      </div>
                      <TextField icon={Building2} name="name" placeholder="Organisation name" value={editOrgForm.name}
                        onChange={(e) => setEditOrgForm((f) => ({ ...f, name: e.target.value }))} />
                      <div className="org-form-field">
                        <textarea
                          className="org-textarea"
                          placeholder="Description (optional)"
                          rows={2}
                          value={editOrgForm.description}
                          onChange={(e) => setEditOrgForm((f) => ({ ...f, description: e.target.value }))}
                        />
                      </div>
                      <div className="org-form-action" style={{ display: "flex", gap: 10 }}>
                        <button type="button" className="org-action-btn org-action-btn--secondary" onClick={() => setEditingOrgId(null)}>Cancel</button>
                        <PrimaryButton type="submit" loading={editOrgLoading}>Save</PrimaryButton>
                      </div>
                    </form>
                  )}

                  {(orgJoinRequests[org.id] ?? []).map((r) => (
                    <div key={r.id} className="org-req-card" style={{ marginLeft: 20 }}>
                      <div className="org-req-avatar" style={{ background: r.student?.color || "#5669ff" }}>
                        {(r.student?.username || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="org-req-body">
                        <div className="org-req-name">{r.student?.firstName ? `${r.student.firstName} ${r.student.lastName || ""}`.trim() : r.student?.username}</div>
                        <div className="org-req-sub">Wants to join <strong>{org.name}</strong></div>
                      </div>
                      <div className="org-req-actions">
                        <button className="org-req-btn org-req-btn--approve" disabled={orgActionId === r.id} onClick={() => handleApproveJoin(org.id, r.id)}><Check size={14} /></button>
                        <button className="org-req-btn org-req-btn--reject" disabled={orgActionId === r.id} onClick={() => handleRejectJoin(org.id, r.id)}><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === "events" && <>
          <div className="org-welcome">
            <p className="org-welcome-sub">Logged in as {user?.username} · Organiser</p>
            <h2 className="org-welcome-title">Manage Your Events</h2>
          </div>

          {error && (
            <div className="org-banner org-banner--error" style={{ marginBottom: 16 }}>{error}</div>
          )}

          {loading && events.length === 0 ? (
            <div className="org-loading-state">
              <div className="spinner" />
              <p>Fetching events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="org-empty-state">
              <div className="org-empty-icon-wrap">
                <ListTodo size={48} color="#9da2e0" />
              </div>
              <h3>No Events Yet</h3>
              <p>Create your first event to invite attendees.</p>
              {canAccessOrganiserDashboard(user) && (
                <button className="org-empty-cta" onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} />
                  <span>Create Event</span>
                </button>
              )}
            </div>
          ) : (
            <div className="org-events-list">
              {events.map((evt) => {
                const busy = actionLoadingId === evt.id
                return (
                  <div key={evt.id} className="org-event-card">
                    {/* Card header: title + status badge */}
                    <div className="org-event-card-header">
                      <button
                        className="org-event-card-title-btn"
                        onClick={() => navigate(`/events/${evt.id}`)}
                      >
                        {evt.title}
                      </button>
                      <span className={`org-status-badge org-status-badge--${evt.status}`}>
                        {STATUS_LABELS[evt.status] ?? evt.status}
                      </span>
                    </div>

                    {evt.description && (
                      <p className="org-event-card-desc">{evt.description}</p>
                    )}

                    <div className="org-event-card-meta">
                      <div className="org-meta-item">
                        <Calendar size={14} className="org-meta-icon" />
                        <span>{formatEventDate(evt.date)}</span>
                      </div>
                      {evt.location && (
                        <div className="org-meta-item">
                          <MapPin size={14} className="org-meta-icon" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                      <div className="org-meta-item">
                        <Users size={14} className="org-meta-icon" />
                        <span>
                          {evt.registrationCount ?? 0} registered
                          {evt.maxCapacity ? ` / ${evt.maxCapacity} capacity` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="org-event-actions">
                      {evt.status === "draft" && (
                        <button
                          className="org-action-btn org-action-btn--publish"
                          onClick={() => handlePublish(evt.id)}
                          disabled={busy}
                        >
                          {busy ? "..." : "Publish"}
                        </button>
                      )}
                      {evt.status === "published" && (
                        <>
                          <button
                            className="org-action-btn org-action-btn--secondary"
                            onClick={() => handleUnpublish(evt.id)}
                            disabled={busy}
                          >
                            {busy ? "..." : "Unpublish"}
                          </button>
                          <button
                            className="org-action-btn org-action-btn--danger"
                            onClick={() => handleCancel(evt.id)}
                            disabled={busy}
                          >
                            {busy ? "..." : "Cancel Event"}
                          </button>
                        </>
                      )}
                      {evt.status !== "published" && confirmDeleteId === evt.id ? (
                        <div className="org-delete-confirm">
                          <span>Delete this event?</span>
                          <button
                            className="org-action-btn org-action-btn--danger"
                            onClick={() => handleDelete(evt.id)}
                            disabled={busy}
                          >
                            {busy ? "..." : "Yes, delete"}
                          </button>
                          <button
                            className="org-action-btn org-action-btn--secondary"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        evt.status !== "published" && (
                          <button
                            className="org-action-btn org-action-btn--ghost"
                            onClick={() => setConfirmDeleteId(evt.id)}
                            disabled={busy}
                          >
                            Delete
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          </>}
        </div>

        {/* Create Event modal */}
        {isModalOpen && (
          <div className="org-modal-overlay">
            <div className="org-modal-content">
              <div className="org-modal-header">
                <h2>Create Event</h2>
                <button className="org-modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="org-modal-form" noValidate>
                {successMsg && (
                  <div className="org-banner org-banner--success" role="status">{successMsg}</div>
                )}
                {error && (
                  <div className="org-banner org-banner--error" role="alert">{error}</div>
                )}

                <ImageUploadField
                  shape="banner"
                  label="Event banner (optional)"
                  value={form.coverImage}
                  onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
                />

                <TextField icon={FileText} name="title" placeholder="Event Title" value={form.title} onChange={updateForm} error={fieldErrors.title} />

                <div className="org-form-field">
                  <textarea
                    name="description"
                    className="org-textarea"
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={updateForm}
                    rows={3}
                  />
                </div>

                <div className="org-form-field">
                  <textarea
                    name="agenda"
                    className="org-textarea"
                    placeholder={"Agenda (optional) — one item per line, e.g.\n11:00 – 11:30 – Opening"}
                    value={form.agenda}
                    onChange={updateForm}
                    rows={3}
                  />
                </div>

                <TextField icon={MapPin} name="location" placeholder="Location / Venue" value={form.location} onChange={updateForm} error={fieldErrors.location} />

                <div className="org-form-row">
                  <div className="org-form-field">
                    <div className="org-datetime-input-wrapper">
                      <Calendar className="org-datetime-icon" size={20} />
                      <input
                        type="datetime-local"
                        name="start"
                        aria-label="Start date and time"
                        className={`org-datetime-input ${fieldErrors.start ? "org-datetime-input--error" : ""}`}
                        value={form.start}
                        onChange={updateForm}
                      />
                    </div>
                    {fieldErrors.start && <span className="field__error" style={{ marginTop: 4, display: "block" }}>{fieldErrors.start}</span>}
                  </div>
                  <div className="org-form-field">
                    <div className="org-datetime-input-wrapper">
                      <Calendar className="org-datetime-icon" size={20} />
                      <input
                        type="datetime-local"
                        name="end"
                        aria-label="End date and time"
                        className={`org-datetime-input ${fieldErrors.end ? "org-datetime-input--error" : ""}`}
                        value={form.end}
                        onChange={updateForm}
                      />
                    </div>
                    {fieldErrors.end && <span className="field__error" style={{ marginTop: 4, display: "block" }}>{fieldErrors.end}</span>}
                  </div>
                </div>

                <TextField icon={Users} name="maxCapacity" placeholder="Max Capacity (optional)" value={form.maxCapacity} onChange={updateForm} error={fieldErrors.maxCapacity} />

                <div className="org-form-action">
                  <PrimaryButton type="submit" loading={createLoading}>Create Event</PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  )
}
