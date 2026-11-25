import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearStoredAuth } from '../services/api'

export function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('Your session has expired. Please sign in again to continue.')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleExpired = (event: Event) => {
      const custom = event as CustomEvent<{ message?: string }>
      if (custom.detail?.message) {
        setMessage(custom.detail.message)
      }
      setIsOpen(true)
    }

    window.addEventListener('teambharat:session-expired', handleExpired)
    return () => window.removeEventListener('teambharat:session-expired', handleExpired)
  }, [])

  if (!isOpen) return null

  const handleSignIn = () => {
    setIsOpen(false)
    clearStoredAuth()
    const isAdmin = location.pathname.startsWith('/admin')
    navigate(isAdmin ? '/admin/login' : '/login', { replace: true })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 antialiased backdrop-blur-sm transition-opacity duration-200 starting:opacity-0"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#D8D2C8] bg-[#FAF8F5] p-6 shadow-2xl transition-all">
        {/* Decorative Top Accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#DC2626] via-[#F59E0B] to-[#24372C]" />

        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FEE2E2] text-[#DC2626] shadow-xs">
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black tracking-widest text-[#DC2626] uppercase">
              Security Notice
            </span>
            <h2 id="session-expired-title" className="text-lg font-bold text-[#24372C] mt-0.5">
              Session Expired
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#657067]">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#EAE7DF]">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-9 px-4 rounded-xl border border-[#D8D2C8] text-xs font-semibold text-[#657067] hover:bg-white hover:text-[#24372C] transition cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleSignIn}
            style={{ color: '#F4F1EA', backgroundColor: '#24372C' }}
            className="h-9 px-5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#2F4739] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Sign In Again</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
