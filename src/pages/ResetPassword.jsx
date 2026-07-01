import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import { resetPassword } from "../services/authService.js"
import { validateResetPassword } from "../utils/validation.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"

export default function ResetPassword() {
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const id = searchParams.get("id")

  const [form, setForm] = useState({ password: "", confirmPassword: "" })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    if (serverError) setServerError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")
    const errors = validateResetPassword(form)
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setLoading(true)
    try {
      await resetPassword({ token, id, password: form.password })
      setSuccess(true)
      setTimeout(() => navigate("/sign-in"), 2000)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <>
      <p className="auth-welcome">Welcome</p>
      <h1 className="auth-title-v2">Reset Password</h1>

      {!token || !id ? (
        <div className="auth-banner auth-banner--error" role="alert">
          This reset link is invalid or incomplete. Please request a new one.
        </div>
      ) : success ? (
        <div className="auth-banner auth-banner--success" role="status">
          Password updated! Redirecting to log in…
        </div>
      ) : (
        <>
          {serverError ? (
            <div className="auth-banner auth-banner--error" role="alert">{serverError}</div>
          ) : null}
          <form onSubmit={handleSubmit} className="auth-form-v2" noValidate>
            <TextField
              variant="underline" label="New Password" name="password" type="password"
              placeholder="Enter password" value={form.password}
              onChange={update} error={fieldErrors.password}
            />
            <TextField
              variant="underline" label="Confirm Password" name="confirmPassword" type="password"
              placeholder="Enter password" value={form.confirmPassword}
              onChange={update} error={fieldErrors.confirmPassword}
            />
            <div className="auth-form__action">
              <PrimaryButton variant="flat" type="submit" loading={loading}>Reset Password</PrimaryButton>
            </div>
          </form>
        </>
      )}

      <p className="auth-footer-v2">
        <Link to="/sign-in" className="auth-link-v2 auth-link-v2--strong">Back to Log In</Link>
      </p>
    </>
  )

  if (isDesktop) {
    return (
      <div className="auth-desktop-center">
        <div className="auth-desktop-card">
          {formContent}
        </div>
      </div>
    )
  }

  return (
    <PhoneFrame>
      <div className="auth-body auth-body--v2">
        {formContent}
      </div>
    </PhoneFrame>
  )
}
