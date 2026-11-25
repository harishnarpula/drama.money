import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CloseIcon, PlayIcon } from '../components/Icons'
import { api } from '../services/api'
import type { ReelResponse } from '../services/api'
import { MediaStatusBadge, RejectionReason } from './MediaModerationStatus'
import { mediaCoverClass, mediaDialogButtonClass, mediaDialogCloseClass, mediaDialogHeaderClass } from './profileMediaLayout'

function readVideoRatio(video: HTMLVideoElement, onRatioChange: (ratio: number) => void) {
  if (video.videoWidth && video.videoHeight) onRatioChange(video.videoWidth / video.videoHeight)
}

type Playback = { attempt: number; videoUrl: string; coverUrl?: string | null }
type WheelGesture = { lastEvent: number; distance: number; handled: boolean }

type ReelViewerProps = {
  reel: ReelResponse
  skills: string
  index: number
  count: number
  previous?: () => void
  next?: () => void
  loadingNext: boolean
  nextError: string
  onRetry: () => void
  onClose: () => void
  onUpdate: (reel: ReelResponse) => void
  onDelete: (id: string) => void
}

export function ReelViewer(props: ReelViewerProps) {
  const wheelGesture = useRef<WheelGesture>({ lastEvent: 0, distance: 0, handled: false })
  return <ReelViewerContent key={props.reel.id} {...props} wheelGesture={wheelGesture} />
}

