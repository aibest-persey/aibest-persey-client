import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import {
  listEvents,
  createEvent,
  publishEvent,
  unpublishEvent,
  cancelEvent,
  deleteEvent,
} from "../services/eventService.js"
import { ArrowLeft, Calendar, MapPin, Plus, X, ListTodo, FileText, Users } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import "./OrganiserDashboard.css"

export default function OrganiserDashboard() {
  const navigate = useNavigate()
  const { token, user } = useAuth()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Per-card action state
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Event creation form
  const [form, setForm] = useState({ title: "", description: "", location: "", date: "", maxCapacity: "" })
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadEvents() }, [loadEvents])

  const updateForm = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const errors = {}
    if (!form.title.trim()) errors.title = "Title is required"
    if (!form.location.trim()) errors.location = "Location is required"
    if (!form.date) errors.date = "Date and time are required"
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
        location: form.location.trim(),
        date: new Date(form.date).toISOString(),
        maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity, 10) : undefined,
      })
      setSuccessMsg("Event created!")
      setForm({ title: "", description: "", location: "", date: "", maxCapacity: "" })
      loadEvents()
      setTimeout(() => { setIsModalOpen(false); setSuccessMsg("") }, 1400)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const handlePublish = async (id) => {
    setActionLoadingId(id)
    try { await publishEvent(token, id); await loadEvents() } catch (err) { setError(err.message) }
    setActionLoadingId(null)
  }

  const handleUnpublish = async (id) => {
    setActionLoadingId(id)
    try { await unpublishEvent(token, id); await loadEvents() } catch (err) { setError(err.message) }
    setActionLoadingId(null)
  }

  const handleCancel = async (id) => {
    setActionLoadingId(id)
    try { await cancelEvent(token, id); await loadEvents() } catch (err) { setError(err.message) }
    setActionLoadingId(null)
  }

  const handleDelete = async (id) => {
    setActionLoadingId(id)
    setConfirmDeleteId(null)
    try { await deleteEvent(token, id); await loadEvents() } catch (err) { setError(err.message) }
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
          <button className="org-add-btn" aria-label="Create Event" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
          </button>
        </header>

        <div className="org-body">
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
              <button className="org-empty-cta" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} />
                <span>Create Event</span>
              </button>
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

                <TextField icon={MapPin} name="location" placeholder="Location / Venue" value={form.location} onChange={updateForm} error={fieldErrors.location} />

                <div className="org-form-field">
                  <div className="org-datetime-input-wrapper">
                    <Calendar className="org-datetime-icon" size={20} />
                    <input
                      type="datetime-local"
                      name="date"
                      className={`org-datetime-input ${fieldErrors.date ? "org-datetime-input--error" : ""}`}
                      value={form.date}
                      onChange={updateForm}
                    />
                  </div>
                  {fieldErrors.date && <span className="field__error" style={{ marginTop: 4, display: "block" }}>{fieldErrors.date}</span>}
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
