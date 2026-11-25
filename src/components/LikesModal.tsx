import { useEffect, useState } from 'react'
import { api, type LikerUser } from '../services/api'

interface LikesModalProps {
  isOpen: boolean
  onClose: () => void
  contentId: string
  contentType: 'POST' | 'REEL'
}

export function LikesModal({
  isOpen,
  onClose,
  contentId,
  contentType,
}: LikesModalProps) {
  const [likers, setLikers] = useState<LikerUser[]>([])
  const [totalLikes, setTotalLikes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !contentId) return

    let active = true
    const fetcher =
      contentType === 'POST'
        ? api.posts.getLikes(contentId)
        : api.reels.getLikes(contentId)

    fetcher
      .then((data) => {
        if (!active) return
        setLikers(data.likers || [])
        setTotalLikes(data.totalLikes || 0)
      })
      .catch((err) => {
        console.debug('Failed to load likes:', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isOpen, contentId, contentType])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-xs antialiased"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[70vh] w-full sm:max-w-[460px] flex-col overflow-hidden rounded-3xl border border-[#D8D2C8] bg-[#FAF8F5] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7DF] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-sm">❤️</span>
            <h3 className="text-sm font-bold text-[#24372C]">
              Likes ({totalLikes})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-full text-base font-bold text-[#657067] hover:bg-[#EFECE5] hover:text-[#24372C] transition cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* List of likers */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 [scrollbar-width:thin]">
          {loading ? (
            <div className="space-y-3 py-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="size-10 rounded-full bg-[#E5E1D8]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-28 rounded bg-[#E5E1D8]" />
                    <div className="h-2.5 w-16 rounded bg-[#E5E1D8]" />
                  </div>
                </div>
              ))}
            </div>
          ) : likers.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs font-semibold text-[#657067]">
                No likes yet. Be the first to like!
              </p>
            </div>
          ) : (
            likers.map((liker) => {
              const initials =
                (liker.firstName ? liker.firstName[0] : '') +
                (liker.lastName ? liker.lastName[0] : '') ||
                liker.username.slice(0, 2).toUpperCase()

              return (
                <div
                  key={liker.userId}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white p-2.5 border border-[#EBE7DF] shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#24372C] text-xs font-bold text-white">
                      {liker.profileUrl ? (
                        <img
                          src={liker.profileUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#1E2A23]">
                        {liker.firstName
                          ? `${liker.firstName} ${liker.lastName || ''}`.trim()
                          : liker.username}
                      </p>
                      <p className="truncate text-[11px] font-medium text-[#657067]">
                        @{liker.username}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] text-[#8A968D]">
                    {liker.likedAt ? new Date(liker.likedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
