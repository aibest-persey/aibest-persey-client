import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import { forgotPassword } from "../services/authService.js"
import { validateForgotPassword } from "../utils/validation.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"

export default function ForgotPassword() {
  const isDesktop = useIsDesktop()

  const [email, setEmail] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const update = (e) => {
    setEmail(e.target.value)
    if (fieldErrors.email) setFieldErrors({})
    if (serverError) setServerError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")
    const errors = validateForgotPassword({ email })
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setLoading(true)
    try {
      await forgotPassword({ email: email.trim() })
      setSent(true)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <>
      <p className="auth-welcome">Welcome</p>
      <h1 className="auth-title-v2">Forgot Password</h1>

      {sent ? (
        <div className="auth-banner auth-banner--success" role="status">
          If that email exists, a reset link is on its way — check your inbox.
        </div>
      ) : (
        <>
          <p className="auth-subtext">Enter your email and we&apos;ll send you a link to reset your password.</p>
          {serverError ? (
            <div className="auth-banner auth-banner--error" role="alert">{serverError}</div>
          ) : null}
          <form onSubmit={handleSubmit} className="auth-form-v2" noValidate>
            <TextField
              variant="underline" label="Email" name="email" type="email"
              placeholder="example@codingamerica.uea" value={email}
              onChange={update} error={fieldErrors.email}
            />
            <div className="auth-form__action">
              <PrimaryButton variant="flat" type="submit" loading={loading}>Send reset link</PrimaryButton>
            </div>
          </form>
        </>
      )}

      <p className="auth-footer-v2">
        Remembered it?{" "}
        <Link to="/sign-in" className="auth-link-v2 auth-link-v2--strong">Log In</Link>
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
        <Link to="/sign-in" aria-label="Go back" className="auth-back">
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        {formContent}
      </div>
    </PhoneFrame>
  )
}
