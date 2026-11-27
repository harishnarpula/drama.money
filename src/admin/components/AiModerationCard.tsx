import { useEffect, useState } from 'react'
import type { AiReviewReport } from '../../services/aiModerator'
import { api } from '../../services/api'

interface AiModerationCardProps {
  report: AiReviewReport
  contentId?: string
  contentType?: 'POST' | 'REEL'
  onApplyRejectionReason?: (reason: string) => void
}

export function AiModerationCard({
  report: initialReport,
  contentId,
  contentType,
  onApplyRejectionReason,
}: AiModerationCardProps) {
  const [report, setReport] = useState<AiReviewReport>(initialReport)
  const [showDetails, setShowDetails] = useState(false)
  const [isBackendVerified, setIsBackendVerified] = useState(false)

  // Fetch real backend AI review from Spring Boot API (stored in PostgreSQL db)
  useEffect(() => {
    if (!contentId || !contentType) return
    let active = true

    const fetcher =
      contentType === 'POST'
        ? api.ai.getPostReview(contentId)
        : api.ai.getReelReview(contentId)

    fetcher
      .then((backendReport) => {
        if (!active || !backendReport) return
        setReport(backendReport)
        setIsBackendVerified(true)
      })
      .catch((err) => {
        console.debug('Backend AI API note:', err)
      })

    return () => {
      active = false
    }
  }, [contentId, contentType])

  const isClean = report.riskLevel === 'CLEAN'
  const isDoubt = report.riskLevel === 'DOUBT'

  const scoreBadgeBg = isClean
    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
    : isDoubt
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-rose-100 text-rose-900 border-rose-300'

  return (
    <div className="rounded-xl border border-[#DCE3DC] bg-[#F7FAF7] p-3 text-xs shadow-2xs space-y-2">
      {/* 1. Score & Type of Reel/Post (Main Highlight) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3ECE3] pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#24372C] px-2.5 py-1 text-xs font-bold text-white">
            <span>🎯 Type:</span>
            <span className="text-emerald-300">{report.detectedCategory || 'General Guidance'}</span>
          </span>

          {isBackendVerified && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800" title="Cached in database">
              ⚡ Saved in DB
            </span>
          )}
        </div>

        {/* Safety Score Meter */}
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-black ${scoreBadgeBg}`}>
          <span>Score: {report.safetyScore}/100</span>
          <span>·</span>
          <span>{report.riskLevel === 'CLEAN' ? '✓ Clean' : report.riskLevel === 'DOUBT' ? '⚠ Review Needed' : '✕ High Risk'}</span>
        </span>
      </div>

      {/* 2. Below: Crisp AI Summary */}
      <div className="pt-0.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#4E6754]">AI Review Summary</p>
        <p className="mt-0.5 text-xs font-medium leading-relaxed text-[#233529]">
          {report.summary}
        </p>
      </div>

      {/* AI suggested rejection reason chip (if content is doubtful or high risk) */}
      {report.suggestedRejectionReason && onApplyRejectionReason && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-rose-50/80 p-2 border border-rose-200">
          <p className="text-[11px] text-rose-900 leading-tight">
            <strong>AI Note:</strong> {report.suggestedRejectionReason}
          </p>
          <button
            type="button"
            onClick={() => onApplyRejectionReason(report.suggestedRejectionReason!)}
            className="shrink-0 rounded bg-rose-700 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-800 transition active:scale-95"
          >
            Use for Reject
          </button>
        </div>
      )}

      {/* Optional details toggle */}
      <div className="flex items-center justify-between border-t border-[#EAEFEA] pt-1.5 text-[11px] text-[#5A695D]">
        <span>Language: {report.languageDetected}</span>
        <button
          type="button"
          onClick={() => setShowDetails((p) => !p)}
          className="text-[#2F4A37] font-semibold underline hover:text-black"
        >
          {showDetails ? 'Hide details ▲' : 'View checks ▼'}
        </button>
      </div>

      {showDetails && (
        <div className="space-y-1 rounded bg-white p-2 border border-[#E0E7E0] text-[11px]">
          {report.checks?.map((check) => (
            <div key={check.id} className="flex items-start gap-1.5">
              <span className={`shrink-0 font-bold ${check.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {check.passed ? '✓' : '✕'}
              </span>
              <span><strong>{check.label}:</strong> {check.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
