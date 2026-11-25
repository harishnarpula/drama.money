import { useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { CameraIcon, CloseIcon, FilmReelIcon, PlayIcon, PlusIcon } from '../components/Icons'
import { api } from '../services/api'
import type { MediaUpload, UploadMediaType } from '../services/api'

// Brand palette: cream #E6E0D5, forest green #24372C
const imageAccept = '.jpg,.jpeg,.png,image/jpeg,image/png'
const maxImageBytes = 10_000_000
const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]
const jpegSignature = [255, 216, 255]
const tiltBase = 'perspective(1400px) rotateX(0deg) rotateY(0deg)'

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24372C]'
const btn3d =
  'bg-[#24372C] text-[#E6E0D5] transition enabled:hover:-translate-y-0.5 enabled:hover:brightness-110 enabled:active:translate-y-1.5 enabled:active:shadow-[0_0_0_rgba(36,55,44,.45)] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none'
const fieldClass =
  'w-full min-w-0 rounded-xl border border-[#24372C]/15 bg-[#E6E0D5]/30 px-3.5 py-3 text-sm font-normal text-[#24372C] shadow-[inset_0_1px_3px_rgba(36,55,44,.08)] placeholder:text-[#24372C]/50 transition focus:border-[#24372C] focus:outline-none focus:ring-2 focus:ring-[#24372C]/30 disabled:opacity-50 motion-reduce:transition-none'
const errorBox = 'rounded-xl border border-l-4 border-[#24372C]/40 border-l-[#24372C] bg-[#24372C]/10 px-3 py-2.5 text-[13px] text-[#24372C]'

async function validateImage(file: File) {
  if (file.size > maxImageBytes) throw new Error('Each image must be 10 MB or smaller.')

  const extension = /\.([^.]+)$/.exec(file.name)?.[1].toLowerCase()
  const isPng = extension === 'png'
  const isJpeg = extension === 'jpg' || extension === 'jpeg'
  const mimeType = isPng ? 'image/png' : 'image/jpeg'
  const signature = isPng ? pngSignature : jpegSignature
  const formatError = 'Choose a JPEG (.jpg, .jpeg) or PNG (.png) image.'

  if ((!isPng && !isJpeg) || (file.type && file.type !== mimeType)) throw new Error(formatError)
  const header = new Uint8Array(await file.slice(0, signature.length).arrayBuffer())
  if (!signature.every((byte, index) => header[index] === byte)) throw new Error(formatError)

  return file.type ? file : new File([file], file.name, { type: mimeType, lastModified: file.lastModified })
}

/** Flips to true right after mount so CSS transitions can play from the "before" state. */
function useEntered() {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return entered
}

