import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../../services/api'
import type { ContentReviewDecision, PostStatus, ReelResponse } from '../../services/api'
import { AdminPage } from '../components/AdminPageUI'
import { generateAiReviewReport } from '../../services/aiModerator'
import { AiModerationCard } from '../components/AiModerationCard'

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

  return <ReelReviewQueue key={status ?? 'ALL'} filter={status} onFilterChange={(value) => setParams({ status: value ?? 'ALL' })} />
}

function ReelReviewQueue({ filter, onFilterChange }: { filter: PostStatus | undefined; onFilterChange: (filter: PostStatus | undefined) => void }) {
  const [page, setPage] = useState(0)
  const [refresh, setRefresh] = useState(0)
  const [reels, setReels] = useState<ReelResponse[]>([])
  const [last, setLast] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [reviewError, setReviewError] = useState<{ id: string; message: string } | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    api.reels.listForReview(page, 20, filter).then((result) => {
      if (!active) return
      setReels(result.content)
      setLast(result.last)
    }).catch((cause: unknown) => {
      if (!active) return
      setLoadError(cause instanceof ApiError && cause.status === 403
        ? 'This account does not have Reel Review permission. Sign in with an authorized admin account.'
        : cause instanceof Error ? cause.message : 'Please try again.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [filter, page, refresh])

  function loadPage(nextPage: number) {
    setLoading(true)
    setLoadError('')
    setPage(nextPage)
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
      loadPage(0)
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
          <button type="button" className={buttonClass} onClick={() => loadPage(page)}>Try again</button>
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
              <article key={reel.id} className="grid min-w-0 gap-4 rounded-2xl border border-[#D8D2C8] bg-white p-4 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
                <video controls preload="metadata" poster={reel.coverUrl || undefined} src={reel.videoUrl} className="max-h-[28rem] w-full rounded-xl bg-[#172D25] object-contain" aria-label="Reel submitted for review" />
                <div className="min-w-0 space-y-3 [overflow-wrap:anywhere]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-block rounded-full bg-[#EEF1EF] px-2.5 py-1 text-xs font-bold text-[#24372C]">{reel.reelStatus ? statusLabels[reel.reelStatus] : 'Status unavailable'}</span>
                    {reel.creator && (
                      <span className="text-xs font-bold text-[#355642]">
                        by @{reel.creator.username} {reel.creator.firstName ? `(${reel.creator.firstName})` : ''}
                      </span>
                    )}
                  </div>
                  <h2 className="whitespace-pre-wrap text-base font-semibold">{reel.caption || 'Untitled reel'}</h2>
                  {reel.hashtags && <p className="text-sm font-semibold text-[#355642]">{reel.hashtags}</p>}
                  <p className="text-xs text-[#526157]">User ID {reel.userId}</p>

                  {/* AI Content Monitoring & Safety Card */}
                  <AiModerationCard
                    report={aiReport}
                    contentId={reel.id}
                    contentType="REEL"
                    onApplyRejectionReason={(autoReason) => {
                      resetRejection()
                      setRejectingId(reel.id)
                      setReason(autoReason)
                    }}
                  />

                  {reel.reelStatus === 'REJECTED' && (
                  <div className="rounded-lg bg-[#FFF4F2] p-3 text-sm text-[#842B24]">
                    <p className="font-semibold">Rejection reason</p>
                    <p className="mt-1 whitespace-pre-wrap">{reel.rejectionReason?.trim() || 'No reason provided.'}</p>
                  </div>
                )}
                {rejectingId === reel.id ? (
                  <form className="grid gap-2" onSubmit={(event) => {
                    event.preventDefault()
                    void review(reel.id, { status: 'REJECTED', rejectionReason: reason })
                  }}>
                    <label className="grid gap-1 text-sm font-semibold">
                      Rejection reason (required)
                      <textarea value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={1000} rows={3} disabled={!!reviewingId}
                        className="w-full rounded-lg border border-[#D8D2C8] px-3 py-2 text-base font-normal" />
                    </label>
                    <p className="text-xs text-[#526157]">The author will see this reason.</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" disabled={!reason.trim() || !!reviewingId} className={`${buttonClass} bg-[#842B24] text-white`}>{reviewingId === reel.id ? 'Rejecting…' : 'Confirm rejection'}</button>
                      <button type="button" disabled={!!reviewingId} className={buttonClass} onClick={resetRejection}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {reel.reelStatus !== 'APPROVED' && <button type="button" disabled={!!reviewingId} className={`${buttonClass} bg-[#24372C] text-white enabled:hover:bg-[#355642]`} onClick={() => void review(reel.id, { status: 'APPROVED' })}>{reviewingId === reel.id ? 'Approving…' : 'Approve'}</button>}
                    {reel.reelStatus !== 'REJECTED' && <button type="button" disabled={!!reviewingId} className={`${buttonClass} text-[#842B24] enabled:hover:bg-[#FFF4F2]`} onClick={() => {
                      resetRejection()
                      setRejectingId(reel.id)
                    }}>Reject</button>}
                  </div>
                )}
                {reviewError?.id === reel.id && <p role="alert" className="text-sm text-[#842B24]">{reviewError.message}</p>}
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
