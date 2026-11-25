import { useEffect, useState } from 'react'
import { CameraIcon, ReelsIcon } from '../../components/Icons'
import { api, ApiError } from '../../services/api'
import type { MediaPage, PostResponse, PostStatus, ReelResponse } from '../../services/api'
import { AdminPage, CardHeading } from '../components/AdminPageUI'

const statuses = [
  { value: 'PENDING', label: 'Pending', description: 'Waiting for review', tone: 'bg-[#FFF1CB] text-[#6D4803]', color: '#B38332' },
  { value: 'APPROVED', label: 'Approved', description: 'Eligible for the Home feed', tone: 'bg-[#DDF1E2] text-[#235437]', color: '#4B8560' },
  { value: 'REJECTED', label: 'Rejected', description: 'Returned with a decision', tone: 'bg-[#F8DDDA] text-[#842B24]', color: '#BB6960' },
] as const

type Overview = {
  postCounts: Record<'ALL' | PostStatus, number | undefined>
  reelCounts: Record<'ALL' | PostStatus, number | undefined>
  posts: PostResponse[]
  reels: ReelResponse[]
}

function total<T>(page: MediaPage<T>) {
  return page.totalElements ?? (page.last ? page.content.length : undefined)
}

function formatCount(count: number | undefined) {
  return count?.toLocaleString() ?? '—'
}

const statusClass: Record<PostStatus, string> = {
  PENDING: 'bg-[#B38332]',
  APPROVED: 'bg-[#4B8560]',
  REJECTED: 'bg-[#BB6960]',
}

function sumCounts(posts: number | undefined, reels: number | undefined) {
  return posts === undefined || reels === undefined ? undefined : posts + reels
}

function StatusChart({ overview }: { overview: Overview }) {
  const rows = [
    { label: 'Posts', icon: CameraIcon, counts: overview.postCounts },
    { label: 'Reels', icon: ReelsIcon, counts: overview.reelCounts },
  ]
  const maximum = Math.max(1, ...rows.map(({ counts }) => statuses.reduce((sum, status) => sum + (counts[status.value] ?? 0), 0)))

  return (
    <section className="min-w-0 rounded-[18px] border border-[#E2E5DF] bg-white p-4 shadow-[0_18px_50px_rgba(29,51,40,.08)] sm:p-5">
      <CardHeading title="Moderation status" subtitle="Posts and reels together, split by review decision" />
      <div className="mt-6 space-y-6">
        {rows.map(({ label, icon: Icon, counts }) => {
          const rowTotal = statuses.reduce((sum, status) => sum + (counts[status.value] ?? 0), 0)
          return (
            <div key={label} className="grid grid-cols-[5.5rem_minmax(0,1fr)_3rem] items-center gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-[#34473D]"><Icon className="size-4" />{label}</span>
              <div className="h-5 overflow-hidden rounded-full bg-[#EEF1EF]" role="img" aria-label={`${label}: ${statuses.map(({ value, label: statusLabel }) => `${statusLabel} ${formatCount(counts[value])}`).join(', ')}`}>
                <div className="flex h-full overflow-hidden rounded-full" style={{ width: `${rowTotal / maximum * 100}%` }}>
                  {statuses.map(({ value, label: statusLabel }) => {
                    const count = counts[value] ?? 0
                    return count > 0 ? <span key={value} title={`${statusLabel}: ${formatCount(count)}`} className={`${statusClass[value]} h-full`} style={{ width: `${rowTotal ? count / rowTotal * 100 : 0}%` }} /> : null
                  })}
                </div>
              </div>
              <span className="text-right text-sm font-bold tabular-nums text-[#1E2A23]">{formatCount(counts.ALL)}</span>
            </div>
          )
        })}
      </div>
      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#EAE7DF] pt-4">
        {statuses.map(({ value, label, color }) => (
          <li key={value} className="flex items-center gap-2 text-xs text-[#526157]"><span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</li>
        ))}
      </ul>
    </section>
  )
}