function ReelViewerContent({ reel, skills, index, count, previous, next, loadingNext, nextError, onRetry, onClose, onUpdate, onDelete, wheelGesture }: ReelViewerProps & { wheelGesture: { current: WheelGesture } }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const playerRef = useRef<HTMLVideoElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [playback, setPlayback] = useState<Playback>()
  const [failedAttempt, setFailedAttempt] = useState<number>()
  const [videoRatio, setVideoRatio] = useState<number>()
  const ratio = videoRatio ?? 16 / 9
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const source = playback?.attempt === attempt ? playback : undefined
  const playbackFailed = failedAttempt === attempt
  const canBrowse = mode === 'view' && Boolean(previous || next)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !canBrowse) return

    function onWheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()

      const gesture = wheelGesture.current
      const now = performance.now()
      if (now - gesture.lastEvent > 200) {
        gesture.distance = 0
        gesture.handled = false
      }
      gesture.lastEvent = now
      if (gesture.handled) return

      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1
      const distance = event.deltaY * unit
      if (Math.sign(distance) !== Math.sign(gesture.distance)) gesture.distance = 0
      gesture.distance += distance
      if (Math.abs(gesture.distance) < 48) return

      const navigate = gesture.distance > 0 ? next : previous
      if (navigate) {
        gesture.handled = true
        navigate()
      }
    }

    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [canBrowse, next, previous, wheelGesture])

  useEffect(() => {
    let active = true
    api.reels.detail(reel.id).then((fresh) => {
      if (active) setPlayback({ attempt, videoUrl: fresh.videoUrl || reel.videoUrl, coverUrl: fresh.coverUrl ?? reel.coverUrl })
    }).catch(() => {
      if (active) setPlayback({ attempt, videoUrl: reel.videoUrl, coverUrl: reel.coverUrl })
    })
    return () => { active = false }
  }, [attempt, reel.id, reel.videoUrl, reel.coverUrl])

  function changeMode(value: typeof mode) {
    if (value === 'edit' && reel.reelStatus === 'REJECTED') return
    if (value !== 'view') playerRef.current?.pause()
    setMode(value)
    setError('')
    setMessage('')
  }

  async function saveReel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || reel.reelStatus === 'REJECTED') return
    const fields = new FormData(event.currentTarget)
    const caption = String(fields.get('caption') ?? '').trim()
    const hashtags = String(fields.get('hashtags') ?? '').trim()
    if (!caption) {
      setError('Enter a caption.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const updated = await api.reels.update(reel.id, { caption, hashtags })
      onUpdate(updated)
      setMode('view')
      setMessage('Reel updated.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update the reel.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteReel() {
    if (busy || mode !== 'delete') return
    setBusy(true)
    setError('')
    try {
      await api.reels.remove(reel.id)
      onDelete(reel.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete the reel.')
      setBusy(false)
    }
  }

  async function handleArchiveToggle() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      if (reel.lifecycleStatus === 'ARCHIVED') {
        await api.reels.restore(reel.id)
        onUpdate({ ...reel, lifecycleStatus: 'ACTIVE' })
        setMessage('Reel restored.')
      } else {
        await api.reels.archive(reel.id)
        onUpdate({ ...reel, lifecycleStatus: 'ARCHIVED' })
        setMessage('Reel archived.')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Action failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog ref={dialogRef} aria-label="Reel viewer" className="fixed inset-0 m-auto h-[min(94dvh,48rem)] max-h-none w-[min(97vw,72rem)] max-w-none flex-col overflow-hidden rounded-2xl bg-white text-[#24372C] shadow-xl open:flex backdrop:bg-black/70 md:h-[min(92dvh,54rem)]" onCancel={(event) => {
      event.preventDefault()
      if (busy) return
      if (mode === 'view') onClose()
      else changeMode('view')
    }}>
      <header className={`${mediaDialogHeaderClass} shrink-0`}>
        <h2 className="font-bold">Reel</h2>
        <div className="flex items-center gap-1">
          {mode === 'view' && (
            <details className="relative" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false
            }} onKeyDown={(event) => {
              if (event.key !== 'Escape' || !event.currentTarget.open) return
              event.preventDefault()
              event.currentTarget.open = false
              event.currentTarget.querySelector('summary')?.focus()
            }}>
              <summary aria-label="Reel options" className="grid size-10 cursor-pointer list-none place-items-center rounded-lg text-xl font-bold hover:bg-[#F1EEE7] [&::-webkit-details-marker]:hidden"><span aria-hidden="true">⋯</span></summary>
              <div className="absolute right-0 z-10 grid w-40 gap-1 rounded-xl border border-[#D8D2C8] bg-white p-1 text-sm shadow-lg">
                {reel.reelStatus !== 'REJECTED' && <button type="button" className="rounded-lg px-3 py-2 text-left hover:bg-[#F1EEE7]" onClick={() => changeMode('edit')}>Edit reel</button>}
                <button type="button" className="rounded-lg px-3 py-2 text-left hover:bg-[#F1EEE7]" onClick={handleArchiveToggle}>
                  {reel.lifecycleStatus === 'ARCHIVED' ? 'Restore reel' : 'Archive reel'}
                </button>
                <button type="button" className="rounded-lg px-3 py-2 text-left text-[#842B24] hover:bg-[#FBECE7]" onClick={() => changeMode('delete')}>Delete reel</button>
              </div>
            </details>
          )}
          <button type="button" aria-label="Close reel" className={mediaDialogCloseClass} disabled={busy} onClick={onClose}><CloseIcon className="size-5" /></button>
        </div>
      </header>
      <div className="grid min-h-0 min-w-0 flex-1 content-start overflow-y-auto overscroll-contain md:grid-cols-[clamp(15rem,24vw,20rem)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)] md:overflow-hidden">
        <section className="min-w-0 space-y-3 p-4 [overflow-wrap:anywhere] sm:p-5 md:min-h-0 md:overflow-y-auto" aria-label="Reel details">
          {reel.reelStatus && <MediaStatusBadge status={reel.reelStatus} />}
          {reel.lifecycleStatus === 'ARCHIVED' && (
            <span className="inline-block rounded-md bg-[#E8E6DE] px-2 py-0.5 text-xs font-bold text-[#4B554E]">
              📦 Archived
            </span>
          )}
          {reel.reelStatus === 'REJECTED' && <RejectionReason reason={reel.rejectionReason} />}
          {mode === 'edit' ? (
            <form className="grid gap-3" onSubmit={saveReel}>
              <label className="grid gap-1 text-sm font-bold">Caption<textarea name="caption" defaultValue={reel.caption ?? ''} required maxLength={2200} rows={3} disabled={busy} className="w-full rounded-lg border border-[#D8D2C8] p-2 text-base font-normal" /></label>
              <label className="grid gap-1 text-sm font-bold">Hashtags<input name="hashtags" defaultValue={reel.hashtags ?? ''} maxLength={1000} disabled={busy} className="w-full rounded-lg border border-[#D8D2C8] p-2 text-base font-normal" /></label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className={mediaDialogButtonClass} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
                <button type="button" className={mediaDialogButtonClass} disabled={busy} onClick={() => changeMode('view')}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="whitespace-pre-wrap">{reel.caption || 'No caption'}</p>
              {reel.hashtags && <p className="text-sm font-semibold text-[#355642]">{reel.hashtags}</p>}
              {skills && <p className="text-sm"><span className="font-semibold">Skills</span> · {skills}</p>}
            </div>
          )}
          {mode === 'delete' && (
            <section aria-label="Confirm deletion" className="space-y-2 rounded-xl bg-[#FBECE7] p-3">
              <h3 className="font-bold">Delete this reel?</h3>
              <p className="text-sm">This permanently removes the reel from your profile.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={mediaDialogButtonClass} disabled={busy} onClick={() => changeMode('view')}>Cancel</button>
                <button type="button" className="rounded-lg bg-[#842B24] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busy} onClick={() => void deleteReel()}>{busy ? 'Deleting…' : 'Delete permanently'}</button>
              </div>
            </section>
          )}
          {error && <p role="alert" className="text-sm text-[#842B24]">{error}</p>}
          <p role="status" className="text-sm font-semibold empty:hidden">{message}</p>
        </section>

        <div ref={stageRef} tabIndex={canBrowse ? 0 : undefined} role="group" aria-label={canBrowse ? 'Reel video. Use the up or down arrow to browse.' : 'Reel video'}
          className={`order-first h-[min(55dvh,30rem)] min-h-0 min-w-0 place-items-center overflow-hidden bg-[#172D25] [container-type:size] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white md:order-none md:h-full ${mode === 'view' ? 'grid' : 'hidden md:grid'} ${canBrowse ? 'touch-pan-x touch-pinch-zoom' : ''}`}
          onKeyDown={(event) => {
            if (!canBrowse || event.target !== event.currentTarget) return
            const navigate = event.key === 'ArrowDown' ? next : event.key === 'ArrowUp' ? previous : undefined
            if (navigate) {
              event.preventDefault()
              navigate()
            }
          }}
          onTouchStart={(event) => {
            const point = event.touches.length === 1 ? event.touches[0] : undefined
            touchStart.current = canBrowse && point ? { x: point.clientX, y: point.clientY } : null
          }}
          onTouchCancel={() => { touchStart.current = null }}
          onTouchEnd={(event) => {
            const start = touchStart.current
            touchStart.current = null
            const point = event.changedTouches[0]
            if (!canBrowse || !start || !point) return
            const dx = point.clientX - start.x
            const dy = point.clientY - start.y
            if (Math.abs(dy) < 55 || Math.abs(dy) <= Math.abs(dx)) return
            if (dy < 0) next?.()
            else previous?.()
          }}>
          {playbackFailed ? (
            <div role="alert" className="space-y-3 p-4 text-center text-sm text-white">
              <p>This reel couldn’t play.</p>
              <button type="button" className="rounded-lg bg-white px-3 py-2 font-semibold text-[#24372C]" onClick={() => setAttempt((value) => value + 1)}>Retry video</button>
            </div>
          ) : source ? (
            <video ref={playerRef} key={`${source.attempt}:${source.videoUrl}`} src={source.videoUrl} poster={source.coverUrl || undefined} aria-label={reel.caption || 'Profile reel'} controls playsInline preload="metadata" className="block max-h-full max-w-full object-contain" style={{ aspectRatio: ratio, width: `min(100%, calc(100cqh * ${ratio}))` }} onLoadedMetadata={(event) => readVideoRatio(event.currentTarget, setVideoRatio)} onError={() => {
              if (attempt === 0) setAttempt(1)
              else setFailedAttempt(attempt)
            }} />
          ) : (
            <p role="status" className="flex items-center gap-2 p-4 text-sm text-white">
              <span aria-hidden="true" className="size-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin" />
              Loading video…
            </p>
          )}
        </div>
      </div>
      <footer className="flex min-h-12 shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[#EAE7DF] bg-white px-3 py-2 text-xs sm:px-4">
        <span aria-live="polite" className="font-semibold tabular-nums">Reel {index + 1} of {count}</span>
        {loadingNext ? <span role="status" className="text-[#526157]">Loading more reels…</span> : canBrowse && <span className="text-[#526157]">Scroll or swipe on the video to browse</span>}
        {nextError && <button type="button" className="font-semibold text-[#842B24] underline" onClick={onRetry}>Couldn’t load more reels. Try again.</button>}
      </footer>
    </dialog>
  )
}

