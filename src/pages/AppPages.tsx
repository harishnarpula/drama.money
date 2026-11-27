import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { feedPosts, notifications } from '../data/mockData'
import { useVideos } from '../data/videoStore'
import { BellIcon, BookmarkIcon, CameraIcon, ChevronRight, CommentIcon, ExternalLinkIcon, FilmReelIcon, HeartIcon, PlatformIcon, PlayIcon, PlusIcon, SearchIcon, ShareIcon, Share2Icon, WalletIcon } from '../components/Icons'
import ProfileMedia from './ProfileMedia'
import ProfilePhotoPicker from '../components/ProfilePhotoPicker'
import HomePosts from './HomePosts'
import loginHero from '../assets/login-hero.webp'
import { api } from '../services/api'
import type { ContentCreator } from '../services/api'
import { FollowButton } from '../components/FollowButton'
import { FollowListModal } from '../components/FollowListModal'

const pageWrap = 'mx-auto w-full max-w-[1080px] px-[42px] pt-[38px] pb-20 max-[680px]:px-3.5 max-[680px]:pt-6 max-[680px]:pb-10'
const pageTitle = 'mb-[30px] flex items-end justify-between max-[680px]:mb-[22px] [&_p]:m-0 [&_p]:text-[10px] [&_p]:font-black [&_p]:tracking-[.16em] [&_p]:text-[#24372C] [&_h1]:mt-1 [&_h1]:text-[34px] [&_h1]:tracking-[-.045em] max-[680px]:[&_h1]:text-[29px]'
const surfaceCard = 'mt-[18px] rounded-[15px] border border-[#D8D2C8] bg-[#FBFAF6] p-[22px] max-[680px]:p-[15px]'
const reelTone: Record<string, string> = {
  teal: 'bg-[linear-gradient(145deg,#617967,#24372c)]',
  indigo: 'bg-[linear-gradient(145deg,#8a7f6f,#394a40)]',
  coral: 'bg-[linear-gradient(145deg,#b2a792,#24372c)]',
}
const videoStatusTone: Record<string, string> = {
  Live: 'bg-[#E9F7F5] text-[#4D6B5B]',
  'In review': 'bg-[#FFF4D6] text-[#8A6418]',
  Processing: 'bg-[#EEEBFC] text-[#817667]',
  Rejected: 'bg-[#FDEBEA] text-[#B64236]',
}

function Avatar({ initials, className = '', src }: { initials: string; className?: string; src?: string }) {
  return <span className={`grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-[linear-gradient(135deg,#6f836f,#24372c)] text-xs font-extrabold text-white shadow-[0_0_0_1px_#D8D2C8] [&_img]:block [&_img]:size-full [&_img]:object-cover ${className}`}>{src ? <img src={src} alt="" /> : initials}</span>
}

function FeedAvatar({ initials, src, size = 'size-9' }: { initials: string; src?: string; size?: string }) {
  return (
    <span className={`${size} shrink-0 overflow-hidden rounded-full bg-[#24372C] ring-2 ring-white shadow-sm flex items-center justify-center text-[11px] font-bold text-[#F4F1EA]`}>
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials}
    </span>
  )
}

