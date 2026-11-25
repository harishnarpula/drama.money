import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../auth/AdminAuth'
import { navGroups } from '../navigation'
import { BellIcon, CloseIcon, LogOutIcon, MenuIcon, SearchIcon } from '../../components/Icons'

const sidebarPreference = 'teambharat-admin-sidebar-collapsed'

function initialSidebarCollapsed() {
  const compactScreen = window.matchMedia('(max-width: 1100px)').matches
  try {
    const saved = localStorage.getItem(sidebarPreference)
    return saved === null ? compactScreen : saved === 'true'
  } catch {
    return compactScreen
  }
}

export function AdminLayout() {
  const { session, logout } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed)
  const menuOpen = menuPath === location.pathname
  const pageName =
    navGroups.flatMap((group) => group.items).find((item) => item.to === location.pathname)?.label ||
    (location.pathname.includes('/review/') ? 'Post Review' : 'Overview')

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuPath(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  const displayName = session?.user?.firstName
    ? `${session.user.firstName} ${session.user.lastName || ''}`.trim()
    : session?.user?.username || 'Administrator'
  const displayEmail = session?.user?.email || session?.user?.username || 'admin@drama.money'
  const initials = (displayName || 'AD').slice(0, 2).toUpperCase()

  function toggleSidebar() {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    try { localStorage.setItem(sidebarPreference, String(next)) } catch { /* State remains available for this visit. */ }
  }

  return (
    <div className={`h-dvh w-full overflow-hidden bg-[#F4F5F1] text-[#17251E] min-[761px]:grid ${sidebarCollapsed ? 'min-[761px]:grid-cols-[78px_minmax(0,1fr)]' : 'min-[761px]:grid-cols-[260px_minmax(0,1fr)]'}`}>
      {menuOpen && (
        <button
          className="fixed inset-0 z-[90] h-full w-full border-0 bg-[rgba(13,25,18,.48)] backdrop-blur-[2px] min-[761px]:hidden"
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setMenuPath(null)}
        />
      )}
      <aside
        id="admin-navigation"
        className={`fixed inset-y-0 left-0 z-[91] flex h-dvh min-h-0 w-[min(290px,84vw)] flex-col overflow-hidden bg-[linear-gradient(165deg,#20382c_0%,#14251d_75%)] px-4 pt-[22px] pb-4 text-[#ECF3EE] shadow-[16px_0_45px_rgba(14,30,22,.24)] transition-[transform,visibility] duration-200 min-[761px]:static min-[761px]:z-auto min-[761px]:w-auto min-[761px]:translate-x-0 min-[761px]:visible min-[761px]:shadow-[16px_0_45px_rgba(14,30,22,.12)] ${sidebarCollapsed ? 'min-[761px]:px-[11px]' : 'min-[761px]:px-4'} ${menuOpen ? 'translate-x-0 visible' : '-translate-x-[105%] invisible'}`}
        aria-label="Admin navigation"
      >
        <NavLink to="/admin/dashboard" className={`flex items-center gap-3 px-2 pb-5 text-inherit no-underline ${sidebarCollapsed ? 'min-[761px]:justify-center min-[761px]:px-0' : ''}`} onClick={() => setMenuPath(null)}>
          <b className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[linear-gradient(145deg,#fff8e9,#cfdccf)] text-sm text-[#20382C] shadow-[0_10px_25px_rgba(0,0,0,.25)]">DM</b>
          <span className={`text-[15px] font-[850] ${sidebarCollapsed ? 'min-[761px]:hidden' : ''}`}>
            Drama.Money<small className="mt-0.5 block text-[9px] font-[550] uppercase tracking-[.06em] text-[#9CB0A4]">Control centre</small>
          </span>
        </NavLink>
        <nav className={`grid min-h-0 flex-1 gap-[15px] overflow-x-hidden overflow-y-auto px-0.5 pb-2 [scrollbar-color:rgba(219,231,222,.38)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[rgba(219,231,222,.32)] [&::-webkit-scrollbar-thumb:hover]:bg-[rgba(219,231,222,.55)] ${sidebarCollapsed ? 'min-[761px]:justify-items-center min-[761px]:px-0' : ''}`}>
          {navGroups.map((group) => (
            <section key={group.label} className={`grid gap-[3px] ${sidebarCollapsed ? 'min-[761px]:justify-items-center' : ''}`}>
              <small className={`px-[11px] pb-1.5 text-[10px] font-[850] uppercase tracking-[.14em] text-[#70887A] ${sidebarCollapsed ? 'min-[761px]:hidden' : ''}`}>{group.label}</small>
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin/dashboard'}
                  className={({ isActive }) => `flex h-11 items-center gap-[11px] rounded-[10px] px-[11px] text-[13px] font-[650] no-underline transition-colors duration-200 [&_svg]:w-[17px] [&_svg]:shrink-0 ${sidebarCollapsed ? 'min-[761px]:w-11 min-[761px]:justify-center min-[761px]:px-0' : ''} ${isActive ? 'bg-[linear-gradient(135deg,#f0eee5,#dfe5dc)] text-[#183026] shadow-[0_10px_26px_rgba(0,0,0,.18)]' : 'text-[#AFBEB5] hover:bg-white/[.09] hover:text-white'}`}
                  onClick={() => setMenuPath(null)}
                >
                  <Icon />
                  <span className={sidebarCollapsed ? 'min-[761px]:hidden' : ''}>{label}</span>
                </NavLink>
              ))}
            </section>
          ))}
        </nav>
        <div className={`mt-auto grid grid-cols-[36px_minmax(0,1fr)_28px] items-center gap-[9px] border-t border-white/[.08] px-[7px] pt-[15px] pb-0.5 ${sidebarCollapsed ? 'min-[761px]:grid-cols-1 min-[761px]:justify-items-center' : ''}`}>
          <span className="grid size-9 place-items-center rounded-[11px] bg-[linear-gradient(145deg,#f5d7be,#e99e73)] text-[10px] font-black text-[#20382C]">{initials}</span>
          <div className={`min-w-0 ${sidebarCollapsed ? 'min-[761px]:hidden' : ''}`}>
            <strong className="block truncate text-[11px]">{displayName}</strong>
            <small className="mt-[3px] block truncate text-[9px] text-[#81978A]">{displayEmail}</small>
          </div>
          <button
            className={`grid cursor-pointer place-items-center border-0 bg-transparent p-1 text-[#9DB0A4] hover:text-white ${sidebarCollapsed ? 'min-[761px]:hidden' : ''}`}
            onClick={() => {
              logout()
              navigate('/admin/login')
            }}
            aria-label="Log out"
          >
            <LogOutIcon className="w-[17px]" />
          </button>
        </div>
      </aside>
      <main className="flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden">
        <header className="grid h-[62px] shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#E2E5DF] bg-white/[.91] px-[14px] shadow-[0_5px_22px_rgba(33,53,43,.035)] backdrop-blur-[18px] min-[761px]:h-[76px] min-[761px]:grid-cols-[1fr_minmax(260px,430px)_1fr] min-[761px]:gap-[25px] min-[761px]:px-[30px] min-[761px]:max-[1100px]:grid-cols-[1fr_minmax(220px,360px)_1fr] max-[380px]:gap-2 max-[380px]:px-[10px]">
          <button
            className="grid size-9 cursor-pointer place-items-center rounded-[10px] border border-[#E2E5DF] bg-white text-[#17251E] min-[761px]:hidden [&_svg]:size-[19px]"
            type="button"
            aria-label={menuOpen ? 'Close admin menu' : 'Open admin menu'}
            aria-expanded={menuOpen}
            aria-controls="admin-navigation"
            onClick={() => setMenuPath(menuOpen ? null : location.pathname)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="hidden size-9 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-[#E2E5DF] bg-white text-[#17251E] transition-colors hover:bg-[#EEF2ED] min-[761px]:grid [&_svg]:size-[18px]"
              type="button"
              aria-label={sidebarCollapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}
              aria-expanded={!sidebarCollapsed}
              aria-controls="admin-navigation"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={toggleSidebar}
            >
              <MenuIcon />
            </button>
            <div className="min-w-0">
              <small className="block truncate text-[6px] font-[850] tracking-[.1em] text-[#95A099] min-[761px]:text-[9px]">ADMIN / {pageName.toUpperCase()}</small>
              <strong className="mt-1 block truncate text-xs min-[761px]:text-[15px] max-[380px]:text-[11px]">{pageName}</strong>
            </div>
          </div>
          <label className="hidden h-[39px] items-center gap-2 rounded-[10px] border border-[#E2E5DF] bg-[#F8F9F6] px-[11px] min-[761px]:flex">
            <SearchIcon className="w-[15px] text-[#819087]" />
            <input className="min-w-0 flex-1 border-0 bg-transparent text-xs text-[#17251E] outline-0" placeholder="Search users, videos, reports…" />
            <kbd className="rounded-[5px] border border-[#DFE3DC] bg-white px-1.5 py-1 text-[9px] text-[#8B958F]">⌘ K</kbd>
          </label>
          <div className="flex items-center justify-end gap-[7px] min-[761px]:gap-3">
            <span className="hidden items-center rounded-[20px] bg-[#E6F4E9] px-2.5 py-[7px] text-[10px] font-extrabold text-[#317449] min-[761px]:inline-flex">
              <i className="mr-1.5 size-1.5 rounded-full bg-[#48B566] shadow-[0_0_0_4px_rgba(72,181,102,.13)]" />127 people online
            </span>
            <button className="relative grid size-9 place-items-center rounded-[10px] border border-[#E2E5DF] bg-white text-[#5F6C64] max-[380px]:size-8" aria-label="Notifications">
              <BellIcon className="w-4" />
              <i className="absolute -top-1 -right-0.5 grid size-[15px] place-items-center rounded-full border-2 border-white bg-[#F06E3D] text-[6px] not-italic text-white">3</i>
            </button>
            <span className="hidden size-9 place-items-center rounded-[11px] bg-[linear-gradient(145deg,#f5d7be,#e99e73)] text-[10px] font-black text-[#20382C] min-[761px]:grid">{initials}</span>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#F4F5F1] [&::-webkit-scrollbar-thumb]:bg-[#BDC6BF]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
