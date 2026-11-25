import { createContext, useContext } from 'react'
import type { AddSocialLinkRequest, AuthResponse, AuthUser, SocialLink, UpdateSocialLinkRequest } from '../services/api'

export type UserProfile = {
  id?: string
  name: string
  username: string
  email?: string
  phone: string
  town: string
  country?: string | null
  college: string
  bio: string
  skills: string
  photoUrl?: string
  role?: string
  countryCode?: string
  mobileNumber?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  age?: number
  latitude?: number | null
  longitude?: number | null
  socialLinks?: SocialLink[]
  postsCount?: number
  followersCount?: number
  followingCount?: number
}

export type AuthContextValue = {
  isAuthenticated: boolean
  user: AuthUser | null
  profile: UserProfile
  isLoadingUser: boolean
  refreshUser: () => Promise<AuthUser | null>
  login: (authData?: AuthResponse | string) => void
  register: (profile: UserProfile) => void
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  uploadProfilePhoto: (file: File) => Promise<void>
  addSocialLink: (body: AddSocialLinkRequest) => Promise<SocialLink>
  updateSocialLink: (linkId: string, body: UpdateSocialLinkRequest) => Promise<SocialLink>
  toggleSocialLink: (linkId: string, active: boolean) => Promise<SocialLink>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
