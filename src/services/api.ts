// Drama.Money API Client
import { API_CONFIG } from '../config/api'
import type { AiReviewReport } from './aiModerator'

export type UploadMediaType = 'POST_IMAGE' | 'REEL_VIDEO' | 'REEL_COVER'

export interface MediaUpload {
  id: string
  userId: string
  fileName: string
  contentType: string
  documentUrl: string
  presignedUrl: string
  createdAt: string
}

export interface CreatePostRequest {
  caption: string
  hashtags?: string
  images: { documentId: string; documentUrl: string }[]
}

export type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ContentReviewDecision = { status: 'APPROVED' } | { status: 'REJECTED'; rejectionReason: string }

export type ContentReviewRequest = { contentType: 'POST' | 'REEL'; contentId: string } & ContentReviewDecision

export interface ContentCreator {
  userId: string
  firstName?: string
  lastName?: string
  username: string
  profileUrl?: string | null
}

export interface PostResponse {
  id: string
  userId: string
  creator?: ContentCreator | null
  caption?: string | null
  hashtags?: string | null
  postStatus?: PostStatus
  lifecycleStatus?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  rejectionReason?: string | null
  createdAt?: string
  images: { id: string; displayOrder: number; imageUrl: string }[]
  likesCount?: number
  commentsCount?: number
  likedByCurrentUser?: boolean
}

export interface ReelResponse {
  id: string
  userId: string
  creator?: ContentCreator | null
  caption?: string | null
  hashtags?: string | null
  createdAt?: string
  videoUrl: string
  coverUrl?: string | null
  reelStatus?: PostStatus
  lifecycleStatus?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  rejectionReason?: string | null
  likesCount?: number
  commentsCount?: number
  likedByCurrentUser?: boolean
}

export interface CreateReelRequest {
  caption: string
  hashtags?: string
  latitude: number
  longitude: number
  videoUrl: string
  coverUrl?: string
}

export interface LikeToggleResponse {
  liked: boolean
  likesCount: number
}

export interface LikerUser {
  userId: string
  username: string
  firstName?: string
  lastName?: string
  profileUrl?: string | null
  likedAt: string
}

export interface LikesSummaryResponse {
  totalLikes: number
  likedByCurrentUser: boolean
  likers: LikerUser[]
}

export interface CommentItem {
  id: string
  contentId: string
  contentType: 'POST' | 'REEL'
  userId: string
  username: string
  firstName?: string
  lastName?: string
  profileUrl?: string | null
  parentCommentId?: string | null
  text: string
  likesCount: number
  likedByCurrentUser: boolean
  repliesCount: number
  isAuthor: boolean
  canDelete: boolean
  replies?: CommentItem[]
  createdAt: string
  updatedAt: string
}

export interface CommentLikeToggleResponse {
  liked: boolean
  likesCount: number
}

export interface MediaPage<T> {
  content: T[]
  last: boolean
  totalElements?: number
}

export type SocialPlatform = 'WEBSITE' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'YOUTUBE' | 'GITHUB' | 'THREADS' | 'OTHER'

export interface AddSocialLinkRequest {
  platform: SocialPlatform
  title: string
  url: string
}

export interface UpdateSocialLinkRequest {
  platform: SocialPlatform
  title: string
  url: string
}

export interface SocialLink {
  id: string
  platform: SocialPlatform
  title: string
  url: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AuthUser {
  id: string
  profileUrl?: string | null
  username: string
  email: string
  countryCode: string
  mobileNumber: string
  firstName: string
  lastName: string
  bio: string | null
  location: string | null
  country: string | null
  latitude?: number | null
  longitude?: number | null
  socialLinks: SocialLink[]
  dateOfBirth?: string
  age?: number
  role: string
  createdAt?: string
  postsCount?: number
  followersCount?: number
  followingCount?: number
}

export interface UpdateProfileRequest {
  bio?: string | null
  location?: string | null
  country?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface UpdateProfileResponse {
  userId: string
  bio: string | null
  location: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  socialLinks?: SocialLink[]
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  sessionId: string
  user: AuthUser
}

export interface ApiErrorResponse {
  timestamp?: string
  status?: number
  code?: string
  message?: string
  path?: string
  errors?: Array<{ field: string; message: string }>
}

const AUTH_STORAGE_KEY = 'teambharat_auth_session'
const ADMIN_AUTH_STORAGE_KEY = 'teambharat_admin_auth_session_v2'

export function getStoredAdminAuth(): AuthResponse | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) ?? 'null') as AuthResponse | null
    return session?.accessToken && session.sessionId && session.user?.id ? session : null
  } catch {
    return null
  }
}

