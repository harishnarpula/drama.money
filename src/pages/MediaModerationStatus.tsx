import type { PostStatus } from '../services/api'

const statuses = {
  PENDING: { label: 'Pending review', color: 'bg-[#FFF1C9] text-[#654302]' },
  APPROVED: { label: 'Approved', color: 'bg-[#DDF1E2] text-[#235437]' },
  REJECTED: { label: 'Rejected', color: 'bg-[#F8DDDA] text-[#842B24]' },
}

export function MediaStatusBadge({ status, className = '' }: { status: PostStatus; className?: string }) {
  const { label, color } = statuses[status]
  return <span className={`inline-block max-w-full rounded-full px-2 py-1 text-xs font-semibold ${color} ${className}`}>{label}</span>
}

export function RejectionReason({ reason }: { reason?: string | null }) {
  return (
    <div className="min-w-0 rounded-lg border border-[#EAC5C0] border-s-4 border-s-[#C95C52] bg-[#FFF4F2] px-3 py-3 text-sm leading-relaxed text-[#842B24]">
      <p className="font-bold">Why this was rejected</p>
      <p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{reason?.trim() || 'No reason was provided. Contact support if you need help.'}</p>
    </div>
  )
}