export default function ProfileReel({ reel, onOpen }: { reel: ReelResponse; onOpen: () => void }) {
  const [failedPoster, setFailedPoster] = useState<string>()
  const poster = reel.coverUrl !== failedPoster ? reel.coverUrl : undefined
  const statusLabel = reel.reelStatus ? `, ${reel.reelStatus.toLowerCase()}` : ''

  return (
    <div className="min-w-0">
      <button type="button" aria-label={`Open reel${reel.caption ? `: ${reel.caption}` : ''}${statusLabel}`} className={`${mediaCoverClass} aspect-square w-full`} onClick={onOpen}>
        {poster ? (
          <img src={poster} alt="" loading="lazy" className="absolute inset-0 size-full object-contain" onError={() => setFailedPoster(poster)} />
        ) : (
          <video aria-hidden="true" src={reel.videoUrl} preload="metadata" muted playsInline className="pointer-events-none absolute inset-0 size-full bg-[#172D25] object-contain" onLoadedMetadata={({ currentTarget }) => {
            if (Number.isFinite(currentTarget.duration) && currentTarget.duration > 0) {
              currentTarget.currentTime = Math.min(0.08, currentTarget.duration / 2)
            }
          }} />
        )}
        <span aria-hidden="true" className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-[#172D25]/90 text-white"><PlayIcon className="size-4" /></span>
        {reel.reelStatus && <MediaStatusBadge status={reel.reelStatus} className="absolute inset-x-1.5 bottom-1.5 w-fit" />}
      </button>
    </div>
  )
}
