import { useRef, useState } from 'react'
import type { PostResponse } from '../services/api'
import { ArrowLeft, ChevronRight } from './Icons'

const navClass = 'absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-[#172D25] text-white shadow-md ring-1 ring-white/60 enabled:hover:bg-[#355642] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-45'

export default function PostImageCarousel({ images, className, onCoverLoad, eager = false }: {
  images: PostResponse['images']
  className?: string
  onCoverLoad?: (image: HTMLImageElement) => void
  eager?: boolean
}) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeImage, setActiveImage] = useState(0)
  const index = Math.max(0, Math.min(activeImage, images.length - 1))
  if (!images.length) return null

  function moveImage(direction: number) {
    const carousel = carouselRef.current
    const nextImage = carousel?.children[index + direction]
    if (carousel && nextImage instanceof HTMLElement) carousel.scrollTo({ left: nextImage.offsetLeft })
  }

  return (
    <figure className={className}>
      <div className="relative">
        <div ref={carouselRef} role="group" aria-label="Post images" tabIndex={images.length > 1 ? 0 : undefined}
          className="relative flex aspect-[var(--post-image-ratio)] max-h-[var(--post-image-height)] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const { scrollLeft, clientWidth } = event.currentTarget
            if (clientWidth > 0) setActiveImage(Math.round(scrollLeft / clientWidth))
          }}>
          {images.map((image, imageIndex) => (
            <div key={image.id} aria-hidden={imageIndex !== index} className="h-full w-full shrink-0 snap-start">
              <img className="block size-full object-contain" src={image.imageUrl} loading={eager && imageIndex <= 1 ? 'eager' : 'lazy'} draggable={false} alt={`Post image ${imageIndex + 1} of ${images.length}`} onLoad={imageIndex === 0 && onCoverLoad ? (event) => onCoverLoad(event.currentTarget) : undefined} />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" className={`${navClass} left-2`} disabled={index === 0} onClick={() => moveImage(-1)}><ArrowLeft className="size-5" /></button>
            <button type="button" aria-label="Next image" className={`${navClass} right-2`} disabled={index === images.length - 1} onClick={() => moveImage(1)}><ChevronRight className="size-5" /></button>
          </>
        )}
      </div>
      {images.length > 1 && <figcaption className="border-t border-[#EAE7DF] bg-white p-2 text-center text-xs font-semibold" aria-live="polite">Image {index + 1} of {images.length}</figcaption>}
    </figure>
  )
}
