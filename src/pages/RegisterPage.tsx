import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { api } from '../services/api'
import { ArrowLeft, ChevronRight } from '../components/Icons'
import { Brand } from '../components/AppShell'
import { Toast } from '../components/Toast'

const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'root',
  'support',
  'help',
  'system',
  'api',
  'null',
  'undefined',
  'login',
  'logout',
  'register',
  'signup',
  'settings',
  'explore',
  'dramamoney',
]

const inputClass =
  'h-11 [@media(min-width:768px)_and_(max-height:760px)]:h-10 w-full rounded-xl border border-[#DCE0DD] bg-white px-3.5 text-[14px] text-[#24372C] placeholder:text-[#24372C]/40 focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10 outline-none transition disabled:opacity-60'

const labelClass = 'flex flex-col gap-1 text-xs font-bold text-[#24372C]'

function InfoTip({ text }: { text: string }) {
  return (
    <span
      tabIndex={0}
      role="button"
      aria-label={text}
      onClick={(e) => e.preventDefault()}
      className="group relative inline-flex size-[13px] cursor-help items-center justify-center rounded-full bg-[#E7EFEA] text-[#3F6B55]/80 outline-none ring-1 ring-[#3F6B55]/10 transition hover:bg-[#24372C] hover:text-white focus:bg-[#24372C] focus:text-white"
    >
      <svg viewBox="0 0 16 16" className="size-[8px]" fill="currentColor" aria-hidden="true">
        <circle cx="8" cy="3.6" r="1.5" />
        <rect x="6.6" y="6.4" width="2.8" height="7.4" rx="1.4" />
      </svg>
      <span className="pointer-events-none absolute bottom-full -left-2 z-20 mb-2 w-max max-w-[230px] translate-y-1 rounded-lg bg-[#24372C] px-2.5 py-1.5 text-[11px] font-medium leading-snug text-[#F4F1EA] opacity-0 shadow-lg transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
        {text}
        <span className="absolute -bottom-1 left-3.5 size-2 rotate-45 bg-[#24372C]" />
      </span>
    </span>
  )
}

