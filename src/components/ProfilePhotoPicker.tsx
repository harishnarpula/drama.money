import { useRef, useState } from 'react'
import { useAuth } from '../auth/auth-context'
import { CameraIcon } from './Icons'

const photoTypes = ['image/jpeg', 'image/png', 'image/webp']

export default function ProfilePhotoPicker() {
  const { profile, uploadProfilePhoto } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [failedUrl, setFailedUrl] = useState<string>()
  const photoUrl = profile.photoUrl !== failedUrl ? profile.photoUrl : undefined
  const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('') || 'DM'

  async function upload(file: File) {
    if (uploading) return
    setSuccess('')
    if (!photoTypes.includes(file.type) || file.size === 0 || file.size > 2_000_000) {
      setError('Choose a JPG, PNG or WebP image up to 2 MB.')
      return
    }
    setError('')
    setUploading(true)
    try {
      await uploadProfilePhoto(file)
      setFailedUrl(undefined)
      setSuccess('Profile photo updated.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not upload the profile photo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex max-w-48 shrink-0 flex-col items-center gap-2 text-center">
      <button type="button" aria-label="Upload profile photo" disabled={uploading} className="group relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#24372C] disabled:cursor-wait" onClick={() => inputRef.current?.click()}>
        <span className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-linear-to-br from-[#6F836F] to-[#24372C] text-2xl font-bold text-white shadow-md ring-1 ring-[#D8D2C8] sm:size-28">
          {photoUrl ? <img src={photoUrl} alt="" className="size-full object-cover" onError={() => setFailedUrl(photoUrl)} /> : initials}
        </span>
        <span aria-hidden="true" className="absolute -right-1 bottom-0 grid size-10 place-items-center rounded-full bg-[#24372C] text-white ring-2 ring-white group-hover:bg-[#355642]">
          {uploading ? <span className="size-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin" /> : <CameraIcon className="size-5" />}
        </span>
      </button>
      <input ref={inputRef} hidden type="file" accept={photoTypes.join(',')} disabled={uploading} onChange={(event) => {
        const file = event.currentTarget.files?.[0]
        event.currentTarget.value = ''
        if (file) void upload(file)
      }} />
      {error && <p role="alert" className="text-xs font-medium text-[#842B24] [overflow-wrap:anywhere]">{error}</p>}
      <div role="status" className="text-xs font-medium text-[#355642] empty:hidden">{uploading ? 'Uploading photo…' : success}</div>
    </div>
  )
}
