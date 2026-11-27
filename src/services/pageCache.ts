const CACHE_PREFIX = 'teambharat:page-cache:'
const DEFAULT_MAX_AGE = 5 * 60 * 1000

type CacheEntry<T> = { savedAt: number; value: T }

export function readPageCache<T>(key: string, maxAge = DEFAULT_MAX_AGE): T | null {
  try {
    const storageKey = `${CACHE_PREFIX}${key}`
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (!entry?.savedAt || Date.now() - entry.savedAt > maxAge) {
      sessionStorage.removeItem(storageKey)
      return null
    }
    return entry.value
  } catch {
    return null
  }
}

export function writePageCache<T>(key: string, value: T) {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({ savedAt: Date.now(), value } satisfies CacheEntry<T>))
  } catch {
    // Storage availability must never prevent a network response from rendering.
  }
}

export function clearPageCache(key: string) {
  try {
    sessionStorage.removeItem(`${CACHE_PREFIX}${key}`)
  } catch {
    // Ignore unavailable storage.
  }
}
