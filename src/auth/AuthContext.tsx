import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth-context'
import type { AuthContextValue, UserProfile } from './auth-context'
import { api, ApiError, clearStoredAuth, getStoredAuth, saveStoredAuth, updateStoredUser } from '../services/api'
import type { AddSocialLinkRequest, AuthResponse, AuthUser, SocialLink, UpdateProfileRequest, UpdateSocialLinkRequest } from '../services/api'

const PROFILE_KEY = 'teambharat_demo_profile'

const defaultProfile: UserProfile = {
  name: 'Drama.Money User',
  username: 'drama_creator',
  phone: '9876543210',
  town: 'Hyderabad',
  college: 'Add your college',
  bio: 'Learning and sharing skills in Telugu.',
  skills: 'Career skills, Communication',
  photoUrl: '',
}

function calculateAge(dob?: string): number | undefined {
  if (!dob) return undefined
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return undefined
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : undefined
}

function authUserToProfile(user: AuthUser, localOverrides?: Partial<UserProfile>): UserProfile {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return {
    id: user.id,
    name: fullName || user.username || defaultProfile.name,
    username: user.username,
    email: user.email,
    phone: user.mobileNumber || localOverrides?.phone || defaultProfile.phone,
    town: user.location || localOverrides?.town || defaultProfile.town,
    country: user.country || null,
    college: localOverrides?.college || defaultProfile.college,
    bio: user.bio || localOverrides?.bio || defaultProfile.bio,
    skills: localOverrides?.skills || defaultProfile.skills,
    photoUrl: user.profileUrl || defaultProfile.photoUrl,
    role: user.role,
    countryCode: user.countryCode,
    mobileNumber: user.mobileNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    age: user.age ?? calculateAge(user.dateOfBirth),
    latitude: user.latitude ?? null,
    longitude: user.longitude ?? null,
    socialLinks: user.socialLinks || [],
    postsCount: user.postsCount ?? 0,
    followersCount: user.followersCount ?? 0,
    followingCount: user.followingCount ?? 0,
  }
}

