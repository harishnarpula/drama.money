import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PostImageCarousel from '../components/PostImageCarousel'
import { BookmarkIcon, CameraIcon, CommentIcon, HeartIcon, ShareIcon } from '../components/Icons'
import { api, getStoredAuth } from '../services/api'
import type { PostResponse } from '../services/api'
import type { MediaPage } from '../services/api'
import { readPageCache, writePageCache } from '../services/pageCache'
import { mediaRatioStyle } from './profileMediaLayout'
import { ShareModal } from '../components/ShareModal'
import { LikesModal } from '../components/LikesModal'
import { CommentsDrawer } from '../components/CommentsDrawer'
import { FollowButton } from '../components/FollowButton'

function PostSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E4E1DA] bg-white p-4 shadow-xs space-y-3.5">
      {/* Top author row skeleton */}
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full bg-[#E8E5DD] animate-pulse shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-32 rounded-md bg-[#E8E5DD] animate-pulse" />
          <div className="h-2.5 w-20 rounded-md bg-[#F0ECE3] animate-pulse" />
        </div>
      </div>

      {/* Main image / media box skeleton with smooth shimmer */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F0ECE3] animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center text-[#8C988F]">
          <CameraIcon className="size-10 opacity-40 motion-safe:animate-pulse" />
        </div>
      </div>

      {/* Action buttons row skeleton */}
      <div className="flex items-center gap-5 pt-1">
        <div className="size-6 rounded-full bg-[#E8E5DD] animate-pulse" />
        <div className="size-6 rounded-full bg-[#E8E5DD] animate-pulse" />
        <div className="size-6 rounded-full bg-[#E8E5DD] animate-pulse" />
        <div className="size-6 rounded-full bg-[#E8E5DD] animate-pulse ml-auto" />
      </div>

      {/* Caption lines skeleton */}
      <div className="space-y-2 pt-1">
        <div className="h-3 w-4/5 rounded-md bg-[#E8E5DD] animate-pulse" />
        <div className="h-2.5 w-3/5 rounded-md bg-[#F0ECE3] animate-pulse" />
      </div>
    </article>
  )
}

