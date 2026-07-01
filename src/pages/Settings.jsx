import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import i18n from "../i18n.js";
import { updateUserProfilePreferences } from "../services/authService.js";
import "./Settings.css"; // Matches his architectural page style sheet pattern

export default function Settings() {
  const { token, user, setUser } = useAuth();

  // 🎯 Ticket #34 Acceptance Criteria: Notification preference toggles
  const [currentLocale, setCurrentLocale] = useState(() => user?.locale || i18n.language || "en");
  const [emailAlerts, setEmailAlerts] = useState(() => user?.preferences?.emailAlerts ?? true);
  const [pushAlerts, setPushAlerts] = useState(() => user?.preferences?.pushAlerts ?? true);
  const [statusMessage, setStatusMsg] = useState("");

  const handleSavePreferences = async () => {
    try {
      const payloadPreferences = { emailAlerts, pushAlerts };
      await updateUserProfilePreferences(token, currentLocale, payloadPreferences);
      
      // Update local global auth context user model properties dynamically
      if (setUser && user) {
        setUser({ ...user, locale: currentLocale, preferences: payloadPreferences });
      }
      setStatusMsg(i18n.t("successMsg"));
    } catch (err) {
      console.error(err);
      setStatusMsg(i18n.t("errorMsg"));
    }
  };

  return (
    <div className="settings-view-wrapper" style={{ padding: "30px", maxWidth: "600px" }}>
      {/* 🎯 Ticket #34 Acceptance Criteria: All new screens use translation keys via i18n.t() */}
      <h2>{i18n.t("settingsTitle")}</h2>
      
      {statusMessage && (
        <div className="status-banner" style={{ margin: "15px 0", padding: "10px", backgroundColor: "#e2e8f0" }}>
          {statusMessage}
        </div>
      )}

      {/* Language Switcher Section */}
      <div className="setting-control-group" style={{ marginBottom: "25px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          {i18n.t("languageLabel")}
        </label>
        <select 
          value={currentLocale} 
          onChange={(e) => setCurrentLocale(e.target.value)}
          style={{ padding: "8px", width: "100%", borderRadius: "4px" }}
        >
          <option value="en">English</option>
          <option value="bg">Български (Bulgarian)</option>
        </select>
      </div>

      {/* Notification Toggle Preferences Section */}
      <div className="setting-control-group" style={{ marginBottom: "25px" }}>
        <h4 style={{ borderBottom: "1px solid #cbd5e1", paddingBottom: "8px" }}>
          {i18n.t("notificationsHeader")}
        </h4>
        
        <div style={{ margin: "12px 0", display: "flex", alignItems: "center" }}>
          <input 
            type="checkbox" 
            id="emailToggle"
            checked={emailAlerts} 
            onChange={(e) => setEmailAlerts(e.target.checked)}
            style={{ width: "18px", height: "18px", marginRight: "10px" }}
          />
          <label htmlFor="emailToggle">{i18n.t("emailNotify")}</label>
        </div>

        <div style={{ margin: "12px 0", display: "flex", alignItems: "center" }}>
          <input 
            type="checkbox" 
            id="pushToggle"
            checked={pushAlerts} 
            onChange={(e) => setPushAlerts(e.target.checked)}
            style={{ width: "18px", height: "18px", marginRight: "10px" }}
          />
          <label htmlFor="pushToggle">{i18n.t("pushNotify")}</label>
        </div>
      </div>

      <button 
        onClick={handleSavePreferences}
        style={{ padding: "10px 20px", backgroundColor: "#0284c7", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        {i18n.t("saveBtn")}
      </button>
    </div>
  );
}
