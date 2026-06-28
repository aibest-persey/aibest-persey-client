import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { Home, Bell, User, LayoutDashboard, LogOut, CalendarCheck, Mail, ShieldCheck } from "lucide-react"
import "./DesktopShell.css"

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Mail, label: "Inbox", path: "/inbox" },
  { icon: User, label: "Profile", path: "/profile" },
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
  const navigate = useNavigate()
  const location = useLocation()

  const profile = (() => {
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
  })()

  const handleLogout = () => {
    logout()
    navigate("/sign-in", { replace: true })
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="dsk-layout">
      <aside className="dsk-sidebar">
        <div className="dsk-brand">
          <div className="dsk-brand-icon">P</div>
          <span className="dsk-brand-name">Persey</span>
        </div>

        <nav className="dsk-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              className={`dsk-nav-item ${isActive(path) ? "dsk-nav-item--active" : ""}`}
              onClick={() => navigate(path)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}

          {user?.role !== "organiser" &&
            STUDENT_NAV_ITEMS.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                className={`dsk-nav-item ${isActive(path) ? "dsk-nav-item--active" : ""}`}
                onClick={() => navigate(path)}
              >
                <Icon size={20} />
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
                <Icon size={20} />
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
                <Icon size={20} />
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
                <span>{(profile.nickname || "U").charAt(0).toUpperCase()}</span>
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
      </aside>

      <main className="dsk-main">
        <Outlet />
      </main>
    </div>
  )
}
