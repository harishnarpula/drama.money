import { useEffect, useRef, useState } from 'react'
import { api, type CommentItem } from '../services/api'
import { useAuth } from '../auth/auth-context'

interface CommentsDrawerProps {
  isOpen: boolean
  onClose: () => void
  contentId: string
  contentType: 'POST' | 'REEL'
  onCommentCountChange?: (newCount: number) => void
}

function formatCommentTime(isoString?: string) {
  if (!isoString) return ''
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return `${Math.floor(diff / 604800)}w`
}

export function CommentsDrawer({
  isOpen,
  onClose,
  contentId,
  contentType,
  onCommentCountChange,
}: CommentsDrawerProps) {
  const { profile } = useAuth()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [inputText, setInputText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  // Load comments on open
  useEffect(() => {
    if (!isOpen || !contentId) return

    let active = true

    const fetcher =
      contentType === 'POST'
        ? api.posts.getComments(contentId)
        : api.reels.getComments(contentId)

    fetcher
      .then((data) => {
        if (!active) return
        setComments(data || [])
        onCommentCountChange?.(data ? data.length : 0)
      })
      .catch((err) => {
        console.debug('Failed to load comments:', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isOpen, contentId, contentType, onCommentCountChange])

  // Focus input when replying
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus()
    }
  }, [replyingTo])

  if (!isOpen) return null

  // Post comment or sub-comment
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = inputText.trim()
    if (!text || submitting) return

    setSubmitting(true)

    const parentId = replyingTo?.id

    try {
      const newComment =
        contentType === 'POST'
          ? await api.posts.addComment(contentId, text, parentId)
          : await api.reels.addComment(contentId, text, parentId)

      if (parentId) {
        // Appended sub-comment to parent
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              const currentReplies = c.replies || []
              return {
                ...c,
                repliesCount: c.repliesCount + 1,
                replies: [...currentReplies, newComment],
              }
            }
            return c
          })
        )
        // Automatically expand replies of parent so the user sees their reply
        setExpandedReplies((prev) => ({ ...prev, [parentId]: true }))
      } else {
        // Appended top-level comment
        setComments((prev) => [newComment, ...prev])
        onCommentCountChange?.(comments.length + 1)
      }

      setInputText('')
      setReplyingTo(null)
    } catch (err) {
      console.error('Failed to post comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle comment like
  const handleToggleLike = async (commentId: string, isReply: boolean, parentId?: string) => {
    // Optimistic toggle
    const updateLikes = (c: CommentItem): CommentItem => {
      if (c.id === commentId) {
        const nextLiked = !c.likedByCurrentUser
        return {
          ...c,
          likedByCurrentUser: nextLiked,
          likesCount: Math.max(0, c.likesCount + (nextLiked ? 1 : -1)),
        }
      }
      return c
    }

    if (isReply && parentId) {
      setComments((prev) =>
        prev.map((p) => {
          if (p.id === parentId && p.replies) {
            return { ...p, replies: p.replies.map(updateLikes) }
          }
          return p
        })
      )
    } else {
      setComments((prev) => prev.map(updateLikes))
    }

    try {
      if (contentType === 'POST') {
        await api.posts.toggleCommentLike(commentId)
      } else {
        await api.reels.toggleCommentLike(commentId)
      }
    } catch (err) {
      console.debug('Failed to toggle comment like:', err)
    }
  }

  // Delete comment
  const handleDelete = async (commentId: string, parentId?: string) => {
    try {
      if (contentType === 'POST') {
        await api.posts.deleteComment(contentId, commentId)
      } else {
        await api.reels.deleteComment(contentId, commentId)
      }

      if (parentId) {
        setComments((prev) =>
          prev.map((p) => {
            if (p.id === parentId && p.replies) {
              return {
                ...p,
                repliesCount: Math.max(0, p.repliesCount - 1),
                replies: p.replies.filter((r) => r.id !== commentId),
              }
            }
            return p
          })
        )
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
        onCommentCountChange?.(Math.max(0, comments.length - 1))
      }
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }

  // Load and toggle replies
  const handleToggleReplies = async (parentComment: CommentItem) => {
    const isCurrentlyExpanded = !!expandedReplies[parentComment.id]
    if (isCurrentlyExpanded) {
      setExpandedReplies((prev) => ({ ...prev, [parentComment.id]: false }))
      return
    }

    // Expand
    setExpandedReplies((prev) => ({ ...prev, [parentComment.id]: true }))

    // If replies not loaded yet, fetch them
    if (!parentComment.replies || parentComment.replies.length === 0) {
      setLoadingReplies((prev) => ({ ...prev, [parentComment.id]: true }))
      try {
        const replies =
          contentType === 'POST'
            ? await api.posts.getReplies(contentId, parentComment.id)
            : await api.reels.getReplies(contentId, parentComment.id)

        setComments((prev) =>
          prev.map((c) => (c.id === parentComment.id ? { ...c, replies } : c))
        )
      } catch (err) {
        console.debug('Failed to load replies:', err)
      } finally {
        setLoadingReplies((prev) => ({ ...prev, [parentComment.id]: false }))
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-6 md:p-8 backdrop-blur-xs antialiased"
      onClick={onClose}
    >
      <div
        className="relative flex h-[82vh] sm:h-[min(70vh,560px)] w-full sm:max-w-[620px] md:max-w-[660px] flex-col overflow-hidden rounded-t-[28px] sm:rounded-3xl border border-[#D8D2C8] bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Swipe Handle */}
        <div className="flex justify-center pt-2 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-[#D8D2C8]" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7DF] px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-[#1E2A23] tracking-wide uppercase">
              Comments
            </h2>
            <span className="rounded-full bg-[#EEF1EF] px-2 py-0.5 text-xs font-bold text-[#24372C]">
              {comments.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-full text-base font-bold text-[#657067] hover:bg-[#F1EEE7] hover:text-[#24372C] transition cursor-pointer"
            aria-label="Close comments"
          >
            ✕
          </button>
        </div>

        {/* Comments Scrollable List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [scrollbar-width:thin]">
          {loading ? (
            <div className="space-y-4 py-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="size-8 rounded-full bg-[#E5E1D8] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 rounded bg-[#E5E1D8]" />
                    <div className="h-3 w-full rounded bg-[#E5E1D8]" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-sm font-bold text-[#1E2A23]">No comments yet</p>
              <p className="text-xs text-[#657067] mt-0.5">Start the conversation!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const userInitials =
                (comment.firstName ? comment.firstName[0] : '') +
                (comment.lastName ? comment.lastName[0] : '') ||
                comment.username.slice(0, 2).toUpperCase()

              const isExpanded = !!expandedReplies[comment.id]
              const hasReplies = comment.repliesCount > 0 || (comment.replies && comment.replies.length > 0)

              return (
                <div key={comment.id} className="group flex flex-col gap-1.5">
                  {/* Top-Level Comment Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#24372C] text-[11px] font-bold text-white shadow-xs">
                        {comment.profileUrl ? (
                          <img src={comment.profileUrl} alt="" className="size-full object-cover" />
                        ) : (
                          userInitials
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-[#1E2A23] hover:underline cursor-pointer">
                            @{comment.username}
                          </span>
                          {comment.isAuthor && (
                            <span className="rounded bg-[#24372C] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                              Author
                            </span>
                          )}
                          <span className="text-[10px] text-[#7A887E]">
                            {formatCommentTime(comment.createdAt)}
                          </span>
                        </div>

                        {/* Text */}
                        <p className="mt-1 whitespace-pre-wrap text-[#26332A] leading-relaxed [overflow-wrap:anywhere]">
                          {comment.text}
                        </p>

                        {/* Actions Row */}
                        <div className="mt-1.5 flex items-center gap-4 text-[11px] font-bold text-[#657067]">
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingTo({ id: comment.id, username: comment.username })
                            }
                            className="hover:text-[#24372C] cursor-pointer"
                          >
                            Reply
                          </button>
                          {comment.canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(comment.id)}
                              className="text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mini Like Heart */}
                    <button
                      type="button"
                      onClick={() => handleToggleLike(comment.id, false)}
                      className="flex flex-col items-center gap-0.5 shrink-0 text-[#657067] hover:scale-110 transition cursor-pointer p-1"
                      aria-label="Like comment"
                    >
                      <span className={`text-sm ${comment.likedByCurrentUser ? 'text-rose-500 scale-110' : 'text-[#8A968D]'}`}>
                        {comment.likedByCurrentUser ? '❤️' : '🤍'}
                      </span>
                      {comment.likesCount > 0 && (
                        <span className="text-[10px] font-semibold text-[#7A887E]">
                          {comment.likesCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Sub-comments (Replies) Toggle & List */}
                  {hasReplies && (
                    <div className="ml-11 mt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleReplies(comment)}
                        className="flex items-center gap-2 text-[11px] font-bold text-[#355642] hover:text-[#17251D] cursor-pointer"
                      >
                        <span className="h-px w-6 bg-[#355642]/40" />
                        <span>
                          {isExpanded
                            ? 'Hide replies ∧'
                            : `View ${comment.repliesCount || comment.replies?.length} replies ⌵`}
                        </span>
                        {loadingReplies[comment.id] && (
                          <span className="size-2 rounded-full bg-[#355642] animate-ping" />
                        )}
                      </button>

                      {/* Expanded Sub-comments / Nested Replies */}
                      {isExpanded && comment.replies && (
                        <div className="mt-3 space-y-3 pl-2 border-l-2 border-[#EAE7DF]">
                          {comment.replies.map((reply) => {
                            const replyInitials =
                              (reply.firstName ? reply.firstName[0] : '') +
                              (reply.lastName ? reply.lastName[0] : '') ||
                              reply.username.slice(0, 2).toUpperCase()

                            return (
                              <div
                                key={reply.id}
                                className="flex items-start justify-between gap-2.5 text-xs"
                              >
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <div className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-[#384E41] text-[10px] font-bold text-white shadow-xs">
                                    {reply.profileUrl ? (
                                      <img src={reply.profileUrl} alt="" className="size-full object-cover" />
                                    ) : (
                                      replyInitials
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-[#1E2A23] hover:underline cursor-pointer">
                                        @{reply.username}
                                      </span>
                                      {reply.isAuthor && (
                                        <span className="rounded bg-[#24372C] px-1 py-0.1 text-[8px] font-bold text-white uppercase">
                                          Author
                                        </span>
                                      )}
                                      <span className="text-[10px] text-[#7A887E]">
                                        {formatCommentTime(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 whitespace-pre-wrap text-[#26332A] leading-relaxed [overflow-wrap:anywhere]">
                                      {reply.text}
                                    </p>
                                    <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-[#657067]">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setReplyingTo({ id: comment.id, username: reply.username })
                                        }
                                        className="hover:text-[#24372C] cursor-pointer"
                                      >
                                        Reply
                                      </button>
                                      {reply.canDelete && (
                                        <button
                                          type="button"
                                          onClick={() => handleDelete(reply.id, comment.id)}
                                          className="text-rose-600 hover:text-rose-800 cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Mini Heart for Sub-comment */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleLike(reply.id, true, comment.id)}
                                  className="flex flex-col items-center gap-0.5 shrink-0 text-[#657067] hover:scale-110 transition cursor-pointer p-1"
                                >
                                  <span className={`text-xs ${reply.likedByCurrentUser ? 'text-rose-500 scale-110' : 'text-[#8A968D]'}`}>
                                    {reply.likedByCurrentUser ? '❤️' : '🤍'}
                                  </span>
                                  {reply.likesCount > 0 && (
                                    <span className="text-[9px] font-semibold text-[#7A887E]">
                                      {reply.likesCount}
                                    </span>
                                  )}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Sticky Replying-to Banner */}
        {replyingTo && (
          <div className="flex items-center justify-between border-t border-[#EAE7DF] bg-[#F4F1EA] px-5 py-1.5 text-xs text-[#24372C]">
            <span>
              Replying to <strong className="font-bold">@{replyingTo.username}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-xs font-bold text-[#657067] hover:text-[#1E2A23] cursor-pointer"
            >
              Cancel ✕
            </button>
          </div>
        )}

        {/* Quick Emoji Bar */}
        <div className="flex items-center gap-3 border-t border-[#EAE7DF] bg-[#FAF8F5] px-5 py-1.5">
          {['❤️', '🔥', '👏', '🙌', '💯', '✨'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setInputText((prev) => prev + emoji)}
              className="text-base hover:scale-125 transition cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Bottom Input Field */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 border-t border-[#EAE7DF] bg-white px-5 py-3"
        >
          {/* Current User Avatar */}
          <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#24372C] text-xs font-bold text-white shadow-xs">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="" className="size-full object-cover" />
            ) : (
              (profile.name ? profile.name[0] : 'DM').toUpperCase()
            )}
          </div>

          {/* Input Box */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'
            }
            maxLength={1000}
            className="flex-1 rounded-full border border-[#D8D2C8] bg-[#F8F7F4] px-4 py-2 text-xs text-[#1E2A23] outline-none focus:border-[#24372C] focus:bg-white transition"
          />

          {/* Send / Post Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || submitting}
            className="shrink-0 text-xs font-black uppercase tracking-wider text-[#24372C] disabled:opacity-30 hover:underline cursor-pointer"
          >
            {submitting ? '...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}