function UploadMixChart({ postCount, reelCount }: { postCount: number | undefined; reelCount: number | undefined }) {
  const totalCount = sumCounts(postCount, reelCount)
  const postPercent = totalCount ? (postCount ?? 0) / totalCount * 100 : 0
  const reelPercent = totalCount ? (reelCount ?? 0) / totalCount * 100 : 0

  return (
    <section className="min-w-0 rounded-[18px] border border-[#E2E5DF] bg-white p-4 shadow-[0_18px_50px_rgba(29,51,40,.08)] sm:p-5">
      <CardHeading title="Upload mix" subtitle="Share of all submitted content" />
      <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
        <div role="img" aria-label={`Upload mix: ${formatCount(postCount)} posts and ${formatCount(reelCount)} reels`}
          className="grid size-36 shrink-0 place-items-center rounded-full"
          style={{ background: totalCount ? `conic-gradient(#4B8560 0 ${postPercent}%, #527B9B ${postPercent}% 100%)` : '#EEF1EF' }}>
          <div className="grid size-24 content-center justify-items-center rounded-full bg-white text-center">
            <strong className="text-2xl tabular-nums text-[#1E2A23]">{formatCount(totalCount)}</strong>
            <span className="text-xs text-[#526157]">Total uploads</span>
          </div>
        </div>
        <dl className="grid min-w-36 gap-4">
          <div><dt className="flex items-center gap-2 text-xs text-[#526157]"><span aria-hidden="true" className="size-2.5 rounded-full bg-[#4B8560]" />Posts</dt><dd className="ml-[18px] mt-0.5 text-lg font-bold tabular-nums text-[#1E2A23]">{formatCount(postCount)}{postPercent > 0 && <span className="ms-2 text-xs font-medium text-[#526157]">{postPercent.toFixed(1)}%</span>}</dd></div>
          <div><dt className="flex items-center gap-2 text-xs text-[#526157]"><span aria-hidden="true" className="size-2.5 rounded-full bg-[#527B9B]" />Reels</dt><dd className="ml-[18px] mt-0.5 text-lg font-bold tabular-nums text-[#1E2A23]">{formatCount(reelCount)}{reelPercent > 0 && <span className="ms-2 text-xs font-medium text-[#526157]">{reelPercent.toFixed(1)}%</span>}</dd></div>
        </dl>
      </div>
    </section>
  )
}

