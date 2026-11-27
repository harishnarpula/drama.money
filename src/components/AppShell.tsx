import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import dramaIcon from '../assets/dramaIcon.png'
import dramaLogo from '../assets/drama-logo.png'
import { useAuth } from '../auth/auth-context'
import { BellIcon, ChartIcon, ChevronRight, CloseIcon, HomeIcon, LogOutIcon, MenuIcon, PlusIcon, ReelsIcon, SearchIcon, UserIcon, WalletIcon } from './Icons'

const navItems = [
  { to: '/app', label: 'Home', icon: HomeIcon, end: true },
  { to: '/app/reels', label: 'Reels', icon: ReelsIcon },
  { to: '/app/search', label: 'Search', icon: SearchIcon },
  { to: '/app/upload', label: 'Create', icon: PlusIcon, accent: true },
  { to: '/app/notifications', label: 'Notifications', icon: BellIcon },
  { to: '/app/creator', label: 'Dashboard', icon: ChartIcon },
  { to: '/app/earnings', label: 'Earnings', icon: WalletIcon },
  { to: '/app/profile', label: 'Profile', icon: UserIcon },
]

const sidebarPreference = 'teambharat-sidebar-collapsed'
const navBase = 'flex h-12 cursor-pointer items-center gap-[15px] rounded-[11px] border-0 bg-transparent px-[13px] text-[13px] font-[650] text-[#3B4642] no-underline hover:bg-[#F1EEE7] [&_svg]:size-[21px] [&_svg]:shrink-0 max-h-[720px]:min-[681px]:h-[42px]'
const avatarBase = 'grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-[linear-gradient(135deg,#6f836f,#24372c)] text-xs font-extrabold text-white shadow-[0_0_0_1px_#D8D2C8] [&_img]:block [&_img]:size-full [&_img]:object-cover'
const sidebarToggle = 'grid h-9 w-[34px] shrink-0 cursor-pointer place-items-center rounded-[9px] border border-[#D8D2C8] bg-white text-[#24372C] hover:bg-[#F1EEE7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24372C] [&_svg]:size-[18px]'

function initialSidebarCollapsed() {
  const compactScreen = window.matchMedia('(max-width: 1100px)').matches
  try {
    const saved = localStorage.getItem(sidebarPreference)
    return saved === null ? compactScreen : saved === 'true'
  } catch {
    return compactScreen
  }
}