function PreviewTile({ image, index, busy, onRemove }: { image: MediaUpload; index: number; busy: boolean; onRemove: () => void }) {
  const entered = useEntered()
  return (
    <li
      className={`group relative aspect-square min-w-0 transition-all duration-700 ease-[cubic-bezier(.2,.9,.25,1.2)] motion-reduce:transition-none ${
        entered
          ? 'opacity-100 [transform:perspective(700px)_rotateY(0deg)_scale(1)]'
          : 'opacity-0 [transform:perspective(700px)_rotateY(-75deg)_scale(.55)]'
      }`}
    >
      <div className="h-full w-full overflow-hidden rounded-xl bg-[#24372C] shadow-[0_8px_18px_-10px_rgba(36,55,44,.22)] ring-1 ring-[#24372C]/10 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04] group-hover:shadow-[0_16px_26px_-12px_rgba(36,55,44,.5)] motion-reduce:transition-none">
        <img className="block h-full w-full object-cover transition duration-500 group-hover:scale-110 motion-reduce:transition-none" src={image.presignedUrl} alt={image.fileName} />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-[#E6E0D5]/25 to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
      </div>
      <button
        className={`absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#24372C] text-lg leading-none text-[#E6E0D5] shadow-md ring-1 ring-[#E6E0D5]/40 transition enabled:hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${focusRing}`}
        type="button"
        aria-label={`Remove image ${index + 1}: ${image.fileName}`}
        disabled={busy}
        onClick={onRemove}
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  )
}

function ImagePostForm() {
  const { user } = useAuth()
  const fileInput = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<MediaUpload[]>([])
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [publishError, setPublishError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const busy = isUploading || isPublishing
  const entered = useEntered()
  const formRef = useRef<HTMLFormElement>(null)

  function tiltMove(event: ReactMouseEvent<HTMLElement>) {
    const el = formRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(1400px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`
  }

  function tiltReset() {
    if (formRef.current) formRef.current.style.transform = tiltBase
  }

  async function uploadImages(files: File[]) {
    if (!files.length || busy) return
    if (!user?.id) {
      setUploadErrors(['Sign in to upload images.'])
      return
    }

    setUploadErrors([])
    setPublishError('')
    setSuccess('')
    setIsUploading(true)
    const userId = user.id
    try {
      const results = await Promise.allSettled(files.map(async (file) => {
        const image = await validateImage(file)
        return api.media.upload(image, 'POST_IMAGE', userId)
      }))
      const uploaded: MediaUpload[] = []
      const errors: string[] = []
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          uploaded.push(result.value)
        } else {
          const message = result.reason instanceof Error ? result.reason.message : 'Upload failed.'
          errors.push(`${files[index].name}: ${message}`)
        }
      })
      setImages((current) => [...current, ...uploaded])
      setUploadErrors(errors)
    } finally {
      setIsUploading(false)
    }
  }

  async function publishPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedCaption = caption.trim()
    if (busy || !images.length || !user?.id || !trimmedCaption) return

    setPublishError('')
    setIsPublishing(true)
    try {
      const post = await api.posts.create({
        caption: trimmedCaption,
        hashtags: hashtags.trim() || undefined,
        images: images.map(({ id, documentUrl }) => ({ documentId: id, documentUrl })),
      })
      setImages([])
      setCaption('')
      setHashtags('')
      setUploadErrors([])
      setSuccess(post.postStatus === 'PENDING' ? 'Post submitted for review.' : 'Post submitted.')
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Could not publish the post. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  const hasImages = images.length > 0
  const card = 'absolute h-24 w-[4.25rem] rounded-2xl shadow-[0_10px_18px_-12px_rgba(36,55,44,.3)] ring-1 ring-[#24372C]/15 transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1.2)] motion-reduce:transition-none'

  return (
    <div
      className={`transition-all duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${
        entered
          ? 'opacity-100 [transform:perspective(1400px)_rotateX(0deg)_translateY(0)_scale(1)]'
          : 'opacity-0 [transform:perspective(1400px)_rotateX(20deg)_translateY(60px)_scale(.94)]'
      }`}
      onMouseMove={tiltMove}
      onMouseLeave={tiltReset}
    >
      <form
        ref={formRef}
        style={{ transform: tiltBase }}
        className="grid overflow-hidden rounded-3xl border border-[#24372C]/10 bg-[#FAF8F3] shadow-[0_20px_40px_-26px_rgba(36,55,44,.28),0_2px_0_rgba(255,255,255,.6)_inset] transition-transform duration-200 ease-out will-change-transform md:min-h-[470px] md:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)] motion-reduce:transition-none"
        onSubmit={publishPost}
      >
        <section className="flex min-w-0 flex-col bg-linear-to-br from-[#304A3D] to-[#172B21]" aria-label="Post images">
          <div
            className={`flex min-h-[300px] flex-1 flex-col transition-colors duration-300 md:min-h-[380px] ${isDragging ? 'bg-white/10' : ''}`}
            onDragOver={(event) => {
              if (event.dataTransfer.types.includes('Files')) {
                event.preventDefault()
                setIsDragging(true)
              }
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false)
            }}
            onDrop={(event) => {
              setIsDragging(false)
              if (!event.dataTransfer.types.includes('Files')) return
              event.preventDefault()
              void uploadImages(Array.from(event.dataTransfer.files))
            }}
          >
            {hasImages && (
              <ul className="m-0 grid max-h-[420px] flex-1 list-none grid-cols-[repeat(auto-fill,minmax(130px,1fr))] content-start gap-3 overflow-y-auto p-4" aria-label="Uploaded images">
                {images.map((image, index) => (
                  <PreviewTile
                    key={`${image.id}-${index}`}
                    image={image}
                    index={index}
                    busy={busy}
                    onRemove={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                  />
                ))}
              </ul>
            )}

            <div
              className={
                hasImages
                  ? 'flex flex-wrap items-center justify-between gap-3 border-t border-white/15 bg-white/5 px-4 py-3'
                  : 'flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center'
              }
            >
              {!hasImages && (
                <>
                  <div className="relative grid h-36 w-52 place-items-center" aria-hidden="true">
                    <span className={`${card} bg-white/15 ${isDragging ? '[transform:perspective(500px)_translateX(-84px)_rotateY(-38deg)_rotateZ(-14deg)_scale(1.05)]' : '[transform:perspective(500px)_translateX(-48px)_rotateY(-30deg)_rotateZ(-9deg)]'}`} />
                    <span className={`${card} bg-white/15 ${isDragging ? '[transform:perspective(500px)_translateX(84px)_rotateY(38deg)_rotateZ(14deg)_scale(1.05)]' : '[transform:perspective(500px)_translateX(48px)_rotateY(30deg)_rotateZ(9deg)]'}`} />
                    <span className="relative z-10 grid h-20 w-20 place-items-center">
                      <span className="absolute inset-0 animate-[spin_5s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#24372C,#E6E0D5,#24372C,#E6E0D5,#24372C)] motion-reduce:animate-none" />
                      <span className={`absolute inset-[3px] rounded-full bg-[#E6E0D5] transition-transform duration-500 ${isDragging ? 'scale-110' : ''}`} />
                      <span className="relative text-[#24372C] [&_svg]:h-8 [&_svg]:w-8">
                        <CameraIcon />
                      </span>
                    </span>
                  </div>
                  <p className="m-0 text-lg font-medium text-[#F8F6EF]">{isDragging ? 'Release to add your photos' : 'Drag and drop your photos here'}</p>
                </>
              )}
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#E6E0D5] px-5 py-2.5 text-sm font-semibold text-[#24372C] shadow-sm enabled:hover:bg-[#F8F6EF] focus-visible:outline-white disabled:opacity-50 [&_svg]:size-4"
                type="button"
                disabled={busy}
                onClick={() => fileInput.current?.click()}
              >
                <PlusIcon />
                {isUploading ? 'Uploading…' : hasImages ? 'Add more images' : 'Select from device'}
              </button>
              <small className="text-sm text-[#C6D6CC]">JPEG or PNG · Up to 10 MB each</small>
            </div>

            <input ref={fileInput} hidden type="file" accept={imageAccept} multiple disabled={busy} onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? [])
              event.currentTarget.value = ''
              void uploadImages(files)
            }} />
          </div>

          {uploadErrors.length > 0 && (
            <div className="m-3 rounded-xl bg-[#FAE9E5] px-3 py-2.5 text-sm text-[#842B24]" role="alert">
              <p className="m-0 font-semibold">Some images couldn’t be added.</p>
              <ul className="mb-0 mt-1.5 list-disc break-words pl-[18px]">{uploadErrors.map((error, index) => <li key={index}>{error}</li>)}</ul>
            </div>
          )}
        </section>

        <section className="flex min-w-0 flex-col gap-4 p-5 sm:p-6" aria-label="Post details">
          <label className="flex flex-col gap-1.5 text-base font-bold text-[#24372C]">
            Caption (required)
            <textarea className={`${fieldClass} min-h-40 resize-y`} placeholder="Write a caption…" required value={caption} disabled={isPublishing} onChange={(event) => setCaption(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-base font-bold text-[#24372C]">
            Hashtags
            <input className={fieldClass} placeholder="#skills #careers" value={hashtags} disabled={isPublishing} onChange={(event) => setHashtags(event.target.value)} />
          </label>
          {publishError && <p className={`m-0 ${errorBox}`} role="alert">{publishError}</p>}
          <div role="status" className="min-h-5 text-[13px] font-medium text-[#24372C]">
            {isUploading && 'Uploading images…'}
            {isPublishing && 'Publishing post…'}
            {success}
          </div>
          <button
            className={`mt-auto w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_6px_0_rgba(36,55,44,.45),0_16px_26px_rgba(36,55,44,.22)] ${btn3d} ${focusRing}`}
            type="submit"
            disabled={busy || !images.length || !caption.trim()}
          >
            {isPublishing ? 'Publishing…' : 'Publish post'}
          </button>
        </section>
      </form>
    </div>
  )
}

const maxReelBytes = 30_000_000

function validateReelVideo(file: File) {
  if (file.size > maxReelBytes) throw new Error('The video must be 30 MB or smaller.')
  const mimeType = /\.mp4$/i.test(file.name) ? 'video/mp4' : /\.mov$/i.test(file.name) ? 'video/quicktime' : null
  if (!file.size || !mimeType || (file.type && file.type !== mimeType)) throw new Error('Choose an MP4 or MOV video.')
  return file.type ? file : new File([file], file.name, { type: mimeType, lastModified: file.lastModified })
}

function getReelLocation(): Promise<GeolocationCoordinates> {
  if (!window.isSecureContext || !navigator.geolocation) {
    return Promise.reject(new Error('Location is unavailable. Open this page over HTTPS in a browser that supports location.'))
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(({ coords }) => resolve(coords), (error) => {
      reject(new Error(error.code === error.PERMISSION_DENIED
        ? 'Allow location for this site in your browser settings, then try again.'
        : 'Could not get your location. Check that location services are on, then try again.'))
    }, { timeout: 15_000 })
  })
}

type ReelFile = { file: File; preview: string }
type ReelMediaType = Extract<UploadMediaType, 'REEL_VIDEO' | 'REEL_COVER'>

function ReelUploadAnimation() {
  return (
    <span aria-hidden="true" className="relative grid h-36 w-52 max-w-full place-items-center sm:h-44 sm:w-60">
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,#A5CBBF38,transparent_68%)] motion-safe:animate-pulse motion-safe:[animation-duration:4s]" />
      <span className="absolute size-32 rounded-full border border-dashed border-[#B8D5C8]/35 motion-safe:animate-spin motion-safe:[animation-duration:24s] sm:size-36">
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C4DFD1]" />
        <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#E6E0D5]/80" />
      </span>
      <span className="absolute left-[13%] grid h-20 w-14 -rotate-18 place-items-center rounded-xl border border-white/20 bg-[#527265]/60 text-[#D5E4DB] shadow-lg transition-transform group-hover:-translate-x-2 motion-reduce:transform-none"><FilmReelIcon className="size-6" /></span>
      <span className="absolute right-[13%] grid h-20 w-14 rotate-18 place-items-center rounded-xl border border-white/20 bg-[#527265]/60 text-[#D5E4DB] shadow-lg transition-transform group-hover:translate-x-2 motion-reduce:transform-none"><CameraIcon className="size-6" /></span>
      <span className="relative grid size-20 place-items-center rounded-2xl border border-white/65 bg-linear-to-br from-[#FFF9EA] to-[#C7DCD0] text-[#24372C] shadow-[0_12px_28px_#08140D80] motion-safe:animate-bounce motion-safe:[animation-duration:3.5s]">
        <PlayIcon className="size-8" />
      </span>
    </span>
  )
}

