import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { ReelResponse } from '../services/api'
import {
  BookmarkIcon,
  CommentIcon,
  HeartIcon,
  PlayIcon,
  ShareIcon,
  PlusIcon,
  FilmReelIcon,
} from '../components/Icons'
import { ShareModal } from '../components/ShareModal'
import { LikesModal } from '../components/LikesModal'
import { CommentsDrawer } from '../components/CommentsDrawer'

function VolumeHighIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function VolumeXIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  )
}

function PauseIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

interface ReelItemProps {
  reel: ReelResponse
  isActive: boolean
  isMuted: boolean
  toggleMute: () => void
}

function ReelItem({ reel, isActive, isMuted, toggleMute }: ReelItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastTapRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayIcon, setShowPlayIcon] = useState(false)
  const [showHeartPop, setShowHeartPop] = useState(false)
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [liked, setLiked] = useState(reel.likedByCurrentUser ?? false)
  const [likesCount, setLikesCount] = useState(reel.likesCount ?? 0)
  const [commentsCount, setCommentsCount] = useState(reel.commentsCount ?? 0)
  const [saved, setSaved] = useState(false)
  const [progress, setProgress] = useState(0)
  const [captionExpanded, setCaptionExpanded] = useState(false)

  // Handle active status (play when active slide, pause when scrolled away)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.muted = isMuted
      video.play().catch(() => {
        // Autoplay policy might require muted initially
        video.muted = true
        video.play().catch(() => {})
      })
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [isActive, isMuted])

  // Keep muted state in sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  const handleTogglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().catch(() => {})
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
    setShowPlayIcon(true)
    setTimeout(() => setShowPlayIcon(false), 800)
  }

  // Handle video tap: single tap = play/pause, double tap = like + heart animation
  const handleVideoTap = (e: React.MouseEvent) => {
    const now = e.timeStamp
    if (now - lastTapRef.current < 320) {
      // Double tap!
      if (!liked) {
        handleLike()
      }
      setShowHeartPop(true)
      setTimeout(() => setShowHeartPop(false), 850)
    } else {
      handleTogglePlay()
    }
    lastTapRef.current = now
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100)
    }
  }

  const handleLike = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)))

    api.reels.toggleLike(reel.id).then((res) => {
      setLiked(res.liked)
      setLikesCount(res.likesCount)
    }).catch((err) => {
      console.debug('Failed to sync reel like:', err)
      // Rollback
      setLiked(!nextLiked)
      setLikesCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)))
    })
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved((prev) => !prev)
  }

  const creatorName = reel.creator ? `${reel.creator.firstName || ''} ${reel.creator.lastName || ''}`.trim() : 'Creator'
  const username = reel.creator?.username || 'dramamoney'
  const avatarInitials = (creatorName || username).substring(0, 2).toUpperCase()

  return (
    <article
      className="relative mx-auto flex h-full max-h-[calc(100dvh-5.5rem)] w-full max-w-[430px] shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-black shadow-2xl ring-1 ring-white/10"
      aria-label={`Reel by @${username}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.coverUrl || undefined}
        loop
        playsInline
        preload="metadata"
        onClick={handleVideoTap}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        className="h-full w-full cursor-pointer object-cover"
      />

      {/* Floating Big Heart on Double Tap */}
      {showHeartPop && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center animate-in zoom-in-50 fade-in duration-200">
          <span className="text-8xl drop-shadow-2xl animate-bounce">❤️</span>
        </div>
      )}

      {/* Play / Pause Animated Center Badge */}
      {showPlayIcon && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="grid size-20 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition-transform animate-in fade-in zoom-in-75">
            {isPlaying ? <PauseIcon className="size-8" /> : <PlayIcon className="size-8" />}
          </div>
        </div>
      )}

      {/* Top Bar (Audio toggle & status badge) */}
      <div className="absolute top-4 inset-x-4 z-10 flex items-center justify-between text-white drop-shadow-md">
        <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur-md">
          <span className="size-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
          Telugu Job Guidance
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleMute()
          }}
          className="grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeXIcon className="size-5" /> : <VolumeHighIcon className="size-5" />}
        </button>
      </div>

      {/* Bottom Gradient Overlay */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
        aria-hidden="true"
      />

      {/* Creator Info & Caption (Bottom Left) */}
      <div className="absolute bottom-5 left-4 right-16 z-20 text-white drop-shadow">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/60 bg-[#24372C] text-xs font-bold text-white shadow-sm">
            {reel.creator?.profileUrl ? (
              <img src={reel.creator.profileUrl} alt="" className="size-full object-cover" />
            ) : (
              avatarInitials
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold leading-tight">{creatorName}</h3>
            <p className="truncate text-xs text-white/80">@{username}</p>
          </div>
        </div>

        {/* Caption */}
        {reel.caption && (
          <div className="mt-2.5">
            <p className={`text-xs text-white/95 leading-relaxed ${captionExpanded ? '' : 'line-clamp-2'}`}>
              {reel.caption}
            </p>
            {reel.caption.length > 80 && (
              <button
                type="button"
                onClick={() => setCaptionExpanded((prev) => !prev)}
                className="mt-0.5 text-[11px] font-bold text-emerald-300 hover:underline"
              >
                {captionExpanded ? 'Show less' : '...more'}
              </button>
            )}
          </div>
        )}

        {/* Hashtags */}
        {reel.hashtags && (
          <p className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-semibold text-emerald-300">
            {reel.hashtags.split(/[\s,]+/).filter(Boolean).map((tag, i) => (
              <span key={i} className="hover:underline">{tag.startsWith('#') ? tag : `#${tag}`}</span>
            ))}
          </p>
        )}
      </div>

      {/* Right Side Action Buttons */}
      <div className="absolute bottom-5 right-3 z-20 flex flex-col items-center gap-4 text-white">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          className="group flex flex-col items-center gap-1 text-center cursor-pointer"
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <div
            className={`grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:scale-110 ${
              liked ? 'text-rose-500 scale-105' : 'text-white'
            }`}
          >
            <HeartIcon className={`size-6 ${liked ? 'fill-current text-rose-500' : ''}`} />
          </div>
          <span
            onClick={(e) => {
              e.stopPropagation()
              setShowLikesModal(true)
            }}
            className="text-[10px] font-bold hover:underline"
            title="View who liked"
          >
            {likesCount}
          </span>
        </button>

        {/* Comment */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowCommentsDrawer(true)
          }}
          className="group flex flex-col items-center gap-1 text-center cursor-pointer"
          aria-label="Comments"
        >
          <div className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white transition group-hover:scale-110">
            <CommentIcon className="size-6" />
          </div>
          <span className="text-[10px] font-bold">{commentsCount}</span>
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className="group flex flex-col items-center gap-1 text-center cursor-pointer"
          aria-label={saved ? 'Remove Bookmark' : 'Bookmark'}
        >
          <div
            className={`grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:scale-110 ${
              saved ? 'text-amber-400' : 'text-white'
            }`}
          >
            <BookmarkIcon className={`size-6 ${saved ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] font-bold">{saved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowShareModal(true)
          }}
          className="group flex flex-col items-center gap-1 text-center cursor-pointer"
          aria-label="Share"
        >
          <div className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white transition group-hover:scale-110">
            <ShareIcon className="size-6" />
          </div>
          <span className="text-[10px] font-bold">Share</span>
        </button>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`${window.location.origin}/app/reels?id=${reel.id}`}
        title={reel.caption || 'Drama.Money Reel'}
        caption={reel.caption || undefined}
        contentType="REEL"
      />

      {/* Who Liked Modal Dialog */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        contentId={reel.id}
        contentType="REEL"
      />

      {/* Threaded Comments & Replies Drawer */}
      <CommentsDrawer
        isOpen={showCommentsDrawer}
        onClose={() => setShowCommentsDrawer(false)}
        contentId={reel.id}
        contentType="REEL"
        onCommentCountChange={setCommentsCount}
      />

      {/* Bottom Slim Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 z-30 h-1 bg-white/20">
        <div
          className="h-full bg-emerald-400 transition-[width] duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  )
}

export default function ReelsFeed() {
  const [reels, setReels] = useState<ReelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const loadReels = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.reels.listApproved(0, 50)
      const approvedOnly = (data?.content || []).filter(
        (r) => !r.reelStatus || r.reelStatus === 'APPROVED'
      )
      setReels(approvedOnly)
    } catch (err) {
      console.error('Failed to load approved reels:', err)
      setError(err instanceof Error ? err.message : 'Could not load reels.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.reels
      .listApproved(0, 50)
      .then((data) => {
        if (!active) return
        const approvedOnly = (data?.content || []).filter(
          (r) => !r.reelStatus || r.reelStatus === 'APPROVED'
        )
        setReels(approvedOnly)
      })
      .catch((err) => {
        if (!active) return
        console.error('Failed to load approved reels:', err)
        setError(err instanceof Error ? err.message : 'Could not load reels.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Scroll active slide detection
  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const index = Math.round(el.scrollTop / el.clientHeight)
    if (index !== activeIndex && index >= 0 && index < reels.length) {
      setActiveIndex(index)
    }
  }

  return (
    <div className="relative flex h-[calc(100dvh-4.25rem)] w-full flex-col items-center justify-center overflow-hidden bg-[#18231C]">
      {/* Top Header */}
      <header className="absolute top-2 inset-x-0 z-30 flex items-center justify-between px-6 pointer-events-none">
        <h1 className="text-lg font-black tracking-wider text-white drop-shadow">REELS</h1>
        <Link
          to="/app/upload?type=video"
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/80 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur shadow hover:bg-emerald-500"
        >
          <PlusIcon className="size-4" /> Upload
        </Link>
      </header>

      {/* Main Snap Scroller */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 text-white">
          <div className="size-10 rounded-full border-4 border-emerald-400 border-t-transparent motion-safe:animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-white/80">Loading reels...</p>
        </div>
      ) : error ? (
        <div className="flex max-w-sm flex-col items-center justify-center gap-4 rounded-2xl bg-white/10 p-6 text-center text-white backdrop-blur">
          <p className="text-sm text-rose-200">{error}</p>
          <button
            type="button"
            onClick={loadReels}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-600"
          >
            Try Again
          </button>
        </div>
      ) : reels.length === 0 ? (
        <div className="flex max-w-md flex-col items-center justify-center gap-4 rounded-3xl border border-white/15 bg-white/5 p-8 text-center text-white backdrop-blur">
          <div className="grid size-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <FilmReelIcon className="size-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">No approved reels yet</h2>
            <p className="mt-1 text-sm text-white/70">
              Be the first creator to upload a short career or skill guidance video!
            </p>
          </div>
          <Link
            to="/app/upload?type=video"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-400"
          >
            <PlusIcon className="size-5" />
            Upload a Reel
          </Link>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              className="grid h-full w-full snap-start snap-always place-items-center p-2 sm:p-4"
            >
              <ReelItem
                reel={reel}
                isActive={index === activeIndex}
                isMuted={isMuted}
                toggleMute={() => setIsMuted((m) => !m)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
