import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, AtSign, ArrowLeft } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import GoogleButton from "../components/GoogleButton.jsx"
import OrDivider from "../components/OrDivider.jsx"
import { registerUser } from "../services/authService.js"
import { validateSignUp } from "../utils/validation.js"

export default function SignUp() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    // Clear the per-field error as the user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }
    if (serverError) setServerError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")

    const errors = validateSignUp(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      await registerUser({
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        username: form.username.trim(),
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

  return (
    <PhoneFrame>
      <div className="auth-body auth-body--signup">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="auth-back"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </button>

        <h1 className="auth-title">Sign up</h1>

        {success ? (
          <div className="auth-banner auth-banner--success" role="status">
            🎉 Account created! Redirecting to sign in…
          </div>
        ) : null}

        {serverError ? (
          <div className="auth-banner auth-banner--error" role="alert">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <TextField
            icon={User}
            name="firstName"
            placeholder="First name (optional)"
            value={form.firstName}
            onChange={update}
            error={fieldErrors.firstName}
          />
          <TextField
            icon={User}
            name="lastName"
            placeholder="Last name (optional)"
            value={form.lastName}
            onChange={update}
            error={fieldErrors.lastName}
          />
          <TextField
            icon={AtSign}
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={update}
            error={fieldErrors.username}
          />
          <TextField
            icon={Mail}
            name="email"
            type="email"
            placeholder="abc@email.com"
            value={form.email}
            onChange={update}
            error={fieldErrors.email}
          />
          <TextField
            icon={Lock}
            name="password"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={update}
            error={fieldErrors.password}
          />
          <TextField
            icon={Lock}
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={update}
            error={fieldErrors.confirmPassword}
          />

          <div className="auth-form__action">
            <PrimaryButton type="submit" loading={loading}>
              Sign up
            </PrimaryButton>
          </div>
        </form>

        <div className="auth-section--tight">
          <OrDivider />
        </div>

        <div className="auth-section--tight">
          <GoogleButton label="Login with Google" />
        </div>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/sign-in" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </PhoneFrame>
  )
}
