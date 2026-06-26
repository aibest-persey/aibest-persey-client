import { useNavigate } from "react-router-dom"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import "./Unauthorized.css"

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <PhoneFrame>
      <div className="unauth-container">
        {/* Header */}
        <header className="unauth-header">
          <button
            className="unauth-back-btn"
            aria-label="Go back"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="unauth-title">Access Denied</h1>
          <div style={{ width: 36 }} />
        </header>

        {/* Content */}
        <div className="unauth-body">
          <div className="unauth-icon-wrap">
            <ShieldAlert size={64} className="unauth-icon" />
          </div>
          
          <h2 className="unauth-heading">Restricted Page</h2>
          <p className="unauth-description">
            You do not have the required permissions to view this section. This page is only accessible to users registered as <strong>Organisers</strong>.
          </p>

          <button
            className="unauth-action-btn"
            onClick={() => navigate("/home")}
          >
            Return to Home
          </button>
        </div>
      </div>
    </PhoneFrame>
  )
}