export function clearStoredAdminAuth() {
  sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
}

function saveStoredAdminAuth(session: AuthResponse) {
  if (!session.accessToken || !session.sessionId || !session.user?.id) {
    throw new ApiError('The server did not return a complete admin session.', 401)
  }
  sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function getStoredAuth(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AuthResponse

    // Fallback to individual keys if present
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken') || ''
    const sessionId = localStorage.getItem('sessionId')
    const userId = localStorage.getItem('userId')
    if (accessToken && sessionId && userId) {
      return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        sessionId,
        user: {
          id: userId,
          username: localStorage.getItem('username') || 'user',
          email: '',
          countryCode: '+91',
          mobileNumber: '',
          firstName: '',
          lastName: '',
          bio: null,
          location: null,
          country: null,
          socialLinks: [],
          role: 'USER',
        },
      }
    }
    return null
  } catch {
    return null
  }
}

export function saveStoredAuth(auth: AuthResponse) {
  try {
    // Store individual keys as requested
    localStorage.setItem('accessToken', auth.accessToken)
    localStorage.setItem('refreshToken', auth.refreshToken || '')
    localStorage.setItem('sessionId', auth.sessionId)
    localStorage.setItem('userId', auth.user.id)
    localStorage.setItem('username', auth.user.username)

    // Store complete auth session object
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  } catch (e) {
    console.error('Failed to save auth to localStorage', e)
  }
}

export function updateStoredUser(user: AuthUser) {
  try {
    const existing = getStoredAuth()
    if (existing) {
      existing.user = user
      saveStoredAuth(existing)
    } else {
      localStorage.setItem('userId', user.id)
      localStorage.setItem('username', user.username)
    }
  } catch (e) {
    console.error('Failed to update stored user', e)
  }
}

export function clearStoredAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('sessionId')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem('teambharat_demo_profile')
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  sessionStorage.removeItem('sessionId')
  sessionStorage.removeItem('userId')
  sessionStorage.removeItem('username')
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem('teambharat_demo_session')
  sessionStorage.removeItem('teambharat_demo_profile')
}

// Every user and admin request uses the same configured server origin.
const API_BASE_URL = API_CONFIG.baseUrl.replace(/\/+$/, '')

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  
  // Read either from stored auth object or individual localStorage keys
  const session = getStoredAuth()
  const accessToken = session?.accessToken || localStorage.getItem('accessToken')
  const userId = session?.user?.id || localStorage.getItem('userId')
  const sessionId = session?.sessionId || localStorage.getItem('sessionId')

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  if (userId) {
    headers['X-Actor'] = userId
  }
  if (sessionId) {
    headers['X-Session-Id'] = sessionId
  }
  return headers
}

export class ApiError extends Error {
  status: number
  code?: string
  fieldErrors?: Array<{ field: string; message: string }>

  constructor(message: string, status: number, code?: string, fieldErrors?: Array<{ field: string; message: string }>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export function notifySessionExpired(message?: string) {
  clearStoredAuth()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('teambharat:session-expired', {
        detail: { message: message || 'Your session has expired. Please sign in again to continue.' },
      })
    )
  }
}

let activeRefreshPromise: Promise<AuthResponse> | null = null

