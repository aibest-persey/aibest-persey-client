import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, Globe, Bell, Settings, ChevronRight, GraduationCap, Phone, Mail, Check, X, Users, Calendar, Edit2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { submitRoleRequest, getMyRoleRequests } from "../services/roleRequestService.js"
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
      nickname: user ? (`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "") : "",
      avatar: "",
      email: user?.email || "",
      phone: "",
      roleLine: user?.role === "student" ? "Student" : (user?.role === "organiser" ? "Organiser" : "Admin"),
      about: "",
      followers: 0,
      following: 0,
      eventsCount: 0
    }
  })

  const activeProfile = propProfile || localProfile

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    nickname: "",
    avatar: "",
    about: "",
    email: "",
    phone: "",
    roleLine: ""
  })

  const [roleRequest, setRoleRequest] = useState(null)
  const [roleReason, setRoleReason] = useState("")
  const [roleSubmitting, setRoleSubmitting] = useState(false)
  const [roleMsg, setRoleMsg] = useState("")
  
  const [toastMessage, setToastMessage] = useState("")

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
      nickname: activeProfile.nickname || "",
      avatar: activeProfile.avatar || "",
      about: activeProfile.about || "",
      email: activeProfile.email || "",
      phone: activeProfile.phone || "",
      roleLine: activeProfile.roleLine || ""
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    const updated = {
      ...activeProfile,
      nickname: editForm.nickname.trim(),
      avatar: editForm.avatar,
      about: editForm.about.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      roleLine: editForm.roleLine.trim(),
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

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage("")
    }, 3000)
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
                      <label className="profile-input-label">Full Name</label>
                      <input
                        type="text"
                        className="profile-name-input"
                        value={editForm.nickname}
                        onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                        placeholder="Katniss Everdine"
                        maxLength={40}
                      />
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-input-label">Role / Affiliation</label>
                      <input
                        type="text"
                        className="profile-input-text"
                        value={editForm.roleLine}
                        onChange={(e) => setEditForm({ ...editForm, roleLine: e.target.value })}
                        placeholder="Student, Admin of Book club"
                      />
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
                      />
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-input-label">Phone Number</label>
                      <input
                        type="text"
                        className="profile-input-text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+1(408) 785-9959"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-desktop-info">
                  <h2 className="profile-name">{activeProfile.nickname || "Enter Name"}</h2>
                  
                  {activeProfile.roleLine && (
                    <div className="profile-badge-pill">
                      <GraduationCap size={16} className="profile-badge-icon" />
                      <span className="profile-badge-text">{activeProfile.roleLine}</span>
                    </div>
                  )}

                  <p className="profile-contact">
                    <Mail size={14} className="profile-contact-icon" />
                    <span>{activeProfile.email || "No email"}</span>
                    {activeProfile.phone && (
                      <>
                        <span className="profile-contact-sep">|</span>
                        <Phone size={14} className="profile-contact-icon" />
                        <span>{activeProfile.phone}</span>
                      </>
                    )}
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
                  />
                ) : (
                  <p className="profile-about-text">
                    {activeProfile.about || "No details provided yet. Click the edit button to add an about section."}
                  </p>
                )}
              </section>

              {isEditing && (
                <div className="profile-edit-actions">
                  <button className="profile-cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button className="profile-save-btn" onClick={handleSave}>
                    Save Changes
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

              {/* Become an Organiser */}
              {user?.role === "student" && !isEditing && (
                <section className="profile-section profile-role-section">
                  <h3 className="profile-section-title">Become an Organiser</h3>
                  {roleRequest ? (
                    <div className={`profile-role-status profile-role-status--${roleRequest.status}`}>
                      {roleRequest.status === "pending" && "Your request is pending review."}
                      {roleRequest.status === "approved" && "Your request was approved! Please log out and back in."}
                      {roleRequest.status === "rejected" && "Your request was rejected. You may contact an admin."}
                    </div>
                  ) : (
                    <div className="profile-role-request-box">
                      <p className="profile-role-desc">Request to be promoted to an organiser to create and manage events.</p>
                      <textarea
                        className="profile-role-textarea"
                        placeholder="Tell us why you'd like to become an organiser (optional)..."
                        rows={2}
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
                    </div>
                  )}
                </section>
              )}
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
                <label className="profile-input-label">Full Name</label>
                <input
                  type="text"
                  className="profile-name-input"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                  placeholder="Enter name"
                  maxLength={40}
                />
              </div>
              <div className="profile-input-group">
                <label className="profile-input-label">Email</label>
                <input
                  type="email"
                  className="profile-input-text"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="name@domain.com"
                />
              </div>
              <div className="profile-input-group">
                <label className="profile-input-label">Phone Number</label>
                <input
                  type="text"
                  className="profile-input-text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1(xxx) xxx-xxxx"
                />
              </div>
              <div className="profile-input-group">
                <label className="profile-input-label">Affiliation / Role</label>
                <input
                  type="text"
                  className="profile-input-text"
                  value={editForm.roleLine}
                  onChange={(e) => setEditForm({ ...editForm, roleLine: e.target.value })}
                  placeholder="Student, Admin of Book club"
                />
              </div>
            </div>
          ) : (
            <div className="profile-info-group">
              <h2 className="profile-name">{activeProfile.nickname || "Enter Name"}</h2>
              <p className="profile-contact">
                {activeProfile.email || "No email"} {activeProfile.phone ? ` | ${activeProfile.phone}` : ""}
              </p>
              {activeProfile.roleLine && (
                <div className="profile-badge-pill">
                  <GraduationCap size={16} className="profile-badge-icon" />
                  <span className="profile-badge-text">{activeProfile.roleLine}</span>
                </div>
              )}
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
              />
            ) : (
              <p className="profile-about-text">
                {activeProfile.about || "No details provided yet."}
              </p>
            )}
          </section>

          {isEditing && (
            <div className="profile-edit-actions">
              <button className="profile-cancel-btn" onClick={handleCancel}>Cancel</button>
              <button className="profile-save-btn" onClick={handleSave}>Save Changes</button>
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

          {/* Become an Organiser (students only) */}
          {user?.role === "student" && !isEditing && (
            <section className="profile-section profile-role-section">
              <h3 className="profile-section-title">Become an Organiser</h3>
              {roleRequest ? (
                <div className={`profile-role-status profile-role-status--${roleRequest.status}`}>
                  {roleRequest.status === "pending" && "Your request is pending review."}
                  {roleRequest.status === "approved" && "Your request was approved! Please log out and back in."}
                  {roleRequest.status === "rejected" && "Your request was rejected. You may contact an admin."}
                </div>
              ) : (
                <div className="profile-role-request-box">
                  <p className="profile-role-desc">Request to be promoted to an organiser to create and manage events.</p>
                  <textarea
                    className="profile-role-textarea"
                    placeholder="Tell us why you'd like to become an organiser (optional)..."
                    rows={2}
                    value={roleReason}
                    onChange={(e) => setRoleReason(e.target.value)}
                    maxLength={500}
                  />
                  {roleMsg && <p className="profile-role-msg">{roleMsg}</p>}
                  <button className="profile-role-btn" onClick={handleRoleRequest} disabled={roleSubmitting}>
                    {roleSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              )}
            </section>
          )}
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
