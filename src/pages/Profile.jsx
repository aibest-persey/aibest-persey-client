import { useState, useRef } from "react"
import { ArrowLeft, Camera, Globe, Bell, Settings, ChevronRight, GraduationCap, Mail, X, Edit2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { updateUserProfile } from "../services/authService.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./Profile.css"

const PROFILE_KEY = "persey_user_profile"

export default function Profile({ profile: propProfile, onSave, onBack }) {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop(768) // Trigger desktop mode on widths >= 768px for desktop viewports

  // Initialize empty state like a new user
  const [localProfile, setLocalProfile] = useState(() => {
    if (propProfile) return propProfile

    const saved = localStorage.getItem(PROFILE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fall back to new user defaults
      }
    }

    return {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      avatar: user?.logoUrl || "",
      email: user?.email || "",
      about: user?.bio || "",
      followers: 0,
      following: 0,
      eventsCount: 0
    }
  })

  const activeProfile = propProfile || localProfile

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    avatar: "",
    about: "",
    email: ""
  })

  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: ""
  })

  const [toastMessage, setToastMessage] = useState("")

  const fileInputRef = useRef(null)

  const handleEditClick = () => {
    setEditForm({
      firstName: activeProfile.firstName || "",
      lastName: activeProfile.lastName || "",
      avatar: activeProfile.avatar || "",
      about: activeProfile.about || "",
      email: activeProfile.email || ""
    })
    setValidationErrors({
      firstName: "",
      lastName: "",
      email: ""
    })
    setIsEditing(true)
  }

  const validateForm = () => {
    const errors = { firstName: "", lastName: "", email: "" }
    let hasErrors = false

    if (!editForm.firstName.trim()) {
      errors.firstName = "First name is required."
      hasErrors = true
    }

    if (!editForm.lastName.trim()) {
      errors.lastName = "Last name (surname) is required."
      hasErrors = true
    }

    if (editForm.email && !/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = "Please enter a valid email address."
      hasErrors = true
    }

    setValidationErrors(errors)
    return !hasErrors
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)

    const updated = {
      ...activeProfile,
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
      avatar: editForm.avatar,
      about: editForm.about.trim(),
      email: editForm.email.trim(),
    }

    try {
      if (token && user) {
        // Attempt update to the backend
        const result = await updateUserProfile(token, {
          firstName: updated.firstName,
          lastName: updated.lastName,
          bio: updated.about,
          logoUrl: updated.avatar
        })
        
        if (result) {
          if (result.firstName) updated.firstName = result.firstName
          if (result.lastName) updated.lastName = result.lastName
          if (result.bio) updated.about = result.bio
          if (result.logoUrl) updated.avatar = result.logoUrl
        }
      }

      if (onSave) {
        onSave(updated)
      } else {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
        setLocalProfile(updated)
      }
      window.dispatchEvent(new Event("profileUpdated"))
      showToast("Profile saved successfully!")
      setIsEditing(false)
    } catch (err) {
      console.warn("Backend save failed, falling back to local storage:", err)
      
      // Fallback local save for Student/non-organiser accounts
      if (onSave) {
        onSave(updated)
      } else {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
        setLocalProfile(updated)
      }
      window.dispatchEvent(new Event("profileUpdated"))
      showToast("Profile updated (saved locally).")
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
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

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage("")
    }, 3000)
  }

  const handleBack = onBack || (() => navigate("/home"))

  const fullName = `${activeProfile.firstName || ""} ${activeProfile.lastName || ""}`.trim() || "Enter Name"
  const dbRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "Student"

  // Shared inner content to be rendered inside / outside of PhoneFrame
  const profileContent = (
    <div className={`profile-container ${isDesktop ? "profile-container--desktop" : ""}`}>
      {/* ── Toast Notification ───────────────────────── */}
      {toastMessage && (
        <div className="profile-toast" role="status">
          {toastMessage}
        </div>
      )}

      {/* ── Header ─────────────────────────────────── */}
      <header className="profile-header">
        <div className="profile-header-left">
          {!isDesktop && (
            <button
              className="profile-back-btn"
              aria-label="Go back"
              onClick={handleBack}
            >
              <ArrowLeft size={22} />
            </button>
          )}
          <h1 className="profile-header-title">My Profile</h1>
        </div>
        
        {!isEditing ? (
          <button 
            className="profile-edit-circle-btn" 
            aria-label="Edit Profile"
            onClick={handleEditClick}
          >
            <Edit2 size={20} color="#ffffff" />
          </button>
        ) : (
          <button 
            className="profile-edit-circle-btn profile-edit-circle-btn--cancel" 
            aria-label="Cancel Editing"
            onClick={handleCancel}
            disabled={saving}
          >
            <X size={20} color="#ffffff" />
          </button>
        )}
      </header>

      {isDesktop ? (
        /* ── DESKTOP CONTENT LAYOUT ── */
        <div className="profile-desktop-layout">
          {/* Banner Card: Avatar, Profile Details, Stats */}
          <div className="profile-desktop-banner">
            <div className="profile-desktop-banner-left">
              {/* Avatar */}
              <div className="profile-avatar-wrap">
                <div
                  className={`profile-avatar ${isEditing ? "profile-avatar--editable" : ""}`}
                  onClick={isEditing ? triggerFileSelect : undefined}
                >
                  {isEditing ? (
                    editForm.avatar ? (
                      <img src={editForm.avatar} alt="Profile Preview" className="profile-avatar-img" />
                    ) : (
                      <AvatarIcon />
                    )
                  ) : activeProfile.avatar ? (
                    <img src={activeProfile.avatar} alt="Profile" className="profile-avatar-img" />
                  ) : (
                    <AvatarIcon />
                  )}
                  {isEditing && (
                    <div className="profile-avatar-overlay">
                      <Camera size={22} color="#ffffff" />
                      <span className="profile-avatar-overlay-text">Edit Photo</span>
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

              {/* Text Info vs Edit Fields */}
              {isEditing ? (
                <div className="profile-desktop-edit-info">
                  <div className="profile-input-row">
                    <div className="profile-input-group">
                      <label className="profile-input-label">First Name</label>
                      <input
                        type="text"
                        className="profile-name-input"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        placeholder="First Name"
                        maxLength={25}
                        disabled={saving}
                      />
                      {validationErrors.firstName && <span className="profile-input-error">{validationErrors.firstName}</span>}
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-input-label">Last Name (Surname)</label>
                      <input
                        type="text"
                        className="profile-input-text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        placeholder="Last Name"
                        maxLength={25}
                        disabled={saving}
                      />
                      {validationErrors.lastName && <span className="profile-input-error">{validationErrors.lastName}</span>}
                    </div>
                  </div>
                  <div className="profile-input-row">
                    <div className="profile-input-group">
                      <label className="profile-input-label">Email</label>
                      <input
                        type="email"
                        className="profile-input-text"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="name@domain.com"
                        disabled={saving}
                      />
                      {validationErrors.email && <span className="profile-input-error">{validationErrors.email}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-desktop-info">
                  <h2 className="profile-name">{fullName}</h2>
                  
                  <div className="profile-badge-pill">
                    <GraduationCap size={16} className="profile-badge-icon" />
                    <span className="profile-badge-text">{dbRole}</span>
                  </div>

                  <p className="profile-contact">
                    <Mail size={14} className="profile-contact-icon" />
                    <span>{activeProfile.email || "No email"}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Stats aligned on the right */}
            <div className="profile-desktop-banner-right">
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-value">{activeProfile.followers ?? 0}</span>
                  <span className="profile-stat-label">Followers</span>
                </div>
                <div className="profile-stat-divider" />
                <div className="profile-stat">
                  <span className="profile-stat-value">{activeProfile.following ?? 0}</span>
                  <span className="profile-stat-label">Following</span>
                </div>
                <div className="profile-stat-divider" />
                <div className="profile-stat">
                  <span className="profile-stat-value">{activeProfile.eventsCount ?? 0}</span>
                  <span className="profile-stat-label">Events</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Settings split grid */}
          <div className="profile-desktop-grid">
            <div className="profile-desktop-grid-left">
              {/* About Me */}
              <section className="profile-section">
                <h3 className="profile-section-title">About me:</h3>
                {isEditing ? (
                  <textarea
                    className="profile-about-textarea"
                    value={editForm.about}
                    onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                    placeholder="Write something about yourself..."
                    rows={6}
                    maxLength={500}
                    disabled={saving}
                  />
                ) : (
                  <p className="profile-about-text">
                    {activeProfile.about || "No details provided yet. Click the edit button to add an about section."}
                  </p>
                )}
              </section>

              {isEditing && (
                <div className="profile-edit-actions">
                  <button className="profile-cancel-btn" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </button>
                  <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div className="profile-desktop-grid-right">
              {/* Account Management */}
              <section className="profile-section">
                <h3 className="profile-section-title">Account management</h3>
                <div className="profile-mgmt-list">
                  <button 
                    className="profile-mgmt-item"
                    onClick={() => showToast("Language settings coming soon!")}
                  >
                    <div className="profile-mgmt-item-left">
                      <div className="profile-mgmt-icon-box">
                        <Globe size={20} />
                      </div>
                      <span className="profile-mgmt-label">Language</span>
                    </div>
                    <ChevronRight size={18} className="profile-mgmt-chevron" />
                  </button>

                  <button 
                    className="profile-mgmt-item"
                    onClick={() => navigate("/notifications")}
                  >
                    <div className="profile-mgmt-item-left">
                      <div className="profile-mgmt-icon-box">
                        <Bell size={20} />
                      </div>
                      <span className="profile-mgmt-label">Notifications</span>
                    </div>
                    <ChevronRight size={18} className="profile-mgmt-chevron" />
                  </button>

                  <button 
                    className="profile-mgmt-item"
                    onClick={() => showToast("Account settings coming soon!")}
                  >
                    <div className="profile-mgmt-item-left">
                      <div className="profile-mgmt-icon-box">
                        <Settings size={20} />
                      </div>
                      <span className="profile-mgmt-label">Settings</span>
                    </div>
                    <ChevronRight size={18} className="profile-mgmt-chevron" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        /* ── MOBILE CONTENT LAYOUT ── */
        <div className="profile-mobile-layout">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div
              className={`profile-avatar ${isEditing ? "profile-avatar--editable" : ""}`}
              onClick={isEditing ? triggerFileSelect : undefined}
            >
              {isEditing ? (
                editForm.avatar ? (
                  <img src={editForm.avatar} alt="Profile Preview" className="profile-avatar-img" />
                ) : (
                  <AvatarIcon />
                )
              ) : activeProfile.avatar ? (
                <img src={activeProfile.avatar} alt="Profile" className="profile-avatar-img" />
              ) : (
                <AvatarIcon />
              )}
              {isEditing && (
                <div className="profile-avatar-overlay">
                  <Camera size={22} color="#ffffff" />
                  <span className="profile-avatar-overlay-text">Edit Photo</span>
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

          {/* Info */}
          {isEditing ? (
            <div className="profile-edit-fields">
              <div className="profile-input-group">
                <label className="profile-input-label">First Name</label>
                <input
                  type="text"
                  className="profile-name-input"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  placeholder="First name"
                  maxLength={25}
                  disabled={saving}
                />
                {validationErrors.firstName && <span className="profile-input-error">{validationErrors.firstName}</span>}
              </div>
              <div className="profile-input-group">
                <label className="profile-input-label">Last Name (Surname)</label>
                <input
                  type="text"
                  className="profile-input-text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  placeholder="Last name"
                  maxLength={25}
                  disabled={saving}
                />
                {validationErrors.lastName && <span className="profile-input-error">{validationErrors.lastName}</span>}
              </div>
              <div className="profile-input-group">
                <label className="profile-input-label">Email</label>
                <input
                  type="email"
                  className="profile-input-text"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="name@domain.com"
                  disabled={saving}
                />
                {validationErrors.email && <span className="profile-input-error">{validationErrors.email}</span>}
              </div>
            </div>
          ) : (
            <div className="profile-info-group">
              <h2 className="profile-name">{fullName}</h2>
              <p className="profile-contact">
                {activeProfile.email || "No email"}
              </p>
              <div className="profile-badge-pill">
                <GraduationCap size={16} className="profile-badge-icon" />
                <span className="profile-badge-text">{dbRole}</span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{activeProfile.followers ?? 0}</span>
              <span className="profile-stat-label">Followers</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-value">{activeProfile.following ?? 0}</span>
              <span className="profile-stat-label">Following</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-value">{activeProfile.eventsCount ?? 0}</span>
              <span className="profile-stat-label">Events</span>
            </div>
          </div>

          {/* About Me */}
          <section className="profile-section">
            <h3 className="profile-section-title">About me:</h3>
            {isEditing ? (
              <textarea
                className="profile-about-textarea"
                value={editForm.about}
                onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                placeholder="Write something about yourself..."
                rows={4}
                maxLength={500}
                disabled={saving}
              />
            ) : (
              <p className="profile-about-text">
                {activeProfile.about || "No details provided yet."}
              </p>
            )}
          </section>

          {isEditing && (
            <div className="profile-edit-actions">
              <button className="profile-cancel-btn" onClick={handleCancel} disabled={saving}>Cancel</button>
              <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Account Management */}
          <section className="profile-section">
            <h3 className="profile-section-title">Account management</h3>
            <div className="profile-mgmt-list">
              <button className="profile-mgmt-item" onClick={() => showToast("Language settings coming soon!")}>
                <div className="profile-mgmt-item-left">
                  <div className="profile-mgmt-icon-box"><Globe size={20} /></div>
                  <span className="profile-mgmt-label">Language</span>
                </div>
                <ChevronRight size={18} className="profile-mgmt-chevron" />
              </button>

              <button className="profile-mgmt-item" onClick={() => navigate("/notifications")}>
                <div className="profile-mgmt-item-left">
                  <div className="profile-mgmt-icon-box"><Bell size={20} /></div>
                  <span className="profile-mgmt-label">Notifications</span>
                </div>
                <ChevronRight size={18} className="profile-mgmt-chevron" />
              </button>

              <button className="profile-mgmt-item" onClick={() => showToast("Account settings coming soon!")}>
                <div className="profile-mgmt-item-left">
                  <div className="profile-mgmt-icon-box"><Settings size={20} /></div>
                  <span className="profile-mgmt-label">Settings</span>
                </div>
                <ChevronRight size={18} className="profile-mgmt-chevron" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )

  if (isDesktop) {
    return profileContent
  }

  return (
    <PhoneFrame>
      {profileContent}
    </PhoneFrame>
  )
}

export function AvatarIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="profile-avatar-svg"
    >
      <circle cx="40" cy="40" r="40" fill="#f0f2f5" />
      <circle cx="40" cy="30" r="14" fill="#9ba3af" />
      <ellipse cx="40" cy="68" rx="22" ry="16" fill="#9ba3af" />
    </svg>
  )
}