export async function refreshAuthToken(): Promise<AuthResponse> {
  if (activeRefreshPromise) {
    return activeRefreshPromise
  }

  activeRefreshPromise = (async () => {
    const session = getStoredAuth()
    const storedRefreshToken = session?.refreshToken || localStorage.getItem('refreshToken')
    const sessionId = session?.sessionId || localStorage.getItem('sessionId')

    if (!storedRefreshToken) {
      notifySessionExpired()
      throw new ApiError('No refresh token available.', 401, 'INVALID_REFRESH_TOKEN')
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (sessionId) {
      headers['X-Session-Id'] = sessionId
    }

    const targetUrl = `${API_BASE_URL}/api/auth/refresh-token`
    let response: Response
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      })
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Network error'
      throw new ApiError(`Unable to refresh token (${errMessage}).`, 0)
    }

    const text = await response.text()
    let data: unknown
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }

    if (!response.ok) {
      const errData = data as ApiErrorResponse | null
      const msg = errData?.message || 'Failed to refresh token.'
      notifySessionExpired(msg)
      throw new ApiError(msg, response.status, errData?.code || 'INVALID_REFRESH_TOKEN')
    }

    const resAuth = data as Partial<AuthResponse>
    const nextAuth: AuthResponse = {
      accessToken: resAuth.accessToken || '',
      refreshToken: resAuth.refreshToken || storedRefreshToken,
      tokenType: resAuth.tokenType || 'Bearer',
      sessionId: resAuth.sessionId || sessionId || '',
      user: resAuth.user || session?.user || {
        id: localStorage.getItem('userId') || '',
        username: localStorage.getItem('username') || 'user',
        email: '',
        countryCode: '+91',
        mobileNumber: '',
        firstName: '',
        lastName: '',
        bio: null,
        location: null,
        country: null,
        socialLinks: [],
        role: 'USER',
      },
    }

    saveStoredAuth(nextAuth)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('teambharat:auth-refreshed', { detail: nextAuth }))
    }

    return nextAuth
  })().finally(() => {
    activeRefreshPromise = null
  })

  return activeRefreshPromise
}

