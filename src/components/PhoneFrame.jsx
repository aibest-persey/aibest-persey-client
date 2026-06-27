import "../../auth.css"
import { useIsDesktop } from "../hooks/useIsDesktop.js"

export default function PhoneFrame({ children }) {
  const isDesktop = useIsDesktop()
  if (isDesktop) return <>{children}</>
  return (
    <div className="auth-screen">
      <div className="auth-phone">
        <div className="auth-phone__scroll">{children}</div>
      </div>
    </div>
  )
}
