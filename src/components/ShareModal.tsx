import { useState } from 'react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
  caption?: string
  contentType?: 'POST' | 'REEL'
}

export function ShareModal({
  isOpen,
  onClose,
  url,
  title,
  caption,
  contentType = 'POST',
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareText = encodeURIComponent(`${title || 'Check out this ' + contentType.toLowerCase() + ' on Drama.Money'}: ${url}`)
  const encodedUrl = encodeURIComponent(url)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // fallback
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: caption || title,
          url,
        })
        onClose()
      } catch {
        // cancelled
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-xs antialiased"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-[460px] overflow-hidden rounded-3xl border border-[#D8D2C8] bg-[#FAF8F5] p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[#24372C] text-xs font-black text-white">
              ↗
            </span>
            <h3 className="text-sm font-bold text-[#24372C]">
              Share {contentType === 'REEL' ? 'Reel' : 'Post'}
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

        {/* Content Preview */}
        <div className="mt-3.5 rounded-xl border border-[#EAE7DF] bg-white p-3">
          <p className="line-clamp-2 text-xs font-semibold text-[#1E2A23]">
            {title || caption || 'Drama.Money Career & Job Guidance'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-[#7A887E] truncate">
            {url}
          </p>
        </div>

        {/* Native share quick trigger for mobile */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#24372C] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#355642] transition cursor-pointer"
          >
            <span>Share via device options</span>
          </button>
        )}

        {/* Link Copy Row */}
        <div className="mt-3.5 flex items-center gap-2">
          <input
            readOnly
            value={url}
            className="h-9 flex-1 rounded-xl border border-[#D8D2C8] bg-white px-3 text-xs text-[#24372C] outline-none select-all font-mono text-[11px]"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="h-9 shrink-0 rounded-xl bg-[#24372C] px-3.5 text-xs font-bold text-white hover:bg-[#355642] transition cursor-pointer"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* Share via Social Apps */}
        <div className="mt-4 border-t border-[#EAE7DF] pt-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#657067]">
            Share to
          </p>
          <div className="grid grid-cols-5 gap-2 text-center">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl border border-[#EAE7DF] bg-white p-2 hover:bg-[#FAF8F5] transition text-[9px] font-bold text-[#24372C]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-[#25D366]/15 text-[#128C7E] text-xs">
                💬
              </span>
              <span>WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl border border-[#EAE7DF] bg-white p-2 hover:bg-[#FAF8F5] transition text-[9px] font-bold text-[#24372C]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-[#0088CC]/15 text-[#0088CC] text-xs">
                ✈
              </span>
              <span>Telegram</span>
            </a>

            {/* X / Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl border border-[#EAE7DF] bg-white p-2 hover:bg-[#FAF8F5] transition text-[9px] font-bold text-[#24372C]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-[#1DA1F2]/15 text-[#1DA1F2] text-xs">
                𝕏
              </span>
              <span>Twitter</span>
            </a>

            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl border border-[#EAE7DF] bg-white p-2 hover:bg-[#FAF8F5] transition text-[9px] font-bold text-[#24372C]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-[#0A66C2]/15 text-[#0A66C2] text-xs">
                in
              </span>
              <span>LinkedIn</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl border border-[#EAE7DF] bg-white p-2 hover:bg-[#FAF8F5] transition text-[9px] font-bold text-[#24372C]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-[#1877F2]/15 text-[#1877F2] text-xs">
                f
              </span>
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