interface RequestOptions extends RequestInit {
  auth?: boolean
  _retry?: boolean
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, _retry = false, ...init } = options
  const targetUrl = `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(auth ? getAuthHeaders() : {}),
    ...(init.headers as Record<string, string> || {}),
  }

  let response: Response
  try {
    response = await fetch(targetUrl, {
      ...init,
      headers,
    })
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : 'Network error'
    console.error('[API Error]', targetUrl, err)
    throw new ApiError(`Unable to reach server (${errMessage}). If server is waking up, please retry in a few seconds.`, 0)
  }

  const text = await response.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null
    const code = errorData?.code
    const firstFieldMsg = errorData?.errors?.[0]?.message
    // Always prioritize the backend's real message or field validation message
    const message = firstFieldMsg || errorData?.message || response.statusText || `Request failed (${response.status})`

    // Check if access token is invalid or expired
    const isInvalidToken =
      response.status === 401 &&
      (code === 'INVALID_TOKEN' ||
        (typeof message === 'string' && message.toUpperCase().includes('INVALID_TOKEN')) ||
        (typeof errorData?.message === 'string' && errorData.message.toUpperCase().includes('INVALID_TOKEN')))

    if (auth && !_retry && isInvalidToken && !endpoint.includes('/api/auth/refresh-token')) {
      try {
        const refreshed = await refreshAuthToken()
        if (refreshed?.accessToken) {
          // Retry the original request with the brand new access token
          return await request<T>(endpoint, {
            ...options,
            _retry: true,
          })
        }
      } catch (refreshErr) {
        console.warn('[API Interceptor] Token refresh failed, signaling session expiry:', refreshErr)
        notifySessionExpired('Your session has expired. Please sign in again.')
        throw new ApiError('Your session has expired. Please sign in again.', 401, 'INVALID_TOKEN')
      }
    }

    throw new ApiError(message, response.status, code, errorData?.errors)
  }

  return data as T
}

type LoginCredentials = { identifier: string; password: string }

function loginRequest(body: LoginCredentials) {
  return request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) })
}

function sameAdminSession(first: AuthResponse | null, second: AuthResponse) {
  return first?.sessionId === second.sessionId && first.user.id === second.user.id
}

let adminRefresh: { accessToken: string; sessionId: string; promise: Promise<AuthResponse> } | undefined

function refreshAdminAuth(session: AuthResponse): Promise<AuthResponse> {
  if (adminRefresh?.accessToken === session.accessToken && adminRefresh.sessionId === session.sessionId) return adminRefresh.promise

  const promise = (async () => {
    if (!session.refreshToken) throw new ApiError('Your admin session has expired. Sign in again.', 401)
    const result = await request<Partial<AuthResponse>>('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'X-Session-Id': session.sessionId },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })
    const current = getStoredAdminAuth()
    if (!sameAdminSession(current, session) || current?.accessToken !== session.accessToken) {
      throw new ApiError('The admin session changed. Please try again.', 401)
    }
    const next: AuthResponse = {
      accessToken: result?.accessToken ?? '',
      refreshToken: result?.refreshToken || session.refreshToken,
      tokenType: result?.tokenType || session.tokenType,
      sessionId: result?.sessionId || session.sessionId,
      user: result?.user || session.user,
    }
    saveStoredAdminAuth(next)
    return next
  })().finally(() => {
    if (adminRefresh?.promise === promise) adminRefresh = undefined
  })
  adminRefresh = { accessToken: session.accessToken, sessionId: session.sessionId, promise }
  return promise
}

async function requestAsAdmin<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = getStoredAdminAuth()
  if (!session) throw new ApiError('Sign in to the admin panel to continue.', 401)

  function send(auth: AuthResponse) {
    return request<T>(endpoint, {
      ...options,
      headers: { Authorization: `Bearer ${auth.accessToken}`, 'X-Session-Id': auth.sessionId, 'X-Actor': auth.user.id },
    })
  }

  try {
    return await send(session)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
  }

  const current = getStoredAdminAuth()
  if (!current || !sameAdminSession(current, session)) throw new ApiError('Sign in to the admin panel to continue.', 401)
  if (current.accessToken !== session.accessToken) return send(current)

  let refreshed: AuthResponse
  try {
    refreshed = await refreshAdminAuth(session)
  } catch (error) {
    const stored = getStoredAdminAuth()
    if (error instanceof ApiError && (error.status === 401 || error.status === 403) && sameAdminSession(stored, session) && stored?.accessToken === session.accessToken) {
      clearStoredAdminAuth()
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('teambharat:admin-session-expired'))
    }
    throw error
  }
  return send(refreshed)
}

export const api = {
  adminAuth: {
    login: async (credentials: LoginCredentials) => {
      const session = await loginRequest(credentials)
      if (/^(ROLE_)?USER$/i.test(session.user?.role ?? '')) {
        throw new ApiError('Sign in with an account that has admin access.', 403, 'ACCESS_DENIED')
      }
      saveStoredAdminAuth(session)
      return session
    },
  },
  media: {
    upload: (file: File, mediaType: UploadMediaType, userId: string): Promise<MediaUpload> => {
      const query = new URLSearchParams({ mediaType, userId })
      const body = new FormData()
      body.append('file', file)
      return request<MediaUpload>(`/api/media/upload?${query}`, {
        method: 'POST',
        auth: true,
        body,
      })
    },
  },
  moderation: {
    review: async (review: ContentReviewRequest) => {
      const { contentType, contentId, status } = review
      const rejectionReason = review.status === 'REJECTED' ? review.rejectionReason.trim() : null
      if (status === 'REJECTED' && !rejectionReason) throw new Error('Enter a rejection reason.')
      return requestAsAdmin<unknown>('/api/content/admin/review', {
        method: 'PATCH',
        body: JSON.stringify({ contentType, contentId, status, rejectionReason }),
      })
    },
  },
  ai: {
    getPostReview: (postId: string) =>
      requestAsAdmin<AiReviewReport>(`/api/posts/${encodeURIComponent(postId)}/ai-review`)
        .catch(() => requestAsAdmin<AiReviewReport>(`/api/content/admin/posts/${encodeURIComponent(postId)}/ai-review`)),
    getReelReview: (reelId: string) =>
      requestAsAdmin<AiReviewReport>(`/api/reels/${encodeURIComponent(reelId)}/ai-review`)
        .catch(() => requestAsAdmin<AiReviewReport>(`/api/content/admin/reels/${encodeURIComponent(reelId)}/ai-review`)),
  },
  posts: {
    listForReview: (page = 0, size = 20, status?: PostStatus) => {
      const query = new URLSearchParams({ page: String(page), size: String(size) })
      if (status) query.set('status', status)
      return requestAsAdmin<MediaPage<PostResponse>>(`/api/content/admin/posts?${query}`)
    },
    listApproved: (page = 0, size = 20) => request<MediaPage<PostResponse>>(`/api/content/posts?page=${page}&size=${size}`, { auth: true }),
    list: (page = 0, size = 20) => request<MediaPage<PostResponse>>(`/api/posts?page=${page}&size=${size}`, { auth: true }),
    create: (body: CreatePostRequest): Promise<PostResponse> => request<PostResponse>('/api/posts', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    }),
    update: (postId: string, body: { caption: string; hashtags: string }) => request<PostResponse | null>(`/api/posts/${encodeURIComponent(postId)}`, {
      method: 'PUT',
      auth: true,
      body: JSON.stringify(body),
    }),
    archive: (postId: string) => request<void>(`/api/posts/${encodeURIComponent(postId)}/archive`, {
      method: 'PUT',
      auth: true,
    }),
    restore: (postId: string) => request<void>(`/api/posts/${encodeURIComponent(postId)}/restore`, {
      method: 'PUT',
      auth: true,
    }),
    remove: (postId: string) => request<void>(`/api/posts/${encodeURIComponent(postId)}`, {
      method: 'DELETE',
      auth: true,
    }),
    toggleLike: (postId: string) =>
      request<LikeToggleResponse>(`/api/posts/${encodeURIComponent(postId)}/likes/toggle`, { method: 'POST', auth: true }),
    getLikes: (postId: string, page = 0, size = 50) =>
      request<LikesSummaryResponse>(`/api/posts/${encodeURIComponent(postId)}/likes?page=${page}&size=${size}`, { auth: true }),
    getComments: (postId: string, page = 0, size = 30) =>
      request<CommentItem[]>(`/api/posts/${encodeURIComponent(postId)}/comments?page=${page}&size=${size}`, { auth: true }),
    getReplies: (postId: string, commentId: string) =>
      request<CommentItem[]>(`/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/replies`, { auth: true }),
    addComment: (postId: string, text: string, parentCommentId?: string) =>
      request<CommentItem>(`/api/posts/${encodeURIComponent(postId)}/comments`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ text, parentCommentId }),
      }),
    deleteComment: (postId: string, commentId: string) =>
      request<void>(`/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`, {
        method: 'DELETE',
        auth: true,
      }),
    toggleCommentLike: (commentId: string) =>
      request<CommentLikeToggleResponse>(`/api/posts/comments/${encodeURIComponent(commentId)}/like`, {
        method: 'POST',
        auth: true,
      }),
  },
  reels: {
    listApproved: (page = 0, size = 20) =>
      request<MediaPage<ReelResponse>>(`/api/content/reels?page=${page}&size=${size}`, { auth: true })
        .catch(() => request<MediaPage<ReelResponse>>(`/api/content/posts/reels?page=${page}&size=${size}`, { auth: true })),
    listForReview: (page = 0, size = 20, status?: PostStatus) => {
      const query = new URLSearchParams({ page: String(page), size: String(size) })
      if (status) query.set('status', status)
      return requestAsAdmin<MediaPage<ReelResponse>>(`/api/content/admin/reels?${query}`)
    },
    list: (page = 0, size = 20) => request<MediaPage<ReelResponse>>(`/api/reels?page=${page}&size=${size}`, { auth: true }),
    detail: (reelId: string) => request<ReelResponse>(`/api/reels/${encodeURIComponent(reelId)}`, { auth: true }),
    update: (reelId: string, body: { caption: string; hashtags: string }) => request<ReelResponse>(`/api/reels/${encodeURIComponent(reelId)}`, {
      method: 'PUT',
      auth: true,
      body: JSON.stringify(body),
    }),
    archive: (reelId: string) => request<void>(`/api/reels/${encodeURIComponent(reelId)}/archive`, {
      method: 'PUT',
      auth: true,
    }),
    restore: (reelId: string) => request<void>(`/api/reels/${encodeURIComponent(reelId)}/restore`, {
      method: 'PUT',
      auth: true,
    }),
    remove: (reelId: string) => request<void>(`/api/reels/${encodeURIComponent(reelId)}`, { method: 'DELETE', auth: true }),
    create: (body: CreateReelRequest) => request<ReelResponse>('/api/reels', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    }),
    toggleLike: (reelId: string) =>
      request<LikeToggleResponse>(`/api/reels/${encodeURIComponent(reelId)}/likes/toggle`, { method: 'POST', auth: true }),
    getLikes: (reelId: string, page = 0, size = 50) =>
      request<LikesSummaryResponse>(`/api/reels/${encodeURIComponent(reelId)}/likes?page=${page}&size=${size}`, { auth: true }),
    getComments: (reelId: string, page = 0, size = 30) =>
      request<CommentItem[]>(`/api/reels/${encodeURIComponent(reelId)}/comments?page=${page}&size=${size}`, { auth: true }),
    getReplies: (reelId: string, commentId: string) =>
      request<CommentItem[]>(`/api/reels/${encodeURIComponent(reelId)}/comments/${encodeURIComponent(commentId)}/replies`, { auth: true }),
    addComment: (reelId: string, text: string, parentCommentId?: string) =>
      request<CommentItem>(`/api/reels/${encodeURIComponent(reelId)}/comments`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ text, parentCommentId }),
      }),
    deleteComment: (reelId: string, commentId: string) =>
      request<void>(`/api/reels/${encodeURIComponent(reelId)}/comments/${encodeURIComponent(commentId)}`, {
        method: 'DELETE',
        auth: true,
      }),
    toggleCommentLike: (commentId: string) =>
      request<CommentLikeToggleResponse>(`/api/reels/comments/${encodeURIComponent(commentId)}/like`, {
        method: 'POST',
        auth: true,
      }),
  },
  auth: {
    checkUsername: async (username: string): Promise<{ available: boolean }> => {
      return await request<{ available: boolean }>(`/api/auth/check-username?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        auth: false,
      })
    },
    register: async (body: {
      username: string
      email: string
      password: string
      firstName: string
      lastName: string
      dateOfBirth: string
      countryCode: string
      mobileNumber: string
    }): Promise<AuthResponse> => {
      const res = await request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify(body),
      })
      saveStoredAuth(res)
      return res
    },
    login: async (body: LoginCredentials): Promise<AuthResponse> => {
      const res = await loginRequest(body)
      saveStoredAuth(res)
      return res
    },
    refreshToken: async (): Promise<AuthResponse> => {
      return await refreshAuthToken()
    },
    logout: () => {
      clearStoredAuth()
    },
  },
  users: {
    uploadProfileImage: (file: File) => {
      const body = new FormData()
      body.append('file', file)
      return request<string>('/api/users/profile/image', { method: 'POST', auth: true, body })
    },
    getMe: async (): Promise<AuthUser> => {
      return await request<AuthUser>('/api/users/me', {
        method: 'GET',
        auth: true,
      })
    },
    updateProfile: async (body: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
      return await request<UpdateProfileResponse>('/api/users/profile', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(body),
      })
    },
    addSocialLink: async (body: AddSocialLinkRequest): Promise<SocialLink> => {
      return await request<SocialLink>('/api/users/profile/social-links', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(body),
      })
    },
    updateSocialLink: async (linkId: string, body: UpdateSocialLinkRequest): Promise<SocialLink> => {
      return await request<SocialLink>(`/api/users/profile/social-links/${encodeURIComponent(linkId)}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(body),
      })
    },
    toggleSocialLinkStatus: async (linkId: string, active: boolean): Promise<SocialLink> => {
      return await request<SocialLink>(`/api/users/profile/social-links/${encodeURIComponent(linkId)}/status`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify({ active }),
      })
    },
  },
}

