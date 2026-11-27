import { useEffect, useState } from 'react'
import { useAuth } from '../auth/auth-context'
import { api } from '../services/api'
import type { ContentCreator, FollowStatus } from '../services/api'

const FOLLOW_CHANGED_EVENT = 'teambharat:follow-changed'

export function FollowButton({ creator, overlay = false }: { creator?: ContentCreator | null; overlay?: boolean }) {
  const { user } = useAuth()
  const [override, setOverride] = useState<{ userId: string; status: FollowStatus | null } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; status: FollowStatus | null }>).detail
      if (detail?.userId === creator?.userId) setOverride(detail)
    }
    window.addEventListener(FOLLOW_CHANGED_EVENT, sync)
    return () => window.removeEventListener(FOLLOW_CHANGED_EVENT, sync)
  }, [creator?.userId])

  if (!creator || creator.userId === user?.id) return null
  const target = creator
  const status = override?.userId === target.userId ? override.status : target.followStatus ?? null

  const isFollowing = status === 'FOLLOWING'
  const followsViewer = status === 'FOLLOWED_BY'
  const label = busy ? (isFollowing ? 'Unfollowing…' : 'Following…') : followsViewer ? 'Follows you' : isFollowing ? 'Following' : 'Follow'

  async function toggleFollow() {
    if (busy || followsViewer) return
    setBusy(true)
    setError('')
    try {
      if (isFollowing) await api.users.unfollow(target.userId)
      else await api.users.follow(target.userId)
      const nextStatus: FollowStatus | null = isFollowing ? null : 'FOLLOWING'
      setOverride({ userId: target.userId, status: nextStatus })
      window.dispatchEvent(new CustomEvent(FOLLOW_CHANGED_EVENT, { detail: { userId: target.userId, status: nextStatus } }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update follow status.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      disabled={busy || followsViewer}
      onClick={(event) => {
        event.stopPropagation()
        void toggleFollow()
      }}
      title={error || (followsViewer ? 'This creator already follows you' : undefined)}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition disabled:cursor-default ${
        overlay
          ? isFollowing || followsViewer ? 'border-white/35 bg-black/35 text-white backdrop-blur-md' : 'border-emerald-300 bg-emerald-400 text-[#10251A] hover:bg-emerald-300'
          : isFollowing || followsViewer ? 'border-[#BCC7BF] bg-white text-[#355642]' : 'border-[#24372C] bg-[#24372C] text-white hover:bg-[#355642]'
      } ${busy ? 'cursor-wait opacity-70' : ''}`}
    >
      {label}
    </button>
  )
}
