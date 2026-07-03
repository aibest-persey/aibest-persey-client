import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"
import { useNotifications } from "../hooks/useNotifications.js"
import PhoneFrame from "../components/PhoneFrame.jsx"
import { updateMySettings } from "../services/authService.js"
import { SUPPORTED_LOCALES } from "../i18n/index.js"
import {
  Bell, Globe, ArrowLeft, Menu, ChevronRight,
  User, SlidersHorizontal, Calendar, Bookmark, Mail, LogOut, CalendarCheck, ShieldCheck, Newspaper,
} from "lucide-react"
import "./Settings.css"

export default function Settings() {
  const { t } = useTranslation()
  const { user, token, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const { unreadCount } = useNotifications()

  const [profile] = useState(() => {
    const saved = localStorage.getItem("persey_user_profile")
    if (saved) { try { return JSON.parse(saved) } catch { /* fall through */ } }
    return { nickname: user ? (user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User") : "User", avatar: "" }
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const locale = user?.locale ?? "en"
  const notificationsEnabled = user?.notificationsEnabled ?? true

  const persist = async (data) => {
    setSaving(true)
    setError("")
    setMessage("")
    try {
      await updateMySettings(token, data)
      await refreshUser()
      setMessage(t("settings.saved"))
      setTimeout(() => setMessage(""), 2500)
    } catch (err) {
      setError(err.message ?? t("settings.saveError"))
    } finally {
      setSaving(false)
    }
  }

  const handleLocaleChange = (nextLocale) => {
    if (nextLocale === locale || saving) return
    persist({ locale: nextLocale })
  }

  const handleNotificationsToggle = () => {
    if (saving) return
    persist({ notificationsEnabled: !notificationsEnabled })
  }

  const content = (
    <>
      <section className="m2-section settings-section">
        <div className="m2-section-header">
          <h2 className="m2-section-title"><Globe size={16} /> {t("settings.language.sectionTitle")}</h2>
        </div>
        <p className="settings-section-desc">{t("settings.language.sectionDesc")}</p>
        <div className="settings-locale-options">
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              className={`settings-locale-btn ${locale === code ? "settings-locale-btn--active" : ""}`}
              disabled={saving}
              onClick={() => handleLocaleChange(code)}
            >
              {t(`settings.language.${code}`)}
            </button>
          ))}
        </div>
      </section>

      <section className="m2-section settings-section">
        <div className="m2-section-header">
          <h2 className="m2-section-title"><Bell size={16} /> {t("settings.notifications.sectionTitle")}</h2>
        </div>
        <div className="settings-toggle-row">
          <div>
            <p className="settings-toggle-label">{t("settings.notifications.toggleLabel")}</p>
            <p className="settings-section-desc" style={{ margin: 0 }}>{t("settings.notifications.toggleDesc")}</p>
          </div>
          <button
            role="switch"
            aria-checked={notificationsEnabled}
            className={`settings-switch ${notificationsEnabled ? "settings-switch--on" : ""}`}
            disabled={saving}
            onClick={handleNotificationsToggle}
          >
            <span className="settings-switch-knob" />
          </button>
        </div>
      </section>

      {message && <div className="settings-feedback settings-feedback--success">{message}</div>}
      {error && <div className="settings-feedback settings-feedback--error">{error}</div>}
    </>
  )

  const sidebarDrawer = (
    <>
      <div className={`sidebar-overlay ${sidebarOpen ? "sidebar-overlay--visible" : ""}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar-drawer ${sidebarOpen ? "sidebar-drawer--open" : ""}`}>
        <button
          type="button"
          className="sidebar-profile sidebar-profile--link"
          onClick={() => { setSidebarOpen(false); navigate("/profile") }}
        >
          <div className="sidebar-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="sidebar-avatar-img" />
            ) : (
              <User size={32} color="#9a9cae" />
            )}
          </div>
          <span className="sidebar-username">{profile.nickname}</span>
          <span className="sidebar-profile-link"><span>View profile</span><ChevronRight size={14} /></span>
        </button>
        <nav className="sidebar-nav">
          <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/home") }}>
            <User size={20} className="sidebar-nav-icon" /><span>Home</span>
          </button>
          {user?.role === "organiser" && (
            <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/organiser-dashboard") }}>
              <SlidersHorizontal size={20} className="sidebar-nav-icon" /><span>Organiser Dashboard</span>
            </button>
          )}
          <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/inbox") }}>
            <Mail size={20} className="sidebar-nav-icon" /><span>Inbox</span>
          </button>
          {user?.role === "admin" && (
            <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/admin") }}>
              <ShieldCheck size={20} className="sidebar-nav-icon" /><span>Admin Dashboard</span>
            </button>
          )}
          {user?.role !== "organiser" && (
            <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/my-registrations") }}>
              <CalendarCheck size={20} className="sidebar-nav-icon" /><span>My Registrations</span>
            </button>
          )}
          <button className="sidebar-nav-item" onClick={() => { setSidebarOpen(false); navigate("/news") }}>
            <Newspaper size={20} className="sidebar-nav-icon" /><span>News</span>
          </button>
          <button className="sidebar-nav-item"><Calendar size={20} className="sidebar-nav-icon" /><span>Calendar</span></button>
          <button className="sidebar-nav-item"><Bookmark size={20} className="sidebar-nav-icon" /><span>Bookmark</span></button>
          <button className="sidebar-nav-item"><Mail size={20} className="sidebar-nav-icon" /><span>Contact Us</span></button>
          <button className="sidebar-nav-item sidebar-nav-item--signout" onClick={() => { logout(); navigate("/sign-in", { replace: true }) }}>
            <LogOut size={20} className="sidebar-nav-icon" /><span>Sign Out</span>
          </button>
        </nav>
      </aside>
    </>
  )

  const header = (
    <header className={isDesktop ? "m2-desktop-header" : "m2-header"}>
      <button className="m2-avatar-btn" aria-label={isDesktop ? "Back to Profile" : "Open menu"} onClick={() => (isDesktop ? navigate("/profile") : setSidebarOpen(true))}>
        {isDesktop ? <ArrowLeft size={18} /> : <Menu size={20} />}
      </button>
      <h1 className="m2-org-name">{t("settings.title")}</h1>
      <button className="m2-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
        <Bell size={18} />
        {unreadCount > 0 && <div className="home-notification-badge" />}
      </button>
    </header>
  )

  if (isDesktop) {
    return (
      <div className="home-container--m2">
        {header}
        <div className="m2-desktop-block">{content}</div>
      </div>
    )
  }

  return (
    <PhoneFrame>
      <div className="home-container--m2">
        {sidebarDrawer}
        {header}
        {content}
      </div>
    </PhoneFrame>
  )
}