function SidebarLinks({ onSelect, compact = false }: { onSelect?: () => void; compact?: boolean }) {
  return (
    <nav aria-label="Main navigation" className="grid min-h-0 flex-1 auto-rows-12 content-start gap-1 overflow-y-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-[720px]:min-[681px]:auto-rows-[42px] max-h-[720px]:min-[681px]:gap-0.5">
      {navItems.map(({ to, label, icon: NavIcon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onSelect}
          aria-label={label}
          title={compact ? label : undefined}
          className={({ isActive }) => `${navBase} ${compact ? 'w-[50px] justify-center px-0' : ''} ${isActive ? '!bg-[#E6E0D5] font-[850] !text-[#24372C] [&_svg]:[stroke-width:2.5]' : ''}`}
        >
          <NavIcon />
          {!compact && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

export function Brand({ compact = false, to = '/app' }: { compact?: boolean; to?: string }) {
  return (
    <NavLink to={to} className="inline-flex min-w-0 items-center no-underline" aria-label="Drama.Money home" title="Drama.Money">
      <img
        src={compact ? dramaIcon : dramaLogo}
        alt=""
        aria-hidden="true"
        className={compact ? 'h-[46px] w-auto shrink-0 object-contain' : 'h-12 w-auto max-w-[210px] shrink-0 object-contain max-[420px]:h-[34px] max-[320px]:h-7'}
      />
    </NavLink>
  )
}

export default function AppShell() {
  const { logout, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogout, setShowLogout] = useState(false)
  const [collapsed, setCollapsed] = useState(initialSidebarCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDialogElement>(null)
  const isReels = location.pathname === '/app/reels'
  const initials = profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')

  useEffect(() => {
    window.scrollTo(0, 0)
    drawerRef.current?.close()
  }, [location.pathname])

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 680px)')
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) drawerRef.current?.close()
    }
    mobile.addEventListener('change', closeOnDesktop)
    return () => mobile.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!showLogout) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowLogout(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [showLogout])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  function toggleSidebar() {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem(sidebarPreference, String(next)) } catch { /* State is still available for this visit. */ }
  }

  return (
    <div className={`min-h-svh bg-[#F8F6F1] text-[#24372C] [--mobile-bottom:calc(62px+env(safe-area-inset-bottom))] [--mobile-top:calc(64px+env(safe-area-inset-top))] ${collapsed ? '[--sidebar-width:82px]' : '[--sidebar-width:280px]'} ${isReels ? 'max-[680px]:h-dvh max-[680px]:min-h-0 max-[680px]:overflow-hidden' : ''}`}>
      <aside className={`fixed inset-y-0 left-0 z-20 flex w-[var(--sidebar-width)] flex-col overflow-hidden border-r border-[#D8D2C8] bg-[#FBFAF6] py-[26px] pr-[18px] pb-5 pl-[18px] max-[680px]:hidden max-h-[720px]:min-[681px]:py-4 max-h-[720px]:min-[681px]:pb-3 ${collapsed ? 'items-center px-3' : ''}`} id="desktop-sidebar">
        <div className={`mb-6 flex items-center justify-between gap-[5px] max-h-[720px]:min-[681px]:mb-3 ${collapsed ? 'mb-[13px] flex-col gap-2' : ''}`}>
          <Brand compact={collapsed} />
          <button className={sidebarToggle} type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} aria-controls="desktop-sidebar" onClick={toggleSidebar}>
            <ChevronRight className={collapsed ? '' : 'rotate-180'} />
          </button>
        </div>
        <SidebarLinks compact={collapsed} />
        <div className={`mt-2 flex min-h-[62px] shrink-0 items-center gap-2 border-t border-[#D8D2C8] px-2 pt-2.5 max-h-[720px]:min-[681px]:mt-1 max-h-[720px]:min-[681px]:min-h-[50px] max-h-[720px]:min-[681px]:pt-[7px] ${collapsed ? 'w-[50px] justify-center px-0' : ''}`}>
          {!collapsed && <NavLink to="/app/profile" className="flex min-w-0 flex-1 items-center gap-2.5 no-underline">
            <span className={`${avatarBase} size-[38px]`}>{profile.photoUrl ? <img src={profile.photoUrl} alt="" /> : initials}</span>
            <span className="grid min-w-0"><strong className="truncate text-[10px]">{profile.name}</strong><small className="truncate text-[8px] text-[#657067]">@{profile.username}</small></span>
          </NavLink>}
          <button className="grid size-[34px] shrink-0 cursor-pointer place-items-center rounded-[9px] border border-transparent bg-transparent text-[#657067] hover:border-[#D8D2C8] hover:bg-[#E6E0D5] hover:text-[#24372C] [&_svg]:w-[17px]" type="button" onClick={() => setShowLogout(true)} aria-label="Log out" title="Log out">
            <LogOutIcon />
          </button>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-20 hidden h-[var(--mobile-top)] items-center justify-between gap-1 border-b border-[#D8D2C8] bg-white/[.95] px-2.5 pt-[env(safe-area-inset-top)] backdrop-blur-xl max-[680px]:flex">
        <div className="flex min-w-0 items-center gap-[7px] [&_a]:gap-1.5 [&_a>span:last-child]:text-[clamp(13px,4.5vw,17px)] [&_a>span:first-child]:size-8">
          <button type="button" className={`${sidebarToggle} size-10`} aria-label="Open navigation" aria-expanded={drawerOpen} aria-controls="mobile-sidebar" onClick={() => {
            drawerRef.current?.showModal()
            setDrawerOpen(true)
          }}><MenuIcon /></button>
          <Brand />
        </div>
        <div className="flex shrink-0 items-center gap-px [&>a]:grid [&>a]:size-10 [&>a]:place-items-center [&>a_svg]:w-5 [&>button]:grid [&>button]:size-10 [&>button]:place-items-center [&>button]:border-0 [&>button]:bg-transparent">
          <NavLink to="/app/notifications" aria-label="Notifications"><BellIcon /></NavLink>
          <button type="button" onClick={() => setShowLogout(true)} aria-label="Open account menu">
            <span className={`${avatarBase} size-[31px] text-[8px]`}>{profile.photoUrl ? <img src={profile.photoUrl} alt="" /> : initials}</span>
          </button>
        </div>
      </header>

      <dialog ref={drawerRef} id="mobile-sidebar" className="fixed inset-y-0 left-0 m-0 hidden h-dvh max-h-none w-[min(86vw,300px)] max-w-none rounded-r-2xl border-0 bg-[#FBFAF6] p-0 text-[#24372C] backdrop:bg-[#14221991] open:block min-[681px]:hidden" aria-label="Navigation" onClose={() => setDrawerOpen(false)} onClick={(event) => {
        if (event.target === event.currentTarget) drawerRef.current?.close()
      }}>
        <div className="flex min-h-full flex-col px-3.5 pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="mb-3.5 flex items-center justify-between gap-[5px]">
            <Brand />
            <button type="button" className={sidebarToggle} aria-label="Close navigation" onClick={() => drawerRef.current?.close()}><CloseIcon /></button>
          </div>
          <SidebarLinks onSelect={() => drawerRef.current?.close()} />
          <button type="button" className={navBase} onClick={() => { drawerRef.current?.close(); setShowLogout(true) }}><LogOutIcon /> Log out</button>
        </div>
      </dialog>

      <section className={`ml-[var(--sidebar-width)] min-h-svh min-w-0 max-[680px]:mx-0 max-[680px]:mt-[var(--mobile-top)] max-[680px]:mb-[var(--mobile-bottom)] ${isReels ? 'h-svh overflow-hidden max-[680px]:h-[calc(100dvh-var(--mobile-top)-var(--mobile-bottom))] max-[680px]:min-h-0' : ''}`}>
        <Outlet />
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-20 hidden h-[var(--mobile-bottom)] items-center justify-around border-t border-[#D8D2C8] bg-white/[.96] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl max-[680px]:flex" aria-label="Mobile navigation">
        {navItems.filter((item) => ['/app', '/app/reels', '/app/upload', '/app/notifications', '/app/profile'].includes(item.to)).map(({ to, label, icon: NavIcon, end, accent }) => (
          <NavLink key={to} to={to} end={end} aria-label={label} className={({ isActive }) => `grid place-items-center rounded-xl [&_svg]:w-[22px] ${accent ? 'size-12 -translate-y-[7px] rounded-[15px] border border-white/75 bg-[#24372C] text-white shadow-[0_7px_18px_rgba(36,55,44,.25)] [&_svg]:size-[25px] [&_svg]:[stroke-width:2.5]' : 'size-[42px]'} ${isActive ? accent ? 'bg-[#365341] text-white' : 'text-[#24372C]' : ''}`}>
            <NavIcon />
          </NavLink>
        ))}
      </nav>

      {!isReels && (
        <NavLink to="/app/upload" className="fixed right-7 bottom-7 z-25 inline-flex h-[58px] min-w-[58px] items-center justify-center gap-2 rounded-[18px] border border-white/80 bg-[#24372C] px-[18px] text-xs font-[850] text-white no-underline shadow-[0_9px_26px_rgba(25,48,34,.3)] transition hover:-translate-y-[3px] hover:bg-[#365341] hover:shadow-[0_14px_30px_rgba(25,48,34,.34)] aria-[current=page]:bg-[#365341] max-[680px]:hidden [&_svg]:size-[23px] [&_svg]:[stroke-width:2.4]" aria-label="Create a post or upload a video">
          <PlusIcon />
          <span>Upload</span>
        </NavLink>
      )}

      {showLogout && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(19,29,23,.58)] p-5 backdrop-blur-[9px]" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowLogout(false)
        }}>
          <section className="w-[min(100%,420px)] rounded-[20px] border border-white/60 bg-[#FBFAF6] p-8 text-center shadow-[0_28px_85px_rgba(13,24,17,.28)] max-[420px]:px-5 max-[420px]:pt-[27px] max-[420px]:pb-[21px]" role="dialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-description">
            <span className="mx-auto mb-[18px] grid size-[54px] place-items-center rounded-2xl bg-[#E6E0D5] text-[#24372C] shadow-[inset_0_0_0_1px_#D5CEC2] [&_svg]:w-[23px]"><LogOutIcon /></span>
            <h2 id="logout-title" className="mb-[9px] text-[22px] tracking-[-.03em]">Log out of Drama.Money?</h2>
            <p id="logout-description" className="mx-auto max-w-[330px] text-[10px] leading-[1.65] text-[#657067]">You’ll need to log in again to access your feed, uploads and creator dashboard.</p>
            <div className="mt-6 grid grid-cols-2 gap-[9px] max-[420px]:grid-cols-1">
              <button className="min-h-11 cursor-pointer rounded-[9px] border border-[#D8D2C8] bg-white px-3 text-[10px] font-extrabold hover:-translate-y-px max-[420px]:row-start-2" type="button" onClick={() => setShowLogout(false)} autoFocus>Stay logged in</button>
              <button className="min-h-11 cursor-pointer rounded-[9px] border border-[#24372C] bg-[#24372C] px-3 text-[10px] font-extrabold text-white hover:-translate-y-px max-[420px]:row-start-1" type="button" onClick={handleLogout}>Log out securely</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
