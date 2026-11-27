import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PostImageCarousel from '../../components/PostImageCarousel'
import { api, ApiError, getStoredAdminAuth } from '../../services/api'
import type { ContentReviewDecision, MediaPage, PostResponse, PostStatus } from '../../services/api'
import { readPageCache, writePageCache } from '../../services/pageCache'
import { AdminPage } from '../components/AdminPageUI'
import { generateAiReviewReport } from '../../services/aiModerator'
import { AiModerationCard } from '../components/AiModerationCard'
import { UploaderIdentity } from '../components/UploaderIdentity'

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
  const cacheOwner = getStoredAdminAuth()?.user.id ?? 'anonymous'
  const initialCacheKey = `admin:${cacheOwner}:posts:${filter ?? 'ALL'}:0`
  const [cachedPage] = useState(() => readPageCache<MediaPage<PostResponse>>(initialCacheKey))
  const [page, setPage] = useState(0)
  const [refresh, setRefresh] = useState(0)
  const [posts, setPosts] = useState<PostResponse[]>(cachedPage?.content ?? [])
  const [last, setLast] = useState(cachedPage?.last ?? false)
  const [loading, setLoading] = useState(!cachedPage)
  const [loadError, setLoadError] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [reviewError, setReviewError] = useState<{ id: string; message: string } | null>(null)
  const [notice, setNotice] = useState('')
  const hasLoadedRef = useRef(Boolean(cachedPage))

  useEffect(() => {
    let active = true
    api.posts.listForReview(page, 20, filter).then((result) => {
      if (!active) return
      setPosts(result.content)
      setLast(result.last)
      setLoadError('')
      hasLoadedRef.current = true
      writePageCache(`admin:${cacheOwner}:posts:${filter ?? 'ALL'}:${page}`, result)
    }).catch((cause: unknown) => {
      if (!active || hasLoadedRef.current) return
      setLoadError(cause instanceof ApiError && cause.status === 403
        ? 'This account does not have Post Review permission. Sign in with an authorized admin account.'
        : cause instanceof Error ? cause.message : 'Please try again.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [cacheOwner, filter, page, refresh])

  function loadPage(nextPage: number) {
    setLoadError('')
    const cached = readPageCache<MediaPage<PostResponse>>(`admin:${cacheOwner}:posts:${filter ?? 'ALL'}:${nextPage}`)
    if (cached) {
      setPosts(cached.content)
      setLast(cached.last)
    }
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
              const cached = readPageCache<MediaPage<PostResponse>>(`admin:${cacheOwner}:posts:${value ?? 'ALL'}:0`)
              if (cached) {
                setPosts(cached.content)
                setLast(cached.last)
              }
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
              <article key={post.id} className="mx-auto grid w-full max-w-[72rem] min-w-0 items-start gap-4 rounded-2xl border border-[#D8D2C8] bg-white p-3.5 md:grid-cols-[280px_minmax(0,1fr)]">
                <div className="min-w-0 md:col-span-2">
                  <UploaderIdentity creator={post.creator} />
                </div>
                {images.length > 0 && <PostImageCarousel images={images} eager className="w-full self-start overflow-hidden rounded-xl border border-[#E7E2D9] bg-[#F4F2ED] [--post-image-height:260px] [--post-image-ratio:4/3]" />}
                <div className="min-w-0 space-y-2.5 [overflow-wrap:anywhere]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-block rounded-full bg-[#EEF1EF] px-2.5 py-0.5 text-xs font-bold text-[#24372C]">{post.postStatus ? statusLabels[post.postStatus] : 'Status unavailable'}</span>
                  </div>
                  <h2 className="whitespace-pre-wrap text-sm font-semibold text-[#1C2820]">{post.caption || 'Untitled post'}</h2>
                  {post.hashtags && <p className="text-xs font-semibold text-[#355642]">{post.hashtags}</p>}

                  {/* AI Content Monitoring & Safety Card */}
                  <AiModerationCard
                    report={aiReport}
                    contentId={post.id}
                    contentType="POST"
                    onApplyRejectionReason={(autoReason) => {
                      setRejectingId(post.id)
                      setReason(autoReason)
                    }}
                  />

                  {/* Prominent Action Bar at Bottom of Card */}
                  {rejectingId !== post.id && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#E3DFD5] bg-[#FAF8F5] p-2.5 shadow-2xs">
                      <span className="text-xs font-medium text-[#526157]">Decision:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {post.postStatus !== 'APPROVED' && (
                          <button
                            type="button"
                            disabled={!!reviewingId}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => void review(post.id, { status: 'APPROVED' })}
                          >
                            <span>✓</span>
                            <span>{reviewingId === post.id ? 'Approving…' : 'Approve (Okay)'}</span>
                          </button>
                        )}
                        {post.postStatus !== 'REJECTED' && (
                          <button
                            type="button"
                            disabled={!!reviewingId}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => {
                              resetRejection()
                              setRejectingId(post.id)
                            }}
                          >
                            <span>✕</span>
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {post.postStatus === 'REJECTED' && (
                    <div className="rounded-lg bg-[#FFF4F2] p-2.5 text-xs text-[#842B24]">
                      <p className="font-semibold">Rejection reason</p>
                      <p className="mt-0.5 whitespace-pre-wrap">{post.rejectionReason?.trim() || 'No reason provided.'}</p>
                    </div>
                  )}

                  {/* Compact Rejection Drawer - Only shown when Reject is clicked */}
                  {rejectingId === post.id && (
                    <form className="mt-2 grid gap-2 rounded-xl border border-rose-200 bg-rose-50/60 p-3" onSubmit={(event) => {
                      event.preventDefault()
                      void review(post.id, { status: 'REJECTED', rejectionReason: reason })
                    }}>
                      <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
                        <span>Rejection Reason (required)</span>
                        <span className="text-[11px] text-rose-700 font-normal">Author will see this feedback</span>
                      </div>
                      <textarea value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={1000} rows={2} disabled={!!reviewingId}
                        placeholder="State reason for rejecting this post..."
                        className="w-full rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-normal text-stone-900 focus:border-rose-500 focus:outline-none" />
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={!reason.trim() || !!reviewingId} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-800 disabled:opacity-50">
                          <span>✕</span>
                          <span>{reviewingId === post.id ? 'Rejecting…' : 'Confirm Rejection'}</span>
                        </button>
                        <button type="button" disabled={!!reviewingId} className="rounded-lg border border-[#D8D2C8] bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-[#F1EEE7]" onClick={resetRejection}>Cancel</button>
                      </div>
                    </form>
                  )}
                  {reviewError?.id === post.id && <p role="alert" className="text-xs text-[#842B24]">{reviewError.message}</p>}
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
