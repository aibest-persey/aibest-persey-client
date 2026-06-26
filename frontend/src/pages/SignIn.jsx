import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import GoogleButton from "../components/GoogleButton.jsx"
import OrDivider from "../components/OrDivider.jsx"
import { loginUser } from "../services/authService.js"
import { validateSignIn } from "../utils/validation.js"
import { saveSession } from "../utils/tokenStorage.js"

export default function SignIn() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ identifier: "", password: "" })
  const [remember, setRemember] = useState(true)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)

  const update = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    if (serverError) setServerError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")

    const errors = validateSignIn(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      const { token, user } = await loginUser({
        identifier: form.identifier.trim(),
        password: form.password,
      })

      saveSession(token, user, remember)
      navigate("/home", { replace: true })
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PhoneFrame>
      <div className="auth-body auth-body--signin">
        <h1 className="auth-title">Sign in</h1>

        {serverError ? (
          <div className="auth-banner auth-banner--error" role="alert">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="auth-form auth-form--signin" noValidate>
          <TextField
            icon={Mail}
            name="identifier"
            type="text"
            placeholder="Email or username"
            value={form.identifier}
            onChange={update}
            error={fieldErrors.identifier}
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

          <div className="auth-row">
            <button
              type="button"
              onClick={() => setRemember((r) => !r)}
              className="auth-inline-btn"
            >
              <span className={`toggle ${remember ? "toggle--on" : ""}`}>
                <span className="toggle__knob" />
              </span>
              <span>Remember Me</span>
            </button>
            <button type="button" className="auth-inline-btn">
              Forgot Password?
            </button>
          </div>

          <div className="auth-form__action">
            <PrimaryButton type="submit" loading={loading}>
              Sign in
            </PrimaryButton>
          </div>
        </form>

        <div className="auth-section">
          <OrDivider />
        </div>

        <div className="auth-section">
          <GoogleButton label="Login with Google" />
        </div>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </PhoneFrame>
  )
}
