import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { getInbox, getSent, markRead } from "../services/messageService.js"
import { ArrowLeft, Mail, Send, MailOpen } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./Inbox.css"

function timeAgo(isoStr) {
  try {
    const diff = Date.now() - new Date(isoStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "just now"
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch { return "" }
}

function displayName(u) {
  if (!u) return "Unknown"
  return u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u.username
}

export default function Inbox() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState("inbox")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState(null)

  const load = (t) => {
    setLoading(true)
    setError("")
    setExpanded(null)
    const fn = t === "inbox" ? getInbox : getSent
    fn(token)
      .then(setMessages)
      .catch((err) => setError(err.message ?? "Failed to load messages."))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (token) load(tab) }, [token, tab])

  const handleExpand = async (msg) => {
    setExpanded(expanded?.id === msg.id ? null : msg)
    if (tab === "inbox" && !msg.isRead) {
      try {
        await markRead(token, msg.id)
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m))
      } catch { /* non-critical */ }
    }
  }

  return (
    <PhoneFrame>
      <div className="inbox-container">
        <header className="inbox-header">
          <button className="inbox-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="inbox-title">Messages</h1>
          <div style={{ width: 36 }} />
        </header>

        <div className="inbox-tabs">
          <button className={`inbox-tab ${tab === "inbox" ? "inbox-tab--active" : ""}`} onClick={() => setTab("inbox")}>
            <Mail size={15} /> Inbox
          </button>
          <button className={`inbox-tab ${tab === "sent" ? "inbox-tab--active" : ""}`} onClick={() => setTab("sent")}>
            <Send size={15} /> Sent
          </button>
        </div>

        {loading ? (
          <div className="inbox-loading"><div className="inbox-spinner" /></div>
        ) : error ? (
          <div className="inbox-error">{error}</div>
        ) : messages.length === 0 ? (
          <div className="inbox-empty">
            <MailOpen size={40} color="#c4c8d8" />
            <p>{tab === "inbox" ? "Your inbox is empty." : "No sent messages."}</p>
          </div>
        ) : (
          <div className="inbox-list">
            {messages.map((msg) => {
              const other = tab === "inbox" ? msg.sender : msg.receiver
              const isOpen = expanded?.id === msg.id
              return (
                <div
                  key={msg.id}
                  className={`inbox-item ${!msg.isRead && tab === "inbox" ? "inbox-item--unread" : ""} ${isOpen ? "inbox-item--open" : ""}`}
                  onClick={() => handleExpand(msg)}
                >
                  <div className="inbox-item-avatar" style={{ background: other?.color || "#1d4e89" }}>
                    {(other?.username || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="inbox-item-body">
                    <div className="inbox-item-top">
                      <span className="inbox-item-name">{displayName(other)}</span>
                      <span className="inbox-item-time">{timeAgo(msg.createdAt)}</span>
                    </div>
                    {msg.subject && <p className="inbox-item-subject">{msg.subject}</p>}
                    {isOpen
                      ? <p className="inbox-item-content">{msg.content}</p>
                      : <p className="inbox-item-preview">{msg.content}</p>
                    }
                  </div>
                  {!msg.isRead && tab === "inbox" && <div className="inbox-unread-dot" />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PhoneFrame>
  )
}
