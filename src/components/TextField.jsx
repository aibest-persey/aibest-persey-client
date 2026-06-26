import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export default function TextField({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) {
  const isPassword = type === "password"
  const [show, setShow] = useState(false)
  const inputType = isPassword ? (show ? "text" : "password") : type

  return (
    <label className="field">
      {Icon ? <Icon className="field__icon" size={20} strokeWidth={2} /> : null}
      <input
        name={name}
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="field__input"
      />
      {isPassword ? (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="field__toggle"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      ) : null}
    </label>
  )
}
