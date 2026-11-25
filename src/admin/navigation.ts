import type { ComponentType } from 'react'
import { BellIcon, CameraIcon, ChartIcon, HomeIcon, ReelsIcon, UserIcon, WalletIcon } from '../components/Icons'

export type IconComponent = ComponentType

export interface NavItem {
  to: string
  label: string
  icon: IconComponent
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/admin/dashboard', label: 'Overview', icon: HomeIcon },
      { to: '/admin/review', label: 'Post Review', icon: CameraIcon },
      { to: '/admin/reel-review', label: 'Reel Review', icon: ReelsIcon },
      { to: '/admin/users', label: 'Users', icon: UserIcon },
      { to: '/admin/reports', label: 'Reports', icon: BellIcon },
    ],
  },
  {
    label: 'Finance & risk',
    items: [
      { to: '/admin/kyc', label: 'Creator KYC', icon: UserIcon },
      { to: '/admin/payouts', label: 'Payouts', icon: WalletIcon },
      { to: '/admin/fraud', label: 'Fraud signals', icon: ChartIcon },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/admin/categories', label: 'Categories', icon: ChartIcon },
      { to: '/admin/settings', label: 'Settings', icon: ChartIcon },
      { to: '/admin/audit', label: 'Audit log', icon: ReelsIcon },
    ],
  },
]
