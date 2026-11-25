import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const Icon = ({ children, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
)

export const HomeIcon = (props: IconProps) => <Icon {...props}><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></Icon>
export const ReelsIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><path d="m8 3 3.5 5M15 3l3.5 5M3 8h18M10 12.5l5 3-5 3z" /></Icon>
export const SearchIcon = (props: IconProps) => <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>
export const PlusIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M12 8v8M8 12h8" /></Icon>
export const BellIcon = (props: IconProps) => <Icon {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></Icon>
export const ChartIcon = (props: IconProps) => <Icon {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Icon>
export const WalletIcon = (props: IconProps) => <Icon {...props}><path d="M3 6h16a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2zM3 6V5a2 2 0 0 1 2-2h12v3M16 12h5" /><circle cx="16" cy="12" r=".5" fill="currentColor" /></Icon>
export const UserIcon = (props: IconProps) => <Icon {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>
export const MoreIcon = (props: IconProps) => <Icon {...props}><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></Icon>
export const HeartIcon = (props: IconProps) => <Icon {...props}><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6z" /></Icon>
export const CommentIcon = (props: IconProps) => <Icon {...props}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></Icon>
export const ShareIcon = (props: IconProps) => <Icon {...props}><path d="m22 2-7 20-4-9-9-4zM22 2 11 13" /></Icon>
export const Share2Icon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </Icon>
)
export const BookmarkIcon = (props: IconProps) => <Icon {...props}><path d="M6 3h12v18l-6-4-6 4z" /></Icon>
export const LogOutIcon = (props: IconProps) => <Icon {...props}><path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /></Icon>
export const PlayIcon = (props: IconProps) => <Icon {...props}><path d="m8 5 11 7-11 7z" /></Icon>
export const CheckIcon = (props: IconProps) => <Icon {...props}><path d="m5 12 4 4L19 6" /></Icon>
export const ChevronRight = (props: IconProps) => <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>
export const ArrowLeft = (props: IconProps) => <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>
export const MenuIcon = (props: IconProps) => <Icon {...props}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>
export const CloseIcon = (props: IconProps) => <Icon {...props}><path d="m18 6-12 12M6 6l12 12" /></Icon>
export const CameraIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </Icon>
)
export const GlobeIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Icon>
)
export const ExternalLinkIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </Icon>
)
export const FilmReelIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect width="20" height="16" x="2" y="4" rx="3" />
    <path d="m10 9 5 3-5 3v-6z" fill="currentColor" stroke="none" />
  </Icon>
)

export const BookmarkRibbonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Icon>
)

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
)

export function PlatformIcon({ platform, className = 'size-4' }: { platform: string; className?: string }) {
  switch (platform.toUpperCase()) {
    case 'INSTAGRAM':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      )
    case 'LINKEDIN':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect width="4" height="12" x="2" y="9"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      )
    case 'GITHUB':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
          <path d="M9 18c-4.51 2-5-2-7-2"/>
        </svg>
      )
    case 'TWITTER':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    case 'YOUTUBE':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
          <polygon points="10 15 15 12 10 9 10 15"/>
        </svg>
      )
    case 'FACEBOOK':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      )
    case 'THREADS':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.186 24c-3.535 0-6.24-1.12-8.04-3.332C2.42 18.528 1.6 15.545 1.6 11.968c0-3.649.865-6.657 2.571-8.941C5.922.683 8.694 0 12.38 0c3.784 0 6.6.723 8.368 2.148 1.767 1.425 2.766 3.42 2.97 5.929l-3.328.261c-.164-1.848-.823-3.23-1.974-4.148C17.265 3.272 15.176 2.8 12.38 2.8c-2.915 0-5.068.514-6.402 1.543-1.334 1.028-2.028 2.55-2.08 4.566v.059c.148-.063.351-.137.608-.22.443-.146 1.05-.27 1.821-.371.771-.101 1.631-.152 2.58-.152 1.956 0 3.65.26 5.083.78 1.433.52 2.559 1.282 3.378 2.285.819 1.003 1.229 2.235 1.229 3.696 0 1.547-.464 2.868-1.391 3.963-.928 1.096-2.228 1.644-3.9 1.644-1.284 0-2.316-.328-3.097-.984-.78-.656-1.171-1.528-1.171-2.615 0-.979.314-1.802.942-2.47.629-.668 1.517-1.077 2.664-1.227l2.846-.372c0-.52-.152-.942-.456-1.267-.305-.325-.769-.487-1.393-.487-.638 0-1.155.15-1.551.451-.396.301-.634.72-.714 1.258l-3.22-.321c.176-1.175.733-2.122 1.67-2.841.938-.718 2.221-1.077 3.85-1.077 1.54 0 2.784.385 3.731 1.155.947.77 1.45 1.825 1.509 3.165v4.54c0 .888.169 1.552.507 1.992.338.44.821.66 1.449.66.697 0 1.268-.261 1.713-.783.445-.522.668-1.26.668-2.215v-1.042c0-3.328-.853-5.962-2.558-7.902C18.683 4.148 16.038 3.1 12.38 3.1c-3.13 0-5.594.887-7.391 2.662C3.192 7.537 2.293 9.948 2.293 12.995c0 2.923.868 5.289 2.604 7.098 1.736 1.809 4.168 2.714 7.29 2.714 2.143 0 3.996-.445 5.56-1.336.568-.323 1.054-.731 1.458-1.223l2.25 2.152c-.672.784-1.488 1.433-2.448 1.947C17.067 23.633 14.862 24 12.186 24z"/>
        </svg>
      )
    default:
      return <GlobeIcon className={className} />
  }
}
