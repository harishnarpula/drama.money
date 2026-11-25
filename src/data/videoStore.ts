import { useSyncExternalStore } from 'react'

export type VideoStatus = 'Processing' | 'In review' | 'Live' | 'Rejected'

export type PlatformVideo = {
  id: string
  title: string
  description: string
  category: string
  creator: string
  creatorUsername: string
  aspectRatio?: number
  status: VideoStatus
  createdAt: string
  views: number
  likes: number
  comments: number
  earning: number
  risk: 'Clean' | 'Doubt' | 'High risk'
  aiSummary: string
  rejectionReason?: string
}

export type AuditEntry = {
  id: string
  action: string
  actor: string
  target: string
  timestamp: string
}

const VIDEO_KEY = 'teambharat_demo_videos_v2'
const AUDIT_KEY = 'teambharat_demo_audit_v1'
const EVENT_NAME = 'teambharat:videos-changed'

const initialVideos: PlatformVideo[] = [
  { id: 'video-1', title: 'Resume mistakes freshers make', description: 'Five resume issues and how to correct them.', category: 'Resume and career tips', creator: 'Hari Bharath', creatorUsername: 'hari_learns', status: 'Live', createdAt: '2026-11-17T10:30:00.000Z', views: 4820, likes: 612, comments: 48, earning: 40, risk: 'Clean', aiSummary: 'Career-focused Telugu video. No policy concerns detected.' },
  { id: 'video-2', title: 'My first HR interview tip', description: 'A simple formula for your introduction.', category: 'Interview preparation', creator: 'Hari Bharath', creatorUsername: 'hari_learns', status: 'In review', createdAt: '2026-11-18T08:15:00.000Z', views: 0, likes: 0, comments: 0, earning: 0, risk: 'Clean', aiSummary: 'Speech and title match interview preparation. Clean risk level.' },
  { id: 'video-3', title: 'Three ways to learn React', description: 'A learning plan for beginners.', category: 'Skill building', creator: 'Hari Bharath', creatorUsername: 'hari_learns', status: 'Processing', createdAt: '2026-11-18T09:20:00.000Z', views: 0, likes: 0, comments: 0, earning: 0, risk: 'Doubt', aiSummary: 'Processing media renditions and Telugu speech transcript.' },
  { id: 'video-4', title: 'Guaranteed job in seven days', description: 'A shortcut to getting hired.', category: 'Private jobs', creator: 'Kiran Kumar', creatorUsername: 'kiran_jobs', status: 'In review', createdAt: '2026-11-18T09:42:00.000Z', views: 0, likes: 0, comments: 0, earning: 0, risk: 'High risk', aiSummary: 'Potentially misleading employment guarantee in title and speech.' },
  { id: 'video-5', title: 'Group discussion opening lines', description: 'How to begin a group discussion confidently.', category: 'Freshers and campus', creator: 'Ananya Rao', creatorUsername: 'ananya_careers', status: 'In review', createdAt: '2026-11-18T10:05:00.000Z', views: 0, likes: 0, comments: 0, earning: 0, risk: 'Clean', aiSummary: 'Relevant campus placement guidance. No unsafe content.' },
]

let memoryVideos: PlatformVideo[] | null = null
let memoryAudit: AuditEntry[] | null = null

function safeParse<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

export function getVideos() {
  if (!memoryVideos) memoryVideos = safeParse(VIDEO_KEY, initialVideos)
  return memoryVideos
}

function emitChange() {
  window.dispatchEvent(new Event(EVENT_NAME))
}

function saveVideos(videos: PlatformVideo[]) {
  memoryVideos = videos
  localStorage.setItem(VIDEO_KEY, JSON.stringify(videos))
  emitChange()
}

export function subscribeVideos(callback: () => void) {
  const syncAcrossTabs = () => { memoryVideos = null; callback() }
  window.addEventListener(EVENT_NAME, callback)
  window.addEventListener('storage', syncAcrossTabs)
  return () => {
    window.removeEventListener(EVENT_NAME, callback)
    window.removeEventListener('storage', syncAcrossTabs)
  }
}

export function useVideos() {
  return useSyncExternalStore(subscribeVideos, getVideos, () => initialVideos)
}

export function addVideo(input: Pick<PlatformVideo, 'title' | 'description' | 'category' | 'creator' | 'creatorUsername'> & Pick<PlatformVideo, 'aspectRatio'>) {
  const video: PlatformVideo = {
    ...input,
    id: 'video-' + Date.now(),
    status: 'In review',
    createdAt: new Date().toISOString(),
    views: 0,
    likes: 0,
    comments: 0,
    earning: 0,
    risk: 'Doubt',
    aiSummary: 'Static demo AI check complete. Awaiting final moderator decision.',
  }
  saveVideos([video, ...getVideos()])
  addAudit('Video submitted', input.creatorUsername, video.title)
  return video
}

export function reviewVideo(id: string, decision: 'approve' | 'reject', reason = '') {
  const videos = getVideos()
  const target = videos.find((video) => video.id === id)
  if (!target) return
  saveVideos(videos.map((video) => video.id === id ? {
    ...video,
    status: decision === 'approve' ? 'Live' : 'Rejected',
    earning: decision === 'approve' ? 40 : 0,
    rejectionReason: decision === 'reject' ? reason || 'Content does not meet pilot guidelines.' : undefined,
  } : video))
  addAudit(decision === 'approve' ? 'Video approved' : 'Video rejected', 'Demo Moderator', target.title)
}

export function getAuditEntries() {
  if (!memoryAudit) memoryAudit = safeParse(AUDIT_KEY, [
    { id: 'audit-1', action: 'Payout batch reviewed', actor: 'Finance Admin', target: 'Batch DM-2026-11-18', timestamp: '2026-11-18T09:30:00.000Z' },
    { id: 'audit-2', action: 'User warned', actor: 'Demo Moderator', target: '@career_fast', timestamp: '2026-11-18T08:55:00.000Z' },
  ])
  return memoryAudit
}

export function addAudit(action: string, actor: string, target: string) {
  const next = [{ id: 'audit-' + Date.now(), action, actor, target, timestamp: new Date().toISOString() }, ...getAuditEntries()]
  memoryAudit = next
  localStorage.setItem(AUDIT_KEY, JSON.stringify(next))
}
