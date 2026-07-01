import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export default function TextField({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  error,
  label,
  variant = "boxed",
  disabled = false,
}) {
  const isPassword = type === "password"
  const [show, setShow] = useState(false)
  const inputType = isPassword ? (show ? "text" : "password") : type

  if (variant === "underline") {
    return (
      <div className="field-v2-wrapper">
        {label ? <label className="field-v2-label" htmlFor={name}>{label}</label> : null}
        <div className={`field-v2${error ? " field-v2--error" : ""}${disabled ? " field-v2--disabled" : ""}`}>
          <input
            id={name}
            name={name}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="field-v2__input"
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${name}-error` : undefined}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="field-v2__toggle"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : null}
        </div>
        {error ? (
          <span id={`${name}-error`} className="field-v2__error" role="alert">
            {error}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div className="field-wrapper">
      <label className={`field${error ? " field--error" : ""}`}>
        {Icon ? <Icon className="field__icon" size={20} strokeWidth={2} /> : null}
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="field__input"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
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
      {error ? (
        <span id={`${name}-error`} className="field__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
