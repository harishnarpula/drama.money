import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/AppShell'
import dramaIcon from '../assets/dramaIcon.png'
import {
  BookmarkIcon, CheckIcon, CommentIcon, HeartIcon, PlayIcon,
  ReelsIcon, SearchIcon, ShareIcon, UserIcon, WalletIcon,
} from '../components/Icons'

/*
  Colours: cream #E6E0D5 and green #24372C (+ light/dark shades of the same two)
  Note: some classes end with "!" so they win over the global a/button rules in index.css.
*/

/* ---------- Small icons used only on this page ---------- */
type SvgProps = { className?: string }
const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
const ArrowRight = ({ className = 'size-4' }: SvgProps) => <svg className={className} {...svg}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
const ArrowLeftIcon = ({ className = 'size-4' }: SvgProps) => <svg className={className} {...svg}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
const MenuIcon = ({ className = 'size-5' }: SvgProps) => <svg className={className} {...svg}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
const CloseIcon = ({ className = 'size-5' }: SvgProps) => <svg className={className} {...svg}><path d="M6 6l12 12M18 6 6 18" /></svg>
const ChevronUp = ({ className = 'size-5' }: SvgProps) => <svg className={className} {...svg}><path d="m6 15 6-6 6 6" /></svg>
const ShieldIcon = ({ className = 'size-5' }: SvgProps) => <svg className={className} {...svg}><path d="M12 3 4 6v6c0 4.6 3.4 8.4 8 9 4.6-.6 8-4.4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
const SparkIcon = ({ className = 'size-5' }: SvgProps) => <svg className={className} {...svg}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>
const MusicIcon = ({ className = 'size-3' }: SvgProps) => <svg className={className} {...svg}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>

/* ---------- Content (from the Drama.Money system design) ---------- */
type Tone = 'forest' | 'sage' | 'stone' | 'moss'
const toneBg: Record<Tone, string> = {
  forest: 'bg-[linear-gradient(160deg,#3E5A49_0%,#1B2A21_100%)]',
  sage: 'bg-[linear-gradient(160deg,#9FB4A3_0%,#3E5A49_100%)]',
  stone: 'bg-[linear-gradient(160deg,#BDB2A0_0%,#4A5A4F_100%)]',
  moss: 'bg-[linear-gradient(160deg,#6F8A76_0%,#24372C_100%)]',
}

type Video = { category: string; title: string; board: string; creator: string; initials: string; town: string; views: string; likes: number; comments: number; time: string; tone: Tone }

const videos: Video[] = [
  { category: 'Interview', title: 'HR రౌండ్‌లో మొదటి ప్రశ్నకు జవాబు', board: 'Tell me about yourself', creator: 'srikanth.hr', initials: 'SK', town: 'Warangal', views: '18K', likes: 2480, comments: 186, time: '0:58', tone: 'forest' },
  { category: 'Govt exams', title: 'గ్రూప్ 2 పాలిటీ — 60 సెకన్లలో', board: 'Article 21 → Right to Life', creator: 'lavanya.prep', initials: 'LV', town: 'Guntur', views: '12K', likes: 1912, comments: 240, time: '1:00', tone: 'sage' },
  { category: 'Skills', title: 'Excel VLOOKUP — తెలుగులో సింపుల్‌గా', board: '=VLOOKUP(A2, B:C, 2, 0)', creator: 'ravi.skills', initials: 'RV', town: 'Karimnagar', views: '22K', likes: 3105, comments: 129, time: '2:10', tone: 'moss' },
  { category: 'Resume', title: 'ఫ్రెషర్ రెజ్యూమ్ ఫార్మాట్', board: '1 page · 3 projects · 0 typos', creator: 'divya.career', initials: 'DV', town: 'Vijayawada', views: '9K', likes: 1240, comments: 98, time: '1:20', tone: 'stone' },
  { category: 'Private jobs', title: 'ఈ వారం వాక్-ఇన్ డ్రైవ్స్', board: 'Walk-in · Hyderabad · Freshers', creator: 'jobs.naveen', initials: 'NV', town: 'Hyderabad', views: '15K', likes: 2010, comments: 310, time: '0:45', tone: 'forest' },
  { category: 'Freshers', title: 'క్యాంపస్ డ్రైవ్‌కి ముందు చెక్‌లిస్ట్', board: 'Campus drive checklist', creator: 'anu.campus', initials: 'AN', town: 'Tirupati', views: '8K', likes: 980, comments: 76, time: '0:38', tone: 'sage' },
  { category: 'Skills', title: 'SQL బేసిక్స్ 2 నిమిషాల్లో', board: 'SELECT * FROM jobs;', creator: 'ravi.skills', initials: 'RV', town: 'Karimnagar', views: '11K', likes: 1530, comments: 112, time: '2:00', tone: 'stone' },
  { category: 'Interview', title: 'Why should we hire you? — బెస్ట్ జవాబు', board: 'Why should we hire you?', creator: 'srikanth.hr', initials: 'SK', town: 'Warangal', views: '21K', likes: 2890, comments: 204, time: '0:52', tone: 'moss' },
]

const categories = [
  { short: 'All', te: 'అన్నీ' },
  { short: 'Private jobs', te: 'ఉద్యోగాలు' },
  { short: 'Interview', te: 'ఇంటర్వ్యూ' },
  { short: 'Skills', te: 'స్కిల్స్' },
  { short: 'Govt exams', te: 'పరీక్షలు' },
  { short: 'Resume', te: 'రెజ్యూమ్' },
  { short: 'Freshers', te: 'ఫ్రెషర్స్' },
]

const tourSteps = [
  { title: 'Sign up with your mobile', text: 'Enter your mobile number and the OTP. It is free, for ages 18–24.' },
  { title: 'Watch short videos', text: 'Scroll, like, comment, follow, share and save videos that help you.' },
  { title: 'Upload what you know', text: 'Add a title, category and thumbnail. Your first upload makes you a creator.' },
  { title: 'Get approved and earn', text: 'Our team checks your video. Approved videos earn money paid to your UPI.' },
]

const comments: { name: string; handle: string; town: string; role: 'Creator' | 'Viewer'; text: string; likes: number; time: string; on: string; tone: Tone }[] = [
  { name: 'Srikanth K', handle: 'srikanth.hr', town: 'Warangal', role: 'Creator', text: 'I post one interview tip every day. When a video is rejected, the reason helps me make the next one better.', likes: 248, time: '2d', on: 'HR round first question', tone: 'forest' },
  { name: 'Anusha M', handle: 'anusha.m', town: 'Vijayawada', role: 'Viewer', text: 'The resume and walk-in videos helped me get my first interview call. Short and clear, in Telugu.', likes: 196, time: '5d', on: 'Fresher resume format', tone: 'sage' },
  { name: 'Lavanya P', handle: 'lavanya.prep', town: 'Guntur', role: 'Creator', text: 'I share Group 2 polity notes in 60 seconds. Watching others also helps my own preparation.', likes: 312, time: '1w', on: 'Group 2 Polity in 60 sec', tone: 'moss' },
  { name: 'Naveen R', handle: 'naveen.r', town: 'Hyderabad', role: 'Viewer', text: 'No movies, no politics. Only useful videos. I open it every morning before going to college.', likes: 154, time: '3d', on: 'Walk-in drives this week', tone: 'stone' },
  { name: 'Ravi T', handle: 'ravi.skills', town: 'Karimnagar', role: 'Creator', text: 'I teach Excel in simple Telugu in under two minutes. The live likes and comments keep me going.', likes: 421, time: '4d', on: 'Excel VLOOKUP in Telugu', tone: 'forest' },
  { name: 'Divya S', handle: 'divya.career', town: 'Tirupati', role: 'Creator', text: 'Got my first payout to UPI after 7 days. KYC was asked only before payout, not before upload.', likes: 287, time: '6d', on: 'Campus drive checklist', tone: 'sage' },
]

