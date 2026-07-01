import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import OAuthButtons from "../components/OAuthButtons.jsx"
import OrDivider from "../components/OrDivider.jsx"
import { registerUser } from "../services/authService.js"
import { validateSignUp } from "../utils/validation.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"

// The mockup has no username field — derive one from name + surname so the
// backend's unique-username requirement stays invisible to the user.
function generateUsername(firstName, lastName) {
  const base = `${firstName}${lastName}`.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 14) || "user"
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${base}${suffix}`
}

export default function SignUp() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const [form, setForm] = useState({
    firstName: "", lastName: "",
    email: "", password: "", confirmPassword: "",
  })
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
    const errors = validateSignUp(form)
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setLoading(true)
    try {
      await registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: generateUsername(form.firstName.trim(), form.lastName.trim()),
        email: form.email.trim(),
        password: form.password,
      })
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
      <h1 className="auth-title-v2">Sign Up</h1>

      {success ? (
        <div className="auth-banner auth-banner--success" role="status">
          Account created! Redirecting to log in…
        </div>
      ) : null}
      {serverError ? (
        <div className="auth-banner auth-banner--error" role="alert">{serverError}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="auth-form-v2" noValidate>
        <div className="auth-name-row">
          <TextField
            variant="underline" label="Name" name="firstName"
            placeholder="Your Name" value={form.firstName}
            onChange={update} error={fieldErrors.firstName}
          />
          <TextField
            variant="underline" label="Surname" name="lastName"
            placeholder="Your Surname" value={form.lastName}
            onChange={update} error={fieldErrors.lastName}
          />
        </div>
        <TextField
          variant="underline" label="Email" name="email" type="email"
          placeholder="example@codingamerica.uea" value={form.email}
          onChange={update} error={fieldErrors.email}
        />
        <TextField
          variant="underline" label="Password" name="password" type="password"
          placeholder="Enter password" value={form.password}
          onChange={update} error={fieldErrors.password}
        />
        <TextField
          variant="underline" label="Confirm Password" name="confirmPassword" type="password"
          placeholder="Enter password" value={form.confirmPassword}
          onChange={update} error={fieldErrors.confirmPassword}
        />
        <div className="auth-form__action">
          <PrimaryButton variant="flat" type="submit" loading={loading}>Sign Up</PrimaryButton>
        </div>
      </form>

      <div className="auth-section"><OrDivider /></div>
      <OAuthButtons />
      <p className="auth-footer-v2">
        Already have an account?{" "}
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
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="auth-back">
          <ArrowLeft size={24} strokeWidth={2} />
        </button>
        {formContent}
      </div>
    </PhoneFrame>
  )
}
