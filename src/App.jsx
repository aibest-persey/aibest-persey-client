import { Routes, Route, Navigate, Outlet } from "react-router-dom"
import SignIn from "./pages/SignIn.jsx"
import SignUp from "./pages/SignUp.jsx"
import ForgotPassword from "./pages/ForgotPassword.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"
import Home from "./pages/Home.jsx"
import EventDetails from "./pages/EventDetails.jsx"
import Profile from "./pages/Profile.jsx"
import Notifications from "./pages/Notifications.jsx"
import OrganiserDashboard from "./pages/OrganiserDashboard.jsx"
import MyRegistrations from "./pages/MyRegistrations.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import Inbox from "./pages/Inbox.jsx"
import Clubs from "./pages/Clubs.jsx"
import Unauthorized from "./pages/Unauthorized.jsx"
import DesktopShell from "./components/DesktopShell.jsx"
import { useAuth } from "./hooks/useAuth.js"
import { useIsDesktop } from "./hooks/useIsDesktop.js"
import { useHasOrganisation } from "./hooks/useHasOrganisation.js"

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) return <Navigate to="/unauthorized" replace />
  return children
}

function OrgMemberRoute({ children }) {
  const { hasOrganisation, loading } = useHasOrganisation()
  if (loading) return null
  if (!hasOrganisation) return <Navigate to="/home" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return children
  return user?.role === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />
}

function AppShell() {
  const isDesktop = useIsDesktop()
  if (isDesktop) return <DesktopShell />
  return <Outlet />
}

export default function App() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fc",
        fontFamily: "sans-serif",
        color: "#747688"
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          border: "3.5px solid #e2e5f1",
          borderTopColor: "#5669ff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: "12px"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span>Verifying session...</span>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          ) : (
            <Navigate to="/sign-in" replace />
          )
        }
      />

      <Route path="/sign-in" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/sign-up" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Authenticated routes: DesktopShell on desktop, bare Outlet on mobile */}
      <Route element={<AppShell />}>
        <Route path="/home" element={<ProtectedRoute allowedRoles={["student", "organiser"]}><Home /></ProtectedRoute>} />
        <Route path="/clubs" element={<ProtectedRoute allowedRoles={["student", "organiser"]}><OrgMemberRoute><Clubs /></OrgMemberRoute></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute allowedRoles={["student", "organiser"]}><EventDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={["student", "organiser"]}><Notifications /></ProtectedRoute>} />
        <Route path="/my-registrations" element={<ProtectedRoute allowedRoles={["student"]}><MyRegistrations /></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute allowedRoles={["student", "organiser"]}><Inbox /></ProtectedRoute>} />
        <Route
          path="/organiser-dashboard"
          element={<ProtectedRoute allowedRoles={["organiser"]}><OrganiserDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>}
        />
        <Route path="/unauthorized" element={<ProtectedRoute><Unauthorized /></ProtectedRoute>} />
      </Route>

      <Route
        path="*"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/sign-in" replace />}
      />
    </Routes>
  )
}
