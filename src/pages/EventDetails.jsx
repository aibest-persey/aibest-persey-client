import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useNotifications } from "../hooks/useNotifications.js"
import { getEvent, registerForEvent, cancelRegistration } from "../services/eventService.js"
import { sendMessage } from "../services/messageService.js"
import { getErrorMessage } from "../utils/errorMessage.js"
import { ArrowLeft, Bell, Calendar, MapPin, Users, MessageSquare, Ticket } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./EventDetails.css"

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
]

function getGradient(id) {
  if (!id) return GRADIENTS[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff
  return GRADIENTS[hash % GRADIENTS.length]
}

function formatDate(isoStr) {
  try {
    return new Date(isoStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch { return isoStr }
}

function formatTime(isoStr) {
  try {
    return new Date(isoStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch { return "" }
}

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { unreadCount } = useNotifications()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState({ text: "", type: "" })
  const [showMsgForm, setShowMsgForm] = useState(false)
  const [msgContent, setMsgContent] = useState("")
  const [msgSubject, setMsgSubject] = useState("")
  const [msgSending, setMsgSending] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError("")
    getEvent(token, id)
      .then(setEvent)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, token])

  const refresh = () => getEvent(token, id).then(setEvent).catch(console.error)

  const handleRegister = async () => {
    setActionLoading(true)
    setActionMsg({ text: "", type: "" })
    try {
      await registerForEvent(token, id)
      await refresh()
      const updated = await getEvent(token, id)
      setEvent(updated)
      setActionMsg({
        text: updated.isWaitlisted ? "You've been added to the waitlist!" : "Registration confirmed!",
        type: "success",
      })
    } catch (err) {
      setActionMsg({ text: getErrorMessage(err), type: "error" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelReg = async () => {
    setActionLoading(true)
    setActionMsg({ text: "", type: "" })
    try {
      await cancelRegistration(token, id)
      await refresh()
      setActionMsg({ text: "Registration cancelled.", type: "info" })
    } catch (err) {
      setActionMsg({ text: getErrorMessage(err), type: "error" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendMsg = async () => {
    if (!msgContent.trim() || !event?.organiser?.id) return
    setMsgSending(true)
    try {
      await sendMessage(token, { receiverId: event.organiser.id, subject: msgSubject.trim() || null, content: msgContent.trim() })
      setShowMsgForm(false)
      setMsgContent("")
      setMsgSubject("")
      setActionMsg({ text: "Message sent to organiser!", type: "success" })
    } catch (err) {
      setActionMsg({ text: getErrorMessage(err), type: "error" })
    } finally {
      setMsgSending(false)
    }
  }

  const isStudent = user?.role !== "organiser"
  const isCancelled = event?.status === "cancelled"
  const isFull =
    event?.maxCapacity != null &&
    event?.registrationCount >= event?.maxCapacity &&
    !event?.isRegistered &&
    !event?.isWaitlisted

  // Capacity indicator state — drives both the banner pill and its color.
  const capacityState = !event || event.maxCapacity == null
    ? "unlimited"
    : event.registrationCount >= event.maxCapacity
    ? "full"
    : event.registrationCount / event.maxCapacity >= 0.8
    ? "filling"
    : "open"
  const capacityLabel = event?.maxCapacity != null
    ? `${event.registrationCount}/${event.maxCapacity}`
    : `${event?.registrationCount ?? 0} going`

  const organiserName = event?.organiser
    ? `${event.organiser.firstName ?? ""} ${event.organiser.lastName ?? ""}`.trim() ||
      event.organiser.username
    : "Organiser"

  return (
    <PhoneFrame>
      <div className="evtd-container">
        {loading ? (
          <div className="evtd-loading">
            <div className="evtd-spinner" />
          </div>
        ) : error ? (
          <div className="evtd-error">
            <p>{error}</p>
            <button className="evtd-back-link" onClick={() => navigate(-1)}>← Go Back</button>
          </div>
        ) : event ? (
          <>
            {/* Banner */}
            <div
              className="evtd-banner"
              style={event.coverImage
                ? { backgroundImage: `url(${event.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: getGradient(id) }}
            >
              <div className="evtd-banner-toprow">
                <button className="evtd-back-btn" aria-label="Go back" onClick={() => navigate(-1)}>
                  <ArrowLeft size={20} />
                </button>
                <span className="evtd-banner-label">Event Details</span>
                <button className="evtd-back-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
                  <Bell size={18} />
                  {unreadCount > 0 && <div className="evtd-bell-badge" />}
                </button>
              </div>
              <div className="evtd-banner-bottomrow">
                <span className={`evtd-capacity-pill evtd-capacity-pill--${capacityState}`}>
                  <Ticket size={13} /> {capacityLabel}
                </span>
                {event.status !== "published" && (
                  <span className={`evtd-status-badge evtd-status-badge--${event.status}`}>
                    {event.status}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="evtd-content">
              <h1 className="evtd-title">{event.title}</h1>

              {/* Meta row */}
              <div className="evtd-meta">
                <div className="evtd-meta-item">
                  <div className="evtd-meta-icon evtd-meta-icon--blue">
                    <Calendar size={16} />
                  </div>
                  <div className="evtd-meta-text">
                    <span className="evtd-meta-label">{formatDate(event.date)}</span>
                    <span className="evtd-meta-sub">{formatTime(event.date)}</span>
                  </div>
                </div>

                {event.location && (
                  <div className="evtd-meta-item">
                    <div className="evtd-meta-icon evtd-meta-icon--orange">
                      <MapPin size={16} />
                    </div>
                    <div className="evtd-meta-text">
                      <span className="evtd-meta-label">{event.location}</span>
                    </div>
                  </div>
                )}

                <div className="evtd-meta-item">
                  <div className="evtd-meta-icon evtd-meta-icon--green">
                    <Users size={16} />
                  </div>
                  <div className="evtd-meta-text">
                    <span className="evtd-meta-label">
                      {event.registrationCount} attending
                      {event.maxCapacity == null
                        ? " · Open registration"
                        : capacityState === "full"
                        ? " · Full"
                        : ` · ${event.maxCapacity - event.registrationCount} spots left`}
                    </span>
                    {event.isWaitlisted && (
                      <span className="evtd-meta-sub evtd-meta-sub--wait">You are on the waitlist</span>
                    )}
                    {event.isRegistered && (
                      <span className="evtd-meta-sub evtd-meta-sub--confirmed">You are registered</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Organiser */}
              <div className="evtd-organiser">
                <div
                  className="evtd-organiser-avatar"
                  style={{ background: event.organiser?.color || "#5669ff" }}
                >
                  {organiserName.charAt(0).toUpperCase()}
                </div>
                <div className="evtd-organiser-info">
                  <span className="evtd-organiser-name">{organiserName}</span>
                  <span className="evtd-organiser-role">Organiser</span>
                </div>
                {isStudent && (
                  <button
                    className="evtd-msg-btn"
                    onClick={() => setShowMsgForm((v) => !v)}
                    title="Message Organiser"
                  >
                    <MessageSquare size={15} /> Message
                  </button>
                )}
              </div>

              {/* Inline message compose — students only */}
              {isStudent && showMsgForm && (
                <div className="evtd-msg-form">
                  <input
                    className="evtd-msg-input"
                    placeholder="Subject (optional)"
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                  />
                  <textarea
                    className="evtd-msg-textarea"
                    placeholder="Write your message..."
                    rows={4}
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                  />
                  <div className="evtd-msg-form-actions">
                    <button className="evtd-msg-cancel" onClick={() => setShowMsgForm(false)}>Cancel</button>
                    <button className="evtd-msg-send" onClick={handleSendMsg} disabled={msgSending || !msgContent.trim()}>
                      {msgSending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              )}

              {/* About */}
              {event.description && (
                <div className="evtd-about">
                  <h2 className="evtd-about-title">About Event</h2>
                  <p className="evtd-about-text">{event.description}</p>
                </div>
              )}

              {/* Action feedback */}
              {actionMsg.text && (
                <div className={`evtd-msg evtd-msg--${actionMsg.type}`}>
                  {actionMsg.text}
                </div>
              )}

              {/* Register / Cancel button — students only, non-cancelled events */}
              {isStudent && !isCancelled && !event.isOwner && (
                <div className="evtd-register-wrap">
                  {event.isRegistered || event.isWaitlisted ? (
                    <button
                      className="evtd-register-btn evtd-register-btn--cancel"
                      onClick={handleCancelReg}
                      disabled={actionLoading}
                    >
                      {actionLoading
                        ? "..."
                        : event.isWaitlisted
                        ? "Leave Waitlist"
                        : "Cancel Registration"}
                    </button>
                  ) : (
                    <button
                      className="evtd-register-btn"
                      onClick={handleRegister}
                      disabled={actionLoading}
                    >
                      {actionLoading
                        ? "..."
                        : isFull
                        ? "Join Waitlist →"
                        : "Register →"}
                    </button>
                  )}
                </div>
              )}

              {isCancelled && (
                <div className="evtd-cancelled-notice">
                  This event has been cancelled.
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </PhoneFrame>
  )
}
