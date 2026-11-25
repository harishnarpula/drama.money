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
  const [loadingBackend, setLoadingBackend] = useState(() => Boolean(contentId && contentType))

  // Fetch real backend AI review from Spring Boot API
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
        // Fall back gracefully to initial evaluation
        console.debug('Backend AI API note:', err)
      })
      .finally(() => {
        if (active) setLoadingBackend(false)
      })

    return () => {
      active = false
    }
  }, [contentId, contentType])

  const isClean = report.riskLevel === 'CLEAN'
  const isDoubt = report.riskLevel === 'DOUBT'

  const scoreBadgeBg = isClean
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : isDoubt
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-rose-50 text-rose-800 border-rose-200'

  const riskBadgeBg = isClean
    ? 'bg-emerald-600 text-white'
    : isDoubt
    ? 'bg-amber-500 text-white'
    : 'bg-rose-600 text-white'

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#D8D2C8] bg-white shadow-sm transition">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBE7DF] bg-[#F9FAF8] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-[#24372C] text-xs font-black text-white">
            AI
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#35483B]">
            Backend AI Review
          </span>
          {isBackendVerified && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
              ⚡ Stored DB History {report.analyzedAt ? `· ${new Date(report.analyzedAt).toLocaleDateString()}` : ''}
            </span>
          )}
          {loadingBackend && (
            <span className="text-[10px] text-[#718076] motion-safe:animate-pulse">
              Syncing with backend...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${riskBadgeBg}`}>
            {report.riskLevel === 'CLEAN' ? '✓ Clean' : report.riskLevel === 'DOUBT' ? '⚠ Review Needed' : '✕ High Risk'}
          </span>

          {/* Safety Score Meter */}
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-black ${scoreBadgeBg}`}>
            <span>Score:</span>
            <span>{report.safetyScore}/100</span>
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Category & Attributes */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-[#EBF3ED] px-2.5 py-1 font-bold text-[#1E3A28]">
            🎯 Topic: {report.detectedCategory}
          </span>
          <span className="rounded-md bg-[#F1EEE7] px-2 py-1 font-semibold text-[#48534C]">
            🗣️ {report.languageDetected}
          </span>
          <span className="rounded-md bg-[#F1EEE7] px-2 py-1 font-semibold text-[#48534C]">
            🎓 Educational Value: {report.educationalValue}
          </span>
        </div>

        {/* AI Summary Box */}
        <div className="rounded-lg border border-[#DCE3DC] bg-[#F7FAF7] p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4E6754]">
            AI Executive Summary
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#233529]">
            {report.summary}
          </p>
        </div>

        {/* Recommendation & Quick Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#4B5850]">Suggested Decision:</span>
            {report.suggestedAction === 'APPROVE' ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                ✓ Recommend Approval
              </span>
            ) : report.suggestedAction === 'CAUTION' ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                ⚠ Manual Review Recommended
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                ✕ Recommend Rejection
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {report.suggestedRejectionReason && onApplyRejectionReason && (
              <button
                type="button"
                onClick={() => onApplyRejectionReason(report.suggestedRejectionReason!)}
                className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                Use AI Rejection Reason
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="text-xs font-semibold text-[#3E5544] underline hover:text-[#1F3325]"
            >
              {showDetails ? 'Hide Policy Checks' : 'View Policy Checks'}
            </button>
          </div>
        </div>

        {/* Expandable Policy Checks */}
        {showDetails && (
          <div className="space-y-1.5 border-t border-[#ECE8E0] pt-2.5">
            {report.checks?.map((check) => (
              <div key={check.id} className="flex items-start gap-2 text-xs">
                <span className={`shrink-0 font-bold ${check.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {check.passed ? '✓' : '✕'}
                </span>
                <span className="min-w-0">
                  <strong className="text-[#2C3830]">{check.label}: </strong>
                  <span className="text-[#59645C]">{check.detail}</span>
                </span>
              </div>
            ))}

            {/* Extracted Tags */}
            {report.tags && report.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[11px] font-semibold text-[#6A786E]">Auto-Tags:</span>
                {report.tags.map((tag) => (
                  <span key={tag} className="rounded bg-[#EAE7DF] px-1.5 py-0.5 text-[10px] font-bold text-[#3E4A41]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
