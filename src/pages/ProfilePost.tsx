import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CloseIcon } from '../components/Icons'
import PostImageCarousel from '../components/PostImageCarousel'
import { api } from '../services/api'
import type { PostResponse } from '../services/api'
import { MediaStatusBadge, RejectionReason } from './MediaModerationStatus'
import { mediaCoverClass, mediaDialogButtonClass as actionClass, mediaDialogClass, mediaDialogCloseClass, mediaDialogFrameClass, mediaDialogHeaderClass, mediaDialogLayoutClass, mediaRatioStyle } from './profileMediaLayout'

const fieldClass = 'w-full rounded-lg border border-[#D8D2C8] p-2 text-base font-normal'
const defaultImageRatio = 4 / 3

type PostProps = {
  post: PostResponse
  skills: string
  onUpdate: (post: PostResponse) => void
  onDelete: (id: string) => void
}

function PostDialog({ post, skills, onUpdate, onDelete, onClose, coverRatio, onCoverLoad }: PostProps & {
  onClose: () => void
  coverRatio: number
  onCoverLoad: (image: HTMLImageElement) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const images = [...post.images].sort((a, b) => a.displayOrder - b.displayOrder)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  function changeMode(nextMode: typeof mode) {
    if (nextMode === 'edit' && post.postStatus === 'REJECTED') return
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || post.postStatus === 'REJECTED') return
    const fields = new FormData(event.currentTarget)
    const body = {
      caption: String(fields.get('caption') ?? '').trim(),
      hashtags: String(fields.get('hashtags') ?? '').trim(),
    }
    setBusy(true)
    setError('')
    try {
      const updated = await api.posts.update(post.id, body)
      onUpdate(updated ?? { ...post, ...body })
      setMode('view')
      setMessage('Post updated.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update the post.')
    } finally {
      setBusy(false)
    }
  }

  async function deletePost() {
    if (busy || mode !== 'delete') return
    setBusy(true)
    setError('')
    try {
      await api.posts.remove(post.id)
      onDelete(post.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete the post.')
      setBusy(false)
    }
  }

  async function handleArchiveToggle() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      if (post.lifecycleStatus === 'ARCHIVED') {
        await api.posts.restore(post.id)
        onUpdate({ ...post, lifecycleStatus: 'ACTIVE' })
        setMessage('Post restored.')
      } else {
        await api.posts.archive(post.id)
        onUpdate({ ...post, lifecycleStatus: 'ARCHIVED' })
        setMessage('Post archived.')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Action failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog ref={dialogRef} aria-label="Post details" style={mediaRatioStyle(coverRatio)} className={mediaDialogClass} onCancel={(event) => {
      event.preventDefault()
      if (busy) return
      if (mode === 'view') onClose()
      else changeMode('view')
    }}>
      <header className={mediaDialogHeaderClass}>
        <h2 className="font-bold">Post</h2>
        <div className="flex items-center gap-2">
          {mode === 'view' && (
            <details className="relative" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false
            }} onKeyDown={(event) => {
              if (event.key !== 'Escape' || !event.currentTarget.open) return
              event.preventDefault()
              event.currentTarget.open = false
              event.currentTarget.querySelector('summary')?.focus()
            }}>
              <summary aria-label="Post options" className="grid size-10 cursor-pointer list-none place-items-center rounded-lg text-xl font-bold hover:bg-[#F1EEE7] [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true">⋯</span>
              </summary>
              <div className="absolute right-0 z-10 grid w-40 gap-1 rounded-xl border border-[#D8D2C8] bg-white p-1 text-sm shadow-lg">
                {post.postStatus !== 'REJECTED' && <button type="button" className="rounded-lg px-3 py-2 text-left hover:bg-[#F1EEE7]" onClick={() => changeMode('edit')}>Edit post</button>}
                <button type="button" className="rounded-lg px-3 py-2 text-left hover:bg-[#F1EEE7]" onClick={handleArchiveToggle}>
                  {post.lifecycleStatus === 'ARCHIVED' ? 'Restore post' : 'Archive post'}
                </button>
                <button type="button" className="rounded-lg px-3 py-2 text-left text-[#9C3028] hover:bg-[#FBECE7]" onClick={() => changeMode('delete')}>Delete post</button>
              </div>
            </details>
          )}
          <button type="button" aria-label="Close post" className={mediaDialogCloseClass} disabled={busy} onClick={onClose}><CloseIcon className="size-5" /></button>
        </div>
      </header>
      <div className={mediaDialogLayoutClass}>
        <section className="min-w-0 space-y-4 p-4 sm:p-5" aria-label="Post details and comments">
          {mode === 'edit' ? (
            <form className="grid gap-3" onSubmit={savePost}>
              <label className="grid gap-1 text-sm font-semibold">Caption<textarea className={fieldClass} name="caption" rows={3} defaultValue={post.caption ?? ''} disabled={busy} /></label>
              <label className="grid gap-1 text-sm font-semibold">Hashtags<input className={fieldClass} name="hashtags" defaultValue={post.hashtags ?? ''} disabled={busy} /></label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className={actionClass} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
                <button type="button" className={actionClass} disabled={busy} onClick={() => changeMode('view')}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 break-words">
              {post.postStatus && <MediaStatusBadge status={post.postStatus} />}
              {post.lifecycleStatus === 'ARCHIVED' && (
                <span className="inline-block rounded-md bg-[#E8E6DE] px-2 py-0.5 text-xs font-bold text-[#4B554E]">
                  📦 Archived
                </span>
              )}
              {post.postStatus === 'REJECTED' && <RejectionReason reason={post.rejectionReason} />}
              {post.caption && <p className="whitespace-pre-wrap">{post.caption}</p>}
              {post.hashtags && <p className="text-sm font-semibold text-[#355642]">{post.hashtags}</p>}
              {skills && <p className="text-sm"><span className="font-semibold">Skills</span> · {skills}</p>}
            </div>
          )}
          {mode === 'delete' && (
            <section aria-label="Confirm deletion" className="space-y-2 rounded-xl bg-[#FBECE7] p-3">
              <h3 className="font-bold">Delete this post?</h3>
              <p className="text-sm">This permanently deletes the post and removes its images from your profile.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={actionClass} disabled={busy} onClick={() => changeMode('view')}>Cancel</button>
                <button type="button" className="rounded-lg bg-[#9C3028] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busy} onClick={() => void deletePost()}>{busy ? 'Deleting…' : 'Delete permanently'}</button>
              </div>
            </section>
          )}
          {error && <p role="alert" className="break-words text-sm text-[#9C3028]">{error}</p>}
          <p role="status" className="text-sm font-semibold empty:hidden">{message}</p>
          <section className="border-t border-[#EAE7DF] pt-4">
            <h3 className="font-bold">Comments</h3>
            <p className="mt-1 text-sm text-[#526157]">Comments are unavailable.</p>
          </section>
        </section>
        <PostImageCarousel images={images} className={mediaDialogFrameClass} onCoverLoad={onCoverLoad} eager />
      </div>
    </dialog>
  )
}

