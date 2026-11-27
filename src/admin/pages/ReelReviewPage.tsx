import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, ApiError, getStoredAdminAuth } from '../../services/api'
import type { ContentReviewDecision, MediaPage, PostStatus, ReelResponse } from '../../services/api'
import { readPageCache, writePageCache } from '../../services/pageCache'
import { AdminPage } from '../components/AdminPageUI'
import { generateAiReviewReport } from '../../services/aiModerator'
import { AiModerationCard } from '../components/AiModerationCard'
import { UploaderIdentity } from '../components/UploaderIdentity'

const filters = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'All reels', value: undefined },
] satisfies { label: string; value: PostStatus | undefined }[]

const statusLabels = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' }
const buttonClass = 'rounded-lg border border-[#D8D2C8] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50'

export function ReelReviewPage() {
  const [params, setParams] = useSearchParams()
  const filter = params.get('status')
  const status = filter === 'ALL' ? undefined : filter === 'APPROVED' || filter === 'REJECTED' ? filter : 'PENDING'

  return <ReelReviewQueue filter={status} onFilterChange={(value) => setParams({ status: value ?? 'ALL' })} />
}

function ReelReviewQueue({ filter, onFilterChange }: { filter: PostStatus | undefined; onFilterChange: (filter: PostStatus | undefined) => void }) {
  const cacheOwner = getStoredAdminAuth()?.user.id ?? 'anonymous'
  const initialCacheKey = `admin:${cacheOwner}:reels:${filter ?? 'ALL'}:0`
  const [cachedPage] = useState(() => readPageCache<MediaPage<ReelResponse>>(initialCacheKey))
  const [page, setPage] = useState(0)
  const [refresh, setRefresh] = useState(0)
  const [reels, setReels] = useState<ReelResponse[]>(cachedPage?.content ?? [])
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
    api.reels.listForReview(page, 20, filter).then((result) => {
      if (!active) return
      setReels(result.content)
      setLast(result.last)
      setLoadError('')
      hasLoadedRef.current = true
      writePageCache(`admin:${cacheOwner}:reels:${filter ?? 'ALL'}:${page}`, result)
    }).catch((cause: unknown) => {
      if (!active || hasLoadedRef.current) return
      setLoadError(cause instanceof ApiError && cause.status === 403
        ? 'This account does not have Reel Review permission. Sign in with an authorized admin account.'
        : cause instanceof Error ? cause.message : 'Please try again.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [cacheOwner, filter, page, refresh])

  function loadPage(nextPage: number) {
    setLoadError('')
    const cached = readPageCache<MediaPage<ReelResponse>>(`admin:${cacheOwner}:reels:${filter ?? 'ALL'}:${nextPage}`)
    if (cached) {
      setReels(cached.content)
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

  async function review(reelId: string, decision: ContentReviewDecision) {
    if (loading || reviewingId) return
    setReviewError(null)
    setNotice('')
    setReviewingId(reelId)
    try {
      await api.moderation.review({ contentType: 'REEL', contentId: reelId, ...decision })
      resetRejection()
      setNotice(decision.status === 'APPROVED' ? 'Reel approved.' : 'Reel rejected.')
      setReels((current) => current.flatMap((reel) => {
        if (reel.id !== reelId) return [reel]
        if (filter !== undefined && filter !== decision.status) return []
        return [{
          ...reel,
          reelStatus: decision.status,
          rejectionReason: decision.status === 'REJECTED' ? decision.rejectionReason.trim() : null,
        }]
      }))
      // Reconcile pagination and server-calculated fields without replacing the page with a loader.
      setRefresh((value) => value + 1)
    } catch (cause) {
      setReviewError({ id: reelId, message: cause instanceof Error ? cause.message : 'Could not save the review.' })
    } finally {
      setReviewingId(null)
    }
  }

  return (
    <AdminPage eyebrow="MODERATION" title="Reel Review" subtitle="Review video reels submitted by users.">
      <nav aria-label="Filter by moderation status" className="mb-4 flex flex-wrap gap-2">
        {filters.map(({ label, value }) => (
          <button key={label} type="button" aria-pressed={filter === value} disabled={!!reviewingId}
            className={`${buttonClass} ${filter === value ? 'bg-[#24372C] text-white' : 'bg-white text-[#24372C] hover:bg-[#F1EEE7]'}`}
            onClick={() => {
              if (filter === value) return
              const cached = readPageCache<MediaPage<ReelResponse>>(`admin:${cacheOwner}:reels:${value ?? 'ALL'}:0`)
              if (cached) {
                setReels(cached.content)
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
        <div role="status" className="space-y-3">
          <span className="sr-only">Loading reels for review…</span>
          {[0, 150, 300].map((delay) => <div key={delay} aria-hidden="true" className="h-52 rounded-2xl border border-[#D8D2C8] bg-linear-to-br from-[#DCE7DA] via-[#F1F4ED] to-[#E9E4D9] motion-safe:animate-pulse" style={{ animationDelay: `${delay}ms` }} />)}
        </div>
      ) : loadError ? (
        <div className="space-y-3 rounded-xl border border-[#EAC5C0] bg-[#FFF4F2] p-4">
          <p role="alert" className="text-sm text-[#842B24]">Could not load reels. {loadError}</p>
          <button type="button" className={buttonClass} onClick={retryInitialLoad}>Try again</button>
        </div>
      ) : (
        <div className="space-y-4">
          {reels.length === 0 && <p className="rounded-xl border border-[#D8D2C8] bg-white p-6 text-sm">No {filter ? filter.toLowerCase() + ' ' : ''}reels found.</p>}
          {reels.map((reel) => {
            const aiReport = generateAiReviewReport({
              id: reel.id,
              contentType: 'REEL',
              caption: reel.caption,
              hashtags: reel.hashtags,
              hasVideo: !!reel.videoUrl,
            })
            return (
              <article key={reel.id} className="mx-auto grid w-full max-w-[72rem] min-w-0 items-start gap-4 rounded-2xl border border-[#D8D2C8] bg-white p-3.5 md:grid-cols-[190px_minmax(0,1fr)]">
                <div className="min-w-0 md:col-span-2">
                  <UploaderIdentity creator={reel.creator} />
                </div>
                {/* Compact Reel Player */}
                <div className="flex justify-center rounded-xl border border-[#E1DDD4] bg-[#172D25] p-1.5 w-[190px] mx-auto md:mx-0">
                  <video controls preload="metadata" poster={reel.coverUrl || undefined} src={reel.videoUrl} className="aspect-[9/16] h-[300px] w-auto rounded-lg bg-black object-contain" aria-label="Reel submitted for review" />
                </div>
                <div className="min-w-0 space-y-2.5 [overflow-wrap:anywhere]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-block rounded-full bg-[#EEF1EF] px-2.5 py-0.5 text-xs font-bold text-[#24372C]">{reel.reelStatus ? statusLabels[reel.reelStatus] : 'Status unavailable'}</span>
                  </div>
                  <h2 className="whitespace-pre-wrap text-sm font-semibold text-[#1C2820]">{reel.caption || 'Untitled reel'}</h2>
                  {reel.hashtags && <p className="text-xs font-semibold text-[#355642]">{reel.hashtags}</p>}

                  {/* AI Content Monitoring & Safety Card (Score + Type + Summary) */}
                  <AiModerationCard
                    report={aiReport}
                    contentId={reel.id}
                    contentType="REEL"
                    onApplyRejectionReason={(autoReason) => {
                      setRejectingId(reel.id)
                      setReason(autoReason)
                    }}
                  />

                  {/* Prominent Action Bar at Bottom of Card */}
                  {rejectingId !== reel.id && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#E3DFD5] bg-[#FAF8F5] p-2.5 shadow-2xs">
                      <span className="text-xs font-medium text-[#526157]">Decision:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {reel.reelStatus !== 'APPROVED' && (
                          <button
                            type="button"
                            disabled={!!reviewingId}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => void review(reel.id, { status: 'APPROVED' })}
                          >
                            <span>✓</span>
                            <span>{reviewingId === reel.id ? 'Approving…' : 'Approve (Okay)'}</span>
                          </button>
                        )}
                        {reel.reelStatus !== 'REJECTED' && (
                          <button
                            type="button"
                            disabled={!!reviewingId}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => {
                              resetRejection()
                              setRejectingId(reel.id)
                            }}
                          >
                            <span>✕</span>
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {reel.reelStatus === 'REJECTED' && (
                    <div className="rounded-lg bg-[#FFF4F2] p-2.5 text-xs text-[#842B24]">
                      <p className="font-semibold">Rejection reason</p>
                      <p className="mt-0.5 whitespace-pre-wrap">{reel.rejectionReason?.trim() || 'No reason provided.'}</p>
                    </div>
                  )}

                  {/* Compact Rejection Drawer - Only shown when Reject is clicked */}
                  {rejectingId === reel.id && (
                    <form className="mt-2 grid gap-2 rounded-xl border border-rose-200 bg-rose-50/60 p-3" onSubmit={(event) => {
                      event.preventDefault()
                      void review(reel.id, { status: 'REJECTED', rejectionReason: reason })
                    }}>
                      <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
                        <span>Rejection Reason (required)</span>
                        <span className="text-[11px] text-rose-700 font-normal">Author will see this feedback</span>
                      </div>
                      <textarea value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={1000} rows={2} disabled={!!reviewingId}
                        placeholder="State reason for rejecting this reel..."
                        className="w-full rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-normal text-stone-900 focus:border-rose-500 focus:outline-none" />
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={!reason.trim() || !!reviewingId} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-800 disabled:opacity-50">
                          <span>✕</span>
                          <span>{reviewingId === reel.id ? 'Rejecting…' : 'Confirm Rejection'}</span>
                        </button>
                        <button type="button" disabled={!!reviewingId} className="rounded-lg border border-[#D8D2C8] bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-[#F1EEE7]" onClick={resetRejection}>Cancel</button>
                      </div>
                    </form>
                  )}
                  {reviewError?.id === reel.id && <p role="alert" className="text-xs text-[#842B24]">{reviewError.message}</p>}
                </div>
            </article>
          )
        })}
          {(page > 0 || !last) && (
            <div className="flex items-center justify-center gap-3" aria-label="Reel review pagination">
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
