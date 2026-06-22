import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import GoogleButton from "../components/GoogleButton.jsx"
import OrDivider from "../components/OrDivider.jsx"

export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [remember, setRemember] = useState(true)

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Auth wiring comes later
    console.log("[v0] sign in", form, { remember })
  }

  return (
    <PhoneFrame>
      <div className="auth-body auth-body--signin">
        <h1 className="auth-title">Sign in</h1>

        <form onSubmit={handleSubmit} className="auth-form auth-form--signin">
          <TextField
            icon={Mail}
            name="email"
            type="email"
            placeholder="abc@email.com"
            value={form.email}
            onChange={update}
          />
          <TextField
            icon={Lock}
            name="password"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={update}
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
            <PrimaryButton type="submit">Sign in</PrimaryButton>
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
