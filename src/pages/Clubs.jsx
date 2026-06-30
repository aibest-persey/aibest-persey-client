import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import {
  Bell, Heart, MessageSquare, Share2, Search
} from "lucide-react"

// Import assets
import bookshelfImg from "../assets/bookshelf_live_banner.png"
import handsImg from "../assets/reading_books_cozy.png"
import newsImg from "../assets/bit_awards_news.png"

// Import custom club assets
import scienceLiveImg from "../assets/science_lab_live.png"
import theaterLiveImg from "../assets/theater_stage_live.png"
import codeLiveImg from "../assets/code_editor_live.png"

import scienceEventImg from "../assets/science_event_collaboration.png"
import theaterEventImg from "../assets/theater_event_stage.png"
import codeEventImg from "../assets/code_event_hands.png"

import blueSneakersImg from "../assets/blue_sneakers_event.png"
import handsHoldingImg from "../assets/science_event_collaboration.png"

// Import specialized event graphics
import scienceGreenhouseImg from "../assets/science_greenhouse_tour.png"
import aiNeuronImg from "../assets/ai_neuron_network.png"
import scienceBeakerImg from "../assets/science_lab_beaker.png"
import codeReactMobileImg from "../assets/code_react_mobile.png"

import "./Clubs.css"

const CLUBS_DATA = {
  "dead-poets-society": {
    id: "dead-poets-society",
    name: "\"Dead Poets Society\"",
    category: "Book club",
    memberCount: 50,
    maxMembers: 60,
    avatarText: "BOOK\nCLUB",
    avatarType: "text",
    meetingTime: "Every Tuesday 6:00PM",
    liveTitle: "Hamlet Scene Analysis",
    liveDesc: "Join us live as we break down Act III scene I of Shakespeare's classic play.",
    liveTime: "43:57",
    liveImage: bookshelfImg,
    eventImage: handsImg,
    feed: {
      author: "Kaloyan Totev",
      time: "30 min ago",
      initials: "KT",
      content: "Everyone be sure to read this message and notify me if you're coming after reading. We are preparing the snacks and seat planning for next Tuesday's analysis of Hamlet. Please confirm RSVP in the event below. We'll be using the main seminar library space."
    },
    events: [
      { name: "Book Club Meeting", time: "Every Tuesday 6:00PM", registrations: 45, capacity: 60, image: handsImg },
      { name: "Shakespeare Reading", time: "Every Thursday 5:00PM", registrations: 12, capacity: 20, image: bookshelfImg },
      { name: "Poetry Slam Workshop", time: "Friday 4:00PM", registrations: 30, capacity: 40, image: handsImg },
      { name: "Creative Writing Lab", time: "Saturday 2:00PM", registrations: 8, capacity: 15, image: bookshelfImg },
      { name: "Literary Tea Party", time: "Sunday 3:00PM", registrations: 50, capacity: 50, image: handsImg }
    ],
    news: [
      { id: "news-d1", title: "Bit awards: Students from 10th grade won again", image: bookshelfImg },
      { id: "news-d2", title: "Literature Review: Modern prose patterns", image: handsImg }
    ]
  },
  "science": {
    id: "science",
    name: "\"Science & Alchemy\"",
    category: "Science club",
    memberCount: 24,
    maxMembers: 40,
    avatarType: "science",
    meetingTime: "Every Monday 4:30PM",
    liveTitle: "Chemistry Lab Safety",
    liveDesc: "Essential training briefing on handling chemical compounds safely in the school lab.",
    liveTime: "12:05",
    liveImage: scienceLiveImg,
    eventImage: scienceEventImg,
    feed: {
      author: "Dr. Elena Petrova",
      time: "1 hour ago",
      initials: "EP",
      content: "Hi team! The new lab equipment has finally arrived. Safety training slots are now open."
    },
    events: [
      { name: "Science Fair Preparations", time: "Every Monday 4:30PM", registrations: 18, capacity: 40, image: scienceEventImg },
      { name: "Lab Equipment Training", time: "Thursday 3:00PM", registrations: 8, capacity: 10, image: scienceBeakerImg },
      { name: "Physics Bowl Quiz", time: "Friday 5:00PM", registrations: 22, capacity: 30, image: scienceEventImg },
      { name: "Star Gazing Campout", time: "Saturday 9:00PM", registrations: 35, capacity: 50, image: scienceLiveImg },
      { name: "Botany Greenhouse Tour", time: "Sunday 11:00AM", registrations: 15, capacity: 20, image: scienceGreenhouseImg }
    ],
    news: [
      { id: "news-s1", title: "Chemistry Olympics: VSCPI wins gold medal!", image: scienceLiveImg },
      { id: "news-s2", title: "New high-precision microscopes arrived...", image: scienceEventImg }
    ]
  },
  "theater": {
    id: "theater",
    name: "\"The Stage Guild\"",
    category: "Theater club",
    memberCount: 35,
    maxMembers: 50,
    avatarType: "theater",
    meetingTime: "Every Wednesday 5:00PM",
    liveTitle: "Romeo & Juliet Auditions",
    liveDesc: "Watch the rehearsal of Act II scene I live and leave comments for feedback.",
    liveTime: "02:40:00",
    liveImage: theaterLiveImg,
    eventImage: theaterEventImg,
    feed: {
      author: "Marta Ivanova",
      time: "3 hours ago",
      initials: "MI",
      content: "Script alterations for Act I are now finalized! Please pick up updated booklets from Room 204. Rehearsals start promptly at 5:00 PM in the auditorium. Make sure to review stage cues."
    },
    events: [
      { name: "Romeo & Juliet Audition", time: "Every Wednesday 5:00PM", registrations: 30, capacity: 50, image: theaterEventImg },
      { name: "Stage Lighting Tutorial", time: "Tuesday 4:00PM", registrations: 10, capacity: 15, image: theaterLiveImg },
      { name: "Costume Design Panel", time: "Thursday 6:00PM", registrations: 25, capacity: 30, image: theaterEventImg },
      { name: "Rehearsal Act I scene II", time: "Friday 4:30PM", registrations: 40, capacity: 45, image: theaterLiveImg },
      { name: "Public Speaking Prep", time: "Saturday 1:00PM", registrations: 15, capacity: 25, image: theaterEventImg }
    ],
    news: [
      { id: "news-t1", title: "School Play Ticket Presales set new record", image: theaterLiveImg },
      { id: "news-t2", title: "Interview with our lead actress Katniss...", image: theaterEventImg }
    ]
  },
  "code": {
    id: "code",
    name: "\"Code of the Future\"",
    category: "Tech club",
    memberCount: 118,
    maxMembers: 150,
    avatarText: "CODE",
    avatarType: "code",
    meetingTime: "Every Thursday 4:00PM",
    liveTitle: "API Hackathon Kickoff",
    liveDesc: "The winter hackathon details are announced! Register to form teams of up to 4.",
    liveTime: "15:30",
    liveImage: codeLiveImg,
    eventImage: codeEventImg,
    feed: {
      author: "Boyan Georgiev",
      time: "4 hours ago",
      initials: "BG",
      content: "Hello coders! We are organizing a study session for Web APIs next week. Fill the feedback form if you want specific topics covered. Winter Hackathon details are posted on Discord."
    },
    events: [
      { name: "Tech Hackathon kickoff", time: "Every Thursday 4:00PM", registrations: 98, capacity: 150, image: codeEventImg },
      { name: "React Native Workshop", time: "Friday 3:30PM", registrations: 45, capacity: 60, image: codeReactMobileImg },
      { name: "Git & Version Control", time: "Saturday 11:00AM", registrations: 120, capacity: 120, image: codeEventImg },
      { name: "LeetCode Grind Session", time: "Monday 6:00PM", registrations: 60, capacity: 80, image: codeLiveImg },
      { name: "AI & Machine Learning Intro", time: "Tuesday 5:00PM", registrations: 140, capacity: 150, image: aiNeuronImg }
    ],
    news: [
      { id: "news-c1", title: "Bit awards: VSCPI team dominates city programming contest", image: newsImg },
      { id: "news-c2", title: "Coding club repository hits 500 stars...", image: codeLiveImg }
    ]
  }
}