function ReelUploadForm() {
  const { user } = useAuth()
  const videoInput = useRef<HTMLInputElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const [video, setVideo] = useState<ReelFile | null>(null)
  const [cover, setCover] = useState<ReelFile | null>(null)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [stage, setStage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checkingCover, setCheckingCover] = useState(false)
  const uploaded = useRef<Partial<Record<ReelMediaType, { file: File; url: string }>>>({})
  const editButton = `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${focusRing}`

  const videoPreview = video?.preview
  const coverPreview = cover?.preview
  useEffect(() => () => { if (videoPreview) URL.revokeObjectURL(videoPreview) }, [videoPreview])
  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview) }, [coverPreview])

  function selectVideo(file: File) {
    setError('')
    try {
      const valid = validateReelVideo(file)
      setVideo({ file: valid, preview: URL.createObjectURL(valid) })
      setSuccess('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not select the video.')
    }
  }

  async function selectCover(file: File) {
    setError('')
    setCheckingCover(true)
    try {
      const valid = await validateImage(file)
      setCover({ file: valid, preview: URL.createObjectURL(valid) })
      setSuccess('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not select the thumbnail.')
    } finally {
      setCheckingCover(false)
    }
  }

  async function upload(file: File, type: ReelMediaType, userId: string) {
    const existing = uploaded.current[type]
    if (existing?.file === file) return existing.url
    const { documentUrl } = await api.media.upload(file, type, userId)
    uploaded.current[type] = { file, url: documentUrl }
    return documentUrl
  }

  async function publishReel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user?.id || !video || !caption.trim() || stage || checkingCover) return
    setError('')
    setSuccess('')
    setStage('Getting your location…')
    try {
      const { latitude, longitude } = await getReelLocation()
      setStage('Uploading video…')
      const videoUrl = await upload(video.file, 'REEL_VIDEO', user.id)
      let coverUrl: string | undefined
      if (cover) {
        setStage('Uploading thumbnail…')
        coverUrl = await upload(cover.file, 'REEL_COVER', user.id)
      }
      setStage('Submitting reel…')
      const reel = await api.reels.create({ caption: caption.trim(), hashtags: hashtags.trim() || undefined, latitude, longitude, videoUrl, coverUrl })
      uploaded.current = {}
      setVideo(null)
      setCover(null)
      setCaption('')
      setHashtags('')
      setSuccess(reel.reelStatus === 'PENDING' ? 'Reel submitted for review.' : 'Reel submitted.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not submit the reel. Please try again.')
    } finally {
      setStage('')
    }
  }

  return (
    <form onSubmit={publishReel} className="overflow-hidden rounded-3xl border border-[#24372C]/10 bg-[#FAF8F3] shadow-[0_22px_50px_-30px_rgba(36,55,44,.4)]">
      <fieldset disabled={!!stage} className="grid min-w-0 md:min-h-[34rem] md:grid-cols-[minmax(0,1.25fr)_minmax(290px,1fr)] lg:min-h-[36rem]">
        <section className="flex min-w-0 flex-col bg-linear-to-br from-[#304A3D] to-[#172B21] p-4 text-[#F8F6EF] sm:p-6" aria-labelledby="reel-preview-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="reel-preview-heading" className="flex items-center gap-2 text-lg font-bold"><FilmReelIcon className="size-5" /> Reel preview</h2>
            {video && <button className={`${editButton} bg-white/10 hover:bg-white/20`} type="button" onClick={() => videoInput.current?.click()}>Replace video</button>}
          </div>
          <input ref={videoInput} hidden type="file" accept=".mp4,.mov,video/mp4,video/quicktime" onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (file) selectVideo(file)
          }} />
          {video ? (
            <div className="overflow-hidden rounded-2xl bg-[#0E1C15] ring-1 ring-white/15">
              <video key={`${video.preview}:${coverPreview ?? ''}`} src={video.preview} poster={coverPreview} controls playsInline preload="metadata" aria-label="Reel video preview" className="block aspect-video max-h-[65dvh] w-full object-contain md:min-h-72" />
              <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
                <p className="min-w-0 truncate text-sm" title={video.file.name}>{video.file.name}</p>
                <button type="button" aria-label="Remove video" className={`${editButton} shrink-0 hover:bg-white/10`} onClick={() => { setVideo(null); setError('') }}><CloseIcon className="size-4" /></button>
              </div>
            </div>
          ) : (
            <button type="button" className="group flex min-h-68 w-full flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/30 bg-white/5 p-5 text-center transition hover:border-white/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F6EF] sm:min-h-76" onClick={() => videoInput.current?.click()}>
              <ReelUploadAnimation />
              <span className="text-base font-semibold">Choose a video</span>
              <span className="text-sm text-[#C6D6CC]">MP4 or MOV · Up to 30 MB</span>
            </button>
          )}
          {video && <p className="mt-3 text-xs text-[#C6D6CC]">{cover ? 'Your thumbnail appears before playback.' : 'Add a thumbnail to choose what viewers see before playback.'}</p>}
        </section>

        <section className="flex min-w-0 flex-col gap-4 p-4 sm:p-6 lg:gap-5" aria-label="Reel details">
          <input ref={coverInput} hidden type="file" accept={imageAccept} disabled={checkingCover} onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (file) void selectCover(file)
          }} />
          <div>
            <h2 className="mb-2 text-base font-bold">Thumbnail <span className="text-sm font-normal text-[#526157]">· Optional</span></h2>
            {cover ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#24372C]/15 bg-[#E6E0D5]/35 p-2">
                <img src={cover.preview} alt="Reel thumbnail preview" className="size-20 shrink-0 rounded-lg bg-[#24372C]/10 object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" title={cover.file.name}>{cover.file.name}</p>
                  <button type="button" disabled={checkingCover} className={`${editButton} -ml-3 hover:bg-[#24372C]/5`} onClick={() => coverInput.current?.click()}>{checkingCover ? 'Checking…' : 'Replace thumbnail'}</button>
                </div>
                <button type="button" disabled={checkingCover} aria-label="Remove thumbnail" className={`${editButton} shrink-0 hover:bg-[#24372C]/5`} onClick={() => { setCover(null); setError('') }}><CloseIcon className="size-4" /></button>
              </div>
            ) : (
              <button type="button" disabled={checkingCover} className={`flex w-full items-center gap-3 rounded-2xl border border-dashed border-[#24372C]/30 bg-[#E6E0D5]/35 p-3 text-left hover:bg-[#E6E0D5]/60 ${focusRing}`} onClick={() => coverInput.current?.click()}>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#24372C]/10"><CameraIcon className="size-5" /></span>
                <span><span className="block text-sm font-semibold">{checkingCover ? 'Checking thumbnail…' : 'Choose thumbnail'}</span><span className="block text-xs text-[#526157]">JPEG or PNG · Up to 10 MB</span></span>
              </button>
            )}
          </div>
          <label className="grid gap-1.5 text-base font-bold">Caption (required)<textarea placeholder="Write a caption…" className={`${fieldClass} min-h-32 resize-y md:min-h-40`} required rows={4} maxLength={2200} value={caption} onChange={(event) => setCaption(event.target.value)} /></label>
          <label className="grid gap-1.5 text-base font-bold">Hashtags<input placeholder="#skills #careers" className={fieldClass} maxLength={1000} value={hashtags} onChange={(event) => setHashtags(event.target.value)} /></label>
          <button className={`mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${btn3d} ${focusRing}`} type="submit" disabled={!video || !caption.trim() || !user?.id || checkingCover}>
            {stage && <span aria-hidden="true" className="size-4 rounded-full border-2 border-white/30 border-t-white motion-safe:animate-spin" />}
            {stage || 'Submit reel'}
          </button>
          {error && <p role="alert" className={errorBox}>{error}</p>}
          <div role="status" className="text-sm empty:hidden">
            {stage && <span className="sr-only">{stage}</span>}
            {success && <>{success} <Link className="font-semibold underline" to="/app/profile?tab=reels">View your reels</Link></>}
          </div>
        </section>
      </fieldset>
    </form>
  )
}

