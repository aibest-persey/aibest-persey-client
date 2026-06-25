import { useState } from "react"
import { ArrowLeft, PenSquare, Pencil } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./Profile.css"

const INTERESTS = [
  { id: 1, label: "Games Online", color: "#5669ff" },
  { id: 2, label: "Concert",      color: "#f0635a" },
  { id: 3, label: "Music",        color: "#f59762" },
  { id: 4, label: "Art",          color: "#29d697" },
  { id: 5, label: "Movie",        color: "#29d697" },
  { id: 6, label: "Others",       color: "#46cdfb" },
]

const ABOUT_SHORT =
  "Enjoy your favorite dishe and a lovely your friends and family and have a great time. Food from local food trucks will be available for purchase."

export default function Profile({ onBack }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <PhoneFrame>
      <div className="profile-container">

        {/* ── Header ─────────────────────────────────── */}
        <header className="profile-header">
          <button
            className="profile-back-btn"
            aria-label="Go back"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="profile-header-title">Profile</h1>
          {/* spacer to keep title centred */}
          <div style={{ width: 36 }} />
        </header>

        {/* ── Avatar ─────────────────────────────────── */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            <AvatarIcon />
          </div>
        </div>

        {/* ── Name ───────────────────────────────────── */}
        <p className="profile-name">User</p>

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

        {/* ── Edit Profile button ─────────────────────── */}
        <button className="profile-edit-btn">
          <PenSquare size={16} className="profile-edit-icon" />
          <span>Edit Profile</span>
        </button>

        {/* ── About Me ───────────────────────────────── */}
        <section className="profile-section">
          <h2 className="profile-section-title">About Me</h2>
          <p className="profile-about-text">
            {ABOUT_SHORT}{" "}
            {!expanded && (
              <button
                className="profile-read-more"
                onClick={() => setExpanded(true)}
              >
                Read More ˅
              </button>
            )}
            {expanded && (
              <>
                {" "}
                Whether you're a sports fan, a music lover, or a foodie, there's
                something here for everyone. Come join us!{" "}
                <button
                  className="profile-read-more"
                  onClick={() => setExpanded(false)}
                >
                  Show Less ˄
                </button>
              </>
            )}
          </p>
        </section>

        {/* ── Interests ──────────────────────────────── */}
        <section className="profile-section">
          <div className="profile-interest-header">
            <h2 className="profile-section-title">Interest</h2>
            <button className="profile-change-btn">
              <Pencil size={11} />
              <span>CHANGE</span>
            </button>
          </div>
          <div className="profile-interest-pills">
            {INTERESTS.map((item) => (
              <span
                key={item.id}
                className="profile-interest-pill"
                style={{ backgroundColor: item.color }}
              >
                {item.label}
              </span>
            ))}
          </div>
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
