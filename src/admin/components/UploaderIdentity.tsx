import type { ContentCreator } from '../../services/api'

export function UploaderIdentity({ creator }: { creator?: ContentCreator | null }) {
  const fullName = creator ? [creator.firstName, creator.lastName].filter(Boolean).join(' ').trim() : ''
  const identity = fullName || creator?.username || 'Unknown user'
  const initials = identity.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <section aria-label="Content uploader" className="flex min-w-0 items-center gap-2 border-b border-[#E2DED5] pb-2">
      <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#24372C] text-[10px] font-bold text-white ring-1 ring-white shadow-sm">
        {creator?.profileUrl ? <img src={creator.profileUrl} alt="" className="size-full object-cover" /> : initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold leading-tight text-[#1E2A23]">{identity}</p>
      </div>
    </section>
  )
}