const stats = [
  { value: '300', label: 'creators in the first 90 days' },
  { value: '1500', label: 'approved videos' },
  { value: '3000', label: 'weekly viewers' },
  { value: '20-50', label: 'rupees per approved video' },
]

const reviewChecks = ['Video frames', 'Telugu speech', 'Title & description', 'Thumbnail']

const safetyPoints = [
  { icon: SparkIcon, title: 'AI checks every video', text: 'Unsafe scenes, abuse, spam, copied videos and wrong category are flagged in minutes.' },
  { icon: UserIcon, title: 'A real person decides', text: 'AI never approves a video, pays a creator or blocks anyone. Our moderators do.' },
  { icon: ShieldIcon, title: 'Your data stays private', text: 'Videos play only through short-life secure links. PAN and bank details are encrypted.' },
]

const faqs = [
  ['What is Drama.Money?', 'A free short-video app for young people in Telangana and Andhra Pradesh. Watch Telugu videos on jobs and skills, and upload your own videos to earn money.'],
  ['Who can join?', 'Anyone aged 18 to 24 from Telangana or Andhra Pradesh. Sign up with your mobile number and an OTP. One account per person.'],
  ['How much can I earn?', '₹20 to ₹50 for every approved video, based on its category, plus a bonus when 100 real viewers watch it. Up to 2 paid videos per day.'],
  ['When do I get paid?', 'Earnings wait 7 days after approval, then they are paid to your UPI. You need to finish KYC (PAN and bank or UPI) before your first payout — not before uploading.'],
  ['What videos are not allowed?', 'Movies, politics, stock or money tips, medical advice, ads and live streams. Only jobs and skills videos in Telugu, 20 seconds to 3 minutes long.'],
]

const navLinks = [['videos', 'Videos'], ['how', 'How it works'], ['earn', 'Earn'], ['creators', 'Creators'], ['faq', 'FAQ']] as const

/* ---------- Helpers ---------- */
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const compact = (n: number) => (n >= 1000 ? (Math.round(n / 100) / 10) + 'K' : String(n))
const wrap = 'mx-auto w-full max-w-6xl px-5 sm:px-6'

function useInView<T extends Element>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setInView(true)
      observer.disconnect()
    }, { threshold, rootMargin: '0px 0px -6% 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

type From = 'up' | 'left' | 'right' | 'scale'
const hiddenState: Record<From, string> = {
  up: 'translate-y-8 opacity-0',
  left: '-translate-x-10 opacity-0',
  right: 'translate-x-10 opacity-0',
  scale: 'scale-95 opacity-0',
}

function Reveal({ children, from = 'up', delay = 0, className = '' }: { children: ReactNode; from?: From; delay?: number; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} style={{ transitionDelay: delay + 'ms' }} className={'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:translate-none motion-reduce:opacity-100 ' + (inView ? 'translate-none scale-100 opacity-100' : hiddenState[from]) + ' ' + className}>
      {children}
    </div>
  )
}