export function HomePage() {
  const { profile } = useAuth()
  const [activeTopic, setActiveTopic] = useState('All')
  const initials = (profile?.name || 'DM').split(' ').filter(Boolean).map((item) => item[0]).slice(0, 2).join('') || 'DM'

  return (
    <div className="mx-auto w-full max-w-[1120px] 2xl:max-w-[1200px] px-3 sm:px-5 lg:px-8 py-4 sm:py-5">
      <div className="flex justify-center gap-8 xl:gap-10">
        {/* Feed */}
        <main className="w-full max-w-[600px] xl:max-w-[640px] 2xl:max-w-[680px] min-w-0">
          <header className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#17251D]">
                  Home Feed
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5ECE7] px-2.5 py-0.5 text-[11px] font-bold text-[#2A4333]">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <Link
                to="/app/upload"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#24372C] px-3.5 py-1.5 text-xs font-bold text-[#F4F1EA] shadow-xs transition hover:bg-[#1A2820] hover:shadow-sm shrink-0"
              >
                <PlusIcon className="size-3.5" />
                <span>Create</span>
              </Link>
            </div>

            {/* Horizontal Filter Chips */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['All', '🔥 Trending', '💼 Walk-in Drives', '🎓 Govt Exams', '💡 Tech & Excel', '📄 Resume Tips'].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setActiveTopic(topic)}
                  className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    activeTopic === topic
                      ? 'bg-[#24372C] text-white shadow-xs'
                      : 'bg-white/80 border border-[#D8D2C8] text-[#3E5244] hover:bg-white hover:text-[#17251D] hover:border-[#BFC9C1]'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </header>
          <HomePosts filter={activeTopic} onResetFilter={() => setActiveTopic('All')} />
        </main>

        {/* Side column (large screens) */}
        <aside className="hidden lg:flex w-[300px] xl:w-[330px] shrink-0 flex-col gap-4 self-start sticky top-5">
          <section className="rounded-2xl bg-[#24372C] p-5 text-[#F4F1EA] shadow-[0_14px_34px_-18px_rgba(36,55,44,0.6)] transition duration-300 hover:-translate-y-0.5">
            <span className="text-[10.5px] font-bold tracking-[0.14em] text-[#BDE6DF]">YOUR NEXT STEP</span>
            <h2 className="mt-1.5 text-lg font-bold text-white">Interview ready</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#C7D8D5]">A focused 3-part path to help you feel prepared before your next interview.</p>
            <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-white/15">
              <span className="block h-full w-1/3 rounded-full bg-[#BDE6DF]" />
            </div>
            <small className="mt-1.5 block text-[11px] text-[#C7D8D5]">1 of 3 lessons complete</small>
            <Link to="/app/reels" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-white hover:underline [&_svg]:size-3.5">
              Continue your path <ChevronRight />
            </Link>
          </section>

          <section className="rounded-2xl border border-[#E4E1DA] bg-white p-5 shadow-[0_10px_30px_-20px_rgba(36,55,44,0.35)] transition duration-300 hover:-translate-y-0.5">
            <span className="text-[10.5px] font-bold tracking-[0.14em] text-[#657067]">CREATOR SPOTLIGHT</span>
            <div className="mt-3 flex items-center gap-2.5">
              <FeedAvatar src={profile.photoUrl} initials={initials} size="size-10" />
              <span className="min-w-0 leading-tight">
                <strong className="block truncate text-[13.5px] text-[#1E2A23]">{profile.name}</strong>
                <small className="block truncate text-[11.5px] text-[#6B746E]">@{profile.username}{profile.town ? ` · ${profile.town}` : ''}</small>
              </span>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-[#4E5A53]">Share one practical tip you wish you had learned earlier.</p>
            <Link to="/app/upload" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#EEF1EF] px-3 py-1.5 text-[12.5px] font-bold text-[#24372C] transition hover:bg-[#E2E7E4] [&_svg]:size-4">
              <PlusIcon /> Create a lesson
            </Link>
          </section>

          <p className="px-1 text-[11px] text-[#8A938D]">© 2026 Drama.Money</p>
        </aside>
      </div>
    </div>
  )
}

export function ReelsPage() {
  const location = useLocation()
  const stageRef = useRef<HTMLDivElement>(null)
  const reels = [...feedPosts, { ...feedPosts[0], id: 3, name: 'Keerthi Exams', username: 'keerthi.preps', initials: 'KE', title: 'A two-minute revision technique', category: 'Government exam preparation', tone: 'indigo' }]
  const requestedVideoId = (location.state as { videoId?: number } | null)?.videoId
  const requestedIndex = Math.max(0, reels.findIndex((reel) => reel.id === requestedVideoId))
  const [active, setActive] = useState(requestedIndex)

  useEffect(() => {
    const stage = stageRef.current
    if (stage && requestedIndex > 0) stage.scrollTop = requestedIndex * stage.clientHeight
  }, [requestedIndex])

  const selectReel = (index: number) => {
    const stage = stageRef.current
    if (!stage) return
    stage.scrollTo({ top: index * stage.clientHeight, behavior: 'smooth' })
    setActive(index)
  }

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden px-[clamp(18px,3vw,42px)] pt-4 pb-4 max-[680px]:h-full max-[680px]:px-3 max-[680px]:pt-2.5 max-[680px]:pb-2">
      <header className="mx-auto mb-2 flex min-h-[68px] w-[min(100%,1100px)] shrink-0 items-center justify-between gap-6 max-[680px]:mb-1 max-[680px]:min-h-[58px] max-[680px]:gap-2">
        <div className="shrink-0"><p className="m-0 text-[9px] font-black tracking-[.16em] text-[#607066]">DISCOVER</p><h1 className="mt-[3px] text-[clamp(26px,2.4vw,34px)] tracking-[-.045em] max-[680px]:text-[26px]">Reels</h1></div>
        <nav className="flex min-w-0 shrink items-center justify-end gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[680px]:gap-[5px] max-[680px]:py-0.5" aria-label="Video categories" role="tablist">
          {reels.map((reel, index) => <button key={reel.id} type="button" role="tab" aria-selected={index === active} className={`min-h-[38px] shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 text-[11px] font-bold transition-colors max-[680px]:min-h-[34px] max-[680px]:px-[9px] max-[680px]:text-[10px] ${index === active ? 'border-[#24372C] bg-[#24372C] text-white' : 'border-[#DEDBD2] bg-white text-[#536057] hover:border-[#9BAB9E]'}`} onClick={() => selectReel(index)}><span className="max-[680px]:hidden">{reel.category}</span><span className="hidden max-[680px]:inline">{['Interviews', 'Skills', 'Govt exams'][index]}</span></button>)}
        </nav>
      </header>
      <div className="min-h-0 w-full flex-1 snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" ref={stageRef} onScroll={(event) => {
        const stage = event.currentTarget
        setActive(Math.min(reels.length - 1, Math.round(stage.scrollTop / stage.clientHeight)))
      }} aria-label="Reels feed">
        {reels.map((reel, index) => <section className="grid h-full min-h-full w-full snap-start snap-always place-items-center" key={reel.id} aria-label={`Reel ${index + 1} of ${reels.length}`}>
          <article className={`relative h-auto max-h-full w-[min(100%,700px,calc((100dvh-150px)*var(--reel-ratio,.667)))] max-w-full self-center justify-self-center overflow-hidden rounded-[19px] border border-white/55 text-white shadow-[0_20px_58px_rgba(36,55,44,.2)] max-[850px]:w-[min(100%,calc((100dvh-200px)*var(--reel-ratio,.667)))] max-[680px]:w-[min(100%,700px,calc((100dvh-225px)*var(--reel-ratio,.667)))] ${reelTone[reel.tone] ?? 'bg-[linear-gradient(145deg,#b2a792,#24372c)]'}`} style={{ '--reel-ratio': String(reel.aspectRatio), aspectRatio: String(reel.aspectRatio) } as CSSProperties}>
            {reel.id === 1 && <img src={loginHero} alt="" className="size-full bg-[rgba(15,24,19,.35)] object-contain" />}
            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,15,13,.75),transparent_58%)]" />
            <button className="absolute top-1/2 left-1/2 z-[3] grid size-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/55 bg-black/25 text-white backdrop-blur-[6px] [&_svg]:ml-[3px] [&_svg]:w-[23px]" type="button" aria-label="Play"><PlayIcon /></button>
            <div className="absolute right-[68px] bottom-[18px] left-[18px] z-[3] flex items-end gap-2.5 max-[680px]:right-[52px] max-[680px]:bottom-3 max-[680px]:left-3 max-[680px]:gap-2"><Avatar initials={reel.initials} className="size-[38px] max-[680px]:size-8" /><div><strong className="text-[10px]">@{reel.username}</strong><h2 className="my-1 line-clamp-2 text-[clamp(15px,1.6vw,20px)] leading-[1.2] max-[680px]:text-[15px]">{reel.title}</h2><p className="m-0 line-clamp-2 text-[9px] leading-[1.5] max-[680px]:text-[8px]">{reel.description}</p></div></div>
            <div className="absolute right-[13px] bottom-[17px] z-[4] grid gap-2.5 max-[680px]:right-[9px] max-[680px]:bottom-3 max-[680px]:gap-2 [&_button]:grid [&_button]:justify-items-center [&_button]:gap-[3px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-white [&_svg]:w-[21px] [&_span]:text-[7px]"><button><HeartIcon /><span>{reel.likes}</span></button><button><CommentIcon /><span>{reel.comments}</span></button><button><BookmarkIcon /><span>Save</span></button><button><ShareIcon /><span>Share</span></button></div>
          </article>
        </section>)}
      </div>
    </div>
  )
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ContentCreator[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) return

    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError('')
      api.users.search(term, 0, 20).then(async (page) => {
        const creators = await Promise.all(page.content.map(async (result) => {
          try {
            return await api.users.getProfile(result.userId)
          } catch {
            return {
              ...result,
              firstName: result.firstName ?? undefined,
              lastName: result.lastName ?? undefined,
              followStatus: null,
            } satisfies ContentCreator
          }
        }))
        if (active) setResults(creators)
      }).catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Could not search creators.')
      }).finally(() => {
        if (active) setLoading(false)
      })
    }, 350)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query])

  return (
    <div className={`${pageWrap} max-w-[820px]`}>
      <header className={pageTitle}><div><p>EXPLORE</p><h1>Search</h1></div></header>
      <label className="flex h-[52px] items-center gap-2.5 rounded-xl border border-[#D8D2C8] bg-[#F1EEE7] px-[15px] focus-within:border-[#6E8174] focus-within:ring-2 focus-within:ring-[#DDE6DF] [&_svg]:w-5 [&_svg]:text-[#657067]"><SearchIcon /><input className="min-w-0 flex-1 border-0 bg-transparent outline-0" value={query} onChange={(event) => {
        const value = event.target.value
        setQuery(value)
        if (value.trim().length < 2) {
          setResults([])
          setLoading(false)
          setError('')
        }
      }} placeholder="Search creators by name or username" autoComplete="off" /></label>

      <div className="mt-5 space-y-3" aria-live="polite">
        {query.trim().length < 2 && <p className="rounded-xl border border-dashed border-[#CFC9BD] bg-white/60 p-6 text-center text-sm text-[#657067]">Enter at least two characters to find creators.</p>}
        {loading && [0, 1, 2].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-[#E2DED5] bg-white p-4"><span className="size-12 shrink-0 animate-pulse rounded-full bg-[#E4E8E2]" /><span className="flex-1 space-y-2"><span className="block h-3 w-36 animate-pulse rounded bg-[#E4E8E2]" /><span className="block h-2.5 w-24 animate-pulse rounded bg-[#EEECE6]" /></span></div>)}
        {!loading && error && <p role="alert" className="rounded-xl border border-[#EAC5C0] bg-[#FFF4F2] p-4 text-sm text-[#842B24]">{error}</p>}
        {!loading && !error && query.trim().length >= 2 && results.length === 0 && <p className="rounded-xl border border-[#D8D2C8] bg-white p-6 text-center text-sm text-[#657067]">No creators found for “{query.trim()}”.</p>}
        {!loading && results.map((creator) => {
          const name = [creator.firstName, creator.lastName].filter(Boolean).join(' ') || creator.username
          const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
          return <article key={creator.userId} className="flex items-center gap-3 rounded-xl border border-[#E2DED5] bg-white p-3.5 shadow-sm">
            <Avatar initials={initials} src={creator.profileUrl || undefined} className="size-12" />
            <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-bold text-[#1E2A23]">{name}</h2><p className="truncate text-xs text-[#657067]">@{creator.username}</p></div>
            <FollowButton creator={creator} />
          </article>
        })}
      </div>
    </div>
  )
}

export function NotificationsPage() {
  const [read, setRead] = useState(false)
  return (
    <div className={`${pageWrap} max-w-[820px]`}>
      <header className={pageTitle}><div><p>UPDATES</p><h1>Notifications</h1></div><button className="border-0 bg-transparent text-[10px] font-extrabold text-[#24372C]" type="button" onClick={() => setRead(true)}>{read ? 'All read' : 'Mark all as read'}</button></header>
      <div>
        <h2 className="mb-3 text-xs">Today</h2>
        {notifications.map((item, index) => <article key={index} className="flex items-center gap-3 border-b border-[#D8D2C8] px-[5px] py-[15px]"><Avatar initials={item.initials} /><p className="grid flex-1 text-[11px]">{item.text}<small className="mt-[3px] text-[8px] text-[#657067]">{item.time}</small></p>{item.type === 'follow' ? <button className="rounded-[7px] border-0 bg-[#24372C] px-[11px] py-[7px] text-[9px] font-extrabold text-white">Follow</button> : item.type === 'approved' ? <span className="rounded-full bg-[#EAF7F5] px-[9px] py-1.5 text-[8px] font-extrabold text-[#4D6B5B]">Approved</span> : <BellIcon className="w-[18px] text-[#657067]" />}</article>)}
      </div>
    </div>
  )
}

export function CreatorDashboardPage() {
  const { profile } = useAuth()
  const videos = useVideos().filter((video) => video.creatorUsername === profile.username)
  const stats = [{ label: 'Total views', value: '12.4K', change: '+18%' }, { label: 'Watch minutes', value: '3,280', change: '+12%' }, { label: 'Total likes', value: '1,642', change: '+24%' }, { label: 'Comments', value: '186', change: '+8%' }]
  return (
    <div className={`${pageWrap} max-w-[1120px]`}>
      <header className={pageTitle}><div><p>CREATOR STUDIO</p><h1>Your dashboard</h1></div><Link className="flex items-center gap-[7px] rounded-[9px] bg-[#24372C] px-[13px] py-2.5 text-[10px] font-extrabold text-white no-underline [&_svg]:w-[15px]" to="/app/upload?type=video"><PlusIcon /><span className="max-[680px]:hidden">Upload video</span></Link></header>
      <div className="grid grid-cols-4 gap-3 max-[680px]:grid-cols-2">{stats.map((stat) => <article className="grid gap-2 rounded-[13px] border border-[#D8D2C8] bg-[#FBFAF6] p-[18px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(36,55,44,.1)]" key={stat.label}><span className="text-[9px] text-[#657067]">{stat.label}</span><strong className="text-[25px]">{stat.value}</strong><small className="text-[8px] text-[#4D6B5B]">{stat.change} this week</small></article>)}</div>
      <section className={surfaceCard}><div><span className="text-[8px] font-black tracking-[.13em] text-[#24372C]">WATCH TIME</span><h2 className="my-[5px] text-[17px]">Performance this week</h2></div><div className="flex h-[170px] items-end gap-[7%] border-b border-[#D8D2C8] px-[15px] pt-[25px] pb-[22px]">{[32, 54, 42, 68, 61, 85, 74].map((height, index) => <span className="relative max-w-[42px] flex-1 rounded-t-[5px] bg-[linear-gradient(#657b6b,#24372c)]" key={index} style={{ height: height + '%' }}><i className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[7px] not-italic text-[#657067]">{['M','T','W','T','F','S','S'][index]}</i></span>)}</div></section>
      <section className={`${surfaceCard} [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_th]:p-2.5 [&_th]:text-[7px] [&_th]:uppercase [&_th]:text-[#657067] [&_td]:border-t [&_td]:border-[#D8D2C8] [&_td]:p-2.5 [&_td]:text-[9px] [&_td:first-child]:min-w-[220px] [&_td:first-child]:items-center [&_td:first-child]:gap-2`}><div className="mb-3.5 flex items-start justify-between"><div><h2 className="text-[17px]">Your videos</h2><p className="mt-[3px] text-[8px] text-[#657067]">Track processing, review and earnings.</p></div><button className="border-0 bg-transparent text-[9px] text-[#24372C]">View all</button></div>
        <div className="overflow-x-auto"><table><thead><tr><th>Video</th><th>Status</th><th>Views</th><th>Likes</th><th>Comments</th><th>Earning</th></tr></thead><tbody>{videos.map((video) => <tr key={video.id}><td className="flex"><span className="grid h-[30px] w-9 place-items-center rounded-md bg-[#31524E] text-white [&_svg]:w-[13px]"><PlayIcon /></span><strong>{video.title}</strong></td><td><span className={`rounded-full px-[7px] py-[5px] text-[7px] font-extrabold ${videoStatusTone[video.status] ?? 'bg-[#F1EEE7] text-[#657067]'}`}>{video.status}</span>{video.rejectionReason && <small className="block">{video.rejectionReason}</small>}</td><td>{video.views || '—'}</td><td>{video.likes || '—'}</td><td>{video.comments || '—'}</td><td>₹{video.earning}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  )
}

export function EarningsPage() {
  const [kycRequested, setKycRequested] = useState(false)
  return (
    <div className={`${pageWrap} max-w-[1120px]`}>
      <header className={pageTitle}><div><p>CREATOR MONEY</p><h1>Earnings</h1></div><span className="text-[10px] text-[#657067] max-[680px]:hidden">Updated from approved videos</span></header>
      <section className="flex items-center justify-between rounded-[17px] bg-[radial-gradient(circle_at_90%_0,rgba(255,255,255,.15),transparent_28%),#24372c] p-7 text-white"><div className="grid gap-1.5"><span className="text-[9px] text-[#D8D1C4]">Available after hold</span><strong className="text-[40px]">₹120</strong><small className="text-[8px] text-[#C6CEC8]">{kycRequested ? 'KYC request prepared for verification' : 'KYC required before your first payout'}</small></div><button className="rounded-lg border-0 bg-[#E6E0D5] px-[13px] py-2.5 text-[9px] font-extrabold text-[#24372C]" type="button" onClick={() => setKycRequested(true)}>{kycRequested ? 'KYC in progress' : 'Complete KYC'}</button></section>
      <div className="mt-[15px] grid grid-cols-3 gap-3 max-[680px]:grid-cols-1">{[['On 7-day hold', '₹80', '2 approved videos'], ['Bonus progress', '64 / 100', 'Genuine viewers'], ['Total paid', '₹0', 'No payouts yet']].map(([label, value, note]) => <article key={label} className="grid gap-2 rounded-[13px] border border-[#D8D2C8] bg-[#FBFAF6] p-[18px]"><span className="text-[9px] text-[#657067]">{label}</span><strong className="text-[25px]">{value}</strong><small className="text-[8px] text-[#4D6B5B]">{note}</small></article>)}</div>
      <section className={`${surfaceCard} flex items-start gap-3.5`}><WalletIcon className="w-[30px] rounded-lg bg-[#E6E0D5] p-1.5 text-[#24372C]" /><div><h2 className="text-[17px]">How creator earnings work</h2><p className="mt-1 text-[9px] leading-[1.7] text-[#657067]">Approved videos receive ₹20–50 depending on category. Earnings stay on hold for seven days. A bonus unlocks at 100 unique genuine viewers.</p></div></section>
      <section className={surfaceCard}><div className="mb-3.5"><h2 className="text-[17px]">Recent activity</h2><p className="mt-[3px] text-[8px] text-[#657067]">Static pilot data</p></div><article className="flex items-center gap-2.5 border-t border-[#D8D2C8] py-[13px]"><span className="grid size-[34px] place-items-center rounded-[9px] bg-[#E8F6F4] font-[850] text-[#4D6B5B]">₹</span><p className="grid flex-1"><strong className="text-[10px]">Resume mistakes freshers make</strong><small className="text-[8px] text-[#657067]">Approved · Hold ends 24 Nov 2026</small></p><b className="text-[10px] text-[#4D6B5B]">+ ₹40</b></article><article className="flex items-center gap-2.5 border-t border-[#D8D2C8] py-[13px]"><span className="grid size-[34px] place-items-center rounded-[9px] bg-[#EFEDFB] font-[850] text-[#817667]">₹</span><p className="grid flex-1"><strong className="text-[10px]">Interview introduction formula</strong><small className="text-[8px] text-[#657067]">Approved · Hold ends 22 Nov 2026</small></p><b className="text-[10px] text-[#4D6B5B]">+ ₹40</b></article></section>
    </div>
  )
}

export function ProfilePage() {
  const { user, profile, toggleSocialLink } = useAuth()
  const location = useLocation()
  const [profileParams, setProfileParams] = useSearchParams()
  const tabParam = profileParams.get('tab')
  const activeTab: 'posts' | 'reels' | 'saved' = tabParam === 'saved' ? 'saved' : tabParam === 'reels' ? 'reels' : 'posts'
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [followListModal, setFollowListModal] = useState<{ isOpen: boolean; type: 'FOLLOWERS' | 'FOLLOWING' }>({
    isOpen: false,
    type: 'FOLLOWERS',
  })
  const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('') || 'DM'
  const uploadNotice = (location.state as { uploadNotice?: string } | null)?.uploadNotice

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/app/profile` : 'https://drama.money/app/profile'
  const shareText = encodeURIComponent(`Check out ${profile.name}'s profile on Drama.Money: ${profileUrl}`)
  const shareMsg = encodeURIComponent(`Check out ${profile.name}'s profile on Drama.Money!`)
  const encodedUrl = encodeURIComponent(profileUrl)

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} (@${profile.username}) on Drama.Money`,
          text: `Check out ${profile.name}'s profile on Drama.Money: ${profile.bio || ''}`,
          url: profileUrl,
        })
        return
      } catch {
        // Fallback to custom modal if user cancels or native share fails
      }
    }
    setShareModalOpen(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleToggleLink = async (linkId: string, currentActive: boolean) => {
    try {
      if (toggleSocialLink) {
        await toggleSocialLink(linkId, !currentActive)
      }
    } catch (err: unknown) {
      console.warn('Failed to toggle link status', err)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 antialiased">
      {uploadNotice && <p role="status" className="mb-4 rounded-xl border border-[#BFD7C5] bg-[#E2F1E6] px-4 py-3 text-sm font-semibold text-[#235437]">{uploadNotice} You can track its moderation status below.</p>}
      {/* Profile Header Card */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8 rounded-3xl border border-[#D8D2C8] bg-white p-4 sm:p-8 shadow-sm">
        <ProfilePhotoPicker />

        {/* Info Column */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="min-w-0 text-xl sm:text-2xl font-bold text-[#1E2A23] tracking-tight [overflow-wrap:anywhere]">@{profile.username}</h1>
            <Link
              to="/app/profile/edit"
              className="h-8 px-4 rounded-xl border border-[#D8D2C8] bg-[#F1EEE7] text-xs font-bold text-[#24372C] hover:bg-[#E6E0D5] transition shadow-xs flex items-center justify-center cursor-pointer"
            >
              Edit profile
            </Link>
            <button
              type="button"
              onClick={handleShareClick}
              className="h-8 px-3.5 rounded-xl border border-[#D8D2C8] bg-white text-xs font-bold text-[#24372C] hover:bg-[#F1EEE7] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Share profile"
              aria-label="Share profile"
            >
              <Share2Icon className="size-3.5" />
              <span>Share profile</span>
            </button>
          </div>

          {/* Full Name */}
          <h2 className="mt-3 text-base sm:text-lg font-bold text-[#1E2A23]">{profile.name}</h2>

          {/* Community Stats: Posts, Followers, Following */}
          <div className="mt-3 flex items-center justify-center sm:justify-start gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#1E2A23]">{profile.postsCount ?? 0}</span>
              <span className="text-[#657067]">posts</span>
            </div>
            <button
              type="button"
              onClick={() => setFollowListModal({ isOpen: true, type: 'FOLLOWERS' })}
              className="flex items-center gap-1.5 hover:underline cursor-pointer group"
              title="View followers"
            >
              <span className="font-extrabold text-[#1E2A23] group-hover:text-emerald-700">{profile.followersCount ?? 0}</span>
              <span className="text-[#657067]">followers</span>
            </button>
            <button
              type="button"
              onClick={() => setFollowListModal({ isOpen: true, type: 'FOLLOWING' })}
              className="flex items-center gap-1.5 hover:underline cursor-pointer group"
              title="View following"
            >
              <span className="font-extrabold text-[#1E2A23] group-hover:text-emerald-700">{profile.followingCount ?? 0}</span>
              <span className="text-[#657067]">following</span>
            </button>
          </div>

          {/* Bio */}
          <p
            title={profile.bio || undefined}
            className="mt-2 text-xs sm:text-sm text-[#4E5A53] max-w-xl truncate"
          >
            {profile.bio || 'Add your bio to share what you learn or teach.'}
          </p>

          {/* Location & Details Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {(profile.town || profile.country) && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#EAE7DF] px-2.5 py-1 text-[11px] font-bold text-[#24372C]">
                📍 {[profile.town, profile.country].filter(Boolean).join(', ')}
              </span>
            )}
            {profile.college && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#F1EEE7] px-2.5 py-1 text-[11px] font-semibold text-[#657067]">
                🎓 {profile.college}
              </span>
            )}
            {profile.skills && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#F1EEE7] px-2.5 py-1 text-[11px] font-semibold text-[#657067]">
                💡 {profile.skills}
              </span>
            )}
          </div>

          {/* Social Media Links Section */}
          <div className="mt-5 pt-4 border-t border-[#EAE7DF]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold tracking-wider text-[#657067] uppercase">Social media links</span>
              {profile.socialLinks && profile.socialLinks.length > 0 && (
                <Link
                  to="/app/profile/edit#social-links"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#24372C] hover:underline"
                >
                  <PlusIcon className="size-3.5" />
                  <span>Add social media link</span>
                </Link>
              )}
            </div>

            {profile.socialLinks && profile.socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      link.active
                        ? 'border-[#D8D2C8] bg-[#F8F7F4] text-[#24372C] hover:bg-[#EFECE5]'
                        : 'border-dashed border-[#D8D2C8] bg-transparent text-[#9CA3AF] opacity-60'
                    }`}
                  >
                    <PlatformIcon platform={link.platform} className="size-4 text-[#24372C]" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                      title={link.url}
                    >
                      <span>{link.title}</span>
                      <ExternalLinkIcon className="size-3 opacity-60" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleToggleLink(link.id, link.active)}
                      className="ml-1 text-[10px] text-[#657067] hover:text-[#24372C] cursor-pointer"
                      title={link.active ? 'Hide link from profile' : 'Show link on profile'}
                    >
                      {link.active ? 'Hide' : 'Show'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF8F5] p-3.5 sm:px-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-1">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#EAE7DF] text-[#24372C] ring-2 ring-white">
                      <PlatformIcon platform="INSTAGRAM" className="size-3.5" />
                    </span>
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#EAE7DF] text-[#24372C] ring-2 ring-white">
                      <PlatformIcon platform="LINKEDIN" className="size-3.5" />
                    </span>
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#EAE7DF] text-[#24372C] ring-2 ring-white">
                      <PlatformIcon platform="GITHUB" className="size-3.5" />
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1E2A23]">Connect your social media profiles</p>
                    <p className="text-[11px] text-[#657067]">Add your Instagram, LinkedIn, GitHub or portfolio link</p>
                  </div>
                </div>
                <Link
                  to="/app/profile/edit#social-links"
                  style={{ color: '#F4F1EA', backgroundColor: '#24372C' }}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#2F4739] transition shrink-0 cursor-pointer"
                >
                  <PlusIcon className="size-3.5" />
                  <span>Add social media link</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Share Profile Modal Dialog */}
      {shareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs antialiased"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#D8D2C8] bg-[#FAF8F5] p-6 shadow-2xl transition-[opacity,transform] duration-200 starting:translate-y-2 starting:opacity-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF]">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#24372C] text-[#F4F1EA]">
                  <Share2Icon className="size-4" />
                </span>
                <h3 className="text-sm font-bold text-[#24372C]">Share profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-[#657067] hover:text-[#24372C] text-lg font-bold cursor-pointer"
                aria-label="Close share dialog"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3 border border-[#EAE7DF]">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#24372C] text-xs font-bold text-white">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="" className="size-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#24372C] truncate">{profile.name}</p>
                <p className="text-[11px] text-[#657067] truncate">@{profile.username}</p>
              </div>
            </div>

            {/* Link Copy Row */}
            <div className="mt-4 flex items-center gap-2">
              <input
                readOnly
                value={profileUrl}
                className="h-9 flex-1 rounded-xl border border-[#D8D2C8] bg-white px-3 text-xs text-[#24372C] outline-none select-all"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                style={{ color: '#F4F1EA', backgroundColor: '#24372C' }}
                className="h-9 px-3.5 rounded-xl text-xs font-bold hover:bg-[#2F4739] transition cursor-pointer shrink-0"
              >
                {copied ? '✓ Copied' : 'Copy link'}
              </button>
            </div>

            {/* Share via Apps */}
            <div className="mt-4 pt-3 border-t border-[#EAE7DF]">
              <p className="text-[10px] font-black text-[#657067] mb-2 uppercase tracking-wider">Share via</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <a
                  href={`https://api.whatsapp.com/send?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#EAE7DF] bg-white hover:bg-[#FAF8F5] transition text-[10px] font-bold text-[#24372C]"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#25D366]/15 text-[#128C7E] font-bold text-sm">
                    💬
                  </span>
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#EAE7DF] bg-white hover:bg-[#FAF8F5] transition text-[10px] font-bold text-[#24372C]"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#1DA1F2]/15 text-[#1DA1F2] font-bold text-sm">
                    𝕏
                  </span>
                  <span>Twitter</span>
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#EAE7DF] bg-white hover:bg-[#FAF8F5] transition text-[10px] font-bold text-[#24372C]"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#0A66C2]/15 text-[#0A66C2] font-bold text-sm">
                    in
                  </span>
                  <span>LinkedIn</span>
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodedUrl}&text=${shareMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#EAE7DF] bg-white hover:bg-[#FAF8F5] transition text-[10px] font-bold text-[#24372C]"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#0088CC]/15 text-[#0088CC] font-bold text-sm">
                    ✈
                  </span>
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Followers & Following List Modal */}
      {followListModal.isOpen && (
        <FollowListModal
          isOpen={followListModal.isOpen}
          onClose={() => setFollowListModal((prev) => ({ ...prev, isOpen: false }))}
          userId={profile.id || user?.id || ''}
          type={followListModal.type}
        />
      )}

      {/* Tabs */}
      <nav aria-label="Profile content" className="mt-6 flex justify-center gap-8 sm:gap-10 border-b border-[#D8D2C8]">
        <button
          type="button"
          onClick={() => setProfileParams({})}
          aria-pressed={activeTab === 'posts'}
          className={`h-11 flex items-center gap-2 border-b-2 text-xs font-bold tracking-wider transition cursor-pointer ${
            activeTab === 'posts' ? 'border-[#24372C] text-[#24372C]' : 'border-transparent text-[#657067] hover:text-[#24372C]'
          }`}
        >
          <CameraIcon className="size-4" />
          <span>POSTS</span>
        </button>
        <button
          type="button"
          onClick={() => setProfileParams({ tab: 'reels' })}
          aria-pressed={activeTab === 'reels'}
          className={`h-11 flex items-center gap-2 border-b-2 text-xs font-bold tracking-wider transition cursor-pointer ${
            activeTab === 'reels' ? 'border-[#24372C] text-[#24372C]' : 'border-transparent text-[#657067] hover:text-[#24372C]'
          }`}
        >
          <FilmReelIcon className="size-4" />
          <span>REELS</span>
        </button>
        <button
          type="button"
          onClick={() => setProfileParams({ tab: 'saved' })}
          aria-pressed={activeTab === 'saved'}
          className={`h-11 flex items-center gap-2 border-b-2 text-xs font-bold tracking-wider transition cursor-pointer ${
            activeTab === 'saved' ? 'border-[#24372C] text-[#24372C]' : 'border-transparent text-[#657067] hover:text-[#24372C]'
          }`}
        >
          <BookmarkIcon className="size-4" />
          <span>SAVED</span>
        </button>
      </nav>

      {/* Content Grid */}
      <div className="mt-6">
        {user?.id && <ProfileMedia key={user.id} userId={user.id} kind={activeTab} skills={profile.skills} />}
      </div>
    </div>
  )
}
