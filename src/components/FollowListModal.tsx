import { useEffect, useState } from 'react'
import { api, type ContentCreator } from '../services/api'
import { FollowButton } from './FollowButton'

interface FollowListModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  type: 'FOLLOWERS' | 'FOLLOWING'
}

export function FollowListModal({
  isOpen,
  onClose,
  userId,
  type,
}: FollowListModalProps) {
  const [users, setUsers] = useState<ContentCreator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isFollowers = type === 'FOLLOWERS'
  const title = isFollowers ? 'Followers' : 'Following'

  useEffect(() => {
    if (!isOpen || !userId) return

    let active = true
    setLoading(true)
    setError('')

    const fetcher = isFollowers
      ? api.users.getFollowers(userId, 0, 50)
      : api.users.getFollowing(userId, 0, 50)

    fetcher
      .then((data) => {
        if (!active) return
        setUsers(data.content || [])
      })
      .catch((err) => {
        if (!active) return
        console.debug(`Failed to load ${type}:`, err)
        setError(err instanceof Error ? err.message : `Could not load ${title.toLowerCase()}.`)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isOpen, userId, type, isFollowers, title])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-xs antialiased"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[75vh] w-full sm:max-w-[440px] flex-col overflow-hidden rounded-3xl border border-[#D8D2C8] bg-[#FAF8F5] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7DF] px-5 py-3.5 bg-white">
          <h3 className="text-base font-bold text-[#24372C]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-lg font-bold cursor-pointer p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="size-11 rounded-full bg-[#E5E2DA]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-28 rounded bg-[#E5E2DA]" />
                    <div className="h-2.5 w-16 rounded bg-[#EFECE5]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-xs text-rose-600 py-6">{error}</p>
          ) : users.length === 0 ? (
            <div className="text-center py-10 space-y-1">
              <p className="text-sm font-bold text-[#24372C]">No {title.toLowerCase()} yet</p>
              <p className="text-xs text-[#657067]">
                {isFollowers ? 'When people follow this profile, they will appear here.' : 'Accounts followed will appear here.'}
              </p>
            </div>
          ) : (
            users.map((creator) => {
              const name = [creator.firstName, creator.lastName].filter(Boolean).join(' ') || creator.username
              const initials = (name || creator.username).slice(0, 2).toUpperCase()
              return (
                <div
                  key={creator.userId}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#EAE6DE] bg-white p-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#24372C] text-xs font-bold text-white">
                      {creator.profileUrl ? (
                        <img src={creator.profileUrl} alt="" className="size-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#1E2A23]">{name}</p>
                      <p className="truncate text-[11px] text-[#657067]">@{creator.username}</p>
                    </div>
                  </div>
                  <FollowButton creator={creator} />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
