import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CameraIcon, FilmReelIcon } from '../components/Icons'
import { api } from '../services/api'
import type { MediaPage } from '../services/api'
import ProfilePost from './ProfilePost'
import ProfileReel, { ReelViewer } from './ProfileReel'

const mediaGridClass = 'grid grid-cols-2 items-start gap-3 @min-[760px]:grid-cols-3 @min-[760px]:gap-4'
type MediaKind = 'posts' | 'reels'

type ViewerControls<T> = {
  index: number
  count: number
  previous?: () => void
  next?: () => void
  loadingNext: boolean
  nextError: string
  onRetry: () => void
  onClose: () => void
  onUpdate: (item: T) => void
  onDelete: (id: string) => void
}

function MediaLoading({ kind, hasItems }: { kind: MediaKind; hasItems: boolean }) {
  const PreviewIcon = kind === 'posts' ? CameraIcon : FilmReelIcon

  return (
    <div role="status">
      <span className="sr-only">Loading {hasItems ? 'more ' : ''}{kind}…</span>
      {hasItems ? (
        <div aria-hidden="true" className="flex justify-center gap-1.5 py-3">
          {[0, 150, 300].map((delay) => (
            <span key={delay} className="size-2 rounded-full bg-[#789282] motion-safe:animate-pulse" style={{ animationDelay: `${delay}ms` }} />
          ))}
        </div>
      ) : (
        <div aria-hidden="true" className={mediaGridClass}>
          {[0, 1, 2].map((index) => (
            <div key={index} className={`relative aspect-square place-items-center overflow-hidden rounded-xl border border-[#E4E7DF] bg-[#EFF1EA] ${index < 2 ? 'grid' : 'hidden sm:grid'}`}>
              <div className="absolute inset-0 bg-linear-to-br from-[#DCE7DA] via-[#F9FAF5] to-[#E9E4D9] motion-safe:animate-pulse" style={{ animationDelay: `${index * 150}ms` }} />
              <span className="relative grid size-9 place-items-center rounded-full bg-white/70 text-[#789282] sm:size-11"><PreviewIcon className="size-5" /></span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MediaList<T extends { id: string; userId: string }>({ userId, kind, active, list, renderItem, renderViewer }: {
  userId: string
  kind: MediaKind
  active: boolean
  list: (page: number) => Promise<MediaPage<T>>
  renderItem: (item: T, update: (item: T) => void, remove: (id: string) => void, open: () => void) => ReactNode
  renderViewer?: (item: T, controls: ViewerControls<T>) => ReactNode
}) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(0)
  const [retry, setRetry] = useState(0)
  const [loading, setLoading] = useState(true)
  const [last, setLast] = useState(false)
  const [error, setError] = useState('')
  const [openedId, setOpenedId] = useState<string | null>(null)
  const endOfList = useRef<HTMLDivElement>(null)
  const openedIndex = items.findIndex((item) => item.id === openedId)
  const atViewerEnd = openedIndex >= 0 && openedIndex === items.length - 1

  if (!active && openedId !== null) setOpenedId(null)

  useEffect(() => {
    let active = true
    list(page).then((response) => {
      if (!active) return
      const owned = response.content.filter((item) => item.userId === userId)
      setItems((current) => [...new Map([...current, ...owned].map((item) => [item.id, item])).values()])
      setLast(response.last)
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : `Could not load ${kind}.`)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [kind, list, page, retry, userId])

  useEffect(() => {
    if (!active || loading || last || error) return

    function loadNext() {
      setLoading(true)
      setPage(page + 1)
    }

    if (openedIndex >= 0) {
      if (!atViewerEnd) return
      const frame = requestAnimationFrame(loadNext)
      return () => cancelAnimationFrame(frame)
    }

    const target = endOfList.current
    if (!target) return

    let watching = true
    const observer = new IntersectionObserver((entries) => {
      if (!watching || !entries.some((entry) => entry.isIntersecting)) return
      watching = false
      observer.disconnect()
      loadNext()
    }, { rootMargin: '0px 0px 240px' })

    observer.observe(target)
    return () => {
      watching = false
      observer.disconnect()
    }
  }, [active, loading, last, error, page, openedIndex, atViewerEnd])

  function retryPage() {
    setLoading(true)
    setError('')
    setRetry((value) => value + 1)
  }

  function updateItem(item: T) {
    setItems((current) => current.map((existing) => existing.id === item.id ? item : existing))
  }

  function removeItem(id: string) {
    if (openedId === id) setOpenedId(last ? (items[openedIndex + 1] ?? items[openedIndex - 1])?.id ?? null : null)
    setItems((current) => current.filter((item) => item.id !== id))
    // Deletion shifts the backend offsets, so restart pagination before fetching another page.
    if (!last) {
      setItems([])
      setLoading(true)
      setError('')
      setPage(0)
      setRetry((value) => value + 1)
    }
  }

  return (
    <section hidden={!active} aria-label={`Your ${kind}`} className="@container space-y-4">
      {items.length > 0 && (
        <ul role="list" className={mediaGridClass}>
          {items.map((item) => <li key={item.id} role="listitem" className="min-w-0">{renderItem(item, updateItem, removeItem, () => setOpenedId(item.id))}</li>)}
        </ul>
      )}
      {loading && <MediaLoading kind={kind} hasItems={items.length > 0} />}
      {error && <p role="alert" className="break-words text-center text-sm text-[#802923]">Could not load {kind}. {error}</p>}
      {!loading && !error && last && !items.length && (
        <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-white p-8 text-center">
          <p className="text-sm text-[#46534B]">You haven’t published any {kind} yet.</p>
          <Link className="mt-2 inline-block text-sm font-bold text-[#24372C] underline" to={kind === 'posts' ? '/app/upload' : '/app/upload?type=video'}>{kind === 'posts' ? 'Create a post' : 'Upload a video'}</Link>
        </div>
      )}
      {!loading && error && (
        <button type="button" className="mx-auto block rounded-xl border border-[#D8D2C8] bg-white px-4 py-2 text-sm font-bold text-[#24372C] hover:bg-[#F1EEE7]" onClick={retryPage}>Try again</button>
      )}
      {!loading && !error && !last && <div ref={endOfList} aria-hidden="true" className="h-px" />}
      {active && openedIndex >= 0 && renderViewer?.(items[openedIndex], {
        index: openedIndex,
        count: items.length,
        previous: openedIndex > 0 ? () => setOpenedId(items[openedIndex - 1].id) : undefined,
        next: !atViewerEnd ? () => setOpenedId(items[openedIndex + 1].id) : undefined,
        loadingNext: atViewerEnd && !last && !error,
        nextError: atViewerEnd ? error : '',
        onRetry: retryPage,
        onClose: () => setOpenedId(null),
        onUpdate: updateItem,
        onDelete: removeItem,
      })}
    </section>
  )
}

export default function ProfileMedia({ userId, kind, skills }: { userId: string; kind: MediaKind; skills: string }) {
  const [visited, setVisited] = useState(() => new Set([kind]))
  if (!visited.has(kind)) setVisited(new Set(visited).add(kind))

  return (
    <>
      {visited.has('posts') && <MediaList key="posts" userId={userId} kind="posts" active={kind === 'posts'} list={api.posts.list}
        renderItem={(post, onUpdate, onDelete) => <ProfilePost post={post} skills={skills} active={kind === 'posts'} onUpdate={onUpdate} onDelete={onDelete} />} />}
      {visited.has('reels') && <MediaList key="reels" userId={userId} kind="reels" active={kind === 'reels'} list={api.reels.list}
        renderItem={(reel, _update, _remove, open) => <ProfileReel reel={reel} onOpen={open} />}
        renderViewer={(reel, controls) => <ReelViewer reel={reel} skills={skills} {...controls} />} />}
    </>
  )
}
