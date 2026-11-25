import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/AppShell'
import { ArrowLeft, ChevronRight } from '../components/Icons'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (identifier.trim().length < 3) {
      setError('Enter the email, username or mobile number linked to your account.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 600)
  }

  return (
    <main className="min-h-dvh w-full bg-[#E6E0D5] px-4 py-8 flex flex-col items-center justify-center antialiased">
      {/* Top Header */}
      <header className="w-full max-w-[440px] flex items-center justify-between mb-4 px-1">
        <Brand to="/" />
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#657067] hover:text-[#24372C] transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </header>

      {/* Card */}
      <section className="w-full max-w-[440px] rounded-2xl border border-[#D8D2C8] bg-white p-7 sm:p-8 shadow-[0_18px_50px_-12px_rgba(36,55,44,0.18)]">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#E6E0D5] text-[#24372C] font-extrabold text-xl tracking-wider">
          •••
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-[#24372C]">
          Reset your password
        </h1>
        <p className="mt-2 text-center text-xs sm:text-sm text-[#657067] leading-relaxed">
          Enter the email address, username or mobile number linked to your account.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-[#BDE6DF] bg-[#EAF7F5] p-4 text-[#24372C]">
            <strong className="block text-sm font-bold text-[#1F5C54]">Check your account</strong>
            <p className="mt-1 text-xs text-[#3E655F] leading-relaxed">
              If an account matches <span className="font-semibold text-[#1F5C54]">{identifier}</span>, password reset instructions have been sent.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center justify-center w-full h-10 rounded-xl bg-[#24372C] text-[#F4F1EA] text-xs font-bold hover:bg-[#2F4739] transition"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-[#24372C]">
              <span>Email, username or mobile</span>
              <input
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value)
                  if (error) setError('')
                }}
                placeholder="you@example.com or mobile"
                className={`h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] text-[#24372C] placeholder:text-[#24372C]/40 outline-none transition ${
                  error
                    ? 'border-[#DC2626] ring-2 ring-[#DC2626]/10'
                    : 'border-[#DCE0DD] focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10'
                }`}
              />
              {error && (
                <span className="text-[11.5px] font-semibold text-[#DC2626] mt-0.5">
                  {error}
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{ color: '#F4F1EA', backgroundColor: '#24372C' }}
              className="h-11 w-full rounded-xl text-xs sm:text-sm font-bold shadow-md hover:bg-[#2F4739] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Sending link...' : 'Send reset link'}</span>
              <ChevronRight className="size-4 shrink-0" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-[#F0EEE9] text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#657067] hover:text-[#24372C] transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Remember your password? Log in
          </Link>
        </div>
      </section>
    </main>
  )
}
