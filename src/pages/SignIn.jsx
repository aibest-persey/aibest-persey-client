import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import OAuthButtons from "../components/OAuthButtons.jsx"
import OrDivider from "../components/OrDivider.jsx"
import { loginUser } from "../services/authService.js"
import { validateSignIn } from "../utils/validation.js"
import { useAuth } from "../hooks/useAuth.js"
import { useIsDesktop } from "../hooks/useIsDesktop.js"

export default function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const isDesktop = useIsDesktop()

  const [form, setForm] = useState({ identifier: "", password: "" })
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
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setLoading(true)
    try {
      const { token, user } = await loginUser({
        identifier: form.identifier.trim(),
        password: form.password,
      })
      login(token, user, true)
      const targetPath = user.role === "admin" ? "/admin" : "/home"
      navigate(targetPath, { replace: true })
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <>
      <p className="auth-welcome">Welcome</p>
      <h1 className="auth-title-v2">Log In</h1>

      {serverError ? (
        <div className="auth-banner auth-banner--error" role="alert">{serverError}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="auth-form-v2" noValidate>
        <TextField
          variant="underline" label="Email"
          name="identifier" type="text"
          placeholder="example@codingamerica.uea" value={form.identifier}
          onChange={update} error={fieldErrors.identifier}
        />
        <div>
          <TextField
            variant="underline" label="Password"
            name="password" type="password"
            placeholder="Enter password" value={form.password}
            onChange={update} error={fieldErrors.password}
          />
          <div className="auth-row-v2">
            <Link to="/forgot-password" className="auth-link-v2">Forgot password?</Link>
          </div>
        </div>
        <div className="auth-form__action">
          <PrimaryButton variant="flat" type="submit" loading={loading}>Log In</PrimaryButton>
        </div>
      </form>

      <div className="auth-section"><OrDivider /></div>
      <OAuthButtons />
      <p className="auth-footer-v2">
        Need to create an account?{" "}
        <Link to="/sign-up" className="auth-link-v2 auth-link-v2--strong">Sign Up</Link>
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