export default function RegisterPage() {
  const { isAuthenticated, register, login } = useAuth()
  const navigate = useNavigate()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    countryCode: '+91',
    phone: '',
    dateOfBirth: '2003-05-15',
    password: '',
    confirmPassword: '',
    town: '',
    college: '',
    bio: '',
    skills: '',
  })

  if (isAuthenticated) return <Navigate to="/app" replace />

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const cleanUsername = form.username.trim().replace(/^@/, '')
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword

  const passwordRules = [
    { label: '8-64 characters', valid: form.password.length >= 8 && form.password.length <= 64 },
    { label: 'Upper & lower case', valid: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) },
    { label: 'Digit & special char', valid: /[0-9]/.test(form.password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password) },
    { label: 'No spaces', valid: form.password.length > 0 && !/\s/.test(form.password) },
  ]

  const passwordContainsUsername =
    cleanUsername.length >= 3 && form.password.toLowerCase().includes(cleanUsername.toLowerCase())

  const validateStep1 = (): Record<string, string> => {
    const errs: Record<string, string> = {}

    const fName = form.firstName.trim()
    if (!fName) {
      errs.firstName = 'First name is required.'
    } else if (!/^[a-zA-Z][a-zA-Z\s.'-]{0,59}$/.test(fName)) {
      errs.firstName = 'Start with letter; letters, dots, hyphens only (max 60).'
    }

    const lName = form.lastName.trim()
    if (!lName) {
      errs.lastName = 'Last name is required.'
    } else if (!/^[a-zA-Z][a-zA-Z\s.'-]{0,59}$/.test(lName)) {
      errs.lastName = 'Start with letter; letters, dots, hyphens only (max 60).'
    }

    if (!cleanUsername) {
      errs.username = 'Username is required.'
    } else if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      errs.username = 'Username must be between 3 and 30 characters.'
    } else if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
      errs.username = 'Only letters, numbers, dots (.) and underscores (_) allowed.'
    } else if (cleanUsername.startsWith('.') || cleanUsername.endsWith('.')) {
      errs.username = 'Cannot start or end with a dot.'
    } else if (cleanUsername.includes('..')) {
      errs.username = 'Cannot contain consecutive dots (..).'
    } else if (RESERVED_USERNAMES.includes(cleanUsername.toLowerCase())) {
      errs.username = 'This username is reserved. Please pick another.'
    }

    if (!form.dateOfBirth) {
      errs.dateOfBirth = 'Date of birth is required.'
    } else {
      const dob = new Date(form.dateOfBirth)
      if (isNaN(dob.getTime()) || dob >= new Date()) {
        errs.dateOfBirth = 'Date of birth must be a date in the past.'
      }
    }

    if (!form.email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || form.email.length > 254) {
      errs.email = 'Please enter a valid email address.'
    }

    const cleanPhone = form.phone.replace(/\D/g, '')
    const countryCode = form.countryCode.trim()
    if (!/^\+[1-9]\d{0,3}$/.test(countryCode)) {
      errs.phone = 'Use a valid country code: + followed by 1–4 digits, for example +91.'
    } else if (!cleanPhone) {
      errs.phone = 'Mobile number is required.'
    } else if (!/^\d{6,14}$/.test(cleanPhone)) {
      errs.phone = 'Mobile number must contain 6–14 digits only.'
    } else if (/^(\d)\1+$/.test(cleanPhone)) {
      errs.phone = 'Enter a real mobile number; repeated digits are not valid.'
    } else if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Indian mobile numbers must have 10 digits and start with 6, 7, 8, or 9.'
    }

    if (!form.password) {
      errs.password = 'Password is required.'
    } else if (form.password.length < 8 || form.password.length > 64) {
      errs.password = 'Password must be between 8 and 64 characters.'
    } else if (/\s/.test(form.password)) {
      errs.password = 'Password cannot contain spaces.'
    } else if (
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/[0-9]/.test(form.password) ||
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password)
    ) {
      errs.password = 'Must include uppercase, lowercase, digit, and symbol.'
    } else if (passwordContainsUsername) {
      errs.password = 'Password cannot contain your username.'
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = 'Confirm your password.'
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.'
    }

    return errs
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const step1Errors = validateStep1()
    if (Object.keys(step1Errors).length > 0) {
      setFieldErrors(step1Errors)
      setToast(Object.values(step1Errors)[0])
      if (step === 2) setStep(1)
      return
    }

    if (step === 1) {
      setLoading(true)
      try {
        const check = await api.auth.checkUsername(cleanUsername)
        if (!check.available) {
          setFieldErrors({ username: 'This username is already taken. Please choose another.' })
          setToast('This username is already taken. Please choose another.')
          setLoading(false)
          return
        }
        setStep(2)
      } catch (err: unknown) {
        if (err instanceof Error && /taken|already|exist/i.test(err.message)) {
          setFieldErrors({ username: err.message })
          setToast(err.message)
          setLoading(false)
          return
        }
        setStep(2)
      } finally {
        setLoading(false)
      }
      return
    }

    if (!accepted) {
      setFieldErrors({ accepted: 'Please confirm that you agree to the Terms and Privacy Policy.' })
      setToast('Please agree to the Terms and Privacy Policy.')
      return
    }

    setLoading(true)
    const cleanPhone = form.phone.replace(/\D/g, '')
    const countryCode = form.countryCode.trim().startsWith('+')
      ? form.countryCode.trim()
      : `+${form.countryCode.trim()}`
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()

    try {
      await api.auth.register({
        username: cleanUsername,
        email: form.email.trim(),
        password: form.password,
        firstName,
        lastName,
        dateOfBirth: form.dateOfBirth,
        countryCode,
        mobileNumber: cleanPhone,
      })

      // Update local profile details
      register({
        name: `${firstName} ${lastName}`.trim(),
        username: cleanUsername,
        phone: cleanPhone,
        town: form.town || 'Hyderabad',
        college: form.college || 'Add your college',
        bio: form.bio || 'Learning and sharing skills in Telugu.',
        skills: form.skills || 'Career skills',
      })

      // Automatically log in to establish a LOGIN_SUCCESS session for protected APIs
      try {
        const loginData = await api.auth.login({
          identifier: cleanUsername,
          password: form.password,
        })
        login(loginData)
        navigate('/app', { replace: true })
      } catch {
        navigate('/login', { replace: true })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your details.'
      setToast(msg)
      if (/username/i.test(msg)) {
        setFieldErrors({ username: msg })
        setStep(1)
      } else if (/email/i.test(msg)) {
        setFieldErrors({ email: msg })
        setStep(1)
      } else if (/mobile|phone/i.test(msg)) {
        setFieldErrors({ phone: msg })
        setStep(1)
      } else if (/password/i.test(msg)) {
        setFieldErrors({ password: msg })
        setStep(1)
      } else if (/first.?name/i.test(msg)) {
        setFieldErrors({ firstName: msg })
        setStep(1)
      } else if (/last.?name/i.test(msg)) {
        setFieldErrors({ lastName: msg })
        setStep(1)
      } else if (/dob|birth/i.test(msg)) {
        setFieldErrors({ dateOfBirth: msg })
        setStep(1)
      }
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-dvh md:h-dvh w-full bg-[#E6E0D5] px-4 py-4 md:pt-3 md:pb-5 flex flex-col items-center justify-center overflow-y-auto md:overflow-hidden antialiased">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Top Bar: Brand on Left, Back to Home on Right */}
      <header className="w-full max-w-[960px] flex items-center justify-between mb-2 md:mb-2.5 px-1 shrink-0">
        <Brand to="/" />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#657067] hover:text-[#24372C] transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </header>

      {/* Main Card */}
      <section className="w-full max-w-[960px] overflow-hidden rounded-2xl border border-[#D8D2C8] bg-white shadow-[0_20px_60px_-15px_rgba(36,55,44,0.18)] grid grid-cols-1 md:grid-cols-[330px_1fr] md:min-h-0 md:flex-1 md:max-h-[720px] md:grid-rows-[minmax(0,1fr)]">
        {/* Left Side: Brand & Steps Panel */}
        <div className="bg-[#24372C] text-[#F4F1EA] p-6 sm:p-7 md:p-8 lg:p-9 [@media(min-width:768px)_and_(max-height:760px)]:p-7 flex flex-col justify-between md:min-h-0 md:overflow-hidden">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold tracking-widest text-[#BDE6DF]">
              STEP {step} OF 2 · {step === 1 ? 'ACCOUNT' : 'PROFILE'}
            </span>
            <h1 className="mt-3 text-2xl md:text-[28px] lg:text-[30px] font-bold leading-tight tracking-tight text-white">
              Create your Drama.Money account
            </h1>
            <p className="mt-2.5 text-xs md:text-sm text-[#C7D8D5] hidden md:block leading-relaxed">
              One account lets you watch videos, follow Telugu mentors and become a creator when you upload your first video.
            </p>
          </div>

          <ul className="hidden md:flex flex-col gap-4 [@media(min-width:768px)_and_(max-height:760px)]:gap-3 mt-7 pt-6 [@media(min-width:768px)_and_(max-height:760px)]:mt-4 [@media(min-width:768px)_and_(max-height:760px)]:pt-4 border-t border-white/10 text-xs md:text-sm">
            <li className="flex items-center gap-3.5">
              <span
                className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                  step === 1 ? 'bg-[#F4F1EA] text-[#24372C]' : 'border border-white/30 text-white'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </span>
              <div>
                <strong className="block text-white text-xs md:text-sm">Your account</strong>
                <span className="text-[11.5px] text-[#9FBAB6]">Name, username, email & password</span>
              </div>
            </li>
            <li className="flex items-center gap-3.5">
              <span
                className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                  step === 2 ? 'bg-[#F4F1EA] text-[#24372C]' : 'border border-white/30 text-white'
                }`}
              >
                2
              </span>
              <div>
                <strong className="block text-white text-xs md:text-sm">Your profile</strong>
                <span className="text-[11.5px] text-[#9FBAB6]">College, town and skills</span>
              </div>
            </li>
            <li className="flex items-center gap-3.5 opacity-60">
              <span className="flex size-8 items-center justify-center rounded-full border border-white/30 text-xs font-bold text-white">
                3
              </span>
              <div>
                <strong className="block text-white text-xs md:text-sm">Start exploring</strong>
                <span className="text-[11.5px] text-[#9FBAB6]">No separate creator sign-up</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Right Side: Form */}
        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 md:p-7 lg:p-8 [@media(min-width:768px)_and_(max-height:760px)]:py-5 flex flex-col justify-between bg-white md:min-h-0">
          {step === 1 ? (
            <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:-mr-2 md:pr-2 [scrollbar-width:thin] md:flex md:flex-col">
              <div className="flex items-baseline justify-between mb-3 [@media(min-width:768px)_and_(max-height:760px)]:mb-2.5 border-b border-[#F0EEE9] pb-2.5 [@media(min-width:768px)_and_(max-height:760px)]:pb-2">
                <h2 className="text-xl md:text-2xl font-bold text-[#24372C]">Account details</h2>
                <span className="text-xs text-[#657067]">Step 1 of 2 · Required info</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex-1 md:content-evenly gap-x-5 gap-y-3 sm:gap-y-3.5 [@media(min-width:768px)_and_(max-height:760px)]:gap-y-2.5">
                {/* First Name */}
                <label className={labelClass}>
                  <span>First name *</span>
                  <input
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    autoComplete="given-name"
                    placeholder="e.g. Ravi"
                    className={`${inputClass} ${
                      fieldErrors.firstName ? 'border-[#DC2626] ring-2 ring-[#DC2626]/10' : ''
                    }`}
                  />
                  {fieldErrors.firstName ? (
                    <span className="text-[11px] font-semibold text-[#DC2626] leading-tight">
                      {fieldErrors.firstName}
                    </span>
                  ) : null}
                </label>

                {/* Last Name */}
                <label className={labelClass}>
                  <span>Last name *</span>
                  <input
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    autoComplete="family-name"
                    placeholder="e.g. Kumar"
                    className={`${inputClass} ${
                      fieldErrors.lastName ? 'border-[#DC2626] ring-2 ring-[#DC2626]/10' : ''
                    }`}
                  />
                  {fieldErrors.lastName ? (
                    <span className="text-[11px] font-semibold text-[#DC2626] leading-tight">
                      {fieldErrors.lastName}
                    </span>
                  ) : null}
                </label>

                {/* Username */}
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1">Username * <InfoTip text="3–30 characters (letters, numbers, dot, _)" /></span>
                  <input
                    value={form.username}
                    onChange={(e) => update('username', e.target.value.replace(/\s/g, ''))}
                    autoComplete="username"
                    placeholder="e.g. Ravi.Kumar"
                    className={`${inputClass} ${
                      fieldErrors.username ? 'border-[#DC2626] ring-2 ring-[#DC2626]/10' : ''
                    }`}
                  />
                  {fieldErrors.username ? (
                    <span className="text-[11px] font-semibold text-[#DC2626] leading-tight">
                      {fieldErrors.username}
                    </span>
                  ) : null}
                </label>

                {/* Date of Birth */}
                <label className={labelClass}>
                  <span>Date of birth *</span>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    max={today}
                    min="1950-01-01"
                    onChange={(e) => update('dateOfBirth', e.target.value)}
                    className={`${inputClass} ${
                      fieldErrors.dateOfBirth ? 'border-[#DC2626] ring-2 ring-[#DC2626]/10' : ''
                    }`}
                  />
                  {fieldErrors.dateOfBirth ? (
                    <span className="text-[11px] font-semibold text-[#DC2626] leading-tight">
                      {fieldErrors.dateOfBirth}
                    </span>
                  ) : null}
                </label>

                {/* Email Address */}
                <label className={labelClass}>
                  <span>Email address *</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`${inputClass} ${
                      fieldErrors.email ? 'border-[#DC2626] ring-2 ring-[#DC2626]/10' : ''
                    }`}
                  />
                  {fieldErrors.email ? (
                    <span className="text-[11px] font-semibold text-[#DC2626] leading-tight">
                      {fieldErrors.email}
                    </span>
                  ) : null}
                </label>

                {/* Mobile Number */}
                <label className={labelClass}>
                  <span>Mobile number *</span>
                  <div
                    className={`flex h-11 [@media(min-width:768px)_and_(max-height:760px)]:h-10 w-full items-center overflow-hidden rounded-xl border bg-white ${
                      fieldErrors.phone
                        ? 'border-[#DC2626] ring-2 ring-[#DC2626]/10'
                        : 'border-[#DCE0DD] focus-within:border-[#24372C] focus-within:ring-2 focus-within:ring-[#24372C]/10'
                    }`}
                  >
                    <input
                      list="country-codes"
                      value={form.countryCode}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                        update('countryCode', digits ? `+${digits}` : '')
                      }}
                      placeholder="+91"
                      className="h-full w-16 shrink-0 border-r border-[#DCE0DD] bg-[#F4F1EA] text-center text-xs sm:text-sm font-bold text-[#24372C] outline-none"
                      title="Country code (type or select)"
                    />
                    <datalist id="country-codes">
                      <option value="+91">India (+91)</option>
                      <option value="+1">USA / Canada (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+971">UAE (+971)</option>
                      <option value="+61">Australia (+61)</option>
                      <option value="+65">Singapore (+65)</option>
                      <option value="+966">Saudi Arabia (+966)</option>
                      <option value="+60">Malaysia (+60)</option>
                    </datalist>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      minLength={6}
                      maxLength={14}
                      pattern="[0-9]{6,14}"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 14))}
                      placeholder="Mobile number"
                      className="h-full flex-1 bg-transparent px-3 text-[14px] text-[#24372C] placeholder:text-[#24372C]/40 outline-none"
                    />
                  </div>
                  {fieldErrors.phone ? (
                    <span className="text-[11px] font-semibold text-[#DC2626] leading-tight">
                      {fieldErrors.phone}
                    </span>
                  ) : null}
                </label>

                {/* Password */}
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1">Password * <InfoTip text="Min. 8 characters (upper, lower, digit, symbol)" /></span>
                  <div
                    className={`flex h-11 [@media(min-width:768px)_and_(max-height:760px)]:h-10 w-full items-center overflow-hidden rounded-xl border bg-white ${
                      fieldErrors.password
                        ? 'border-[#DC2626] ring-2 ring-[#DC2626]/10'
                        : 'border-[#DCE0DD] focus-within:border-[#24372C] focus-within:ring-2 focus-within:ring-[#24372C]/10'
                    }`}
                  >
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      className="h-full w-full bg-transparent px-3 text-[14px] text-[#24372C] placeholder:text-[#24372C]/40 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="px-3 text-xs font-bold text-[#657067] hover:text-[#24372C]"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <span className="text-[11px] font-semibold text-[#DC2626] leading-tight">
                      {fieldErrors.password}
                    </span>
                  ) : null}
                </label>

                {/* Confirm Password */}
                <label className={labelClass}>
                  <span>Confirm password *</span>
                  <div
                    className={`flex h-11 [@media(min-width:768px)_and_(max-height:760px)]:h-10 w-full items-center overflow-hidden rounded-xl border bg-white ${
                      fieldErrors.confirmPassword
                        ? 'border-[#DC2626] ring-2 ring-[#DC2626]/10'
                        : 'border-[#DCE0DD] focus-within:border-[#24372C] focus-within:ring-2 focus-within:ring-[#24372C]/10'
                    }`}
                  >
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => update('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      className="h-full w-full bg-transparent px-3 text-[14px] text-[#24372C] placeholder:text-[#24372C]/40 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="px-3 text-xs font-bold text-[#657067] hover:text-[#24372C]"
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword ? (
                    <span className="text-[11px] font-semibold text-[#DC2626] leading-tight">
                      {fieldErrors.confirmPassword}
                    </span>
                  ) : form.confirmPassword ? (
                    <span
                      className={`text-[11px] font-semibold leading-tight ${
                        passwordsMatch ? 'text-[#0F7A55]' : 'text-[#DC2626]'
                      }`}
                    >
                      {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                    </span>
                  ) : null}
                </label>

                {/* Password Rules Checklist */}
                {form.password && (
                  <div className="col-span-1 sm:col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[#DFE3EA] bg-[#F8F9FB] px-2.5 py-1.5 text-[10.5px]">
                    {passwordRules.map((rule, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 font-medium ${
                          rule.valid ? 'text-[#0F7A55]' : 'text-[#667085]'
                        }`}
                      >
                        <strong className="font-bold">{rule.valid ? '✓' : '○'}</strong>
                        <span>{rule.label}</span>
                      </span>
                    ))}
                    {passwordContainsUsername && (
                      <span className="w-full font-semibold text-[#DC2626]">
                        ✕ Password cannot contain your username
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:-mr-2 md:pr-2 [scrollbar-width:thin]">
              <div className="flex items-baseline justify-between mb-2.5 border-b border-[#F0EEE9] pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#24372C]">Set up your profile</h2>
                <span className="text-xs text-[#657067]">Step 2 of 2 · Optional details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <label className={labelClass}>
                  <span>Town or city</span>
                  <input
                    value={form.town}
                    onChange={(e) => update('town', e.target.value)}
                    placeholder="e.g. Vijayawada, Hyderabad"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  <span>College or Institution</span>
                  <input
                    value={form.college}
                    onChange={(e) => update('college', e.target.value)}
                    placeholder="Your college or university"
                    className={inputClass}
                  />
                </label>

                <label className={`${labelClass} sm:col-span-2`}>
                  <span>Skills</span>
                  <input
                    value={form.skills}
                    onChange={(e) => update('skills', e.target.value)}
                    placeholder="e.g. Java, Communication, Banking exams, Web design"
                    className={inputClass}
                  />
                </label>

                <label className={`${labelClass} sm:col-span-2`}>
                  <span>Short bio</span>
                  <textarea
                    value={form.bio}
                    onChange={(e) => update('bio', e.target.value)}
                    maxLength={140}
                    placeholder="Tell the community what you are learning or sharing"
                    className="h-16 w-full rounded-xl border border-[#DCE0DD] bg-white p-2.5 text-[13px] text-[#24372C] placeholder:text-[#24372C]/40 focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10 outline-none transition resize-none"
                  />
                </label>
              </div>

              <label className="mt-3 flex items-start gap-2 text-xs text-[#657067] cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => {
                    setAccepted(e.target.checked)
                    if (fieldErrors.accepted) {
                      setFieldErrors((prev) => {
                        const next = { ...prev }
                        delete next.accepted
                        return next
                      })
                    }
                  }}
                  className="mt-0.5 size-4 accent-[#24372C]"
                />
                <span>
                  I confirm that I am aged 18–24 and agree to the <strong>Terms of Service</strong> and{' '}
                  <Link to="/privacy" className="font-bold text-[#24372C] underline underline-offset-2" target="_blank" rel="noreferrer">Privacy Policy</Link>.
                </span>
              </label>
              {fieldErrors.accepted && (
                <span className="text-[11px] font-semibold text-[#DC2626] mt-1 block">
                  {fieldErrors.accepted}
                </span>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 [@media(min-width:768px)_and_(max-height:760px)]:mt-3 border-t border-[#F0EEE9] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
            <p className="text-xs sm:text-[13px] text-[#657067]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#24372C] underline underline-offset-2">
                Log in
              </Link>
            </p>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {step === 2 && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setStep(1)
                    setFieldErrors({})
                  }}
                  className="h-11 [@media(min-width:768px)_and_(max-height:760px)]:h-10 px-5 rounded-xl border border-[#DCE0DD] text-xs font-bold text-[#24372C] hover:bg-[#F4F1EA] transition"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{ color: '#F4F1EA', backgroundColor: '#24372C' }}
                className="h-11 [@media(min-width:768px)_and_(max-height:760px)]:h-10 flex-1 sm:flex-initial sm:min-w-[190px] px-6 rounded-xl !text-[#F4F1EA] text-xs sm:text-sm font-bold shadow-md hover:bg-[#2F4739] transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <span style={{ color: '#F4F1EA' }} className="!text-[#F4F1EA] text-white">
                  {loading ? 'Please wait...' : step === 1 ? 'Continue to profile' : 'Create account'}
                </span>
                <ChevronRight className="size-4 shrink-0" style={{ color: '#F4F1EA' }} />
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}
