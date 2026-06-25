import { useState } from "react"
import Notifications from "./Notifications.jsx"
import {
  ChevronDown,
  Bell,
  Search,
  SlidersHorizontal,
  Music,
  Utensils,
  Palette,
  MapPin,
  Bookmark,
  User,
  MessageSquare,
  Calendar,
  Mail,
  LogOut,
} from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import handsHoldingImg from "../assets/hands_holding_event.png"
import blueSneakersImg from "../assets/blue_sneakers_event.png"
import "./Home.css"

// Custom Sports (Basketball) icon SVG
function SportsIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M6.2 6.2a8.8 8.8 0 0 0 0 11.6" />
      <path d="M17.8 6.2a8.8 8.8 0 0 1 0 11.6" />
      <path d="M2 12h20" />
      <path d="M12 2v20" />
    </svg>
  )
}

export default function Home() {
  // Notifications page visibility
  const [showNotifications, setShowNotifications] = useState(false)

  // Sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Search input state
  const [searchQuery, setSearchQuery] = useState("")

  // Dynamic categories
  const [categories] = useState([
    { id: "sports", name: "Sports", icon: SportsIcon, color: "#f0635a" },
    { id: "music", name: "Music", icon: Music, color: "#f59762" },
    { id: "food", name: "Food", icon: Utensils, color: "#29d697" },
    { id: "art", name: "Art", icon: Palette, color: "#46cdfb" },
  ])

  // Active category selection
  const [activeCategory, setActiveCategory] = useState("sports")

  // Event cards state
  const [trendingEvents, setTrendingEvents] = useState([
    {
      id: 1,
      title: "International Band Music Show",
      displayTitle: "International Band Mu...",
      date: { day: "10", month: "JUNE" },
      location: "36 Guild Street London, UK",
      image: handsHoldingImg,
      bookmarked: true,
    },
    {
      id: 2,
      title: "Jo Malone",
      displayTitle: "Jo Malone...",
      date: { day: "10", month: "JUNE" },
      location: "Radius Gallery, London",
      image: blueSneakersImg,
      bookmarked: false,
    },
  ])

  const [nearbyEvents, setNearbyEvents] = useState([
    {
      id: 1,
      title: "International Band Music Show",
      displayTitle: "International Band Mu...",
      date: { day: "10", month: "JUNE" },
      location: "36 Guild Street London, UK",
      image: handsHoldingImg,
      bookmarked: true,
    },
    {
      id: 2,
      title: "Jo Malone",
      displayTitle: "Jo Malone...",
      date: { day: "10", month: "JUNE" },
      location: "Radius Gallery, London",
      image: blueSneakersImg,
      bookmarked: false,
    },
  ])

  // Handle bookmark click
  const toggleBookmark = (eventId, section) => {
    const updateEvents = (list) =>
      list.map((evt) =>
        evt.id === eventId ? { ...evt, bookmarked: !evt.bookmarked } : evt
      )

    if (section === "trending") {
      setTrendingEvents(updateEvents(trendingEvents))
    } else {
      setNearbyEvents(updateEvents(nearbyEvents))
    }
  }

  if (showNotifications) {
    return <Notifications onBack={() => setShowNotifications(false)} />
  }

  return (
    <PhoneFrame>
      <div className="home-container">

        {/* Sidebar Overlay (dim backdrop) */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "sidebar-overlay--visible" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar Drawer */}
        <aside className={`sidebar-drawer ${sidebarOpen ? "sidebar-drawer--open" : ""}`}>
          {/* User profile area */}
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              <User size={32} color="#9a9cae" />
            </div>
            <span className="sidebar-username">User</span>
          </div>

          {/* Nav items */}
          <nav className="sidebar-nav">
            <button className="sidebar-nav-item">
              <User size={20} className="sidebar-nav-icon" />
              <span>My Profile</span>
            </button>

            <button className="sidebar-nav-item">
              <div className="sidebar-nav-icon-wrap">
                <MessageSquare size={20} className="sidebar-nav-icon" />
                <span className="sidebar-msg-badge">9</span>
              </div>
              <span>Message</span>
            </button>

            <button className="sidebar-nav-item">
              <Calendar size={20} className="sidebar-nav-icon" />
              <span>Calendar</span>
            </button>

            <button className="sidebar-nav-item">
              <Bookmark size={20} className="sidebar-nav-icon" />
              <span>Bookmark</span>
            </button>

            <button className="sidebar-nav-item">
              <Mail size={20} className="sidebar-nav-icon" />
              <span>Contact Us</span>
            </button>

            <button className="sidebar-nav-item sidebar-nav-item--signout">
              <LogOut size={20} className="sidebar-nav-icon" />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>
        {/* Blue Curved Header */}
        <header className="home-header">
          <div className="home-nav-row">
            {/* Menu icon */}
            <button className="home-menu-btn" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="16" y2="12" />
                <line x1="3" y1="18" x2="10" y2="18" />
              </svg>
            </button>

            {/* Location selector */}
            <div className="home-location-selector">
              <div className="home-location-label">
                <span>Current Location</span>
                <ChevronDown size={14} />
              </div>
              <span className="home-location-value">Burgas, Bulgaria</span>
            </div>

            {/* Bell icon with cyan indicator badge */}
            <button
              className="home-notification-btn"
              aria-label="Notifications"
              onClick={() => setShowNotifications(true)}
            >
              <Bell size={20} />
              <div className="home-notification-badge" />
            </button>
          </div>

          {/* Search and Filters Row */}
          <div className="home-search-row">
            <div className="home-search-wrapper">
              <Search size={22} className="home-search-icon" />
              <div className="home-search-divider" />
              <input
                type="text"
                className="home-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="home-filter-btn">
              <span className="home-filter-icon">
                <SlidersHorizontal size={12} />
              </span>
              <span>Filters</span>
            </button>
          </div>
        </header>

        {/* Interests Bar (overlapping the header) */}
        <section className="home-interests-container">
          <div className="home-interests-scroll">
            {categories.map((cat) => {
              const IconComp = cat.icon
              const isActive = cat.id === activeCategory
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="interest-pill"
                  style={{
                    backgroundColor: cat.color,
                    opacity: isActive ? 1 : 0.7,
                    transform: isActive ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <IconComp size={18} />
                  <span>{cat.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Trending Events Section */}
        <section className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">Trending Events</h2>
            <button className="home-see-all-btn">
              <span>See All</span>
              <span className="home-see-all-arrow">▶</span>
            </button>
          </div>

          <div className="home-events-scroll">
            {trendingEvents.map((evt) => (
              <div key={evt.id} className="event-card">
                <div className="event-card-img-wrapper">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="event-card-img"
                  />
                  {/* Date badge */}
                  <div className="card-date-badge">
                    <span className="card-date-day">{evt.date.day}</span>
                    <span className="card-date-month">{evt.date.month}</span>
                  </div>
                  {/* Bookmark badge */}
                  <button
                    className="card-bookmark-btn"
                    onClick={() => toggleBookmark(evt.id, "trending")}
                    aria-label="Bookmark event"
                  >
                    <Bookmark
                      size={14}
                      className="card-bookmark-icon"
                      style={{
                        fill: evt.bookmarked ? "#f0635a" : "none",
                        color: "#f0635a",
                      }}
                    />
                  </button>
                </div>

                <div className="event-card-info">
                  <h3 className="event-card-title">{evt.displayTitle}</h3>
                  <div className="event-card-location">
                    <MapPin size={14} className="event-card-location-icon" />
                    <span className="event-card-location-text">
                      {evt.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby You Section */}
        <section className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">Nearby You</h2>
            <button className="home-see-all-btn">
              <span>See All</span>
              <span className="home-see-all-arrow">▶</span>
            </button>
          </div>

          <div className="home-events-scroll">
            {nearbyEvents.map((evt) => (
              <div key={evt.id} className="event-card">
                <div className="event-card-img-wrapper">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="event-card-img"
                  />
                  {/* Date badge */}
                  <div className="card-date-badge">
                    <span className="card-date-day">{evt.date.day}</span>
                    <span className="card-date-month">{evt.date.month}</span>
                  </div>
                  {/* Bookmark badge */}
                  <button
                    className="card-bookmark-btn"
                    onClick={() => toggleBookmark(evt.id, "nearby")}
                    aria-label="Bookmark event"
                  >
                    <Bookmark
                      size={14}
                      className="card-bookmark-icon"
                      style={{
                        fill: evt.bookmarked ? "#f0635a" : "none",
                        color: "#f0635a",
                      }}
                    />
                  </button>
                </div>

                <div className="event-card-info">
                  <h3 className="event-card-title">{evt.displayTitle}</h3>
                  <div className="event-card-location">
                    <MapPin size={14} className="event-card-location-icon" />
                    <span className="event-card-location-text">
                      {evt.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PhoneFrame>
  )
}
