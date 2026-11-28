import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../auth/AdminAuth'
import { ArrowLeft, CheckIcon, ChevronRight, PlayIcon, ReelsIcon, UserIcon, WalletIcon } from '../../components/Icons'
import { Brand } from '../../components/AppShell'
import { Toast } from '../../components/Toast'

const adminLabel = 'grid gap-[clamp(4px,0.8vh,8px)] text-[13px] font-semibold text-[#24372C]'
const adminBox = 'flex h-[clamp(40px,6vh,52px)] items-center overflow-hidden rounded-xl border border-[#24372C]/15 bg-white transition focus-within:border-[#24372C] focus-within:shadow-[0_0_0_4px_rgba(36,55,44,0.08)]'
const adminInput = 'h-full w-full min-w-0 bg-transparent px-4 text-[15px]! text-[#24372C] outline-none placeholder:text-[#24372C]/40 disabled:opacity-60'
const adminPrimary = 'group flex h-[clamp(40px,6vh,52px)] w-full items-center justify-center gap-2 rounded-xl bg-[#24372C] text-[15px]! font-semibold! text-[#F4F1EA]! shadow-[0_14px_30px_-14px_rgba(36,55,44,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2F4739] disabled:opacity-60 disabled:hover:translate-y-0'

function AdminRise({ show, delay = 0, children, className = '' }: { show: boolean; delay?: number; children: ReactNode; className?: string }) {
  return (
    <div
      style={{ transitionDelay: delay + 'ms' }}
      className={
        'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:translate-none motion-reduce:opacity-100 ' +
        (show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0') +
        ' ' +
        className
      }
    >
      {children}
    </div>
  )
}

function ShieldMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function ReviewSceneCard() {
  const checks = ['Speech checked', 'Frames scanned', 'Category matched']
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.4rem] bg-[#F4F1EA] text-[#24372C] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75),0_0_0_5px_#17241D] [container-type:size]">
      <div style={{ fontSize: 'clamp(10px, 3.6cqh, 18px)' }} className="absolute inset-0 flex flex-col p-[1em]">
        <div className="flex items-center justify-between">
          <small className="text-[0.68em] font-bold uppercase tracking-[0.14em] opacity-60">Post Review</small>
          <span className="rounded-full bg-[#24372C] px-[0.75em] py-[0.3em] text-[0.66em] font-bold text-[#F4F1EA]">In review</span>
        </div>
        <div className="relative mt-[0.7em] h-[34%] shrink-0 overflow-hidden rounded-[0.9em] bg-[linear-gradient(160deg,#4E6E5A_0%,#1B2A21_100%)]">
          <span className="absolute -right-[1.5em] -top-[1.5em] size-[6em] rounded-full bg-[#F4F1EA]/20 blur-2xl" />
          <span className="absolute inset-x-[10%] top-[16%] rounded-[0.6em] bg-[#F4F1EA]/95 px-[0.8em] py-[0.5em] text-[0.72em] font-bold leading-tight">Tell me about yourself</span>
          <span className="absolute left-1/2 top-[64%] grid size-[2.4em] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#F4F1EA]/90">
            <PlayIcon className="ml-[0.12em] size-[1.1em]" />
          </span>
          <span className="absolute bottom-[0.5em] right-[0.5em] rounded-[0.4em] bg-black/55 px-[0.4em] py-[0.1em] text-[0.62em] font-semibold text-white">00:43</span>
        </div>
        <strong className="mt-[0.7em] block text-[1em] font-bold leading-tight">First HR interview tip</strong>
        <small className="mt-[0.2em] block truncate text-[0.68em] font-semibold opacity-60">@hari_learns · Interview preparation</small>
        <div className="mt-[0.75em] flex flex-col gap-[0.5em] rounded-[0.8em] bg-[#24372C]/[0.05] p-[0.7em]">
          {checks.map((item) => (
            <span key={item} className="flex items-center gap-[0.55em] text-[0.74em] font-semibold">
              <span className="grid size-[1.6em] shrink-0 place-items-center rounded-full bg-[#24372C] text-[#F4F1EA]">
                <CheckIcon className="size-[0.95em]" />
              </span>
              {item}
            </span>
          ))}
        </div>
        <div className="mt-[0.7em] flex items-center justify-between text-[0.72em] font-semibold">
          <span className="opacity-60">AI risk</span>
          <span className="inline-flex items-center gap-[0.4em] rounded-full bg-[#24372C]/10 px-[0.7em] py-[0.2em] font-bold">
            <i className="size-[0.55em] rounded-full bg-[#2F8F6B]" />Clean
          </span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-[0.5em] pt-[0.7em]">
          <span className="grid h-[2.4em] place-items-center rounded-[0.65em] border border-[#24372C]/25 text-[0.74em] font-bold">Reject</span>
          <span className="grid h-[2.4em] place-items-center rounded-[0.65em] bg-[#24372C] text-[0.74em] font-bold text-[#F4F1EA]">Approve</span>
        </div>
      </div>
    </div>
  )
}