/* Heading whose letters slide up one by one */
function SplitText({ text, highlight = [], className = '', as = 'h2', highlightClass = 'text-[#4E6E5A]' }: { text: string; highlight?: string[]; className?: string; as?: 'h1' | 'h2'; highlightClass?: string }) {
  const [ref, inView] = useInView<HTMLHeadingElement>(0.3)
  const Tag = as
  let index = 0
  return (
    <Tag ref={ref} aria-label={text} className={className}>
      {text.split(' ').map((word, w, all) => (
        <span key={w}>
          <span aria-hidden="true" className="inline-block overflow-hidden whitespace-nowrap pb-[0.08em] align-bottom">
            {Array.from(word).map((char, c) => (
              <span key={c} style={{ transitionDelay: index++ * 28 + 'ms' }} className={'inline-block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:translate-none motion-reduce:opacity-100 ' + (inView ? 'translate-y-0 opacity-100' : 'translate-y-[0.9em] opacity-0') + (highlight.includes(word) ? ' ' + highlightClass : '')}>{char}</span>
            ))}
          </span>
          {w < all.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  )
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <Reveal>
      <span className={'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ' + (light ? 'text-[#B9CDBE]' : 'text-[#4E6E5A]')}>
        <span className={'h-px w-8 ' + (light ? 'bg-[#B9CDBE]' : 'bg-[#4E6E5A]')} />{children}
      </span>
    </Reveal>
  )
}

/* Primary button: arrow slides in on hover */
function ArrowButton({ to, children, light = false }: { to: string; children: ReactNode; light?: boolean }) {
  return (
    <Link to={to} className={'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm! font-semibold! shadow-[0_14px_30px_-14px_rgba(36,55,44,0.9)] transition-all duration-300 hover:-translate-y-0.5 ' + (light ? 'bg-[#E6E0D5] text-[#24372C]! hover:bg-[#F4F1EA]' : 'bg-[#24372C] text-[#F4F1EA]! hover:bg-[#2F4739]')}>
      <span className="-ml-5 w-0 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:w-4 group-hover:opacity-100"><ArrowRight /></span>
      <span>{children}</span>
      <span className="transition-all duration-300 group-hover:w-0 group-hover:opacity-0"><ArrowRight /></span>
    </Link>
  )
}

/* Video thumbnail art (no photos needed) */
function VideoArt({ video, big = false }: { video: Video; big?: boolean }) {
  return (
    <>
      <span aria-hidden="true" className="absolute -right-10 -top-10 size-40 rounded-full bg-[#E6E0D5]/20 blur-2xl" />
      <span aria-hidden="true" className="absolute -bottom-12 -left-10 size-44 rounded-full bg-[#24372C]/40 blur-2xl" />
      <div className={'absolute top-[24%] rounded-2xl bg-[#F4F1EA]/95 text-[#24372C] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] ' + (big ? 'left-[8%] right-[22%] p-4' : 'inset-x-[9%] p-2.5')}>
        <small className={'block font-bold uppercase tracking-[0.16em] opacity-55 ' + (big ? 'text-[9px]' : 'text-[7px]')}>{video.category}</small>
        <strong className={'mt-1 block font-bold leading-tight ' + (big ? 'text-[15px]' : 'text-[11px]')}>{video.board}</strong>
        {big && <span className="mt-3 flex flex-col gap-1.5"><i className="h-1.5 w-full rounded-full bg-[#24372C]/12" /><i className="h-1.5 w-3/4 rounded-full bg-[#24372C]/12" /></span>}
      </div>
      {big && (
        <div className="absolute left-[9%] top-[56%] flex items-center gap-2 rounded-full bg-black/25 py-1.5 pl-1.5 pr-3 backdrop-blur">
          <span className="grid size-7 place-items-center rounded-full bg-[#E6E0D5] text-[10px] font-bold text-[#24372C]">{video.initials}</span>
          <span aria-hidden="true" className="flex h-4 items-end gap-[3px]">
            {[0, 1, 2, 3, 4].map((i) => <i key={i} style={{ animationDelay: i * 150 + 'ms', height: [40, 90, 60, 100, 50][i] + '%' }} className="w-[3px] animate-pulse rounded-full bg-[#E6E0D5]" />)}
          </span>
        </div>
      )}
    </>
  )
}

/* ---------- Hero: Moj / ShareChat style reel feed ---------- */
const heroReels = [videos[0], videos[1], videos[2], videos[4]]
const REEL_MS = 4200

function HeroReels() {
  const [active, setActive] = useState(0)
  const [filling, setFilling] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(heroReels[0].likes)
  const stageRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((index: number) => {
    const next = (index + heroReels.length) % heroReels.length
    setFilling(false)
    setLiked(false)
    setLikes(heroReels[next].likes)
    setActive(next)
  }, [])

  // Start the story-style progress bar after each change
  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilling(true))
    return () => cancelAnimationFrame(frame)
  }, [active])

  // Next reel automatically
  useEffect(() => {
    if (reduceMotion()) return
    const id = window.setTimeout(() => goTo(active + 1), REEL_MS)
    return () => window.clearTimeout(id)
  }, [active, goTo])

  // Live likes
  useEffect(() => {
    const id = window.setInterval(() => setLikes((n) => n + Math.floor(Math.random() * 3)), 1500)
    return () => window.clearInterval(id)
  }, [])

  const tilt = (event: ReactMouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current
    if (!stage || reduceMotion()) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    stage.style.transform = `rotateY(${x * 10}deg) rotateX(${y * -8}deg)`
  }
  const untilt = () => { if (stageRef.current) stageRef.current.style.transform = '' }

  const reel = heroReels[active]
  const prev = heroReels[(active + heroReels.length - 1) % heroReels.length]
  const next = heroReels[(active + 1) % heroReels.length]

  return (
    <div className="relative mx-auto h-[450px] w-full max-w-[420px] [perspective:1400px] lg:h-[460px]" onMouseMove={tilt} onMouseLeave={untilt}>
      <div ref={stageRef} className="relative h-full w-full transition-transform duration-300 ease-out transform-3d">
        {/* side reels */}
        {[prev, next].map((side, i) => (
          <div key={side.title + i} aria-hidden="true" className={'absolute top-1/2 hidden aspect-[9/16] w-[42%] -translate-y-1/2 overflow-hidden rounded-[1.6rem] opacity-70 shadow-[0_30px_60px_-30px_rgba(36,55,44,0.6)] transition-all duration-700 sm:block ' + toneBg[side.tone] + (i === 0 ? ' left-0 [transform:translateZ(-120px)_rotateY(18deg)]' : ' right-0 [transform:translateZ(-120px)_rotateY(-18deg)]')}>
            <VideoArt video={side} />
          </div>
        ))}

        {/* main reel */}
        <div className="absolute left-1/2 top-1/2 aspect-[9/16] w-[64%] -translate-x-1/2 -translate-y-1/2 sm:w-[54%] [transform:translateZ(40px)]">
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#17241D] shadow-[0_50px_90px_-30px_rgba(23,36,29,0.75),0_0_0_6px_#17241D]">
            {heroReels.map((item, i) => (
              <div key={item.title} aria-hidden={i !== active} className={'absolute inset-0 transition-all duration-700 ease-out ' + toneBg[item.tone] + (i === active ? ' scale-100 opacity-100' : ' scale-105 opacity-0')}>
                <VideoArt video={item} big />
              </div>
            ))}

            {/* stories progress */}
            <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
              {heroReels.map((item, i) => (
                <span key={item.title} className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#F4F1EA]/30">
                  <span style={{ transitionDuration: i === active && filling ? REEL_MS + 'ms' : '0ms' }} className={'block h-full rounded-full bg-[#F4F1EA] transition-[width] ease-linear ' + (i < active || (i === active && filling) ? 'w-full' : 'w-0')} />
                </span>
              ))}
            </div>

            {/* top tabs */}
            <div className="absolute inset-x-0 top-7 z-20 flex items-center justify-center gap-4 text-[11px] font-semibold text-[#F4F1EA]">
              <span className="opacity-60">Following</span>
              <span className="border-b-2 border-[#F4F1EA] pb-0.5">For you</span>
            </div>

            <span className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-linear-to-t from-black/75 via-black/30 to-transparent" />

            {/* right rail */}
            <div className="absolute bottom-24 right-2.5 z-20 flex flex-col items-center gap-3.5 text-[10px] font-semibold text-[#F4F1EA]">
              <button type="button" aria-label="Like" aria-pressed={liked} onClick={() => setLiked((v) => !v)} className="flex flex-col items-center gap-1 text-[10px]! font-semibold! text-[#F4F1EA]! transition active:scale-90">
                <HeartIcon className={'size-6 transition-transform duration-300 ' + (liked ? 'scale-125 fill-[#F4F1EA]' : '')} />{compact(likes + (liked ? 1 : 0))}
              </button>
              <span className="flex flex-col items-center gap-1"><CommentIcon className="size-6" />{reel.comments}</span>
              <span className="flex flex-col items-center gap-1"><ShareIcon className="size-6" />Share</span>
              <span className="flex flex-col items-center gap-1"><BookmarkIcon className="size-6" />Save</span>
            </div>

            {/* caption */}
            <div className="absolute bottom-4 left-3.5 right-14 z-20 text-[#F4F1EA]">
              <div className="flex items-center gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E6E0D5] text-[10px] font-bold text-[#24372C] ring-2 ring-[#8FA894]">{reel.initials}</span>
                <strong className="truncate text-xs">@{reel.creator}</strong>
                <span className="shrink-0 rounded-md border border-[#F4F1EA]/70 px-1.5 py-0.5 text-[9px] font-bold">Follow</span>
              </div>
              <p lang="te" className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug">{reel.title}</p>
              <span className="mt-1.5 flex items-center gap-1 text-[10px] opacity-80"><MusicIcon /> Original audio · {reel.town}</span>
            </div>

            {/* tap areas */}
            <button type="button" aria-label="Previous video" onClick={() => goTo(active - 1)} className="absolute inset-y-16 left-0 z-10 w-1/4" />
            <button type="button" aria-label="Next video" onClick={() => goTo(active + 1)} className="absolute inset-y-16 right-14 z-10 w-1/4" />
          </div>
        </div>

        {/* floating chips */}
        <div className="absolute -left-1 top-[12%] z-30 hidden sm:flex items-center gap-2.5 rounded-2xl border border-[#24372C]/10 bg-[#FBFAF6]/95 px-3 py-2.5 shadow-[0_20px_40px_-20px_rgba(36,55,44,0.5)] backdrop-blur [transform:translateZ(110px)] sm:-left-4">
          <span className="grid size-8 place-items-center rounded-xl bg-[#24372C] text-[#E6E0D5]"><CheckIcon className="size-4" /></span>
          <span className="text-[11px] leading-tight text-[#24372C]/65"><strong className="block text-xs text-[#24372C]">Approved</strong>by our team</span>
        </div>
        <div className="absolute bottom-[12%] right-0 z-30 flex items-center gap-2.5 rounded-2xl border border-[#24372C]/10 bg-[#FBFAF6]/95 px-3 py-2.5 shadow-[0_20px_40px_-20px_rgba(36,55,44,0.5)] backdrop-blur [transform:translateZ(130px)] sm:-right-4">
          <span className="grid size-8 place-items-center rounded-xl bg-[#24372C] text-[#E6E0D5]"><WalletIcon className="size-4" /></span>
          <span className="text-[11px] leading-tight text-[#24372C]/65"><strong className="block text-xs text-[#24372C]">+ ₹40 earned</strong>for this video</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- How it works: app tour with a changing phone screen ---------- */
const TOUR_MS = 3800

function AppTour({ header }: { header: ReactNode }) {
  const [step, setStep] = useState(0)
  const [filling, setFilling] = useState(false)
  const [paused, setPaused] = useState(false)
  const [ref, inView] = useInView<HTMLDivElement>(0.3)

  const choose = (index: number) => { setFilling(false); setStep(index) }

  useEffect(() => {
    if (!inView) return
    const frame = requestAnimationFrame(() => setFilling(true))
    return () => cancelAnimationFrame(frame)
  }, [step, inView])

  useEffect(() => {
    if (!inView || paused || reduceMotion()) return
    const id = window.setTimeout(() => { setFilling(false); setStep((s) => (s + 1) % tourSteps.length) }, TOUR_MS)
    return () => window.clearTimeout(id)
  }, [step, inView, paused])

  const screen = (index: number) => 'absolute inset-0 transition-all duration-500 ease-out ' + (step === index ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')

  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
      {/* step list */}
      <div>
      {header}
      <ol className="mt-7 grid gap-3">
        {tourSteps.map((item, i) => {
          const active = step === i
          return (
            <li key={item.title}>
              <button type="button" onClick={() => { setPaused(true); choose(i) }} className={'relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-500 sm:p-5 ' + (active ? 'border-[#24372C] bg-[#24372C] shadow-[0_20px_40px_-24px_rgba(36,55,44,0.9)]' : 'border-[#24372C]/10 bg-[#F4F1EA] hover:border-[#24372C]/30')}>
                <span className="flex items-start gap-4">
                  <span className={'grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold transition-colors duration-500 ' + (active ? 'bg-[#E6E0D5] text-[#24372C]' : 'bg-[#E6E0D5]/70 text-[#24372C]/60')}>{i + 1}</span>
                  <span className="min-w-0">
                    <span className={'block text-base font-semibold transition-colors duration-500 ' + (active ? 'text-[#F4F1EA]' : 'text-[#24372C]')}>{item.title}</span>
                    <span className={'mt-1 block text-sm leading-relaxed transition-colors duration-500 ' + (active ? 'text-[#E6E0D5]/75' : 'text-[#24372C]/60')}>{item.text}</span>
                  </span>
                </span>
                {active && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#E6E0D5]/15"><span style={{ transitionDuration: filling && !paused ? TOUR_MS + 'ms' : '0ms' }} className={'block h-full bg-[#B9CDBE] transition-[width] ease-linear ' + (filling || paused ? 'w-full' : 'w-0')} /></span>}
              </button>
            </li>
          )
        })}
      </ol>
      </div>

      {/* phone */}
      <div className="relative mx-auto">
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E6E0D5] blur-2xl" />
        <span className="absolute -right-3 top-8 z-20 rounded-full bg-[#24372C] px-3 py-1.5 text-[11px] font-semibold text-[#E6E0D5] shadow-lg sm:-right-10">Step {step + 1} of 4</span>
        <div className="relative aspect-[9/18] w-[250px] rounded-[2.2rem] bg-[#17241D] p-2 shadow-[0_40px_80px_-30px_rgba(23,36,29,0.75)] transition-transform duration-500 hover:-translate-y-1 hover:[transform:rotateY(-6deg)] sm:w-[270px]">
          <div className="relative h-full overflow-hidden rounded-[1.8rem] bg-[#FBFAF6]">
            <span className="absolute left-1/2 top-2 z-30 h-4 w-16 -translate-x-1/2 rounded-full bg-[#17241D]" />

            {/* 1. sign up */}
            <div className={screen(0) + ' flex flex-col px-5 pt-14'}>
              <img src={dramaIcon} alt="" className="h-14 w-auto self-start object-contain" />
              <strong className="mt-5 text-lg">Welcome</strong>
              <span className="text-xs text-[#24372C]/60">Sign up with your mobile number</span>
              <span className="mt-5 rounded-xl border border-[#24372C]/15 bg-[#F4F1EA] px-3 py-2.5 text-sm"><span className="text-[#24372C]/50">+91 </span>98480 •••10</span>
              <span className="mt-4 text-[11px] font-semibold text-[#24372C]/60">Enter OTP</span>
              <span className="mt-2 grid grid-cols-4 gap-2">{['4', '7', '2', '9'].map((d, i) => <span key={i} className={'grid h-11 place-items-center rounded-xl border text-base font-bold transition-all duration-500 ' + (step === 0 ? 'border-[#24372C] bg-[#F4F1EA]' : 'border-[#24372C]/15')} style={{ transitionDelay: i * 150 + 'ms' }}>{d}</span>)}</span>
              <span className="mt-auto mb-6 rounded-xl bg-[#24372C] py-3 text-center text-sm font-semibold text-[#E6E0D5]">Verify &amp; continue</span>
            </div>

            {/* 2. watch */}
            <div className={screen(1) + ' ' + toneBg.forest}>
              <VideoArt video={videos[1]} big />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-20 right-2 flex flex-col items-center gap-3 text-[9px] font-semibold text-[#F4F1EA]">
                <span className="flex flex-col items-center"><HeartIcon className="size-5 fill-[#F4F1EA]" />1.9K</span>
                <span className="flex flex-col items-center"><CommentIcon className="size-5" />240</span>
                <span className="flex flex-col items-center"><ShareIcon className="size-5" />Share</span>
              </div>
              <div className="absolute bottom-4 left-3 right-12 text-[#F4F1EA]">
                <strong className="text-xs">@lavanya.prep</strong>
                <p lang="te" className="mt-1 text-[11px] leading-snug opacity-90">గ్రూప్ 2 పాలిటీ — 60 సెకన్లలో</p>
              </div>
            </div>

            {/* 3. upload */}
            <div className={screen(2) + ' flex flex-col gap-3 px-4 pt-12'}>
              <strong className="text-base">New video</strong>
              <span className="rounded-xl border border-[#24372C]/12 bg-[#F4F1EA] px-3 py-2"><small className="block text-[9px] font-semibold text-[#24372C]/55">Title</small><span className="text-xs font-semibold">Excel VLOOKUP in Telugu</span></span>
              <span className="rounded-xl border border-[#24372C]/12 bg-[#F4F1EA] px-3 py-2"><small className="block text-[9px] font-semibold text-[#24372C]/55">Category</small><span className="text-xs font-semibold">Skill building</span></span>
              {[['video.mp4', '2:10 · 720p', 'duration-[2600ms]'], ['thumbnail.jpg', 'JPG · 1.2 MB', 'duration-[1400ms]']].map(([name, note, speed]) => (
                <span key={name} className="rounded-xl bg-[#24372C] p-3 text-[#E6E0D5]">
                  <span className="flex justify-between text-[11px]"><strong>{name}</strong><span className="opacity-60">{note}</span></span>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#E6E0D5]/15"><span className={'block h-full rounded-full bg-[#B9CDBE] transition-[width] ease-out ' + speed + ' ' + (step === 2 ? 'w-full' : 'w-0')} /></span>
                </span>
              ))}
              <span className="mt-auto mb-5 rounded-xl bg-[#24372C] py-3 text-center text-sm font-semibold text-[#E6E0D5]">Submit for review</span>
            </div>

            {/* 4. earn */}
            <div className={screen(3) + ' flex flex-col px-4 pt-12'}>
              <span className={'flex items-center gap-2 rounded-xl bg-[#24372C] p-3 text-[#E6E0D5] transition-all delay-200 duration-500 ' + (step === 3 ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0')}>
                <span className="grid size-7 place-items-center rounded-full bg-[#B9CDBE] text-[#24372C]"><CheckIcon className="size-4" /></span>
                <span className="text-[11px] leading-tight"><strong className="block text-xs">Video approved</strong>₹50 added to your earnings</span>
              </span>
              <small className="mt-5 text-[11px] text-[#24372C]/55">Total earned</small>
              <strong className="text-3xl font-bold tracking-tight">₹1,240</strong>
              <div className="mt-4 grid grid-cols-3 gap-1.5 text-center">
                {[['Hold', '₹280'], ['Ready', '₹410'], ['Paid', '₹550']].map(([l, v]) => <span key={l} className="rounded-lg bg-[#F4F1EA] py-2"><small className="block text-[9px] text-[#24372C]/55">{l}</small><strong className="text-xs">{v}</strong></span>)}
              </div>
              <span className="mt-4 rounded-xl border border-[#24372C]/10 p-3">
                <span className="flex justify-between text-[10px]"><span className="text-[#24372C]/60">Bonus</span><strong>72 / 100 viewers</strong></span>
                <span className="mt-2 block h-1.5 rounded-full bg-[#24372C]/10"><span className="block h-full w-[72%] rounded-full bg-[#3E5A49]" /></span>
              </span>
              <span className="mt-auto mb-5 flex items-center justify-center gap-2 rounded-xl bg-[#E6E0D5] py-3 text-sm font-semibold"><WalletIcon className="size-4" /> Paid to UPI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Safety: animated review of one video ---------- */
function ReviewDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduceMotion()) {
      const frame = requestAnimationFrame(() => setPhase(6))
      return () => cancelAnimationFrame(frame)
    }
    const id = window.setInterval(() => setPhase((p) => (p >= 8 ? 0 : p + 1)), 850)
    return () => window.clearInterval(id)
  }, [inView])

  const scanning = phase >= 1 && phase <= 4
  const approved = phase >= 6

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[460px]">
      <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[3rem] bg-[#E6E0D5] blur-2xl" />
      <div className="rounded-[2rem] bg-[#24372C] p-5 text-[#E6E0D5] shadow-[0_40px_80px_-35px_rgba(23,36,29,0.85)] sm:p-6">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 font-semibold"><span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-[#B9CDBE]" /><span className="relative size-2 rounded-full bg-[#B9CDBE]" /></span>Review in progress</span>
          <span className="rounded-full bg-[#E6E0D5]/10 px-2.5 py-1 text-[#E6E0D5]/70">Video #1024</span>
        </div>

        <div className="mt-5 flex gap-4">
          {/* video being checked */}
          <div className={'relative aspect-[9/16] w-32 shrink-0 overflow-hidden rounded-2xl sm:w-36 ' + toneBg.moss}>
            <VideoArt video={videos[2]} />
            <span style={{ top: scanning ? ((phase - 1) / 3) * 100 + '%' : '0%' }} className={'absolute inset-x-0 h-10 -translate-y-1/2 bg-linear-to-b from-transparent via-[#B9CDBE]/50 to-transparent transition-[top,opacity] duration-[850ms] ease-linear ' + (scanning ? 'opacity-100' : 'opacity-0')} />
            <span className={'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-lg border-2 border-[#F4F1EA] bg-[#24372C]/80 px-3 py-1 text-xs font-extrabold tracking-[0.2em] text-[#F4F1EA] transition-all duration-500 ' + (approved ? 'scale-100 opacity-100' : 'scale-150 opacity-0')}>APPROVED</span>
          </div>

          {/* checklist */}
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E6E0D5]/50">AI checks</span>
            <ul className="mt-2 space-y-2">
              {reviewChecks.map((check, i) => {
                const done = phase > i + 1 || phase >= 5
                const active = phase === i + 1
                return (
                  <li key={check} className={'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-colors duration-300 ' + (active ? 'bg-[#E6E0D5]/12' : 'bg-[#E6E0D5]/[0.04]')}>
                    <span className={'grid size-5 shrink-0 place-items-center rounded-full transition-all duration-300 ' + (done ? 'bg-[#B9CDBE] text-[#24372C]' : 'border border-[#E6E0D5]/30')}>{done ? <CheckIcon className="size-3" /> : active ? <span className="size-1.5 animate-pulse rounded-full bg-[#E6E0D5]" /> : null}</span>
                    <span className={done || active ? '' : 'text-[#E6E0D5]/50'}>{check}</span>
                  </li>
                )
              })}
            </ul>
            <div className={'mt-3 flex items-center justify-between rounded-xl border px-2.5 py-2 text-xs transition-all duration-500 ' + (phase >= 5 ? 'border-[#B9CDBE]/50 opacity-100' : 'border-[#E6E0D5]/10 opacity-40')}>
              <span className="text-[#E6E0D5]/60">Risk level</span>
              <strong>{phase >= 5 ? 'Clean' : '—'}</strong>
            </div>
          </div>
        </div>

        {/* moderator */}
        <div className="mt-5 rounded-2xl bg-[#E6E0D5]/[0.06] p-3.5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E6E0D5] text-[11px] font-bold text-[#24372C]">PR</span>
            <span className="min-w-0 flex-1 text-xs leading-tight"><strong className="block text-sm">Moderator</strong><span className="text-[#E6E0D5]/55">Final decision by a person</span></span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
            <span className={'flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all duration-500 ' + (approved ? 'bg-[#B9CDBE] text-[#24372C]' : 'bg-[#E6E0D5]/10 text-[#E6E0D5]/60')}><CheckIcon className="size-3.5" />Approve</span>
            <span className="flex items-center justify-center rounded-xl border border-[#E6E0D5]/15 py-2.5 text-[#E6E0D5]/50">Reject with reason</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Rolling digits */
function Odometer({ value }: { value: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4)
  let digit = 0
  return (
    <span ref={ref} aria-label={value} className="inline-flex items-end leading-none tabular-nums">
      {Array.from(value).map((char, i) => {
        if (!/\d/.test(char)) return <span key={i} aria-hidden="true" className="inline-block h-[1.1em] leading-[1.1em]">{char === '-' ? '–' : char}</span>
        const d = Number(char)
        const order = digit++
        return (
          <span key={i} aria-hidden="true" className="inline-block h-[1.1em] overflow-hidden leading-[1.1em]">
            <span className="flex flex-col transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: `translateY(${inView ? -(10 + d) * 1.1 : 0}em)`, transitionDelay: order * 120 + 'ms' }}>
              {Array.from({ length: 20 }, (_, n) => <span key={n} className="h-[1.1em]">{n % 10}</span>)}
            </span>
          </span>
        )
      })}
    </span>
  )
}

/* ---------- Page ---------- */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [category, setCategory] = useState('All')
  const [openFaq, setOpenFaq] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)

  // Header shadow + back-to-top ring
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      setScrolled(doc.scrollTop > 8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const frame = requestAnimationFrame(onScroll)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll) }
  }, [])

  // Highlight the menu link of the section on screen
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    navLinks.forEach(([id]) => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const shown = category === 'All' ? videos : [...videos.filter((v) => v.category === category), ...videos.filter((v) => v.category !== category)]
  // Smooth, animated move to a section (instead of a sudden jump)
  const goToSection = (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    setMenuOpen(false)
    target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', '#' + id)
  }
  const scrollStrip = (dir: number) => stripRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-[#FBFAF6] text-[#24372C] antialiased selection:bg-[#24372C] selection:text-[#E6E0D5]">
      {/* soft background glow behind header + hero */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px] overflow-hidden">
        <div className="absolute -right-40 -top-40 size-[680px] rounded-full bg-[#E6E0D5] blur-3xl" />
        <div className="absolute -left-40 top-[380px] size-[440px] rounded-full bg-[#DCE5DD] blur-3xl" />
      </div>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <div className={'mx-auto max-w-6xl rounded-[1.75rem] border border-[#24372C]/10 bg-[#F4F1EA]/85 backdrop-blur-xl transition-shadow duration-300 ' + (scrolled ? 'shadow-[0_14px_40px_-18px_rgba(36,55,44,0.45)]' : '')}>
          <div className="flex h-16 items-center justify-between gap-3 pl-4 pr-2 sm:pl-5">
            <Brand to="/" />
            <nav aria-label="Landing navigation" className="hidden items-center gap-1 lg:flex">
              {navLinks.map(([id, label]) => (
                <a key={id} href={'#' + id} onClick={(e) => goToSection(e, id)} className={'relative rounded-full px-4 py-2 text-sm! font-semibold! transition-colors hover:bg-[#24372C]/6 ' + (activeSection === id ? 'text-[#24372C]!' : 'text-[#24372C]/65!')}>
                  {label}
                  <span className={'absolute bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-[#24372C] transition-all duration-300 ' + (activeSection === id ? 'w-4' : 'w-0')} />
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-1.5">
              <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm! font-semibold! transition hover:bg-[#24372C]/6 sm:inline-flex">Log in</Link>
              <Link to="/register" className="rounded-full bg-[#24372C] px-4 py-2.5 text-sm! font-semibold! text-[#F4F1EA]! shadow-[0_10px_24px_-12px_rgba(36,55,44,0.9)] transition hover:bg-[#2F4739] whitespace-nowrap sm:px-5">Sign up<span className="hidden sm:inline"> free</span></Link>
              <button type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className="grid size-10 place-items-center rounded-full border border-[#24372C]/15 lg:hidden">{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
            </div>
          </div>
          <div className={'grid transition-all duration-500 lg:hidden ' + (menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
            <div className="overflow-hidden">
              <nav className="flex flex-col px-5 pb-4">
                {navLinks.map(([id, label]) => <a key={id} href={'#' + id} onClick={(e) => goToSection(e, id)} className="border-b border-[#24372C]/8 py-3 text-[15px]! font-semibold! last:border-0">{label}</a>)}
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-3 text-[15px]! font-semibold! sm:hidden">Log in</Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative">
        <div className={wrap + ' grid items-center gap-10 pb-12 pt-8 lg:grid-cols-[1fr_1fr] lg:gap-6 lg:pb-14 lg:pt-6'}>
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#24372C]/12 bg-[#F4F1EA] px-3.5 py-1.5 text-xs font-semibold">
                <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-[#8FA894]" /><span className="relative size-2 rounded-full bg-[#3E5A49]" /></span>
                Telugu short videos · Jobs &amp; skills
              </span>
            </Reveal>
            <SplitText as="h1" text="Watch, learn and earn with short Telugu videos" highlight={['earn']} className="mx-auto mt-5 max-w-xl text-[1.85rem] font-bold leading-[1.15] tracking-tight sm:text-[2.2rem] lg:mx-0 lg:text-[2.5rem]" />
            <Reveal delay={150}>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#24372C]/70 lg:mx-0">Scroll 1-minute videos on jobs, interviews, exams and skills. Share what you know and get paid for every video our team approves.</p>
            </Reveal>
            <Reveal delay={250}>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <ArrowButton to="/register">Create free account</ArrowButton>
                <a href="#videos" onClick={(e) => goToSection(e, 'videos')} className="inline-flex items-center gap-2 rounded-full border border-[#24372C]/15 bg-[#F4F1EA] px-6 py-3 text-sm! font-semibold! transition hover:-translate-y-0.5 hover:bg-[#E6E0D5]"><PlayIcon className="size-4" /> Watch videos</a>
              </div>
            </Reveal>
            <Reveal delay={350}>
              <div className="mt-7 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex -space-x-2.5">
                  {['SK', 'LV', 'RV', 'DV', 'AN'].map((i, n) => <span key={i} className={'grid size-9 place-items-center rounded-full border-2 border-[#FBFAF6] text-[10px] font-bold text-[#F4F1EA] ' + toneBg[(['forest', 'sage', 'moss', 'stone', 'forest'] as Tone[])[n]]}>{i}</span>)}
                </div>
                <p className="text-left text-xs leading-snug text-[#24372C]/65"><strong className="block text-sm text-[#24372C]">Creators from 30+ towns</strong>Warangal, Guntur, Karimnagar, Tirupati…</p>
              </div>
            </Reveal>
          </div>
          <Reveal from="scale" delay={200}><HeroReels /></Reveal>
        </div>
      </section>

      {/* ================= VIDEOS (stories + trending) ================= */}
      <section id="videos" className="scroll-mt-24 border-y border-[#24372C]/8 bg-[#F4F1EA] py-14 sm:py-16">
        <div className={wrap}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Trending now</Eyebrow>
              <SplitText text="Short videos that help you get a job" highlight={['job']} className="mt-3 max-w-md text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2rem]" />
            </div>
            <Reveal from="right" className="flex items-center gap-2">
              <button type="button" aria-label="Scroll left" onClick={() => scrollStrip(-1)} className="grid size-11 place-items-center rounded-full border border-[#24372C]/25 transition hover:bg-[#24372C] hover:text-[#E6E0D5]!"><ArrowLeftIcon /></button>
              <button type="button" aria-label="Scroll right" onClick={() => scrollStrip(1)} className="grid size-11 place-items-center rounded-full border border-[#24372C]/25 transition hover:bg-[#24372C] hover:text-[#E6E0D5]!"><ArrowRight /></button>
            </Reveal>
          </div>

          {/* story-style categories */}
          <Reveal delay={100}>
            <div className="-mx-5 mt-8 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              {categories.map((c) => {
                const active = category === c.short
                return (
                  <button key={c.short} type="button" onClick={() => setCategory(c.short)} className="group flex w-[76px] shrink-0 flex-col items-center gap-1.5 text-center">
                    <span className={'grid size-[68px] place-items-center rounded-full p-[3px] transition duration-300 group-hover:-translate-y-1 ' + (active ? 'bg-[conic-gradient(#24372C,#8FA894,#24372C)]' : 'bg-[conic-gradient(#8FA894,#E6E0D5,#4E6E5A,#8FA894)]')}>
                      <span className={'grid size-full place-items-center rounded-full border-[3px] border-[#F4F1EA] transition-colors ' + (active ? 'bg-[#24372C] text-[#E6E0D5]' : 'bg-[#FBFAF6]')}>{c.short === 'All' ? <SearchIcon className="size-6" /> : <ReelsIcon className="size-6" />}</span>
                    </span>
                    <span className="text-[12px] font-semibold leading-tight">{c.short}</span>
                    <span lang="te" className="-mt-1 text-[10px] text-[#24372C]/55">{c.te}</span>
                  </button>
                )
              })}
            </div>
          </Reveal>

          {/* trending strip */}
          <Reveal delay={150}>
            <div ref={stripRef} className="-mx-5 mt-6 flex snap-x gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              {shown.map((video) => (
                <article key={video.title} className="group w-[170px] shrink-0 snap-start sm:w-[200px]">
                  <div className={'relative aspect-[9/16] overflow-hidden rounded-[1.4rem] shadow-[0_24px_50px_-28px_rgba(36,55,44,0.7)] transition duration-500 group-hover:-translate-y-1.5 ' + toneBg[video.tone]}>
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"><VideoArt video={video} /></div>
                    <span className="absolute right-2.5 top-2.5 rounded-md bg-black/35 px-1.5 py-0.5 text-[10px] font-semibold text-[#F4F1EA]">{video.time}</span>
                    <span className="absolute left-1/2 top-[62%] grid size-11 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-[#F4F1EA]/90 text-[#24372C] opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100"><PlayIcon className="ml-0.5 size-4" /></span>
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 pt-10 text-[#F4F1EA]">
                      <p lang="te" className="line-clamp-2 text-xs font-semibold leading-snug">{video.title}</p>
                      <span className="mt-1.5 flex items-center justify-between text-[10px] opacity-85"><span className="flex items-center gap-1"><PlayIcon className="size-3" />{video.views}</span><span className="flex items-center gap-1"><HeartIcon className="size-3" />{compact(video.likes)}</span></span>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 px-1">
                    <span className={'grid size-6 shrink-0 place-items-center rounded-full text-[8px] font-bold text-[#F4F1EA] ' + toneBg[video.tone]}>{video.initials}</span>
                    <span className="truncate text-xs font-semibold">@{video.creator}</span>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className={wrap + ' scroll-mt-24 py-14 sm:py-20'}>
        <AppTour header={<><Eyebrow>How it works</Eyebrow><SplitText text="From watching to earning in 4 steps" highlight={['earning']} className="mt-3 max-w-lg text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2rem]" /></>} />
      </section>

      {/* ================= EARN ================= */}
      <section id="earn" className="scroll-mt-24 bg-[#F4F1EA] py-14 sm:py-20">
        <div className={wrap + ' grid items-center gap-12 lg:grid-cols-2'}>
          <div>
            <Eyebrow>Creator earnings</Eyebrow>
            <SplitText text="Your knowledge can pay you" highlight={['pay']} className="mt-3 max-w-md text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2rem]" />
            <Reveal delay={150}>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#24372C]/70">You earn for approved videos and real viewers — not fake views. Money goes to your UPI after a short waiting time.</p>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[['₹20–50', 'for every approved video'], ['Bonus', 'at 100 real viewers'], ['7 days', 'wait before payout'], ['KYC', 'only before first payout']].map(([value, label], i) => (
                <Reveal key={label} delay={i * 90}>
                  <div className="group h-full rounded-2xl border border-[#24372C]/10 bg-[#FBFAF6] p-4 transition-all duration-500 hover:-translate-y-1 hover:bg-[#24372C] hover:text-[#E6E0D5]">
                    <strong className="block text-xl font-bold">{value}</strong>
                    <span className="text-sm opacity-70">{label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={300}><p className="mt-5 max-w-md text-xs leading-relaxed text-[#24372C]/55">A real viewer is a logged-in user (not you) who watches at least 10 seconds or 30% of your video.</p></Reveal>
          </div>

          <Reveal from="right" delay={150}>
            <div className="mx-auto max-w-md [perspective:1400px]">
              <div className="rounded-[2rem] bg-[linear-gradient(150deg,#2F4739,#1B2A21)] p-6 text-[#E6E0D5] shadow-[0_50px_100px_-40px_rgba(23,36,29,0.85)] transition-transform duration-700 ease-out [transform:rotateY(-10deg)_rotateX(6deg)] hover:[transform:none] sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold"><WalletIcon className="size-5" /> My earnings</span>
                  <span className="rounded-full bg-[#E6E0D5]/10 px-3 py-1 text-xs">November</span>
                </div>
                <small className="mt-7 block text-xs text-[#E6E0D5]/60">Total earned</small>
                <strong className="block text-4xl font-bold tracking-tight">₹1,240</strong>
                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                  {[['On hold', '₹280'], ['Ready', '₹410'], ['Paid', '₹550']].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-[#E6E0D5]/8 py-3"><span className="block text-[11px] text-[#E6E0D5]/60">{label}</span><strong className="text-base">{value}</strong></div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-[#E6E0D5]/6 p-4">
                  <div className="flex items-center justify-between text-xs"><span className="text-[#E6E0D5]/70">Bonus progress</span><strong>72 / 100 viewers</strong></div>
                  <span className="mt-2 block h-2 rounded-full bg-[#E6E0D5]/12"><span className="block h-full w-[72%] rounded-full bg-[#B9CDBE]" /></span>
                </div>
                <div className="mt-4 space-y-2">
                  {[videos[0], videos[2]].map((v, i) => (
                    <div key={v.title} className="flex items-center gap-3 rounded-xl bg-[#E6E0D5]/6 p-2.5">
                      <span className={'grid size-9 shrink-0 place-items-center rounded-lg ' + toneBg[v.tone]}><PlayIcon className="size-3.5" /></span>
                      <span className="min-w-0 flex-1"><strong lang="te" className="block truncate text-xs">{v.title}</strong><span className="text-[10px] text-[#E6E0D5]/55">Approved</span></span>
                      <strong className="text-sm">{i === 0 ? '₹40' : '₹50'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= COMMUNITY ================= */}
      <section id="creators" className="scroll-mt-24 py-14 sm:py-20">
        <div className={wrap}>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Community</Eyebrow>
            <SplitText text="Comments from our creators and viewers" highlight={['creators', 'viewers']} className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem]" />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {comments.map((c, i) => (
              <Reveal key={c.handle} delay={(i % 3) * 110} className={i % 3 === 1 ? 'md:mt-6' : ''}>
                <article className="group h-full rounded-2xl border border-[#24372C]/10 bg-[#F4F1EA] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#24372C]/25 hover:bg-[#FBFAF6] hover:shadow-[0_24px_50px_-30px_rgba(36,55,44,0.6)]">
                  <span className="flex items-center gap-1.5 text-[11px] text-[#24372C]/50"><PlayIcon className="size-3" /> on “{c.on}”</span>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={'grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold text-[#F4F1EA] ring-2 ring-[#FBFAF6] ' + toneBg[c.tone]}>{c.name.split(' ').map((part) => part[0]).join('')}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><strong className="truncate text-sm">{c.name}</strong><span className={'rounded-full px-2 py-0.5 text-[10px] font-semibold ' + (c.role === 'Creator' ? 'bg-[#24372C] text-[#E6E0D5]' : 'bg-[#E6E0D5]')}>{c.role}</span></span>
                      <span className="text-xs text-[#24372C]/55">@{c.handle} · {c.town} · {c.time}</span>
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#24372C]/80">{c.text}</p>
                  <div className="mt-4 flex items-center gap-5 border-t border-[#24372C]/8 pt-3 text-xs font-semibold text-[#24372C]/60">
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-[#24372C]"><HeartIcon className="size-4" />{c.likes}</span>
                    <span className="flex items-center gap-1.5"><CommentIcon className="size-4" />Reply</span>
                    <span className="ml-auto flex items-center gap-1.5"><ShareIcon className="size-4" /></span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#24372C,#2F4739_60%,#3E5A49)] py-14 text-[#E6E0D5] sm:py-16">
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(230,224,213,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,224,213,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className={wrap + ' relative grid grid-cols-2 gap-8 lg:grid-cols-4'}>
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 110}>
              <div className="border-l-2 border-[#B9CDBE]/60 pl-5">
                <div className="text-3xl font-bold sm:text-4xl">{i === 3 && <span>₹</span>}<Odometer value={s.value} /></div>
                <p className="mt-3 text-sm text-[#E6E0D5]/75">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= SAFETY ================= */}
      <section className={wrap + ' grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2'}>
        <div>
          <Eyebrow>Trust &amp; safety</Eyebrow>
          <SplitText text="AI checks. People decide." highlight={['People']} className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem]" />
          <Reveal delay={120}><p className="mt-4 max-w-md text-base text-[#24372C]/70">A clean, safe place for learning. No movies, politics, money tips, medical advice or ads.</p></Reveal>
          <ul className="mt-8 space-y-5">
            {safetyPoints.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} from="left" delay={i * 120}>
                <li className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#24372C]/12 bg-[#F4F1EA]"><Icon className="size-5" /></span>
                  <span><strong className="block text-base">{title}</strong><span className="text-sm leading-relaxed text-[#24372C]/65">{text}</span></span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal from="right" delay={150}><ReviewDemo /></Reveal>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="scroll-mt-24 bg-[#F4F1EA] py-14 sm:py-20">
        <div className={wrap + ' grid items-center gap-12 lg:grid-cols-12'}>
          <div className="lg:col-span-7">
            <Eyebrow>FAQ</Eyebrow>
            <SplitText text="Questions you may have" highlight={['Questions']} className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem]" />
            <div className="mt-8">
              {faqs.map(([q, a], i) => {
                const open = openFaq === i
                return (
                  <Reveal key={q} delay={i * 80}>
                    <div className="border-b border-[#24372C]/12">
                      <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                        <span className={'text-base font-semibold transition-colors ' + (open ? 'text-[#4E6E5A]' : '')}>{q}</span>
                        <span className={'grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ' + (open ? 'rotate-45 border-[#24372C] bg-[#24372C] text-[#E6E0D5]' : 'border-[#24372C]/25')}><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
                      </button>
                      <div className={'grid transition-[grid-template-rows] duration-300 ease-out ' + (open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                        <p className="overflow-hidden pr-12 text-sm leading-relaxed text-[#24372C]/70"><span className="block pb-5">{a}</span></p>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
          <div className="lg:col-span-5">
            <Reveal from="scale">
              <div className="relative mx-auto h-[380px] w-full max-w-sm">
                {[videos[5], videos[3], videos[7]].map((v, i) => (
                  <div key={v.title} className={'absolute top-1/2 aspect-[9/16] w-[46%] -translate-y-1/2 overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-30px_rgba(36,55,44,0.75)] transition-transform duration-700 hover:z-20 hover:scale-105 ' + toneBg[v.tone] + [' left-0 -rotate-12', ' left-1/2 z-10 -translate-x-1/2', ' right-0 rotate-12'][i]}>
                    <VideoArt video={v} />
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={200} className="mt-6 text-center">
              <p className="text-base font-semibold">Still have a question?</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-[#24372C]/65">Sign up and ask from the app — our team replies in Telugu or English.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= CTA + FOOTER ================= */}
      <footer className="bg-[#FBFAF6] pt-14 sm:pt-20">
        <div className={wrap}>
          <Reveal from="scale">
            <div className="relative grid overflow-hidden rounded-[2rem] bg-[#24372C] text-[#E6E0D5] md:grid-cols-[1.15fr_1fr]">
              <div aria-hidden="true" className="absolute -left-20 -top-24 size-72 rounded-full bg-[#3E5A49] blur-3xl" />
              <div className="relative p-7 sm:p-10">
                <SplitText text="Start learning today. Start earning when you are ready." highlight={['earning']} highlightClass="text-[#B9CDBE]" className="max-w-md text-2xl font-bold leading-tight tracking-tight sm:text-3xl" />
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#E6E0D5]/70">Free for everyone aged 18–24 in Telangana and Andhra Pradesh.</p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <ArrowButton to="/register" light>Create free account</ArrowButton>
                  <Link to="/login" className="rounded-full border border-[#E6E0D5]/25 px-6 py-3 text-sm! font-semibold! text-[#E6E0D5]! transition hover:bg-[#E6E0D5]/10">Log in</Link>
                </div>
              </div>
              {/* fanned reels */}
              <div aria-hidden="true" className="relative hidden h-full min-h-[260px] md:block">
                {[videos[3], videos[0], videos[6]].map((v, i) => (
                  <div key={v.title} className={'absolute bottom-[-30%] aspect-[9/16] w-[38%] overflow-hidden rounded-[1.4rem] border-4 border-[#24372C] shadow-2xl transition-transform duration-500 hover:-translate-y-4 ' + toneBg[v.tone] + [' left-[8%] -rotate-12', ' left-[31%] z-10 -translate-y-6', ' left-[54%] rotate-12'][i]}>
                    <VideoArt video={v} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <div className={wrap + ' mt-10 flex flex-col items-center gap-5 border-t border-[#24372C]/10 py-8 md:flex-row md:justify-between'}>
          <Brand to="/" />
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map(([id, label]) => <a key={id} href={'#' + id} onClick={(e) => goToSection(e, id)} className="text-sm! font-medium! text-[#24372C]/65! transition-colors hover:text-[#24372C]!">{label}</a>)}
          </nav>
          <span className="text-xs text-[#24372C]/55">© 2026 Drama.Money · Jobs &amp; skills only</span>
        </div>
      </footer>

      {/* Back to top */}
      <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' })} className={'fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full bg-[#24372C] text-[#E6E0D5]! shadow-[0_14px_30px_-12px_rgba(36,55,44,0.9)] transition-all duration-500 hover:-translate-y-1 ' + (scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')}>
        <ChevronUp className="size-5" />
      </button>
    </main>
  )
}