export default function ProfilePost({ active, ...props }: PostProps & { active: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const { post, onDelete } = props
  if (!active && isOpen) setIsOpen(false)
  const images = [...post.images].sort((a, b) => a.displayOrder - b.displayOrder)
  const cover = images[0]
  if (!cover) return null

  function rememberCoverRatio(image: HTMLImageElement) {
    const { naturalWidth, naturalHeight } = image
    if (!naturalWidth || !naturalHeight) return
    const ratio = naturalWidth / naturalHeight
    setRatios((current) => current[cover.id] === ratio ? current : { ...current, [cover.id]: ratio })
  }

  const coverRatio = ratios[cover.id] ?? defaultImageRatio
  const statusLabel = post.postStatus ? `, ${post.postStatus.toLowerCase()}` : ''

  return (
    <>
      <div className="min-w-0">
        <button type="button" aria-label={`Open ${post.caption || 'post'}, ${images.length} ${images.length === 1 ? 'image' : 'images'}${statusLabel}`} className={`${mediaCoverClass} aspect-square w-full`} onClick={() => setIsOpen(true)}>
          <img src={cover.imageUrl} alt="" loading="lazy" onLoad={(event) => rememberCoverRatio(event.currentTarget)} className="absolute inset-0 size-full object-contain" />
          {images.length > 1 && <span aria-hidden="true" className="absolute top-2 right-2 rounded-full bg-[#172D25] px-2 py-1 text-xs font-semibold text-white">{images.length} images</span>}
          {post.postStatus && <MediaStatusBadge status={post.postStatus} className="absolute inset-x-1.5 bottom-1.5 w-fit" />}
        </button>
      </div>
      {isOpen && <PostDialog {...props} coverRatio={coverRatio} onCoverLoad={rememberCoverRatio} onClose={() => setIsOpen(false)} onDelete={(id) => {
        setIsOpen(false)
        onDelete(id)
      }} />}
    </>
  )
}