function getStoredLocalProfile(): Partial<UserProfile> {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY) || localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) as Partial<UserProfile> : {}
  } catch {
    return {}
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(getStoredAuth)
  const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>(getStoredLocalProfile)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  const profile = useMemo<UserProfile>(() => {
    if (session?.user) {
      return authUserToProfile(session.user, localProfile)
    }
    return { ...defaultProfile, ...localProfile }
  }, [session, localProfile])

  const isAuthenticated = !!(session?.accessToken && session?.sessionId)

  const fetchUser = useCallback(async (): Promise<AuthUser | null> => {
    const stored = getStoredAuth()
    if (!stored?.accessToken || !stored?.sessionId) {
      return null
    }

    try {
      const user = await api.users.getMe()
      updateStoredUser(user)
      setSession((prev) => {
        if (!prev) return null
        return { ...prev, user }
      })
      return user
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403 || err.status === 404)) {
        console.warn('[Auth] Session invalid or user not found during /api/users/me, logging out', err)
        clearStoredAuth()
        setSession(null)
        setLocalProfile({})
      } else {
        console.warn('[Auth] Failed to refresh user via /api/users/me:', err)
      }
      return null
    }
  }, [])

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const stored = getStoredAuth()
    if (!stored?.accessToken || !stored?.sessionId) return null

    setIsLoadingUser(true)
    try {
      return await fetchUser()
    } finally {
      setIsLoadingUser(false)
    }
  }, [fetchUser])

  useEffect(() => {
    if (isAuthenticated) {
      void Promise.resolve().then(fetchUser)
    }
  }, [isAuthenticated, fetchUser])

  useEffect(() => {
    const handleAuthRefreshed = (e: Event) => {
      const custom = e as CustomEvent<AuthResponse>
      if (custom.detail) {
        setSession(custom.detail)
      }
    }

    const handleSessionExpired = () => {
      setSession(null)
      setLocalProfile({})
    }

    window.addEventListener('teambharat:auth-refreshed', handleAuthRefreshed)
    window.addEventListener('teambharat:session-expired', handleSessionExpired)
    return () => {
      window.removeEventListener('teambharat:auth-refreshed', handleAuthRefreshed)
      window.removeEventListener('teambharat:session-expired', handleSessionExpired)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    user: session?.user || null,
    profile,
    isLoadingUser,
    refreshUser,
    login: (authData?: AuthResponse | string) => {
      if (authData && typeof authData === 'object' && 'accessToken' in authData) {
        saveStoredAuth(authData)
        setSession(authData)
        // Refresh with latest data from /api/users/me
        refreshUser()
      } else {
        const dummyUser: AuthUser = {
          id: 'user-' + Date.now(),
          username: typeof authData === 'string' && authData ? authData : 'user',
          email: 'user@example.com',
          countryCode: '+91',
          mobileNumber: typeof authData === 'string' ? authData : '9876543210',
          firstName: 'Drama.Money',
          lastName: 'User',
          bio: null,
          location: 'Hyderabad',
          country: 'India',
          socialLinks: [],
          role: 'USER',
        }
        const dummyAuth: AuthResponse = {
          accessToken: 'demo_token_' + Date.now(),
          refreshToken: 'demo_refresh_' + Date.now(),
          tokenType: 'Bearer',
          sessionId: 'session-' + Date.now(),
          user: dummyUser,
        }
        saveStoredAuth(dummyAuth)
        setSession(dummyAuth)
      }
    },
    register: (nextProfile: UserProfile) => {
      setLocalProfile(nextProfile)
      sessionStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile))
    },
    uploadProfilePhoto: async (file) => {
      const userId = session?.user.id
      if (!userId) throw new Error('Sign in to change your profile photo.')
      await api.users.uploadProfileImage(file)
      const freshUser = await api.users.getMe()
      const profileUrl = freshUser.profileUrl?.trim()
      if (!profileUrl) throw new Error('The photo was uploaded, but the server did not return its link.')

      const current = getStoredAuth()
      if (current?.user.id !== userId) return
      updateStoredUser(freshUser)
      setSession((previous) => previous?.user.id === userId ? { ...previous, user: freshUser } : previous)
    },
    updateProfile: async (updates: Partial<UserProfile>): Promise<void> => {
      const merged = { ...localProfile, ...updates }
      setLocalProfile(merged)
      sessionStorage.setItem(PROFILE_KEY, JSON.stringify(merged))

      if (session?.user && session?.accessToken) {
        // Backend replaces all five fields: bio, location, country, latitude, longitude
        const payload: UpdateProfileRequest = {
          bio: updates.bio !== undefined ? (updates.bio || null) : (session.user.bio ?? null),
          location: updates.town !== undefined ? (updates.town || null) : (session.user.location ?? null),
          country: updates.country !== undefined ? (updates.country || null) : (session.user.country ?? null),
          latitude: updates.latitude !== undefined ? updates.latitude : (session.user.latitude ?? null),
          longitude: updates.longitude !== undefined ? updates.longitude : (session.user.longitude ?? null),
        }

        const res = await api.users.updateProfile(payload)

        const current = getStoredAuth()
        if (current?.user.id !== session.user.id) return

        const updatedUser: AuthUser = {
          ...current.user,
          bio: res.bio,
          location: res.location,
          country: res.country,
          latitude: res.latitude,
          longitude: res.longitude,
          socialLinks: res.socialLinks || current.user.socialLinks || [],
        }
        updateStoredUser(updatedUser)
        setSession((prev) => prev?.user.id === updatedUser.id ? { ...prev, user: updatedUser } : prev)
      }
    },
    addSocialLink: async (body: AddSocialLinkRequest): Promise<SocialLink> => {
      const newLink = await api.users.addSocialLink(body)
      try {
        const freshUser = await api.users.getMe()
        if (session) {
          const updatedUser: AuthUser = {
            ...session.user,
            ...freshUser,
          }
          updateStoredUser(updatedUser)
          setSession((prev) => (prev ? { ...prev, user: updatedUser } : null))
        }
      } catch {
        if (session?.user) {
          const existingLinks = session.user.socialLinks || []
          const updatedLinks = [...existingLinks, newLink]
          const updatedUser: AuthUser = {
            ...session.user,
            socialLinks: updatedLinks,
          }
          updateStoredUser(updatedUser)
          setSession((prev) => (prev ? { ...prev, user: updatedUser } : null))
        }
      }
      return newLink
    },
    updateSocialLink: async (linkId: string, body: UpdateSocialLinkRequest): Promise<SocialLink> => {
      const updated = await api.users.updateSocialLink(linkId, body)
      try {
        const freshUser = await api.users.getMe()
        if (session) {
          const updatedUser: AuthUser = {
            ...session.user,
            ...freshUser,
          }
          updateStoredUser(updatedUser)
          setSession((prev) => (prev ? { ...prev, user: updatedUser } : null))
        }
      } catch {
        if (session?.user) {
          const existingLinks = session.user.socialLinks || []
          const updatedLinks = existingLinks.map((l) => (l.id === linkId ? updated : l))
          const updatedUser: AuthUser = {
            ...session.user,
            socialLinks: updatedLinks,
          }
          updateStoredUser(updatedUser)
          setSession((prev) => (prev ? { ...prev, user: updatedUser } : null))
        }
      }
      return updated
    },
    toggleSocialLink: async (linkId: string, active: boolean): Promise<SocialLink> => {
      const updated = await api.users.toggleSocialLinkStatus(linkId, active)
      try {
        const freshUser = await api.users.getMe()
        if (session) {
          const updatedUser: AuthUser = {
            ...session.user,
            ...freshUser,
          }
          updateStoredUser(updatedUser)
          setSession((prev) => (prev ? { ...prev, user: updatedUser } : null))
        }
      } catch {
        if (session?.user) {
          const existingLinks = session.user.socialLinks || []
          const updatedLinks = existingLinks.map((l) => (l.id === linkId ? updated : l))
          const updatedUser: AuthUser = {
            ...session.user,
            socialLinks: updatedLinks,
          }
          updateStoredUser(updatedUser)
          setSession((prev) => (prev ? { ...prev, user: updatedUser } : null))
        }
      }
      return updated
    },
    logout: () => {
      clearStoredAuth()
      sessionStorage.removeItem(PROFILE_KEY)
      setSession(null)
      setLocalProfile({})
    },
  }), [isAuthenticated, session, profile, localProfile, isLoadingUser, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