function RecentSubmissions({ posts, reels }: { posts: PostResponse[]; reels: ReelResponse[] }) {
  const recent = [
    ...posts.map((post) => ({
      id: `post-${post.id}`,
      title: post.caption || 'Untitled post',
      type: 'Post' as const,
      image: [...post.images].sort((a, b) => a.displayOrder - b.displayOrder)[0]?.imageUrl,
      status: post.postStatus,
      date: post.createdAt ? new Date(post.createdAt).getTime() : 0,
    })),
    ...reels.map((reel) => ({
      id: `reel-${reel.id}`,
      title: reel.caption || 'Untitled reel',
      type: 'Reel' as const,
      image: reel.coverUrl || undefined,
      status: reel.reelStatus,
      date: reel.createdAt ? new Date(reel.createdAt).getTime() : 0,
    })),
  ].sort((a, b) => b.date - a.date).slice(0, 8)

  if (!recent.length) return <p className="mt-4 text-sm text-[#526157]">No content has been submitted yet.</p>

  return (
    <ul className="mt-3 divide-y divide-[#EAE7DF]">
      {recent.map((item) => {
        const status = statuses.find(({ value }) => value === item.status)
        const Icon = item.type === 'Post' ? CameraIcon : ReelsIcon
        return (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#EEF1EF] text-[#526157]">
              {item.image ? <img src={item.image} alt="" loading="lazy" className="size-full object-cover" /> : <Icon className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-[#526157]">{item.type}{item.date ? ` · ${new Date(item.date).toLocaleDateString()}` : ''}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${status?.tone ?? 'bg-[#EEF1EF] text-[#526157]'}`}>{status?.label ?? 'Unknown'}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview>()
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      api.posts.listForReview(0, 6),
      api.posts.listForReview(0, 1, 'PENDING'),
      api.posts.listForReview(0, 1, 'APPROVED'),
      api.posts.listForReview(0, 1, 'REJECTED'),
      api.reels.listForReview(0, 6),
      api.reels.listForReview(0, 1, 'PENDING'),
      api.reels.listForReview(0, 1, 'APPROVED'),
      api.reels.listForReview(0, 1, 'REJECTED'),
    ]).then(([allPosts, pendingPosts, approvedPosts, rejectedPosts, allReels, pendingReels, approvedReels, rejectedReels]) => {
      if (!active) return
      setOverview({
        postCounts: { ALL: total(allPosts), PENDING: total(pendingPosts), APPROVED: total(approvedPosts), REJECTED: total(rejectedPosts) },
        reelCounts: { ALL: total(allReels), PENDING: total(pendingReels), APPROVED: total(approvedReels), REJECTED: total(rejectedReels) },
        posts: allPosts.content,
        reels: allReels.content,
      })
    }).catch((cause: unknown) => {
      if (!active) return
      setError(cause instanceof ApiError && cause.status === 403
        ? 'This account does not have permission to view moderation data.'
        : cause instanceof Error ? cause.message : 'Please try again.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [refresh])

  function reload() {
    setLoading(true)
    setError('')
    setRefresh((value) => value + 1)
  }

  return (
    <AdminPage eyebrow="MODERATION" title="Overview" subtitle="Combined activity and review status for all posts and reels."
      actions={<button type="button" className="inline-flex items-center justify-center rounded-[9px] border border-[#E2E5DF] bg-white px-[14px] py-[10px] text-[9px] font-extrabold text-[#34473D] transition-colors hover:border-[#AEBCB2] hover:bg-[#EEF2ED] hover:text-[#1D3328] disabled:opacity-50 max-[760px]:flex-1 max-[760px]:text-xs" onClick={reload} disabled={loading}>{loading && overview ? 'Refreshing…' : 'Refresh'}</button>}>
      {loading && !overview && (
        <div role="status" className="mb-4">
          <span className="sr-only">Loading unified content statistics…</span>
          <div aria-hidden="true" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 rounded-2xl border border-[#D8D2C8] bg-[#E6ECE7] motion-safe:animate-pulse" />)}
          </div>
        </div>
      )}
      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-[#EAC5C0] bg-[#FFF4F2] p-4 text-sm text-[#842B24]">
          <p className="font-semibold">Could not refresh the moderation overview.</p>
          <p className="mt-1">{error}{overview ? ' Showing the last successful results.' : ''}</p>
        </div>
      )}
      {overview && (
        <div aria-busy={loading} className="space-y-5">
          {(() => {
            const postTotal = overview.postCounts.ALL
            const reelTotal = overview.reelCounts.ALL
            const totalUploads = sumCounts(postTotal, reelTotal)
            const approvedPosts = overview.postCounts.APPROVED
            const approvedReels = overview.reelCounts.APPROVED
            const approved = sumCounts(approvedPosts, approvedReels)
            const pendingPosts = overview.postCounts.PENDING
            const pendingReels = overview.reelCounts.PENDING
            const pending = sumCounts(pendingPosts, pendingReels)
            const rejectedPosts = overview.postCounts.REJECTED
            const rejectedReels = overview.reelCounts.REJECTED
            const rejected = sumCounts(rejectedPosts, rejectedReels)
            const notApproved = sumCounts(
              pendingPosts === undefined || rejectedPosts === undefined ? undefined : pendingPosts + rejectedPosts,
              pendingReels === undefined || rejectedReels === undefined ? undefined : pendingReels + rejectedReels,
            )
            const metrics = [
              { label: 'Total uploads', count: totalUploads, detail: `${formatCount(postTotal)} posts · ${formatCount(reelTotal)} reels`, color: '#24372C' },
              { label: 'Approved', count: approved, detail: `${formatCount(approvedPosts)} posts · ${formatCount(approvedReels)} reels`, color: '#4B8560' },
              { label: 'Not approved', count: notApproved, detail: `${formatCount(pending)} pending · ${formatCount(rejected)} rejected`, color: '#BB6960' },
              { label: 'Pending review', count: pending, detail: `${formatCount(pendingPosts)} posts · ${formatCount(pendingReels)} reels`, color: '#B38332' },
            ]

            return (
              <>
                <section aria-label="Combined content statistics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {metrics.map(({ label, count, detail, color }) => (
                    <article key={label} className="min-w-0 rounded-2xl border border-[#D8D2C8] bg-white p-4 shadow-none motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-[3px] motion-safe:hover:shadow-[0_14px_28px_rgba(29,51,40,.09)]">
                      <span className="text-xs font-semibold text-[#526157]">{label}</span>
                      <p className="mt-2 text-3xl font-bold tabular-nums" style={{ color }}>{formatCount(count)}</p>
                      <p className="mt-1 text-xs text-[#657067]">{detail}</p>
                    </article>
                  ))}
                </section>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.8fr)]">
                  <StatusChart overview={overview} />
                  <UploadMixChart postCount={postTotal} reelCount={reelTotal} />
                </div>

                <section className="min-w-0 rounded-[18px] border border-[#E2E5DF] bg-white p-4 shadow-[0_18px_50px_rgba(29,51,40,.08)] sm:p-5">
                  <CardHeading title="Recent submissions" subtitle="Latest posts and reels in the moderation queue" />
                  <RecentSubmissions posts={overview.posts} reels={overview.reels} />
                </section>
              </>
            )
          })()}
        </div>
      )}
    </AdminPage>
  )
}
