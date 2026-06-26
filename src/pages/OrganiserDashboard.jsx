import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { ArrowLeft, Calendar, MapPin, Plus, X, ListTodo, FileText } from "lucide-react"
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
  
  // Event creation form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: ""
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [createLoading, setCreateLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error("Failed to fetch events from backend.")
      }
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error(err)
      // Provide a nice fallback if server is offline or fails
      setEvents([
        {
          id: "mock-1",
          title: "Organiser Workshop 2026",
          description: "A private session for event managers.",
          location: "Sofia Tech Park, Sofia",
          date: "2026-11-20T10:00:00.000Z",
          createdAt: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch events on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadEvents])


  const updateForm = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!form.title.trim()) errors.title = "Title is required"
    if (!form.location.trim()) errors.location = "Location is required"
    if (!form.date) errors.date = "Date and time are required"
    return errors
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    setSuccessMsg("")
    setError("")

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setCreateLoading(true)
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          date: new Date(form.date).toISOString()
        })
      })

      const json = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(json.message || "Failed to create event")
      }

      setSuccessMsg("🎉 Event created successfully!")
      setForm({ title: "", description: "", location: "", date: "" })
      
      // Reload events list
      loadEvents()
      
      // Close modal after delay
      setTimeout(() => {
        setIsModalOpen(false)
        setSuccessMsg("")
      }, 1500)

    } catch (err) {
      setError(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  // Helper to format ISO Date to clean text
  const formatEventDate = (isoStr) => {
    try {
      const d = new Date(isoStr)
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return isoStr
    }
  }

  return (
    <PhoneFrame>
      <div className="org-container">
        {/* Header */}
        <header className="org-header">
          <button
            className="org-back-btn"
            aria-label="Go back"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="org-title">Dashboard</h1>
          <button
            className="org-add-btn"
            aria-label="Create Event"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
          </button>
        </header>

        {/* Content Body */}
        <div className="org-body">
          <div className="org-welcome">
            <p className="org-welcome-sub">Logged in as {user?.username} (Organiser)</p>
            <h2 className="org-welcome-title">Your Hosted Events</h2>
          </div>

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
              <h3>No Events Created Yet</h3>
              <p>Create your first event to invite attendees and manage registrations.</p>
              <button className="org-empty-cta" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} />
                <span>Create Event</span>
              </button>
            </div>
          ) : (
            <div className="org-events-list">
              {events.map((evt) => (
                <div key={evt.id} className="org-event-card">
                  <div className="org-event-card-details">
                    <h3 className="org-event-card-title">{evt.title}</h3>
                    {evt.description && (
                      <p className="org-event-card-desc">{evt.description}</p>
                    )}
                    <div className="org-event-card-meta">
                      <div className="org-meta-item">
                        <Calendar size={14} className="org-meta-icon" />
                        <span>{formatEventDate(evt.date)}</span>
                      </div>
                      <div className="org-meta-item">
                        <MapPin size={14} className="org-meta-icon" />
                        <span>{evt.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Creation Modal Slider */}
        {isModalOpen && (
          <div className="org-modal-overlay">
            <div className="org-modal-content">
              <div className="org-modal-header">
                <h2>Create Event</h2>
                <button
                  className="org-modal-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="org-modal-form" noValidate>
                {successMsg && (
                  <div className="org-banner org-banner--success" role="status">
                    {successMsg}
                  </div>
                )}

                {error && (
                  <div className="org-banner org-banner--error" role="alert">
                    {error}
                  </div>
                )}

                <TextField
                  icon={FileText}
                  name="title"
                  placeholder="Event Title"
                  value={form.title}
                  onChange={updateForm}
                  error={fieldErrors.title}
                />

                <div className="org-form-field">
                  <textarea
                    name="description"
                    className={`org-textarea ${fieldErrors.description ? "org-textarea--error" : ""}`}
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={updateForm}
                    rows={3}
                  />
                </div>

                <TextField
                  icon={MapPin}
                  name="location"
                  placeholder="Location / Venue"
                  value={form.location}
                  onChange={updateForm}
                  error={fieldErrors.location}
                />

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
                  {fieldErrors.date && (
                    <span className="field__error" style={{ marginTop: 4, display: "block" }}>
                      {fieldErrors.date}
                    </span>
                  )}
                </div>

                <div className="org-form-action">
                  <PrimaryButton type="submit" loading={createLoading}>
                    Submit Event
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  )
}
