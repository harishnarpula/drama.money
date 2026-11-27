import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PostImageCarousel from '../../components/PostImageCarousel'
import { api, ApiError } from '../../services/api'
import type { ContentReviewDecision, PostResponse, PostStatus } from '../../services/api'
import { AdminPage } from '../components/AdminPageUI'
import { generateAiReviewReport } from '../../services/aiModerator'
import { AiModerationCard } from '../components/AiModerationCard'

const filters = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'All posts', value: undefined },
] satisfies { label: string; value: PostStatus | undefined }[]

const statusLabels = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' }
const buttonClass = 'rounded-lg border border-[#D8D2C8] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50'

function ReviewLoading() {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">Loading posts for review…</span>
      {[0, 150, 300].map((delay) => (
        <div key={delay} aria-hidden="true" className="grid gap-4 rounded-2xl border border-[#D8D2C8] bg-white p-4 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <div className="aspect-video rounded-xl bg-linear-to-br from-[#DCE7DA] via-[#F1F4ED] to-[#E9E4D9] motion-safe:animate-pulse" style={{ animationDelay: `${delay}ms` }} />
          <div className="grid content-center gap-3 motion-safe:animate-pulse" style={{ animationDelay: `${delay}ms` }}>
            <div className="h-5 w-20 rounded-full bg-[#E2EBE1]" />
            <div className="h-4 w-3/4 max-w-72 rounded bg-[#EBEEE7]" />
            <div className="h-3 w-1/2 max-w-44 rounded bg-[#EBEEE7]" />
            <div className="flex gap-2"><div className="h-9 w-20 rounded-lg bg-[#E2EBE1]" /><div className="h-9 w-16 rounded-lg bg-[#EFECE6]" /></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ReviewQueuePage() {
  const [params, setParams] = useSearchParams()
  const filter = params.get('status')
  const status = filter === 'ALL' ? undefined : filter === 'APPROVED' || filter === 'REJECTED' ? filter : 'PENDING'

  return <ReviewQueue filter={status} onFilterChange={(value) => setParams({ status: value ?? 'ALL' })} />
}

function ReviewQueue({ filter, onFilterChange }: { filter: PostStatus | undefined; onFilterChange: (filter: PostStatus | undefined) => void }) {
  const [page, setPage] = useState(0)
  const [refresh, setRefresh] = useState(0)
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [last, setLast] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [reviewError, setReviewError] = useState<{ id: string; message: string } | null>(null)
  const [notice, setNotice] = useState('')
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    let active = true
    api.posts.listForReview(page, 20, filter).then((result) => {
      if (!active) return
      setPosts(result.content)
      setLast(result.last)
      setLoadError('')
      hasLoadedRef.current = true
    }).catch((cause: unknown) => {
      if (!active || hasLoadedRef.current) return
      setLoadError(cause instanceof ApiError && cause.status === 403
        ? 'This account does not have Post Review permission. Sign in with an authorized admin account.'
        : cause instanceof Error ? cause.message : 'Please try again.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [filter, page, refresh])

  function loadPage(nextPage: number) {
    setLoadError('')
    if (nextPage === page) setRefresh((value) => value + 1)
    else setPage(nextPage)
  }

  function retryInitialLoad() {
    setLoading(true)
    setLoadError('')
    setRefresh((value) => value + 1)
  }

  function resetRejection() {
    setRejectingId(null)
    setReason('')
    setReviewError(null)
  }

  async function review(postId: string, decision: ContentReviewDecision) {
    if (loading || reviewingId) return
    setReviewError(null)
    setNotice('')
    setReviewingId(postId)
    try {
      await api.moderation.review({ contentType: 'POST', contentId: postId, ...decision })
      resetRejection()
      setNotice(decision.status === 'APPROVED' ? 'Post approved.' : 'Post rejected.')
      setPosts((current) => current.flatMap((post) => {
        if (post.id !== postId) return [post]
        if (filter !== undefined && filter !== decision.status) return []
        return [{
          ...post,
          postStatus: decision.status,
          rejectionReason: decision.status === 'REJECTED' ? decision.rejectionReason.trim() : null,
        }]
      }))
      // Reconcile pagination and server-calculated fields without replacing the page with a loader.
      setRefresh((value) => value + 1)
    } catch (cause) {
      setReviewError({ id: postId, message: cause instanceof Error ? cause.message : 'Could not save the review.' })
    } finally {
      setReviewingId(null)
    }
  }

  return (
    <AdminPage eyebrow="MODERATION" title="Post Review" subtitle="Review image posts submitted by users.">
      <nav aria-label="Filter by moderation status" className="mb-4 flex flex-wrap gap-2">
        {filters.map(({ label, value }) => (
          <button key={label} type="button" aria-pressed={filter === value} disabled={!!reviewingId}
            className={`${buttonClass} ${filter === value ? 'bg-[#24372C] text-white' : 'bg-white text-[#24372C] hover:bg-[#F1EEE7]'}`}
            onClick={() => {
              if (filter === value) return
              setPage(0)
              setLoadError('')
              onFilterChange(value)
            }}>{label}</button>
        ))}
      </nav>

      {notice && <p role="status" className="mb-4 rounded-lg bg-[#E2F1E6] p-3 text-sm font-semibold text-[#235437]">{notice}</p>}
      {loading ? (
        <ReviewLoading />
      ) : loadError ? (
        <div className="space-y-3 rounded-xl border border-[#EAC5C0] bg-[#FFF4F2] p-4">
          <p role="alert" className="text-sm text-[#842B24]">Could not load posts. {loadError}</p>
          <button type="button" className={buttonClass} onClick={retryInitialLoad}>Try again</button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 && <p className="rounded-xl border border-[#D8D2C8] bg-white p-6 text-sm">No {filter ? filter.toLowerCase() + ' ' : ''}posts found.</p>}
          {posts.map((post) => {
            const images = [...post.images].sort((a, b) => a.displayOrder - b.displayOrder)
            const aiReport = generateAiReviewReport({
              id: post.id,
              contentType: 'POST',
              caption: post.caption,
              hashtags: post.hashtags,
              mediaCount: post.images.length,
            })
            return (
              <article key={post.id} className="grid min-w-0 gap-4 rounded-2xl border border-[#D8D2C8] bg-white p-4 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
                {images.length > 0 && <PostImageCarousel images={images} className="overflow-hidden rounded-xl bg-[#F4F2ED] [--post-image-height:18rem] [--post-image-ratio:4/3]" />}
                <div className="min-w-0 space-y-3 [overflow-wrap:anywhere]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-block rounded-full bg-[#EEF1EF] px-2.5 py-1 text-xs font-bold text-[#24372C]">{post.postStatus ? statusLabels[post.postStatus] : 'Status unavailable'}</span>
                    {post.creator && (
                      <span className="text-xs font-bold text-[#355642]">
                        by @{post.creator.username} {post.creator.firstName ? `(${post.creator.firstName})` : ''}
                      </span>
                    )}
                  </div>
                  <h2 className="whitespace-pre-wrap text-base font-semibold">{post.caption || 'Untitled post'}</h2>
                  {post.hashtags && <p className="text-sm font-semibold text-[#355642]">{post.hashtags}</p>}
                  <p className="text-xs text-[#526157]">User ID {post.userId}</p>

                  {/* AI Content Monitoring & Safety Card */}
                  <AiModerationCard
                    report={aiReport}
                    contentId={post.id}
                    contentType="POST"
                    onApplyRejectionReason={(autoReason) => {
                      resetRejection()
                      setRejectingId(post.id)
                      setReason(autoReason)
                    }}
                  />

                  {post.postStatus === 'REJECTED' && (
                    <div className="rounded-lg bg-[#FFF4F2] p-3 text-sm text-[#842B24]">
                      <p className="font-semibold">Rejection reason</p>
                      <p className="mt-1 whitespace-pre-wrap">{post.rejectionReason?.trim() || 'No reason provided.'}</p>
                    </div>
                  )}
                  {rejectingId === post.id ? (
                    <form className="grid gap-2" onSubmit={(event) => {
                      event.preventDefault()
                      void review(post.id, { status: 'REJECTED', rejectionReason: reason })
                    }}>
                      <label className="grid gap-1 text-sm font-semibold">
                        Rejection reason (required)
                        <textarea value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={1000} rows={3} disabled={!!reviewingId}
                          className="w-full rounded-lg border border-[#D8D2C8] px-3 py-2 text-base font-normal" />
                      </label>
                      <p className="text-xs text-[#526157]">The author will see this reason.</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={!reason.trim() || !!reviewingId} className={`${buttonClass} bg-[#842B24] text-white`}>{reviewingId === post.id ? 'Rejecting…' : 'Confirm rejection'}</button>
                        <button type="button" disabled={!!reviewingId} className={buttonClass} onClick={resetRejection}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {post.postStatus !== 'APPROVED' && <button type="button" disabled={!!reviewingId} className={`${buttonClass} bg-[#24372C] text-white enabled:hover:bg-[#355642]`} onClick={() => void review(post.id, { status: 'APPROVED' })}>{reviewingId === post.id ? 'Approving…' : 'Approve'}</button>}
                      {post.postStatus !== 'REJECTED' && <button type="button" disabled={!!reviewingId} className={`${buttonClass} text-[#842B24] enabled:hover:bg-[#FFF4F2]`} onClick={() => {
                        resetRejection()
                        setRejectingId(post.id)
                      }}>Reject</button>}
                    </div>
                  )}
                  {reviewError?.id === post.id && <p role="alert" className="text-sm text-[#842B24]">{reviewError.message}</p>}
                </div>
              </article>
            )
          })}
          {(page > 0 || !last) && (
            <div className="flex items-center justify-center gap-3" aria-label="Post review pagination">
              <button type="button" className={buttonClass} disabled={page === 0 || !!reviewingId} onClick={() => {
                resetRejection()
                loadPage(page - 1)
              }}>Previous</button>
              <span className="text-sm">Page {page + 1}</span>
              <button type="button" className={buttonClass} disabled={last || !!reviewingId} onClick={() => {
                resetRejection()
                loadPage(page + 1)
              }}>Next</button>
            </div>
          )}
        </div>
      )}
    </AdminPage>
  )
}
