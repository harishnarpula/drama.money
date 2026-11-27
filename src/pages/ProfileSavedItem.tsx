import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkIcon, CameraIcon, FilmReelIcon, HeartIcon, CommentIcon } from '../components/Icons'
import { api } from '../services/api'
import type { SavedContentItem } from '../services/api'
import { mediaCoverClass } from './profileMediaLayout'

export default function ProfileSavedItem({
  item,
  onRemove,
}: {
  item: SavedContentItem
  onRemove: (id: string) => void
}) {
  const [unsaving, setUnsaving] = useState(false)
  const isReel = item.contentType === 'REEL'
  const displayUrl = isReel ? item.coverUrl || item.contentUrl : item.contentUrl

  const handleUnsave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (unsaving) return
    setUnsaving(true)
    try {
      if (isReel) {
        await api.reels.toggleSave(item.contentId)
      } else {
        await api.posts.toggleSave(item.contentId)
      }
      onRemove(item.id)
    } catch (err) {
      console.error('Failed to unsave item:', err)
      setUnsaving(false)
    }
  }

  const targetUrl = isReel ? `/app/reels?id=${item.contentId}` : `/app`

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-xl border border-[#E4E7DF] bg-white shadow-xs">
      <Link
        to={targetUrl}
        className={`${mediaCoverClass} aspect-square w-full block relative overflow-hidden`}
        aria-label={`View saved ${isReel ? 'reel' : 'post'}: ${item.caption || ''}`}
      >
        {isReel && !item.coverUrl && item.contentUrl ? (
          <video
            src={item.contentUrl}
            preload="metadata"
            muted
            playsInline
            className="pointer-events-none absolute inset-0 size-full bg-black object-contain"
            onLoadedMetadata={({ currentTarget }) => {
              if (Number.isFinite(currentTarget.duration) && currentTarget.duration > 0) {
                currentTarget.currentTime = Math.min(0.08, currentTarget.duration / 2)
              }
            }}
          />
        ) : displayUrl ? (
          <img
            src={displayUrl}
            alt={item.caption || 'Saved media'}
            loading="lazy"
            className="absolute inset-0 size-full object-contain bg-[#121B16]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#EAE7DF] text-[#657067]">
            {isReel ? <FilmReelIcon className="size-8" /> : <CameraIcon className="size-8" />}
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 z-10 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
            {isReel ? <FilmReelIcon className="size-3" /> : <CameraIcon className="size-3" />}
            {isReel ? 'Reel' : 'Post'}
          </span>

          <button
            type="button"
            onClick={handleUnsave}
            disabled={unsaving}
            title="Remove from saved"
            className="pointer-events-auto grid size-7 place-items-center rounded-full bg-black/60 text-amber-400 backdrop-blur-xs transition hover:scale-110 hover:bg-black/80 cursor-pointer"
          >
            <BookmarkIcon className="size-4 fill-current text-amber-400" />
          </button>
        </div>

        {/* Hover / Bottom Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white transition-opacity">
          {item.creator?.username && (
            <p className="truncate text-[11px] font-bold text-white/90">
              @{item.creator.username}
            </p>
          )}
          {item.caption && (
            <p className="truncate text-[10px] text-white/75 mt-0.5">
              {item.caption}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3 text-[10px] text-white/80">
            {typeof item.likesCount === 'number' && (
              <span className="inline-flex items-center gap-1">
                <HeartIcon className="size-3" /> {item.likesCount}
              </span>
            )}
            {typeof item.commentsCount === 'number' && (
              <span className="inline-flex items-center gap-1">
                <CommentIcon className="size-3" /> {item.commentsCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