function SideSceneCard({ kind }: { kind: 'kyc' | 'payout' }) {
  const kyc = kind === 'kyc'
  return (
    <div
      className={
        'relative h-full w-full overflow-hidden rounded-[1.4rem] text-[#F4F1EA] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] [container-type:size] ' +
        (kyc ? 'bg-[linear-gradient(160deg,#A9BCAC_0%,#3E5A49_100%)]' : 'bg-[linear-gradient(160deg,#C9BFAE_0%,#4A5A4F_100%)]')
      }
    >
      <div style={{ fontSize: 'clamp(10px, 4cqh, 18px)' }} className={'absolute inset-0 flex flex-col p-[1em] ' + (kyc ? 'items-start pr-[38%]' : 'items-end pl-[38%] text-right')}>
        <small className="text-[0.7em] font-bold uppercase tracking-[0.14em] opacity-85">{kyc ? 'Creator KYC' : 'Payouts'}</small>
        <div className={'mt-[0.9em] w-full rounded-[0.9em] bg-[#F4F1EA]/95 p-[0.8em] text-[#24372C] ' + (kyc ? '' : 'flex flex-col items-end')}>
          <span className="grid size-[2.2em] place-items-center rounded-[0.6em] bg-[#24372C] text-[#E6E0D5]">
            {kyc ? <UserIcon /> : <WalletIcon />}
          </span>
          <strong className="mt-[0.6em] block truncate text-[0.95em] font-bold leading-tight">{kyc ? '@ananya_careers' : '₹120'}</strong>
          <small className="block text-[0.7em] font-semibold opacity-60">{kyc ? 'PAN + bank' : 'Hold ends 24 Nov'}</small>
        </div>
        <span className="mt-[0.8em] inline-flex w-fit items-center gap-[0.4em] rounded-full bg-[#F4F1EA] px-[0.8em] py-[0.35em] text-[0.7em] font-bold text-[#24372C]">
          <CheckIcon className="size-[1em]" />{kyc ? 'Verified' : 'Approved'}
        </span>
      </div>
    </div>
  )
}

const adminBadgeFont = { fontSize: 'clamp(11px, 2.4cqh, 15px)' }

