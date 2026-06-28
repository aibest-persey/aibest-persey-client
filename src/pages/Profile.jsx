import { useState, useRef, useEffect } from "react"
import { ArrowLeft, PenSquare, Camera } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { submitRoleRequest, getMyRoleRequests } from "../services/roleRequestService.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./Profile.css"

const PROFILE_KEY = "persey_user_profile"

export default function Profile({ profile: propProfile, onSave, onBack }) {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  // Initialize profile state from props or localStorage fallback
  const [localProfile, setLocalProfile] = useState(() => {
    if (propProfile) return propProfile

    const saved = localStorage.getItem(PROFILE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fall back to default
      }
    }

    return {
      nickname: user ? (user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User") : "User",
      avatar: "",
      about: "Enjoy your favorite dishe and a lovely your friends and family and have a great time. Food from local food trucks will be available for purchase."
    }
  })

  // Use the active profile object (prop-supplied or locally managed)
  const activeProfile = propProfile || localProfile

  const [expanded, setExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ nickname: "", avatar: "", about: "" })

  const [roleRequest, setRoleRequest] = useState(null)
  const [roleReason, setRoleReason] = useState("")
  const [roleSubmitting, setRoleSubmitting] = useState(false)
  const [roleMsg, setRoleMsg] = useState("")

  useEffect(() => {
    if (user?.role === "student") {
      getMyRoleRequests(token)
        .then((reqs) => setRoleRequest(reqs[0] ?? null))
        .catch(() => {})
    }
  }, [user, token])

  const fileInputRef = useRef(null)

  const handleEditClick = () => {
    setEditForm({
      nickname: activeProfile.nickname,
      avatar: activeProfile.avatar,
      about: activeProfile.about
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    const updated = {
      nickname: editForm.nickname.trim() || "User",
      avatar: editForm.avatar,
      about: editForm.about.trim()
    }

    if (onSave) {
      onSave(updated)
    } else {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
      setLocalProfile(updated)
    }
    window.dispatchEvent(new Event("profileUpdated"))

    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm((prev) => ({ ...prev, avatar: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const displayAbout = () => {
    const text = activeProfile.about || ""
    if (text.length <= 150) {
      return text
    }
    if (expanded) {
      return (
        <>
          {text}{" "}
          <button
            className="profile-read-more"
            onClick={() => setExpanded(false)}
          >
            Show Less ˄
          </button>
        </>
      )
    }
    return (
      <>
        {text.slice(0, 150)}...{" "}
        <button
          className="profile-read-more"
          onClick={() => setExpanded(true)}
        >
          Read More ˅
        </button>
      </>
    )
  }

  const handleRoleRequest = async () => {
    setRoleSubmitting(true)
    setRoleMsg("")
    try {
      const req = await submitRoleRequest(token, roleReason.trim() || undefined)
      setRoleRequest(req)
      setRoleMsg("Request submitted! An admin or organiser will review it.")
      setRoleReason("")
    } catch (err) {
      setRoleMsg(err.message)
    } finally {
      setRoleSubmitting(false)
    }
  }

  const handleBack = onBack || (() => navigate("/home"))

  return (
    <PhoneFrame>
      <div className="profile-container">

        {/* ── Header ─────────────────────────────────── */}
        <header className="profile-header">
          <button
            className="profile-back-btn"
            aria-label="Go back"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="profile-header-title">
            {isEditing ? "Edit Profile" : "Profile"}
          </h1>
          {/* spacer to keep title centred */}
          <div style={{ width: 36 }} />
        </header>

        {/* ── Avatar ─────────────────────────────────── */}
        <div className="profile-avatar-wrap">
          <div
            className={`profile-avatar ${isEditing ? "profile-avatar--editable" : ""}`}
            onClick={isEditing ? triggerFileSelect : undefined}
          >
            {isEditing ? (
              editForm.avatar ? (
                <img
                  src={editForm.avatar}
                  alt="Profile Preview"
                  className="profile-avatar-img"
                />
              ) : (
                <AvatarIcon />
              )
            ) : activeProfile.avatar ? (
              <img
                src={activeProfile.avatar}
                alt="Profile"
                className="profile-avatar-img"
              />
            ) : (
              <AvatarIcon />
            )}
            {isEditing && (
              <div className="profile-avatar-overlay">
                <Camera size={20} color="#ffffff" />
              </div>
            )}
          </div>
          {isEditing && (
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
          )}
        </div>

        {/* ── Name / Edit Name ───────────────────────────────────── */}
        {isEditing ? (
          <div className="profile-name-edit-wrap">
            <input
              type="text"
              className="profile-name-input"
              value={editForm.nickname}
              onChange={(e) =>
                setEditForm({ ...editForm, nickname: e.target.value })
              }
              placeholder="Nickname"
              maxLength={25}
            />
          </div>
        ) : (
          <p className="profile-name">{activeProfile.nickname}</p>
        )}

        {/* ── Stats ──────────────────────────────────── */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">350</span>
            <span className="profile-stat-label">Following</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-value">346</span>
            <span className="profile-stat-label">Followers</span>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────── */}
        {isEditing ? (
          <div className="profile-edit-actions">
            <button className="profile-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="profile-save-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        ) : (
          <button className="profile-edit-btn" onClick={handleEditClick}>
            <PenSquare size={16} className="profile-edit-icon" />
            <span>Edit Profile</span>
          </button>
        )}

        {/* ── About Me ───────────────────────────────── */}
        <section className="profile-section">
          <h2 className="profile-section-title">About Me</h2>
          {isEditing ? (
            <textarea
              className="profile-about-textarea"
              value={editForm.about}
              onChange={(e) =>
                setEditForm({ ...editForm, about: e.target.value })
              }
              placeholder="Write something about yourself..."
              rows={4}
              maxLength={500}
            />
          ) : (
            <p className="profile-about-text">{displayAbout()}</p>
          )}
        </section>

        {/* ── Become an Organiser (students only) ────── */}
        {user?.role === "student" && (
          <section className="profile-section profile-role-section">
            <h2 className="profile-section-title">Become an Organiser</h2>
            {roleRequest ? (
              <div className={`profile-role-status profile-role-status--${roleRequest.status}`}>
                {roleRequest.status === "pending" && "Your request is pending review."}
                {roleRequest.status === "approved" && "Your request was approved! Please log out and back in."}
                {roleRequest.status === "rejected" && "Your request was rejected. You may contact an admin."}
              </div>
            ) : (
              <>
                <p className="profile-role-desc">Request to be promoted to an organiser so you can create and manage events.</p>
                <textarea
                  className="profile-role-textarea"
                  placeholder="Tell us why you'd like to become an organiser (optional)..."
                  rows={3}
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                  maxLength={500}
                />
                {roleMsg && <p className="profile-role-msg">{roleMsg}</p>}
                <button
                  className="profile-role-btn"
                  onClick={handleRoleRequest}
                  disabled={roleSubmitting}
                >
                  {roleSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </>
            )}
          </section>
        )}

      </div>
    </PhoneFrame>
  )
}

/* ── Inline placeholder avatar SVG ─────────────────────────────────── */
export function AvatarIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="profile-avatar-svg"
    >
      <circle cx="40" cy="40" r="40" fill="#dce0e8" />
      {/* Head */}
      <circle cx="40" cy="30" r="14" fill="#9aa0b0" />
      {/* Body */}
      <ellipse cx="40" cy="68" rx="22" ry="16" fill="#9aa0b0" />
    </svg>
  )
}

