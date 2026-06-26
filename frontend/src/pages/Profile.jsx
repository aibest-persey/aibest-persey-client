import { useState, useRef } from "react"
import { ArrowLeft, PenSquare, Camera } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./Profile.css"

const PROFILE_KEY = "persey_user_profile"

export default function Profile({ profile: propProfile, onSave, onBack }) {
  const { user } = useAuth()
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

      </div>
    </PhoneFrame>
  )
}

/* ── Inline placeholder avatar SVG ─────────────────────────────────── */
function AvatarIcon() {
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

