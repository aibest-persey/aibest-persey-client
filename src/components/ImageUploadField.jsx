import { useRef, useState } from "react"
import { Camera, Loader2, X } from "lucide-react"
import { useAuth } from "../hooks/useAuth.js"
import { uploadImage, resolveImageUrl } from "../services/uploadService.js"
import "./ImageUploadField.css"

/**
 * A click-to-upload image field. Uploads immediately on file selection and
 * reports the resulting server URL back via onChange — the parent just holds
 * the URL string, it never touches the File object itself.
 *
 * @param {{ value: string|null, onChange: (url: string|null) => void, shape?: "circle"|"banner", label?: string }} props
 */
export default function ImageUploadField({ value, onChange, shape = "banner", label }) {
  const { token } = useAuth()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const { url } = await uploadImage(token, file)
      onChange(url)
    } catch (err) {
      setError(err.message ?? "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const previewUrl = resolveImageUrl(value)

  return (
    <div className={`img-upload img-upload--${shape}`}>
      <button
        type="button"
        className="img-upload-preview"
        style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
        onClick={() => inputRef.current?.click()}
        aria-label={label ?? "Upload image"}
      >
        {uploading ? (
          <Loader2 size={20} className="img-upload-spinner" />
        ) : !previewUrl ? (
          <Camera size={20} />
        ) : null}
      </button>
      {value && !uploading && (
        <button type="button" className="img-upload-remove" aria-label="Remove image" onClick={() => onChange(null)}>
          <X size={12} />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {label && <span className="img-upload-label">{label}</span>}
      {error && <span className="img-upload-error">{error}</span>}
    </div>
  )
}