export default function AdminLoginPage() {
  const { session, login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  if (session) return <Navigate to="/admin/dashboard" replace />

  const clearError = (key: string) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const errs: Record<string, string> = {}
    if (!identifier.trim()) errs.identifier = 'Enter your admin username or email.'
    if (!password) errs.password = 'Enter your password.'
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setToast(Object.values(errs)[0])
      return
    }
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      await login(identifier.trim(), password)
      const destination = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard'
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please verify your admin username and password.'
      setToast(msg)
      setFieldErrors(/user|identifier|email/i.test(msg) && !/password/i.test(msg) ? { identifier: msg } : { password: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative isolate grid h-dvh overflow-hidden bg-[#F4F1EA] text-[#24372C] antialiased lg:grid-cols-[1.05fr_1fr]">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* LEFT: visual panel */}
      <section aria-label="Drama.Money admin" className="relative hidden h-full min-h-0 py-[clamp(14px,2.6vh,28px)] pl-[clamp(14px,2.6vh,28px)] lg:block">
        <div className="group relative h-full overflow-hidden rounded-[1.75rem] bg-[linear-gradient(150deg,#2F4739_0%,#1B2A21_100%)]">
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(230,224,213,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,224,213,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
          <div aria-hidden="true" className="absolute -right-24 -top-24 size-96 rounded-full bg-[#4E6E5A]/60 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-24 size-96 rounded-full bg-[#3E5A49]/50 blur-3xl" />

          <AdminRise show={ready} className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-[clamp(16px,3vh,28px)]">
            <span className="rounded-2xl bg-[#F4F1EA]/95 px-3 py-2 shadow-lg"><Brand to="/" /></span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F4F1EA]/25 bg-[#F4F1EA]/8 px-3.5 py-1.5 text-xs font-semibold text-[#F4F1EA]/90">
              <ShieldMark className="size-3.5" />Admin control centre
            </span>
          </AdminRise>

          <div aria-hidden="true" className="absolute inset-x-0 bottom-[30%] top-[15%] [perspective:1400px]">
            <div className="absolute inset-x-0 top-1/2 mx-auto h-full max-h-[600px] -translate-y-1/2 [container-type:size]">
              <div className={'absolute left-1/2 top-1/2 aspect-[3/4] h-[72%] -translate-x-1/2 -translate-y-1/2 opacity-95 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ' + (ready ? '[transform:translateX(-92%)_rotate(-7deg)] group-hover:[transform:translateX(-98%)_rotate(-9deg)]' : '[transform:translateX(0)_rotate(0deg)] opacity-0')}>
                <SideSceneCard kind="kyc" />
              </div>
              <div className={'absolute left-1/2 top-1/2 aspect-[3/4] h-[72%] -translate-x-1/2 -translate-y-1/2 opacity-95 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ' + (ready ? '[transform:translateX(92%)_rotate(7deg)] group-hover:[transform:translateX(98%)_rotate(9deg)]' : '[transform:translateX(0)_rotate(0deg)] opacity-0')}>
                <SideSceneCard kind="payout" />
              </div>
              <div className={'absolute left-1/2 top-1/2 z-10 aspect-[3/4] h-[96%] -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ' + (ready ? 'scale-100 opacity-100 group-hover:-translate-y-[52%]' : 'scale-90 opacity-0')}>
                <ReviewSceneCard />
              </div>

              <span style={adminBadgeFont} className={'absolute bottom-[2%] left-[4%] z-20 flex items-center gap-[0.7em] rounded-[1.2em] bg-[#F4F1EA] px-[1.1em] py-[0.7em] text-[1em] text-[#24372C]/65 shadow-xl transition-all delay-500 duration-700 ' + (ready ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}>
                <span className="grid size-[2.5em] place-items-center rounded-[0.7em] bg-[#24372C] text-[#E6E0D5]"><CheckIcon className="size-[1.3em]" /></span>
                <span className="leading-tight"><strong className="block text-[1.1em] text-[#24372C]">Video approved</strong>just now</span>
              </span>
              <span style={adminBadgeFont} className={'absolute bottom-[10%] right-[3%] z-20 flex items-center gap-[0.7em] rounded-[1.2em] bg-[#F4F1EA] px-[1.1em] py-[0.7em] text-[1em] text-[#24372C]/65 shadow-xl transition-all delay-700 duration-700 ' + (ready ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}>
                <span className="grid size-[2.5em] place-items-center rounded-[0.7em] bg-[#24372C] text-[#E6E0D5]"><ShieldMark className="size-[1.3em]" /></span>
                <span className="leading-tight"><strong className="block text-[1.1em] text-[#24372C]">Risk signal</strong>resolved</span>
              </span>
              <span style={adminBadgeFont} className={'absolute right-[5%] top-[2%] z-20 flex items-center gap-[0.5em] rounded-full bg-[#24372C] px-[1.1em] py-[0.55em] text-[1em] font-semibold text-[#F4F1EA] shadow-xl ring-1 ring-[#F4F1EA]/20 transition-all delay-[900ms] duration-700 ' + (ready ? 'scale-100 opacity-100' : 'scale-75 opacity-0')}>
                <ReelsIcon />3 in review
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 p-[clamp(20px,4.5vh,44px)] text-[#F4F1EA]">
            <AdminRise show={ready} delay={150}>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B9CDBE]"><span className="h-px w-8 bg-[#B9CDBE]" />Review · Verify · Protect</p>
            </AdminRise>
            <AdminRise show={ready} delay={230}>
              <h1 className="mt-[clamp(8px,1.6vh,16px)] text-[clamp(26px,min(3vw,5.2vh),44px)] font-bold leading-[1.1] tracking-tight">
                Keep Drama.Money<br /><span className="text-[#B9CDBE]">safe and trusted.</span>
              </h1>
            </AdminRise>
          </div>
        </div>
      </section>

      {/* RIGHT: form */}
      <section className="relative flex h-full min-h-0 flex-col px-5 py-[clamp(12px,2.6vh,28px)] sm:px-8 lg:px-[clamp(2rem,5vw,5rem)]">
        <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 size-[420px] rounded-full bg-[#E6E0D5] blur-3xl" />

        <AdminRise show={ready} className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
          <span className="lg:hidden"><Brand to="/" /></span>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px]! font-semibold! text-[#657067]! transition hover:-translate-x-0.5 hover:text-[#24372C]!">
            <ArrowLeft className="size-4" />Back to home
          </Link>
        </AdminRise>

        <div className="mx-auto flex min-h-0 w-full max-w-[420px] flex-1 flex-col justify-center-safe py-[clamp(8px,2vh,24px)]">
          <AdminRise show={ready} delay={80}>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4E6E5A]"><span className="h-px w-8 bg-[#4E6E5A]" />Secure admin access</p>
            <h2 className="mt-[clamp(6px,1.2vh,12px)] text-[clamp(24px,min(2.6vw,4.4vh),34px)] font-bold leading-tight tracking-tight">Sign in to control centre</h2>
          </AdminRise>

          <AdminRise show={ready} delay={160}>
            <form onSubmit={submit} noValidate className="mt-[clamp(14px,3vh,30px)] grid gap-[clamp(10px,1.8vh,16px)]">
              <label className={adminLabel}>
                Username or work email
                <span className={adminBox + (fieldErrors.identifier ? ' border-[#dc2626]! ring-2 ring-[#dc2626]/10' : '')}>
                  <input
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value)
                      clearError('identifier')
                    }}
                    autoComplete="username"
                    placeholder="admin or admin@drama.money"
                    className={adminInput}
                  />
                </span>
                {fieldErrors.identifier && <span className="text-[11.5px] font-semibold text-[#dc2626]">{fieldErrors.identifier}</span>}
              </label>

              <label className={adminLabel}>
                <span className="flex items-center justify-between">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => setToast('Please contact technical support to reset your administrator password.')}
                    className="text-[12px]! font-semibold! text-[#4E6E5A]! hover:underline"
                  >
                    Forgot password?
                  </button>
                </span>
                <span className={adminBox + (fieldErrors.password ? ' border-[#dc2626]! ring-2 ring-[#dc2626]/10' : '')}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      clearError('password')
                    }}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={adminInput}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="mr-1.5 shrink-0 rounded-lg px-3 py-1.5 text-[12px]! font-semibold! text-[#24372C]/70! transition hover:bg-[#E6E0D5]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </span>
                {fieldErrors.password && <span className="text-[11.5px] font-semibold text-[#dc2626]">{fieldErrors.password}</span>}
              </label>

              <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-[13px] font-medium text-[#24372C]/75">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                  className="size-4 accent-[#24372C]"
                />
                Remember this device
              </label>

              <button type="submit" disabled={isSubmitting} className={adminPrimary + ' mt-[clamp(2px,0.6vh,6px)]'}>
                {isSubmitting ? (
                  <span role="status" className="inline-flex items-center gap-2">
                    <span aria-hidden="true" className="size-4 rounded-full border-2 border-white/35 border-t-white motion-safe:animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <><span>Sign in to dashboard</span><ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" /></>
                )}
              </button>
            </form>
          </AdminRise>

          <AdminRise show={ready} delay={240}>
            <div className="mt-[clamp(14px,2.8vh,28px)] flex items-center gap-3 rounded-xl border border-[#24372C]/10 bg-white/70 px-4 py-[clamp(8px,1.4vh,12px)]">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#24372C] text-[#E6E0D5]">
                <ShieldMark className="size-4" />
              </span>
              <strong className="text-[13px] font-semibold text-[#24372C]">Protected admin session</strong>
            </div>
          </AdminRise>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 text-[11px] text-[#24372C]/45">
          <span>© 2026 Drama.Money</span>
          <span className="hidden sm:inline-flex gap-3">
            <a href="/privacy" className="text-[#24372C]/45! hover:text-[#24372C]!">Privacy</a>
            <a href="#security" className="text-[#24372C]/45! hover:text-[#24372C]!">Security</a>
            <a href="mailto:support@drama.money" className="text-[#24372C]/45! hover:text-[#24372C]!">Support</a>
          </span>
        </footer>
      </section>
    </main>
  )
}
