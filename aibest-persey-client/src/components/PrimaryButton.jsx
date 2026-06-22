import { ArrowRight } from "lucide-react"

export default function PrimaryButton({ children, onClick, type = "button" }) {
  return (
    <button type={type} onClick={onClick} className="btn-primary">
      <span>{children}</span>
      <span className="btn-primary__arrow">
        <ArrowRight size={20} strokeWidth={2.5} />
      </span>
    </button>
  )
}
