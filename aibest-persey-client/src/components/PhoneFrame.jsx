import "../../auth.css"

export default function PhoneFrame({ children }) {
  return (
    <div className="auth-screen">
      <div className="auth-phone">
        <div className="auth-phone__scroll">{children}</div>
      </div>
    </div>
  )
}
