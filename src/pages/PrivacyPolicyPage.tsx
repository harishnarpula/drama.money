import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/AppShell'

const sections = [
  ['overview', 'Overview'],
  ['collect', 'Information we collect'],
  ['use', 'How we use information'],
  ['share', 'How we share information'],
  ['choices', 'Your choices and rights'],
  ['retention', 'Retention and security'],
  ['young-users', 'Young users'],
  ['transfers', 'Data transfers'],
  ['changes', 'Changes to this policy'],
  ['contact', 'Contact us'],
] as const

function ShieldIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 4.5 6v5.5c0 4.5 3.1 8.2 7.5 9.5 4.4-1.3 7.5-5 7.5-9.5V6L12 3Z" />
      <path d="m9.2 12 1.8 1.8 3.9-4" />
    </svg>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-[#24372C]/10 py-8 first:pt-0 last:border-0 last:pb-0 sm:py-10">
      <h2 className="text-2xl font-bold tracking-tight text-[#24372C]">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-[#3F4C44]">{children}</div>
    </section>
  )
}

export default function PrivacyPolicyPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Privacy Policy | Drama.Money'
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="min-h-dvh bg-[#F8F6F1] text-[#24372C]">
      <header className="sticky top-0 z-30 border-b border-[#24372C]/10 bg-[#F8F6F1]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
          <Brand to="/" />
          <Link to="/" className="rounded-full border border-[#24372C]/15 bg-white/60 px-4 py-2 text-sm! font-semibold! text-[#24372C]! transition hover:border-[#24372C]/30 hover:bg-white">
            Back to home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#24372C]/10 bg-[#24372C] text-[#F4F1EA]">
        <div aria-hidden="true" className="absolute -right-24 -top-28 size-96 rounded-full bg-[#4E6E5A]/45 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-44 left-1/4 size-80 rounded-full bg-[#B9CDBE]/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E6E0D5]/15 bg-[#E6E0D5]/8 px-3 py-1.5 text-sm font-semibold text-[#D8E4DA]">
            <ShieldIcon className="size-4" /> Privacy at Drama.Money
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-[-0.035em] sm:text-5xl lg:text-6xl">Your information, explained clearly.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#E6E0D5]/75 sm:text-lg">This policy explains what information Drama.Money collects, why we use it, when we share it, and the choices available to you.</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#E6E0D5]/60">
            <span><strong className="font-semibold text-[#E6E0D5]">Effective:</strong> 28 November 2026</span>
            <span><strong className="font-semibold text-[#E6E0D5]">Applies to:</strong> drama.money and the Drama.Money service</span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-16">
        <aside className="hidden lg:block">
          <nav aria-label="Privacy policy sections" className="sticky top-28 rounded-2xl border border-[#24372C]/10 bg-white/55 p-4">
            <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#4E6E5A]">On this page</p>
            <ul className="space-y-0.5">
              {sections.map(([id, label]) => (
                <li key={id}><a href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm! font-medium! text-[#24372C]/65! transition hover:bg-[#E6E0D5]/55 hover:text-[#24372C]!">{label}</a></li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="min-w-0 rounded-[1.75rem] border border-[#24372C]/10 bg-[#FBFAF6] p-6 shadow-[0_30px_80px_-60px_rgba(36,55,44,0.5)] sm:p-10 lg:p-12">
          <Section id="overview" title="1. Overview">
            <p>Drama.Money is a short-video community focused on jobs, skills, and learning. In this policy, “Drama.Money,” “we,” “us,” and “our” refer to the operator of the Drama.Money service. “You” means a visitor, account holder, viewer, or creator.</p>
            <p>We process personal information to provide the service, keep the community safe, support creator earnings, and meet our legal obligations. We aim to collect only what is reasonably needed for those purposes.</p>
          </Section>

          <Section id="collect" title="2. Information we collect">
            <p>Depending on how you use Drama.Money, we may collect:</p>
            <ul className="list-disc space-y-3 pl-5 marker:text-[#4E6E5A]">
              <li><strong className="text-[#24372C]">Account information:</strong> name, username, email address, mobile number, password in protected form, date of birth, and authentication or session details.</li>
              <li><strong className="text-[#24372C]">Profile information:</strong> profile photo, bio, college, skills, location, country, social links, and other details you choose to add.</li>
              <li><strong className="text-[#24372C]">Content and communications:</strong> posts, reels, covers, captions, hashtags, comments, reports, support messages, and moderation records.</li>
              <li><strong className="text-[#24372C]">Activity information:</strong> content you view, like, save, share, upload, or comment on; accounts you follow; creator statistics; and timestamps.</li>
              <li><strong className="text-[#24372C]">Location:</strong> approximate location from your network and precise latitude and longitude only when you choose a feature that requests location and grant permission.</li>
              <li><strong className="text-[#24372C]">Device and technical information:</strong> IP address, device and browser type, operating system, identifiers, logs, diagnostic data, and security events.</li>
              <li><strong className="text-[#24372C]">Creator payment and verification information:</strong> when you become eligible for a payout, we or our payment and verification partners may collect UPI, bank, PAN, KYC, transaction, and tax-related information.</li>
            </ul>
            <div className="rounded-2xl border border-[#4E6E5A]/15 bg-[#E6E0D5]/45 p-4 text-sm leading-6"><strong className="text-[#24372C]">Browser storage.</strong> We use cookies or similar technologies, including local and session storage, to keep you signed in, remember settings, protect accounts, understand performance, and operate the service.</div>
          </Section>

          <Section id="use" title="3. How we use information">
            <p>We use personal information to:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-[#4E6E5A]">
              <li>create and manage accounts, profiles, authentication, and support;</li>
              <li>deliver, personalise, maintain, and improve Drama.Money;</li>
              <li>publish content and enable likes, comments, follows, saves, shares, and search;</li>
              <li>review content using automated tools and trained moderators, enforce community rules, and investigate fraud, spam, abuse, or security threats;</li>
              <li>calculate creator eligibility, earnings, bonuses, and payouts;</li>
              <li>send service, safety, account, and policy communications; and</li>
              <li>comply with law, resolve disputes, and protect users, Drama.Money, and others.</li>
            </ul>
            <p>Where applicable law requires consent, you may withdraw that consent through the relevant setting or by contacting us. Withdrawal does not affect processing already carried out lawfully.</p>
          </Section>

          <Section id="share" title="4. How we share information">
            <p>We do not sell or rent your personal information. We may share information in these circumstances:</p>
            <ul className="list-disc space-y-3 pl-5 marker:text-[#4E6E5A]">
              <li><strong className="text-[#24372C]">With the community:</strong> your public profile, posts, reels, comments, engagement counts, and other information you make public can be seen and shared by others.</li>
              <li><strong className="text-[#24372C]">With service providers:</strong> vendors that help with hosting, storage, content delivery, analytics, communications, security, moderation, customer support, payments, or identity verification may process information for us under contractual restrictions.</li>
              <li><strong className="text-[#24372C]">For legal and safety reasons:</strong> we may disclose information when reasonably necessary to comply with law or a valid legal request, enforce our rules, or protect rights, safety, and the integrity of the service.</li>
              <li><strong className="text-[#24372C]">During a business change:</strong> information may be transferred as part of a merger, financing, acquisition, restructuring, or sale of assets, subject to appropriate safeguards.</li>
              <li><strong className="text-[#24372C]">At your direction:</strong> we share information when you request it or clearly consent.</li>
            </ul>
          </Section>

          <Section id="choices" title="5. Your choices and rights">
            <p>You can update much of your profile information in the app, control browser permissions such as location, and sign out to clear the active session. You can also ask us to:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-[#4E6E5A]">
              <li>confirm whether we process your personal information and provide a summary;</li>
              <li>correct or complete inaccurate information;</li>
              <li>delete your account or personal information, where applicable;</li>
              <li>withdraw consent or object to certain processing where the law provides; and</li>
              <li>review a privacy complaint or grievance.</li>
            </ul>
            <p>Email <a href="mailto:support@drama.money" className="font-semibold text-[#24372C] underline decoration-[#4E6E5A]/40 underline-offset-4 hover:decoration-[#24372C]">support@drama.money</a> from the address linked to your account. We may need to verify your identity before completing a request. Some information may be retained where required for legal, safety, fraud-prevention, payment, or record-keeping purposes.</p>
          </Section>

          <Section id="retention" title="6. Retention and security">
            <p>We keep personal information only for as long as needed for the purposes described in this policy, including providing the service, maintaining transaction and moderation records, resolving disputes, preventing abuse, and meeting legal obligations. Retention periods vary by the type of information and the reason it is held.</p>
            <p>We use administrative, technical, and organisational safeguards designed to protect information from unauthorised access, alteration, disclosure, or loss. No online service can guarantee absolute security, so please use a strong, unique password and protect your device and login details.</p>
          </Section>

          <Section id="young-users" title="7. Young users">
            <p>Drama.Money is intended for people aged 18 to 24 and is not directed to children under 18. Do not create an account if you are under 18. If we learn that an underage user has provided personal information, we may suspend the account and take reasonable steps to delete the information. A parent or guardian who believes a child has used the service should contact us.</p>
          </Section>

          <Section id="transfers" title="8. Data transfers">
            <p>Our service providers may process information in India or other countries where they operate. When information is transferred, we use safeguards appropriate to the information and comply with restrictions that apply under law.</p>
          </Section>

          <Section id="changes" title="9. Changes to this policy">
            <p>We may update this policy as Drama.Money changes or legal requirements evolve. We will post the revised policy here and update the effective date. If a change materially affects your rights or how we use your information, we will provide additional notice where required.</p>
          </Section>

          <Section id="contact" title="10. Contact us">
            <p>For privacy questions, requests, or grievances, email <a href="mailto:support@drama.money" className="font-semibold text-[#24372C] underline decoration-[#4E6E5A]/40 underline-offset-4 hover:decoration-[#24372C]">support@drama.money</a> with “Privacy” in the subject line. Please do not send passwords, OTPs, full PAN details, or banking credentials by email.</p>
          </Section>
        </article>
      </div>

      <footer className="border-t border-[#24372C]/10 bg-[#FBFAF6]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:px-6 md:flex-row md:text-left">
          <Brand to="/" />
          <p className="text-sm text-[#24372C]/55">© 2026 Drama.Money · Privacy made understandable</p>
        </div>
      </footer>
    </main>
  )
}
