import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { api } from '../services/api'
import { ArrowLeft, CheckIcon, ChevronRight, CommentIcon, HeartIcon, PlayIcon, WalletIcon } from '../components/Icons'
import { Brand } from '../components/AppShell'
import { Toast } from '../components/Toast'

/*
  Colours: cream #E6E0D5 and green #24372C (+ light/dark shades of the same two)
  The page is always exactly one screen tall (h-dvh), so it never scrolls.
  Form sizes use clamp() with vh.
  The left picture is different: everything inside it is sized in em, and the font size
  comes from the picture's own height (cqh), so text, icons and cards always grow and
  shrink together. The picture is also capped (max-h) so it never gets bigger than the text.
  Some classes end with "!" so they win over the global a/button/input rules in index.css.
*/

type LoginMode = 'password' | 'otp'

const label = 'grid gap-[clamp(4px,0.8vh,8px)] text-[13px] font-semibold text-[#24372C]'
const box = 'flex h-[clamp(40px,6vh,52px)] items-center overflow-hidden rounded-xl border border-[#24372C]/15 bg-white transition focus-within:border-[#24372C] focus-within:shadow-[0_0_0_4px_rgba(36,55,44,0.08)]'
const input = 'h-full w-full min-w-0 bg-transparent px-4 text-[15px]! text-[#24372C] outline-none placeholder:text-[#24372C]/40 disabled:opacity-60'
const primary = 'group flex h-[clamp(40px,6vh,52px)] w-full items-center justify-center gap-2 rounded-xl bg-[#24372C] text-[15px]! font-semibold! text-[#F4F1EA]! shadow-[0_14px_30px_-14px_rgba(36,55,44,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2F4739]'
const social = 'flex h-[clamp(38px,5.4vh,48px)] items-center justify-center gap-2.5 rounded-xl border border-[#24372C]/15 bg-white text-[14px]! font-semibold! transition hover:-translate-y-0.5 hover:border-[#24372C]/35'