export default function Clubs() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const [activeClubId, setActiveClubId] = useState("dead-poets-society")
  const [activeEventIndex, setActiveEventIndex] = useState(0)
  const [isFeedExpanded, setIsFeedExpanded] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Track joined status for each club separately
  const [joinedClubs, setJoinedClubs] = useState({
    "dead-poets-society": false,
    "science": false,
    "theater": false,
    "code": false,
  })

  // Track likes for each club separately
  const [clubLikes, setClubLikes] = useState({
    "dead-poets-society": { count: 12, liked: false },
    "science": { count: 4, liked: false },
    "theater": { count: 18, liked: false },
    "code": { count: 42, liked: false },
  })

  // Load user profile details
  const [profile] = useState(() => {
    const saved = localStorage.getItem("persey_user_profile")
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    return { nickname: user?.username || "Katniss Everdine", avatar: "" }
  })

  const activeClub = CLUBS_DATA[activeClubId] || CLUBS_DATA["dead-poets-society"]
  const isJoined = joinedClubs[activeClubId] ?? false
  const currentMembers = activeClub.memberCount + (isJoined ? 1 : 0)
  const activeLikeState = clubLikes[activeClubId] || { count: 0, liked: false }

  const filteredClubs = Object.values(CLUBS_DATA).filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLikeToggle = () => {
    setClubLikes(prev => {
      const current = prev[activeClubId]
      return {
        ...prev,
        [activeClubId]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked
        }
      }
    })
  }

  const handleClubChange = (clubId) => {
    setActiveClubId(clubId)
    setActiveEventIndex(0) // Reset event carousel back to first item when switching clubs
    setIsFeedExpanded(false) // Collapse post when changing clubs
    setSearchQuery("") // Clear search input text
    setIsDropdownOpen(false) // Hide dropdown list
  }

  const renderDropdownList = () => {
    if (!isDropdownOpen) return null
    return (
      <div className="clubs-search-dropdown">
        {filteredClubs.length === 0 ? (
          <div className="clubs-dropdown-empty">No clubs found</div>
        ) : (
          filteredClubs.map(c => (
            <div
              key={c.id}
              className="clubs-dropdown-item"
              onMouseDown={() => handleClubChange(c.id)}
            >
              <div className="clubs-dropdown-avatar">
                {renderClubAvatarContent(c)}
              </div>
              <div className="clubs-dropdown-info">
                <span className="clubs-dropdown-name">{c.name.replace(/"/g, "")}</span>
                <span className="clubs-dropdown-category">{c.category}</span>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  const renderClubAvatarContent = (club) => {
    if (club.id === "dead-poets-society") {
      return (
        <div className="club-avatar-inner book-club-avatar" style={{ border: "none" }}>
          <span className="club-avatar-text-label" style={{ fontSize: "7px" }}>BOOK<br/>CLUB</span>
        </div>
      )
    } else if (club.id === "science") {
      return (
        <div className="club-avatar-inner science-club-avatar">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" fill="#1b85b8" />
            <circle cx="50" cy="50" r="15" fill="#f9d5e5" />
            <path d="M30,70 L50,50 L70,70" stroke="#ffffff" strokeWidth="4" />
          </svg>
        </div>
      )
    } else if (club.id === "theater") {
      return (
        <div className="club-avatar-inner theater-club-avatar">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" fill="#ae5a41" />
            <path d="M50,20 L50,80 M20,50 L80,50" stroke="#ffffff" strokeWidth="4" />
            <polygon points="50,30 30,70 70,70" fill="#e7d3d3" />
          </svg>
        </div>
      )
    } else if (club.id === "code") {
      return (
        <div className="club-avatar-inner code-club-avatar">
          <span className="club-avatar-code-text" style={{ fontSize: "8px" }}>CODE</span>
        </div>
      )
    }
    return null
  }


  // Define the common elements to avoid repetition
  const renderClubsScrollList = () => (
    <div className="clubs-horizontal-scroll">
      <button className="club-avatar-btn club-avatar-btn--add" title="Add Club" onClick={() => alert("Create club wizard!")}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <button className={`club-avatar-btn ${activeClubId === "dead-poets-society" ? "club-avatar-btn--active" : ""}`} onClick={() => handleClubChange("dead-poets-society")}>
        <div className="club-avatar-inner book-club-avatar">
          <span className="club-avatar-text-label">BOOK<br/>CLUB</span>
        </div>
      </button>

      <button className={`club-avatar-btn ${activeClubId === "science" ? "club-avatar-btn--active" : ""}`} onClick={() => handleClubChange("science")}>
        <div className="club-avatar-inner science-club-avatar">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" fill="#1b85b8" />
            <circle cx="50" cy="50" r="15" fill="#f9d5e5" />
            <path d="M30,70 L50,50 L70,70" stroke="#ffffff" strokeWidth="4" />
          </svg>
        </div>
      </button>

      <button className={`club-avatar-btn ${activeClubId === "theater" ? "club-avatar-btn--active" : ""}`} onClick={() => handleClubChange("theater")}>
        <div className="club-avatar-inner theater-club-avatar">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" fill="#ae5a41" />
            <path d="M50,20 L50,80 M20,50 L80,50" stroke="#ffffff" strokeWidth="4" />
            <polygon points="50,30 30,70 70,70" fill="#e7d3d3" />
          </svg>
        </div>
      </button>

      <button className={`club-avatar-btn ${activeClubId === "code" ? "club-avatar-btn--active" : ""}`} onClick={() => handleClubChange("code")}>
        <div className="club-avatar-inner code-club-avatar">
          <span className="club-avatar-code-text">CODE</span>
        </div>
      </button>
    </div>
  )

  const renderLiveShelfCard = () => (
    <div className="clubs-shelf-card-wrapper">
      <div className="clubs-shelf-card" style={{ backgroundImage: `url(${activeClub.liveImage || bookshelfImg})` }}>
        <div className="clubs-shelf-badge-left">
          <span className="clubs-live-dot"></span>
          <span>Live</span>
        </div>
        <div className="clubs-shelf-badge-right">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="clubs-clock-icon">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{activeClub.liveTime}</span>
        </div>
        <div className="clubs-shelf-content-overlay">
          <h4 className="clubs-shelf-live-title">{activeClub.liveTitle}</h4>
          <p className="clubs-shelf-live-desc">{activeClub.liveDesc}</p>
        </div>
        <button className="clubs-shelf-join-btn" onClick={() => alert(`Joining live stream for ${activeClub.liveTitle}!`)}>
          Join
        </button>
      </div>
    </div>
  )

  const renderFeedPostCard = () => {
    if (!activeClub.feed || !activeClub.feed.content) {
      return (
        <div className="clubs-empty-state-box">
          <div className="clubs-empty-state-icon">💬</div>
          <h4 className="clubs-empty-state-title">No Posts Yet</h4>
          <p className="clubs-empty-state-desc">This club's feed is currently empty. Be the first to start a conversation!</p>
        </div>
      )
    }

    const rawContent = activeClub.feed.content
    const maxChars = 120
    const isLongPost = rawContent.length > maxChars

    let displayContent = rawContent
    let showLink = false
    let linkText = ""

    if (isLongPost) {
      showLink = true
      if (!isFeedExpanded) {
        displayContent = rawContent.slice(0, maxChars) + "..."
        linkText = "Read more"
      } else {
        displayContent = rawContent
        linkText = "Read less"
      }
    }

    return (
      <div className="clubs-mock-feed-post-card">
        <div className="clubs-post-header">
          <div className="clubs-post-author-avatar">
            <div className="clubs-post-author-img-placeholder">
              <span className="clubs-author-initials">{activeClub.feed.initials}</span>
            </div>
          </div>
          <div className="clubs-post-author-text">
            <h4 className="clubs-post-author-name">{activeClub.feed.author}</h4>
            <span className="clubs-post-time">{activeClub.feed.time}</span>
          </div>
        </div>
        <div className="clubs-post-body">
          <p className="clubs-post-content">
            {activeClub.id === "dead-poets-society" ? <strong>IMPORTANT REMINDER!</strong> : null}
            {activeClub.id === "dead-poets-society" ? <br /> : null}
            {displayContent}
            {showLink && (
              <span className="clubs-read-more-link" onClick={() => setIsFeedExpanded(!isFeedExpanded)}>
                {linkText}
              </span>
            )}
          </p>
        </div>
        <div className="clubs-post-footer-actions">
          <button className={`clubs-post-action-btn ${activeLikeState.liked ? "clubs-post-action-btn--active" : ""}`} onClick={handleLikeToggle}>
            <Heart size={16} fill={activeLikeState.liked ? "#f0635a" : "none"} stroke={activeLikeState.liked ? "#f0635a" : "currentColor"} />
            <span style={{ marginLeft: "4px" }}>Like ({activeLikeState.count})</span>
          </button>
          <button className="clubs-post-action-btn" onClick={() => alert("Open comments dialog!")}>
            <MessageSquare size={16} />
            <span>Comment</span>
          </button>
          <button className="clubs-post-action-btn" onClick={() => alert("Copied post share link!")}>
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    )
  }

  const renderEventsWeekCard = () => {
    if (!activeClub.events || activeClub.events.length === 0) {
      return (
        <div className="clubs-empty-state-box">
          <div className="clubs-empty-state-icon">📅</div>
          <h4 className="clubs-empty-state-title">No Events Scheduled</h4>
          <p className="clubs-empty-state-desc">There are no events planned for this week. Stay tuned!</p>
        </div>
      )
    }

    const currentEvent = activeClub.events[activeEventIndex] || activeClub.events[0]
    // If user is joined, we increment registrations of the first event as dynamic visualization
    const isFirstEvent = activeEventIndex === 0
    const regCount = currentEvent.registrations + ((isJoined && isFirstEvent) ? 1 : 0)
    
    return (
      <div className="clubs-events-week-card" style={{ backgroundImage: `url(${currentEvent.image || activeClub.eventImage || handsImg})` }}>
        <div className="clubs-events-week-badge-row">
          <div className="clubs-events-register-badge">
            <Heart size={12} fill="#ff4d4f" stroke="#ff4d4f" className="clubs-register-heart" />
            <span className="clubs-register-count">{regCount}/{currentEvent.capacity}</span>
            <button className="clubs-register-action-btn" onClick={() => navigate("/events/1")}>
              Register &rarr;
            </button>
          </div>
        </div>
        <div className="clubs-events-week-bottom-strip">
          <span className="clubs-event-strip-name">{currentEvent.name}</span>
          <span className="clubs-event-strip-time">{currentEvent.time}</span>
        </div>
      </div>
    )
  }

  // ─── DESKTOP VIEW ───
  if (isDesktop) {
    return (
      <div className="clubs-desktop-container">
        {/* Top Header Panel */}
        <div className="clubs-desktop-top-header">
          <div className="clubs-header-left">
            <div className="clubs-user-avatar-circle" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {renderClubAvatarContent(activeClub)}
            </div>
            <div className="clubs-header-text-container">
              <h1 className="clubs-main-title">{activeClub.name}</h1>
              <span className="clubs-category-subtitle">_{activeClub.category}_</span>
              <span className="clubs-member-count-subtitle">{currentMembers}/{activeClub.maxMembers} members</span>
            </div>
          </div>

          <div className="clubs-desktop-controls-bar">
            {/* Search Pill */}
            <div className="clubs-search-pill" style={{ position: "relative" }}>
              <input
                type="text"
                className="clubs-search-input-field"
                placeholder="Search clubs..."
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="clubs-search-action-btn" aria-label="Search">
                <Search size={18} color="#ffffff" />
              </button>
              {renderDropdownList()}
            </div>

            {/* Join Club button */}
            <button 
              className={`clubs-mock-join-btn ${isJoined ? "clubs-mock-join-btn--joined" : ""}`}
              onClick={() => setJoinedClubs(prev => ({ ...prev, [activeClubId]: !isJoined }))}
              style={{ width: "auto", minWidth: "140px" }}
            >
              {isJoined ? "Leave Club" : "Join Club"}
            </button>

            {/* Notification bell */}
            <button className="clubs-bell-icon-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
              <Bell size={20} className="clubs-bell-svg" />
            </button>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="clubs-desktop-layout-grid">
          
          {/* Main Left Pane (70% width) */}
          <div className="clubs-desktop-left-pane">
            
            {/* Clubs scroll list block */}
            <div className="clubs-desktop-block">
              <h2 className="clubs-section-header-title">Clubs</h2>
              {renderClubsScrollList()}
            </div>

            {/* Live shelf card block */}
            <div className="clubs-desktop-block">
              {renderLiveShelfCard()}
            </div>

            {/* Club Feed block */}
            <div className="clubs-desktop-block">
              <h3 className="clubs-section-title-label" style={{ marginBottom: "16px" }}>Club Feed</h3>
              {renderFeedPostCard()}
            </div>

          </div>

          {/* Sidebar Right Pane (30% width) */}
          <div className="clubs-desktop-right-pane">
            
            {/* Events widget */}
            <div className="clubs-desktop-sidebar-widget">
              <div className="clubs-section-title-row">
                <h3 className="clubs-section-title-label">Events this week</h3>
                <button className="clubs-see-more-link-btn" onClick={() => navigate("/schedule")}>See more</button>
              </div>
              {renderEventsWeekCard()}
              
              <div className="clubs-carousel-dots" style={{ justifyContent: "center" }}>
                {activeClub.events.map((evt, idx) => (
                  <span
                    key={idx}
                    className={`clubs-dot ${idx === activeEventIndex ? "clubs-dot--active" : ""}`}
                    onClick={() => setActiveEventIndex(idx)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
            </div>

            {/* News widget */}
            <div className="clubs-desktop-sidebar-widget" style={{ marginTop: "28px" }}>
              <div className="clubs-section-title-row">
                <h3 className="clubs-section-title-label">Latest News</h3>
                <button className="clubs-see-more-link-btn" onClick={() => alert("Show all news!")}>See all</button>
              </div>
              
              <div className="clubs-desktop-news-stack">
                {!activeClub.news || activeClub.news.length === 0 ? (
                  <div className="clubs-empty-state-box" style={{ width: "100%" }}>
                    <div className="clubs-empty-state-icon">📰</div>
                    <h4 className="clubs-empty-state-title">No News Available</h4>
                    <p className="clubs-empty-state-desc">No news articles or updates have been published for this club yet.</p>
                  </div>
                ) : (
                  activeClub.news.map((item) => (
                    <div key={item.id} className="clubs-news-grid-item">
                      <div className="clubs-news-image-container" style={{ backgroundImage: `url(${item.image || newsImg})` }}>
                        <button className="clubs-news-see-more-btn" onClick={() => alert(`${item.title} detailed view`)}>
                          <span>See more</span>
                          <span className="clubs-news-arrow">&rarr;</span>
                        </button>
                      </div>
                      <div className="clubs-news-title-bar">
                        <p className="clubs-news-grid-title">{item.title}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    )
  }

  // ─── MOBILE VIEW ───
  return (
    <PhoneFrame>
      <div className="clubs-page-container">
        
        {/* Header Section */}
        <header className="clubs-mock-header">
          <div className="clubs-header-left">
            <div className="clubs-user-avatar-circle" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {renderClubAvatarContent(activeClub)}
            </div>
            <div className="clubs-header-text-container">
              <h1 className="clubs-main-title">{activeClub.name}</h1>
              <span className="clubs-category-subtitle">_{activeClub.category}_</span>
              <span className="clubs-member-count-subtitle">{currentMembers}/{activeClub.maxMembers} members</span>
            </div>
          </div>
          <button className="clubs-bell-icon-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={20} className="clubs-bell-svg" />
          </button>
        </header>

        {/* Clubs section title */}
        <h2 className="clubs-section-header-title">Clubs</h2>

        {/* Horizontal Clubs selection */}
        {renderClubsScrollList()}

        {/* Search bar inside the selected club */}
        <div className="clubs-search-container-mock">
          <div className="clubs-search-pill" style={{ position: "relative" }}>
            <input
              type="text"
              className="clubs-search-input-field"
              placeholder="Search clubs..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="clubs-search-action-btn" aria-label="Search">
              <Search size={18} color="#ffffff" />
            </button>
            {renderDropdownList()}
          </div>
        </div>

        {/* Join Club button */}
        <div className="clubs-join-action-wrapper">
          <button 
            className={`clubs-mock-join-btn ${isJoined ? "clubs-mock-join-btn--joined" : ""}`}
            onClick={() => setJoinedClubs(prev => ({ ...prev, [activeClubId]: !isJoined }))}
          >
            {isJoined ? "Leave Club" : "Join Club"}
          </button>
        </div>

        {/* Live Shelf Card */}
        {renderLiveShelfCard()}

        {/* Feed Post */}
        {renderFeedPostCard()}

        {/* Events this week */}
        <div className="clubs-section-title-row">
          <h3 className="clubs-section-title-label">Events this week</h3>
          <button className="clubs-see-more-link-btn" onClick={() => navigate("/schedule")}>See more</button>
        </div>

        <div className="clubs-events-week-card-wrapper">
          {renderEventsWeekCard()}
          {/* Carousel dots */}
          <div className="clubs-carousel-dots">
            {activeClub.events.map((evt, idx) => (
              <span
                key={idx}
                className={`clubs-dot ${idx === activeEventIndex ? "clubs-dot--active" : ""}`}
                onClick={() => setActiveEventIndex(idx)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
        </div>

        {/* Latest News */}
        <div className="clubs-section-title-row">
          <h3 className="clubs-section-title-label">Latest News</h3>
          <button className="clubs-see-more-link-btn" onClick={() => alert("Show all news!")}>See all</button>
        </div>

        <div className="clubs-news-horizontal-grid">
          {!activeClub.news || activeClub.news.length === 0 ? (
            <div className="clubs-empty-state-box" style={{ width: "100%", gridColumn: "span 2" }}>
              <div className="clubs-empty-state-icon">📰</div>
              <h4 className="clubs-empty-state-title">No News Available</h4>
              <p className="clubs-empty-state-desc">No news articles or updates have been published for this club yet.</p>
            </div>
          ) : (
            activeClub.news.map((item) => (
              <div key={item.id} className="clubs-news-grid-item">
                <div className="clubs-news-image-container" style={{ backgroundImage: `url(${item.image || newsImg})` }}>
                  <button className="clubs-news-see-more-btn" onClick={() => alert(`${item.title} detailed view`)}>
                    <span>See more</span>
                    <span className="clubs-news-arrow">&rarr;</span>
                  </button>
                </div>
                <div className="clubs-news-title-bar">
                  <p className="clubs-news-grid-title">{item.title}</p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </PhoneFrame>
  )
}
