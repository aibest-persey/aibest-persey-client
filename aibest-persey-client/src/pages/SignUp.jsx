import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, ArrowLeft } from "lucide-react"
import PhoneFrame from "../components/PhoneFrame.jsx"
import TextField from "../components/TextField.jsx"
import PrimaryButton from "../components/PrimaryButton.jsx"
import GoogleButton from "../components/GoogleButton.jsx"
import OrDivider from "../components/OrDivider.jsx"

export default function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Auth wiring comes later
    console.log("[v0] sign up", form)
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

        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            icon={User}
            name="firstName"
            placeholder="First name"
            value={form.firstName}
            onChange={update}
          />
          <TextField
            icon={User}
            name="lastName"
            placeholder="Last name"
            value={form.lastName}
            onChange={update}
          />
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
          <TextField
            icon={Lock}
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={update}
          />

          <div className="auth-form__action">
            <PrimaryButton type="submit">Sign up</PrimaryButton>
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
