import type { CSSProperties } from 'react'

export function mediaRatioStyle(ratio: number): CSSProperties {
  return { '--post-image-ratio': ratio, '--media-end-gap': ratio < 1 ? '.75rem' : '0px' } as CSSProperties
}

export const mediaCoverClass = 'relative block overflow-hidden rounded-xl bg-[#F1EEE7] shadow-sm ring-1 ring-[#EAE7DF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355642]'

export const mediaDialogClass = 'fixed inset-0 m-auto max-h-[92dvh] w-[min(94vw,max(18rem,calc(var(--post-image-height)*var(--post-image-ratio)+var(--media-end-gap))))] max-w-none overflow-auto rounded-2xl bg-white text-[#24372C] shadow-xl [--post-image-height:min(56dvh,32rem)] backdrop:bg-black/65 md:w-[min(94vw,68rem,calc(18rem+max(10rem,var(--post-image-height)*var(--post-image-ratio))+var(--media-end-gap)))] md:[--post-image-height:min(68dvh,40rem)]'
export const mediaDialogHeaderClass = 'sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[#EAE7DF] bg-white px-4 py-2'
export const mediaDialogLayoutClass = 'grid min-w-0 pe-[var(--media-end-gap)] md:grid-cols-[18rem_minmax(0,1fr)]'
export const mediaDialogFrameClass = 'order-first w-[min(100%,max(8rem,calc(var(--post-image-height)*var(--post-image-ratio))))] min-w-0 self-start justify-self-center bg-[#F4F2ED] md:order-none md:w-full md:border-s md:border-[#EAE7DF]'
export const mediaDialogButtonClass = 'rounded-lg border border-[#D8D2C8] px-3 py-2 text-sm font-semibold hover:bg-[#F1EEE7] disabled:opacity-50'
export const mediaDialogCloseClass = 'grid size-10 place-items-center rounded-lg hover:bg-[#F1EEE7] disabled:opacity-50'
