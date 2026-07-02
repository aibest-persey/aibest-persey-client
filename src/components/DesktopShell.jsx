import { useState, useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useHasOrganisation } from "../hooks/useHasOrganisation.js"
import { useNotifications } from "../hooks/useNotifications.js"
import { Home, Bell, User, LayoutDashboard, LogOut, CalendarCheck, Mail, ShieldCheck, Users, Calendar, Newspaper, Settings as SettingsIcon } from "lucide-react"
import { AvatarIcon } from "../pages/Profile.jsx"
import "./DesktopShell.css"

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Users, label: "Clubs", path: "/clubs" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: Newspaper, label: "News", path: "/news" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Mail, label: "Inbox", path: "/inbox" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: SettingsIcon, label: "Settings", path: "/settings" },
]

const STUDENT_NAV_ITEMS = [
  { icon: CalendarCheck, label: "My Registrations", path: "/my-registrations" },
]

const ORG_NAV_ITEMS = [
  { icon: LayoutDashboard, label: "My Events", path: "/organiser-dashboard" },
]

const ADMIN_NAV_ITEMS = [
  { icon: ShieldCheck, label: "Admin Dashboard", path: "/admin" },
]

export default function DesktopShell() {
  const { user, logout } = useAuth()
  const { hasOrganisation } = useHasOrganisation()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("persey_user_profile")
      if (saved) return JSON.parse(saved)
    } catch { /* ignore */ }
    return {
      nickname: user
        ? (user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User")
        : "User",
      avatar: "",
    }
  })

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem("persey_user_profile")
        if (saved) setProfile(JSON.parse(saved))
      } catch { /* ignore */ }
    }
    window.addEventListener("storage", handleStorage)
    window.addEventListener("profileUpdated", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("profileUpdated", handleStorage)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/sign-in", { replace: true })
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="dsk-layout">
      <header className="dsk-top-navbar">
        <nav className="dsk-nav">
          {NAV_ITEMS
            .filter((item) => user?.role !== "admin" || ["/home", "/clubs", "/profile", "/notifications", "/news", "/settings"].includes(item.path))
            .filter((item) => item.path !== "/clubs" || hasOrganisation)
            .map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              className={`dsk-nav-item ${isActive(path) ? "dsk-nav-item--active" : ""}`}
              onClick={() => navigate(path)}
              style={path === "/notifications" ? { position: "relative" } : undefined}
            >
              <Icon size={18} />
              {path === "/notifications" && unreadCount > 0 && <div className="home-notification-badge" />}
              <span>{label}</span>
            </button>
          ))}

          {user?.role === "student" &&
            STUDENT_NAV_ITEMS.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                className={`dsk-nav-item ${isActive(path) ? "dsk-nav-item--active" : ""}`}
                onClick={() => navigate(path)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}

          {user?.role === "organiser" &&
            ORG_NAV_ITEMS.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                className={`dsk-nav-item ${isActive(path) ? "dsk-nav-item--active" : ""}`}
                onClick={() => navigate(path)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}

          {user?.role === "admin" &&
            ADMIN_NAV_ITEMS.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                className={`dsk-nav-item ${isActive(path) ? "dsk-nav-item--active" : ""}`}
                onClick={() => navigate(path)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
        </nav>

        <div className="dsk-user-section">
          <div className="dsk-user-info" onClick={() => navigate("/profile")}>
            <div className="dsk-user-avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" />
              ) : (
                <AvatarIcon />
              )}
            </div>
            <div className="dsk-user-details">
              <span className="dsk-user-name">{profile.nickname}</span>
              <span className="dsk-user-role">{user?.role || "Student"}</span>
            </div>
          </div>
          <button className="dsk-logout-btn" onClick={handleLogout} title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="dsk-main">
        <Outlet />
      </main>
    </div>
  )
}