/* Fades children up when the page opens */
function Rise({ show, delay = 0, children, className = '' }: { show: boolean; delay?: number; children: ReactNode; className?: string }) {
  return (
    <div style={{ transitionDelay: delay + 'ms' }} className={'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:translate-none motion-reduce:opacity-100 ' + (show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0') + ' ' + className}>
      {children}
    </div>
  )
}

/* ---------- Left side picture: built in code, so it is sharp on every screen ---------- */
type Tone = 'forest' | 'sage' | 'moss'
const toneBg: Record<Tone, string> = {
  forest: 'bg-[linear-gradient(160deg,#4E6E5A_0%,#1B2A21_100%)]',
  sage: 'bg-[linear-gradient(160deg,#A9BCAC_0%,#3E5A49_100%)]',
  moss: 'bg-[linear-gradient(160deg,#C9BFAE_0%,#4A5A4F_100%)]',
}
const sceneCards: { tone: Tone; category: string; board: string; handle: string; initials: string; title: string; likes: string }[] = [
  { tone: 'sage', category: 'Govt exams', board: 'Article 21 → Right to Life', handle: 'lavanya.prep', initials: 'LV', title: 'గ్రూప్ 2 పాలిటీ', likes: '1.9K' },
  { tone: 'forest', category: 'Interview', board: 'Tell me about yourself', handle: 'srikanth.hr', initials: 'SK', title: 'HR రౌండ్ — మొదటి ప్రశ్న', likes: '2.4K' },
  { tone: 'moss', category: 'Skills', board: '=VLOOKUP(A2, B:C, 2, 0)', handle: 'ravi.skills', initials: 'RV', title: 'Excel తెలుగులో', likes: '3.1K' },
]

/*
  SceneCard is its own size container. The inner layer sets font-size = 2.8% of the card's height,
  so 1em is about 12px on a normal card and every em value below grows with the card.
  (Old px sizes -> em: 7px .58, 8px .67, 9px .75, 10px .83, 12px 1, 16px 1.33, 20px 1.67, 36px 3)
*/
function SceneCard({ card, front = false }: { card: (typeof sceneCards)[number]; front?: boolean }) {
  return (
    <div className={'relative h-full w-full overflow-hidden rounded-[1.4rem] text-[#F4F1EA] [container-type:size] ' + toneBg[card.tone] + (front ? ' shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75),0_0_0_5px_#17241D]' : ' shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]')}>
      <div style={{ fontSize: '2.8cqh' }} className="absolute inset-0">
        <span aria-hidden="true" className="absolute -right-[2.7em] -top-[2.7em] size-[10.7em] rounded-full bg-[#F4F1EA]/20 blur-2xl" />
        {front && <span className="absolute inset-x-[1em] top-[1em] flex gap-[0.33em]">{[1, 0.4, 0.4].map((o, i) => <i key={i} style={{ opacity: o }} className="h-[0.25em] flex-1 rounded-full bg-[#F4F1EA]" />)}</span>}
        <div className="absolute inset-x-[9%] top-[20%] rounded-[1em] bg-[#F4F1EA]/95 p-[8%] text-[#24372C] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.6)]">
          <small className="block text-[0.67em] font-bold uppercase tracking-[0.16em] opacity-55">{card.category}</small>
          <strong className="mt-[0.33em] block text-[1em] font-bold leading-tight">{card.board}</strong>
          <span className="mt-[0.67em] flex flex-col gap-[0.33em]"><i className="h-[0.33em] w-full rounded-full bg-[#24372C]/12" /><i className="h-[0.33em] w-2/3 rounded-full bg-[#24372C]/12" /></span>
        </div>
        <span className="absolute left-1/2 top-[60%] grid size-[3em] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#F4F1EA]/85 text-[#24372C]"><PlayIcon className="ml-[0.17em] size-[1.33em]" /></span>
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/65 to-transparent" />
        <div className="absolute bottom-[18%] right-[0.67em] flex flex-col items-center gap-[0.67em] text-[0.67em] font-semibold">
          <span className="flex flex-col items-center"><HeartIcon className={'size-[2em] ' + (front ? 'fill-[#F4F1EA]' : '')} />{card.likes}</span>
          <span className="flex flex-col items-center"><CommentIcon className="size-[2em]" />120</span>
        </div>
        <div className="absolute bottom-[1em] left-[1em] right-[3em]">
          <span className="flex items-center gap-[0.5em] text-[0.75em] font-semibold"><span className="grid size-[2.2em] place-items-center rounded-full bg-[#E6E0D5] text-[0.78em] font-bold text-[#24372C]">{card.initials}</span>@{card.handle}</span>
          <p lang="te" className="mt-[0.33em] truncate text-[0.83em] font-semibold opacity-90">{card.title}</p>
        </div>
      </div>
    </div>
  )
}

/* Floating badges: font-size comes from the scene's height, everything inside is em */
const badgeFont = { fontSize: 'clamp(9px, 2.2cqh, 15px)' }

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<LoginMode>('password')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [ready, setReady] = useState(false)

  // Start the opening animation after the first paint
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  if (isAuthenticated) return <Navigate to="/app" replace />

  const destination = (location.state as { from?: string } | null)?.from ?? '/app'

  const clearError = (key: string) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handlePasswordLogin = async (event: FormEvent) => {
    event.preventDefault()
    const errs: Record<string, string> = {}
    if (identifier.trim().length < 3) {
      errs.identifier = 'Enter your email or username.'
    }
    if (password.length < 1) {
      errs.password = 'Enter your password.'
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setToast(Object.values(errs)[0])
      return
    }

    setLoading(true)
    setFieldErrors({})
    try {
      const authData = await api.auth.login({
        identifier: identifier.trim(),
        password,
      })
      login(authData)
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
      setToast(msg)
      if (/credential|password|match/i.test(msg)) {
        setFieldErrors({ password: msg })
      } else if (/user|identifier/i.test(msg)) {
        setFieldErrors({ identifier: msg })
      } else {
        setFieldErrors({ password: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtpLogin = (event: FormEvent) => {
    event.preventDefault()
    if (!otpSent) {
      if (phone.length !== 10) {
        setFieldErrors({ phone: 'Enter a valid 10-digit mobile number.' })
        setToast('Enter a valid 10-digit mobile number.')
        return
      }
      setOtpSent(true)
      setFieldErrors({})
      setToast(null)
      return
    }
    if (otp.length !== 6) {
      setFieldErrors({ otp: 'Enter the 6-digit OTP.' })
      setToast('Enter the 6-digit OTP.')
      return
    }
    login(phone)
    navigate(destination, { replace: true })
  }

  const switchMode = () => {
    setMode(mode === 'password' ? 'otp' : 'password')
    setOtpSent(false)
    setOtp('')
    setFieldErrors({})
    setToast(null)
  }

  const handleDemoSocialLogin = () => {
    login()
    navigate(destination, { replace: true })
  }

  return (
    <main className="relative isolate grid h-dvh overflow-hidden bg-[#F4F1EA] text-[#24372C] antialiased lg:grid-cols-[1.05fr_1fr]">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {/* ================= LEFT: picture panel (large screens) ================= */}
      <section aria-label="About Drama.Money" className="relative hidden h-full min-h-0 py-[clamp(14px,2.6vh,28px)] pl-[clamp(14px,2.6vh,28px)] lg:block">
        <div className="group relative h-full overflow-hidden rounded-[1.75rem] bg-[linear-gradient(150deg,#2F4739_0%,#1B2A21_100%)]">
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(230,224,213,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,224,213,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
          <div aria-hidden="true" className="absolute -right-24 -top-24 size-96 rounded-full bg-[#4E6E5A]/60 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-24 size-96 rounded-full bg-[#3E5A49]/50 blur-3xl" />

          <Rise show={ready} className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-[clamp(16px,3vh,28px)]">
            <span className="rounded-2xl bg-[#F4F1EA]/95 px-3 py-2 shadow-lg"><Brand to="/" /></span>
            <span className="rounded-full border border-[#F4F1EA]/25 bg-[#F4F1EA]/8 px-3.5 py-1.5 text-xs font-semibold text-[#F4F1EA]/90">Jobs &amp; skills in Telugu</span>
          </Rise>

          {/* video cards scene: outer box gives the free space, inner box is capped and is the size container */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-[33%] top-[13%] [perspective:1400px]">
            <div className="absolute inset-x-0 top-1/2 mx-auto h-full max-h-[600px] -translate-y-1/2 [container-type:size]">
              <div className={'absolute left-1/2 top-1/2 aspect-[9/16] h-[82%] -translate-x-1/2 -translate-y-1/2 opacity-80 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ' + (ready ? '[transform:translateX(-78%)_rotate(-9deg)] group-hover:[transform:translateX(-86%)_rotate(-12deg)]' : '[transform:translateX(0)_rotate(0deg)] opacity-0')}><SceneCard card={sceneCards[0]} /></div>
              <div className={'absolute left-1/2 top-1/2 aspect-[9/16] h-[82%] -translate-x-1/2 -translate-y-1/2 opacity-80 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ' + (ready ? '[transform:translateX(78%)_rotate(9deg)] group-hover:[transform:translateX(86%)_rotate(12deg)]' : '[transform:translateX(0)_rotate(0deg)] opacity-0')}><SceneCard card={sceneCards[2]} /></div>
              <div className={'absolute left-1/2 top-1/2 z-10 aspect-[9/16] h-full -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ' + (ready ? 'scale-100 opacity-100 group-hover:-translate-y-[52%]' : 'scale-90 opacity-0')}><SceneCard card={sceneCards[1]} front /></div>

              <span style={badgeFont} className={'absolute left-[9%] top-[10%] z-20 flex items-center gap-[0.7em] rounded-[1.2em] bg-[#F4F1EA] px-[1.1em] py-[0.7em] text-[1em] text-[#24372C]/65 shadow-xl transition-all delay-500 duration-700 ' + (ready ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}><span className="grid size-[2.5em] place-items-center rounded-[0.7em] bg-[#24372C] text-[#E6E0D5]"><CheckIcon className="size-[1.3em]" /></span><span className="leading-tight"><strong className="block text-[1.1em] text-[#24372C]">Approved</strong>by our team</span></span>
              <span style={badgeFont} className={'absolute bottom-[8%] right-[8%] z-20 flex items-center gap-[0.7em] rounded-[1.2em] bg-[#F4F1EA] px-[1.1em] py-[0.7em] text-[1em] text-[#24372C]/65 shadow-xl transition-all delay-700 duration-700 ' + (ready ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}><span className="grid size-[2.5em] place-items-center rounded-[0.7em] bg-[#24372C] text-[#E6E0D5]"><WalletIcon className="size-[1.3em]" /></span><span className="leading-tight"><strong className="block text-[1.1em] text-[#24372C]">+ ₹40</strong>earned</span></span>
              <span style={badgeFont} className={'absolute right-[13%] top-[16%] z-20 flex items-center gap-[0.5em] rounded-full bg-[#24372C] px-[1.1em] py-[0.55em] text-[1em] font-semibold text-[#F4F1EA] shadow-xl ring-1 ring-[#F4F1EA]/20 transition-all delay-[900ms] duration-700 ' + (ready ? 'scale-100 opacity-100' : 'scale-75 opacity-0')}><HeartIcon className="size-[1.3em] fill-[#F4F1EA]" />2.4K</span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 p-[clamp(20px,4.5vh,44px)] text-[#F4F1EA]">
            <Rise show={ready} delay={150}>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B9CDBE]"><span className="h-px w-8 bg-[#B9CDBE]" />Learn · Create · Earn</p>
            </Rise>
            <Rise show={ready} delay={230}>
              <h1 className="mt-[clamp(8px,1.6vh,16px)] text-[clamp(26px,min(3vw,5.2vh),44px)] font-bold leading-[1.1] tracking-tight">Your next opportunity<br /><span className="text-[#B9CDBE]">could start here.</span></h1>
            </Rise>
            <Rise show={ready} delay={310}>
              <p className="mt-[clamp(6px,1.4vh,14px)] max-w-md text-[clamp(13px,1.9vh,15px)] leading-relaxed text-[#E6E0D5]/80">Watch useful career videos, share what you know and grow with a community built for Telugu youth.</p>
            </Rise>
          </div>
        </div>
      </section>

      {/* ================= RIGHT: form ================= */}
      <section className="relative flex h-full min-h-0 flex-col px-5 py-[clamp(12px,2.6vh,28px)] sm:px-8 lg:px-[clamp(2rem,5vw,5rem)]">
        <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 size-[420px] rounded-full bg-[#E6E0D5] blur-3xl" />

        {/* top bar */}
        <Rise show={ready} className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
          <span className="lg:hidden"><Brand to="/" /></span>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px]! font-semibold! text-[#657067]! transition hover:-translate-x-0.5 hover:text-[#24372C]!"><ArrowLeft className="size-4" />Back to home</Link>
        </Rise>

        {/* small picture strip on phones and tablets, only when the screen is tall enough */}
        <Rise show={ready} delay={60} className="mt-4 hidden shrink-0 [@media(min-height:920px)]:max-lg:block">
          <div aria-hidden="true" className="relative flex h-[clamp(110px,15vh,170px)] items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[linear-gradient(150deg,#2F4739,#1B2A21)] py-4">
            {sceneCards.map((card, i) => <div key={card.handle} className={'aspect-[9/16] h-full ' + (i === 1 ? 'z-10' : 'opacity-80 ' + (i === 0 ? 'rotate-[-6deg]' : 'rotate-[6deg]'))}><SceneCard card={card} front={i === 1} /></div>)}
          </div>
        </Rise>

        {/* form */}
        <div className="mx-auto flex min-h-0 w-full max-w-[420px] flex-1 flex-col justify-center-safe py-[clamp(8px,2vh,24px)]">
          {mode === 'otp' && (
            <Rise show={ready}>
              <button type="button" onClick={switchMode} className="mb-[clamp(10px,2.2vh,22px)] inline-flex items-center gap-1.5 text-[13px]! font-semibold! text-[#657067]! transition hover:-translate-x-0.5 hover:text-[#24372C]!"><ArrowLeft className="size-4" />Back to password login</button>
            </Rise>
          )}

          <Rise show={ready} delay={80}>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4E6E5A]"><span className="h-px w-8 bg-[#4E6E5A]" />Welcome back</p>
            <h2 className="mt-[clamp(6px,1.2vh,12px)] text-[clamp(24px,min(2.6vw,4.4vh),34px)] font-bold leading-tight tracking-tight">{mode === 'password' ? 'Log in to Drama.Money' : 'Log in with mobile OTP'}</h2>
            <p className="mt-[clamp(4px,0.8vh,8px)] text-[clamp(13px,1.9vh,15px)] text-[#24372C]/65">{mode === 'password' ? 'Use your email address or username to continue.' : 'We will send a one-time code to your number.'}</p>
          </Rise>

          <Rise show={ready} delay={160}>
            {mode === 'password' ? (
              <form onSubmit={handlePasswordLogin} noValidate className="mt-[clamp(14px,3vh,30px)] grid gap-[clamp(10px,1.8vh,16px)]">
                <label className={label}>Email address or username
                  <span className={box + (fieldErrors.identifier ? ' border-[#dc2626]! ring-2 ring-[#dc2626]/10' : '')}>
                    <input value={identifier} onChange={(event) => { setIdentifier(event.target.value); clearError('identifier') }} autoComplete="username" placeholder="you@example.com or username" className={input} />
                  </span>
                  {fieldErrors.identifier && <span className="text-[11.5px] font-semibold text-[#dc2626]">{fieldErrors.identifier}</span>}
                </label>
                <label className={label}>
                  <span className="flex items-center justify-between"><span>Password</span><Link to="/forgot-password" className="text-[12px]! font-semibold! text-[#4E6E5A]! hover:underline">Forgot password?</Link></span>
                  <span className={box + (fieldErrors.password ? ' border-[#dc2626]! ring-2 ring-[#dc2626]/10' : '')}>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); clearError('password') }} autoComplete="current-password" placeholder="Enter your password" className={input} />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="mr-1.5 shrink-0 rounded-lg px-3 py-1.5 text-[12px]! font-semibold! text-[#24372C]/70! transition hover:bg-[#E6E0D5]">{showPassword ? 'Hide' : 'Show'}</button>
                  </span>
                  {fieldErrors.password && <span className="text-[11.5px] font-semibold text-[#dc2626]">{fieldErrors.password}</span>}
                </label>
                <button type="submit" disabled={loading} className={primary + ' mt-[clamp(2px,0.6vh,6px)]'}><span>{loading ? 'Logging in...' : 'Log in'}</span><ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" /></button>
              </form>
            ) : (
              <form onSubmit={handleOtpLogin} noValidate className="mt-[clamp(14px,3vh,30px)] grid gap-[clamp(10px,1.8vh,16px)]">
                <label className={label}>Mobile number
                  <span className={box + (fieldErrors.phone ? ' border-[#dc2626]! ring-2 ring-[#dc2626]/10' : '')}>
                    <span className="flex h-full items-center border-r border-[#24372C]/12 bg-[#F4F1EA] px-3.5 text-[14px] font-semibold">+91</span>
                    <input inputMode="numeric" autoComplete="tel-national" value={phone} disabled={otpSent} onChange={(event) => { setPhone(event.target.value.replace(/\D/g, '').slice(0, 10)); clearError('phone') }} placeholder="10-digit number" className={input} />
                  </span>
                  {fieldErrors.phone && <span className="text-[11.5px] font-semibold text-[#dc2626]">{fieldErrors.phone}</span>}
                </label>
                {otpSent && (
                  <label className={label}>6-digit OTP
                    <span className={box + (fieldErrors.otp ? ' border-[#dc2626]! ring-2 ring-[#dc2626]/10' : '')}><input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '').slice(0, 6)); clearError('otp') }} placeholder="• • • • • •" className={input + ' text-center text-lg! font-bold! tracking-[0.5em]'} /></span>
                    {fieldErrors.otp && <span className="text-[11.5px] font-semibold text-[#dc2626]">{fieldErrors.otp}</span>}
                  </label>
                )}
                <button type="submit" className={primary + ' mt-[clamp(2px,0.6vh,6px)]'}><span>{otpSent ? 'Verify & log in' : 'Send OTP'}</span><ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" /></button>
              </form>
            )}
          </Rise>

          {mode === 'password' && (
            <Rise show={ready} delay={240}>
              <div className="my-[clamp(10px,2.2vh,22px)] flex items-center gap-3 text-[12px] text-[#24372C]/45 before:h-px before:flex-1 before:bg-[#24372C]/12 after:h-px after:flex-1 after:bg-[#24372C]/12"><span>or continue with</span></div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={handleDemoSocialLogin} className={social}><span className="grid size-6 place-items-center rounded-full border border-[#24372C]/15 text-[13px] font-extrabold">G</span>Google</button>
                <button type="button" onClick={handleDemoSocialLogin} className={social}><span className="grid size-6 place-items-center rounded-full bg-[#24372C] text-[13px] font-extrabold text-[#E6E0D5]">f</span>Facebook</button>
              </div>
              <button type="button" onClick={switchMode} className="group mt-[clamp(6px,1.2vh,12px)] flex w-full items-center justify-center gap-1.5 rounded-xl py-[clamp(6px,1vh,10px)] text-[13px]! font-semibold! text-[#3E5A49]! transition hover:bg-[#E6E0D5]/60">Use mobile number &amp; OTP instead <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" /></button>
            </Rise>
          )}

          <Rise show={ready} delay={320}>
            <p className="mt-[clamp(10px,2vh,22px)] text-center text-[14px] text-[#24372C]/65">New to Drama.Money? <Link to="/register" className="font-semibold! text-[#24372C]! underline-offset-4 hover:underline">Create an account</Link></p>
            <p className="mt-[clamp(4px,1vh,10px)] text-center text-[11px] text-[#24372C]/45">By continuing, you agree to the Terms and <Link to="/privacy" className="font-semibold! text-[#24372C]/65! underline underline-offset-2 hover:text-[#24372C]!">Privacy Policy</Link>.</p>
          </Rise>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 text-[11px] text-[#24372C]/45">
          <span>© 2026 Drama.Money</span>
          <span className="hidden sm:inline">Help · Safety · తెలుగు</span>
        </footer>
      </section>
    </main>
  )
}
