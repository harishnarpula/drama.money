import { useEffect, useState } from 'react'
import { useAuth } from '../auth/auth-context'
import { api } from '../services/api'
import type { ContentCreator, FollowStatus } from '../services/api'

const FOLLOW_CHANGED_EVENT = 'teambharat:follow-changed'

export function FollowButton({ creator, overlay = false }: { creator?: ContentCreator | null; overlay?: boolean }) {
  const { user, profile } = useAuth()
  const [override, setOverride] = useState<{ userId: string; status: FollowStatus | null } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const targetUserId = creator?.userId || (creator as any)?.id
  const currentUserId = user?.id || profile?.id

  useEffect(() => {
    if (!targetUserId) return
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; status: FollowStatus | null }>).detail
      if (detail?.userId === targetUserId) setOverride(detail)
    }
    window.addEventListener(FOLLOW_CHANGED_EVENT, sync)
    return () => window.removeEventListener(FOLLOW_CHANGED_EVENT, sync)
  }, [targetUserId])

  if (!creator || !targetUserId) return null

  // If this post/reel is owned by the logged-in user, do not show any follow button:
  if (currentUserId && targetUserId === currentUserId) {
    return null
  }

  const status = override?.userId === targetUserId ? override?.status : creator.followStatus ?? null
  const isFollowing = status === 'FOLLOWING'
  const followsViewer = status === 'FOLLOWED_BY'

  const label = busy
    ? isFollowing ? 'Unfollowing…' : 'Following…'
    : isFollowing
    ? '✓ Following'
    : followsViewer
    ? '+ Follow back'
    : '+ Follow'

  async function toggleFollow() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      if (isFollowing) {
        await api.users.unfollow(targetUserId)
        const nextStatus: FollowStatus | null = followsViewer ? 'FOLLOWED_BY' : null
        setOverride({ userId: targetUserId, status: nextStatus })
        window.dispatchEvent(new CustomEvent(FOLLOW_CHANGED_EVENT, { detail: { userId: targetUserId, status: nextStatus } }))
      } else {
        await api.users.follow(targetUserId)
        const nextStatus: FollowStatus = 'FOLLOWING'
        setOverride({ userId: targetUserId, status: nextStatus })
        window.dispatchEvent(new CustomEvent(FOLLOW_CHANGED_EVENT, { detail: { userId: targetUserId, status: nextStatus } }))
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update follow status.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={(event) => {
        event.stopPropagation()
        void toggleFollow()
      }}
      title={error || undefined}
      className={`shrink-0 rounded-full border px-3.5 py-1 text-xs font-bold transition active:scale-95 cursor-pointer disabled:cursor-wait ${
        overlay
          ? isFollowing
            ? 'border-white/40 bg-black/50 text-white backdrop-blur-md hover:border-rose-400 hover:bg-rose-900/40 hover:text-rose-200'
            : followsViewer
            ? 'border-emerald-400 bg-emerald-600 text-white hover:bg-emerald-500 shadow-md ring-1 ring-emerald-300/50'
            : 'border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-400 shadow-sm'
          : isFollowing
          ? 'border-[#C8D1CA] bg-[#F1EEE7] text-[#24372C] hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
          : followsViewer
          ? 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs ring-1 ring-emerald-600/30'
          : 'border-[#24372C] bg-[#24372C] text-white hover:bg-[#355642] shadow-xs'
      } ${busy ? 'opacity-70' : ''}`}
    >
      {label}
    </button>
  )
}