export default function UploadPage() {
  const [params] = useSearchParams()
  const { user } = useAuth()
  const videoSelected = params.get('type') === 'video'
  const tab = `inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#24372C]/65 no-underline transition duration-300 hover:text-[#24372C] aria-[current=page]:bg-[#24372C] aria-[current=page]:text-[#E6E0D5] aria-[current=page]:shadow-[0_4px_0_rgba(36,55,44,.45),0_10px_18px_rgba(36,55,44,.22)] motion-reduce:transition-none [&_svg]:h-[18px] [&_svg]:w-[18px] ${focusRing}`

  return (
    <div className="mx-auto max-w-[1040px] px-3 pb-28 pt-6 text-[#24372C] sm:px-6">

      <header className="mb-5 flex flex-col items-center gap-3 text-center">
        <h1 className="m-0 text-2xl font-bold tracking-tight text-[#24372C] sm:text-3xl">
          {videoSelected ? 'Create a reel' : 'Create a new post'}
        </h1>
        <p className="m-0 text-sm text-[#24372C]/70">
          {videoSelected ? 'Add a video to share with your community.' : 'Add photos, write a caption and publish.'}
        </p>
        <nav className="grid w-full max-w-md grid-cols-2 gap-1 rounded-full border border-[#24372C]/10 bg-[#E6E0D5]/50 p-1.5" aria-label="Upload type">
          <Link className={tab} to="/app/upload" aria-current={!videoSelected ? 'page' : undefined}><CameraIcon />Photo</Link>
          <Link className={tab} to="/app/upload?type=video" aria-current={videoSelected ? 'page' : undefined}><FilmReelIcon />Video</Link>
        </nav>
      </header>

      <div hidden={videoSelected}><ImagePostForm key={user?.id} /></div>
      <div hidden={!videoSelected}><ReelUploadForm key={user?.id} /></div>
    </div>
  )
}