function HomePost({ post }: { post: PostResponse }) {
  const [ratio, setRatio] = useState(4 / 3)
  const [captionExpanded, setCaptionExpanded] = useState(false)
  const [canExpandCaption, setCanExpandCaption] = useState(false)
  const [previewLength, setPreviewLength] = useState(post.caption?.length ?? 0)
  const [liked, setLiked] = useState(post.likedByCurrentUser ?? false)
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0)
  const [saved, setSaved] = useState(post.savedByCurrentUser ?? false)
  const [saving, setSaving] = useState(false)
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const captionRef = useRef<HTMLParagraphElement>(null)
  const measuredWidthRef = useRef(0)
  const images = [...post.images].sort((first, second) => first.displayOrder - second.displayOrder)

  const handleLike = () => {
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)))

    api.posts.toggleLike(post.id).then((res) => {
      setLiked(res.liked)
      setLikesCount(res.likesCount)
    }).catch((err) => {
      console.debug('Failed to sync post like:', err)
      setLiked(!nextLiked)
      setLikesCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)))
    })
  }

  useLayoutEffect(() => {
    const caption = captionRef.current
    const container = caption?.parentElement
    if (!caption || !container || !post.caption) {
      setCanExpandCaption(false)
      setPreviewLength(post.caption?.length ?? 0)
      return
    }

    function measureCaption() {
      const source = captionRef.current
      if (!source || !container) return
      const width = source.clientWidth
      if (!width || measuredWidthRef.current === width) return
      measuredWidthRef.current = width

      const measurement = document.createElement('p')
      measurement.style.position = 'fixed'
      measurement.style.left = '-10000px'
      measurement.style.top = '0'
      measurement.style.width = `${width}px`
      measurement.style.height = 'auto'
      measurement.style.maxHeight = 'none'
      measurement.style.overflow = 'visible'
      measurement.style.display = 'block'
      measurement.style.setProperty('-webkit-line-clamp', 'unset')
      measurement.style.setProperty('-webkit-box-orient', 'initial')
      const styles = window.getComputedStyle(source)
      measurement.style.fontFamily = styles.fontFamily
      measurement.style.fontSize = styles.fontSize
      measurement.style.fontWeight = styles.fontWeight
      measurement.style.fontStyle = styles.fontStyle
      measurement.style.lineHeight = styles.lineHeight
      measurement.style.letterSpacing = styles.letterSpacing
      measurement.style.wordSpacing = styles.wordSpacing
      measurement.style.whiteSpace = styles.whiteSpace
      measurement.style.overflowWrap = styles.overflowWrap
      measurement.textContent = post.caption ?? ''
      document.body.append(measurement)

      const lineHeight = Number.parseFloat(styles.lineHeight) || Number.parseFloat(styles.fontSize) * 1.2
      const maxHeight = lineHeight * 2 + 1
      const fullCaptionHeight = measurement.getBoundingClientRect().height
      if (fullCaptionHeight <= maxHeight) {
        setCanExpandCaption((current) => current ? false : current)
        setPreviewLength((current) => current === post.caption?.length ? current : post.caption?.length ?? 0)
        measurement.remove()
        return
      }

      setCanExpandCaption((current) => current ? current : true)
      const fullCaption = post.caption ?? ''
      let low = 0
      let high = fullCaption.length
      let fittingLength = 0

      while (low <= high) {
        const middle = Math.floor((low + high) / 2)
        const prefix = fullCaption.slice(0, middle).trimEnd()
        const separator = prefix && !/\s$/.test(prefix) ? ' ' : ''
        measurement.replaceChildren(document.createTextNode(prefix + separator + '…'))
        const readMore = document.createElement('span')
        readMore.textContent = 'Read more'
        readMore.style.whiteSpace = 'nowrap'
        readMore.style.fontWeight = '600'
        readMore.style.marginLeft = '.35em'
        measurement.append(readMore)

        const readMoreRect = readMore.getBoundingClientRect()
        const fits = readMoreRect.bottom <= measurement.getBoundingClientRect().top + maxHeight
        if (fits) {
          fittingLength = middle
          low = middle + 1
        } else {
          high = middle - 1
        }
      }

      const wordBoundary = fullCaption.slice(0, fittingLength).search(/\s+\S*$/)
      if (wordBoundary > 0) fittingLength = wordBoundary
      setPreviewLength((current) => current === fittingLength ? current : fittingLength)
      measurement.remove()
    }

    measureCaption()
    const observer = new ResizeObserver(() => {
      const width = captionRef.current?.clientWidth ?? 0
      if (width !== measuredWidthRef.current) measureCaption()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      measuredWidthRef.current = 0
    }
  }, [post.caption])

  const creatorInitials =
    (post.creator?.firstName ? post.creator.firstName[0] : post.creator?.username ? post.creator.username[0] : 'DM').toUpperCase()

  const handleSave = () => {
    if (saving) return
    setSaving(true)
    const nextSaved = !saved
    setSaved(nextSaved)
    api.posts.toggleSave(post.id).then((res) => {
      setSaved(res.saved)
    }).catch((err) => {
      console.debug('Failed to sync post save:', err)
      setSaved(!nextSaved)
    }).finally(() => {
      setSaving(false)
    })
  }

  return (
    <article style={mediaRatioStyle(ratio)} className="overflow-hidden rounded-2xl border border-[#E4E1DA] bg-white shadow-sm [--post-image-height:min(72dvh,40rem)]">
      {/* Creator Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE7DF]">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center overflow-hidden rounded-full bg-[#24372C] text-xs font-bold text-white shadow-xs">
            {post.creator?.profileUrl ? (
              <img src={post.creator.profileUrl} alt="" className="size-full object-cover" />
            ) : (
              creatorInitials
            )}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs font-bold text-[#1E2A23] hover:underline cursor-pointer">
              @{post.creator?.username || 'user'}
            </span>
            {post.creator?.firstName && (
              <span className="block truncate text-[10px] text-[#657067]">
                {post.creator.firstName} {post.creator.lastName || ''}
              </span>
            )}
          </div>
        </div>
        <FollowButton creator={post.creator || (post.userId ? { userId: post.userId, username: 'creator' } : null)} />
      </div>

      <PostImageCarousel images={images} className="bg-[#F4F2ED]" onCoverLoad={({ naturalWidth, naturalHeight }) => {
        if (naturalWidth && naturalHeight) setRatio(Math.max(4 / 5, Math.min(16 / 9, naturalWidth / naturalHeight)))
      }} />

      {/* Action Buttons */}
      <div aria-label="Post actions" className="flex items-center gap-4 px-4 pt-3 text-[#24372C]">
        <button
          type="button"
          onClick={handleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`cursor-pointer transition hover:scale-110 ${liked ? 'text-rose-500 scale-105' : 'text-[#24372C]'}`}
        >
          <HeartIcon className={`size-6 ${liked ? 'fill-current text-rose-500' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => setShowCommentsDrawer(true)}
          aria-label="Comment"
          className="cursor-pointer transition hover:scale-110 text-[#24372C]"
        >
          <CommentIcon className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          aria-label="Share"
          className="cursor-pointer transition hover:scale-110 text-[#24372C]"
        >
          <ShareIcon className="size-6" />
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          aria-label={saved ? 'Remove Bookmark' : 'Save post'}
          className={`ml-auto cursor-pointer transition hover:scale-110 ${saved ? 'text-amber-500' : 'text-[#24372C]'} ${saving ? 'opacity-60' : ''}`}
        >
          <BookmarkIcon className={`size-6 ${saved ? 'fill-current text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Likes Count Row */}
      {likesCount > 0 && (
        <div className="px-4 pt-1.5">
          <button
            type="button"
            onClick={() => setShowLikesModal(true)}
            className="text-xs font-bold text-[#1E2A23] hover:underline cursor-pointer"
          >
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </button>
        </div>
      )}

      {/* Caption & Metadata */}
      <div className="space-y-1 px-4 py-2 text-sm [overflow-wrap:anywhere] empty:hidden">
        {post.caption && (
          <div>
            <p ref={captionRef} className="whitespace-pre-wrap text-[#1E2A23] text-xs leading-relaxed">
              <strong className="font-extrabold mr-1.5">@{post.creator?.username || 'user'}</strong>
              {canExpandCaption && !captionExpanded ? `${post.caption.slice(0, previewLength).trimEnd()}…` : post.caption}
              {canExpandCaption && !captionExpanded && (
                <button type="button" className="ml-1 whitespace-nowrap font-semibold text-[#355642] hover:text-[#17251D] hover:underline cursor-pointer" aria-expanded={false} onClick={() => setCaptionExpanded(true)}>
                  Read more
                </button>
              )}
            </p>
            {canExpandCaption && captionExpanded && (
              <button type="button" className="mt-1 font-semibold text-[#355642] hover:text-[#17251D] hover:underline cursor-pointer" aria-expanded={true} onClick={() => setCaptionExpanded(false)}>
                Show less
              </button>
            )}
          </div>
        )}

        {/* View all comments shortcut */}
        {commentsCount > 0 && (
          <button
            type="button"
            onClick={() => setShowCommentsDrawer(true)}
            className="block text-xs font-medium text-[#657067] hover:underline cursor-pointer pt-0.5"
          >
            View all {commentsCount} comments
          </button>
        )}

        {post.hashtags && (!canExpandCaption || captionExpanded) && (
          <p className="font-semibold text-xs text-[#355642]">{post.hashtags}</p>
        )}
        {post.createdAt && (
          <time dateTime={post.createdAt} className="block text-[10px] text-[#8A968D]">
            {new Date(post.createdAt).toLocaleDateString()}
          </time>
        )}
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`${window.location.origin}/app?post=${post.id}`}
        title={post.caption || 'Drama.Money Post'}
        caption={post.caption || undefined}
        contentType="POST"
      />

      {/* Who Liked Modal Dialog */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        contentId={post.id}
        contentType="POST"
      />

      {/* Threaded Comments & Replies Drawer */}
      <CommentsDrawer
        isOpen={showCommentsDrawer}
        onClose={() => setShowCommentsDrawer(false)}
        contentId={post.id}
        contentType="POST"
        onCommentCountChange={setCommentsCount}
      />
    </article>
  )
}

const TOPIC_CONFIG: Record<string, { keywords: string[]; isTrending?: boolean }> = {
  'All': { keywords: [] },
  '🔥 Trending': { keywords: [], isTrending: true },
  '💼 Walk-in Drives': { keywords: ['walkin', 'walk-in', 'job', 'jobs', 'hiring', 'drive', 'career', 'recruitment', 'fresher', 'opening', 'vacancy'] },
  '🎓 Govt Exams': { keywords: ['govt', 'exam', 'exams', 'appsc', 'tspsc', 'upsc', 'ssc', 'bank', 'notification', 'results', 'syllabus', 'hallticket', 'police', 'group'] },
  '💡 Tech & Excel': { keywords: ['tech', 'excel', 'coding', 'developer', 'python', 'java', 'react', 'sql', 'sheets', 'vlookup', 'formula', 'data', 'software', 'programming'] },
  '📄 Resume Tips': { keywords: ['resume', 'cv', 'interview', 'portfolio', 'tips', 'guidance', 'template', 'hr', 'ats', 'fresher'] },
}

export default function HomePosts({
  filter = 'All',
  onResetFilter,
}: {
  filter?: string
  onResetFilter?: () => void
} = {}) {
  const cacheOwner = getStoredAuth()?.user.id ?? 'anonymous'
  const cacheKey = `user:${cacheOwner}:home-posts:0`
  const [cachedPage] = useState(() => readPageCache<MediaPage<PostResponse>>(cacheKey))
  const [posts, setPosts] = useState<PostResponse[]>(() => (cachedPage?.content ?? []).filter((post) => post.postStatus == null || post.postStatus === 'APPROVED'))
  const [page, setPage] = useState(0)
  const [retry, setRetry] = useState(0)
  const [last, setLast] = useState(cachedPage?.last ?? false)
  const [loading, setLoading] = useState(!cachedPage)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.posts.listApproved(page).then((response) => {
      if (!active) return
      const approved = response.content.filter((post) => post.postStatus == null || post.postStatus === 'APPROVED')
      setPosts((current) => page === 0 ? approved : [...new Map([...current, ...approved].map((post) => [post.id, post])).values()])
      setLast(response.last)
      setError('')
      if (page === 0) writePageCache(cacheKey, response)
    }).catch((cause: unknown) => {
      if (active && (page > 0 || !cachedPage)) setError(cause instanceof Error ? cause.message : 'Please try again.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [cacheKey, cachedPage, page, retry])

  function loadMore() {
    setLoading(true)
    if (error) {
      setError('')
      setRetry((current) => current + 1)
    } else {
      setPage((current) => current + 1)
    }
  }

  // Filter posts based on topic configuration
  let visiblePosts = posts
  const config = TOPIC_CONFIG[filter]

  if (config?.isTrending) {
    // Sort by engagement score: (likes * 2) + comments
    visiblePosts = [...posts].sort((a, b) => {
      const scoreA = (a.likesCount ?? 0) * 2 + (a.commentsCount ?? 0)
      const scoreB = (b.likesCount ?? 0) * 2 + (b.commentsCount ?? 0)
      if (scoreB !== scoreA) return scoreB - scoreA
      return (new Date(b.createdAt ?? 0).getTime()) - (new Date(a.createdAt ?? 0).getTime())
    })
  } else if (config && config.keywords.length > 0) {
    visiblePosts = posts.filter((p) => {
      const text = `${p.caption || ''} ${p.hashtags || ''}`.toLowerCase()
      return config.keywords.some((kw) => text.includes(kw.toLowerCase()))
    })
  } else if (filter !== 'All') {
    const fallbackKeyword = filter.replace(/[^\w\s]/gi, '').trim().toLowerCase()
    if (fallbackKeyword) {
      visiblePosts = posts.filter((p) =>
        `${p.caption || ''} ${p.hashtags || ''}`.toLowerCase().includes(fallbackKeyword),
      )
    }
  }

  return (
    <section aria-label="Community posts" className="space-y-4">
      {visiblePosts.map((post) => <HomePost key={post.id} post={post} />)}

      {visiblePosts.length === 0 && !loading && posts.length > 0 && (
        <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-white/70 py-10 px-4 text-center">
          <p className="text-sm font-bold text-[#1E2A23]">No posts matching "{filter}" yet</p>
          <p className="mt-1 text-xs text-[#6B7870]">
            No posts found with tags or keywords related to {filter}.
          </p>
          {onResetFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#24372C] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#1A2820] cursor-pointer"
            >
              View All Posts
            </button>
          )}
        </div>
      )}

      {loading && (
        <div role="status" className="space-y-4">
          <span className="sr-only">Loading {posts.length > 0 ? 'more ' : ''}posts…</span>
          {posts.length > 0 ? (
            <div aria-hidden="true" className="flex justify-center gap-1.5 py-4">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="size-2 rounded-full bg-[#789282] motion-safe:animate-pulse"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          ) : (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-[#EAC5C0] bg-[#FFF4F2] p-5 text-center space-y-2">
          <p role="alert" className="text-sm font-semibold text-[#842B24] [overflow-wrap:anywhere]">
            Could not load community posts. {error}
          </p>
          <button
            type="button"
            className="rounded-xl border border-[#D8D2C8] bg-white px-4 py-2 text-xs font-bold text-[#24372C] hover:bg-[#F1EEE7] cursor-pointer"
            onClick={loadMore}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && last && !posts.length && (
        <div className="rounded-2xl border border-dashed border-[#D8D4CB] bg-white px-5 py-14 text-center">
          <span className="text-3xl mb-2 block">🌱</span>
          <p className="text-base font-bold text-[#1E2A23]">No community posts yet</p>
          <p className="text-xs text-[#657067] mt-1">
            Be the first creator to share a career lesson or job update!
          </p>
          <Link
            to="/app/upload"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#24372C] px-4 py-2 text-xs font-bold text-white hover:bg-[#355642] transition"
          >
            + Create a Post
          </Link>
        </div>
      )}

      {!loading && (error || !last) && (
        <button
          type="button"
          className="mx-auto block rounded-xl border border-[#D8D2C8] bg-white px-4 py-2 text-sm font-bold text-[#24372C] hover:bg-[#F1EEE7] cursor-pointer"
          onClick={loadMore}
        >
          {error ? 'Try again' : 'Load more posts'}
        </button>
      )}
    </section>
  )
}
