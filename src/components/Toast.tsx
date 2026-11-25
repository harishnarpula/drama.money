import { useEffect } from 'react'

type ToastProps = {
  message: string
  type?: 'error' | 'success' | 'info'
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'error', onClose, duration = 4500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  const icon = type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️'
  const accentBorder = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
        minWidth: '280px',
        padding: '12px 18px',
        borderRadius: '12px',
        background: '#1c2820',
        color: '#f4f1ea',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0,0,0,0.15)',
        borderLeft: `4px solid ${accentBorder}`,
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.01em',
        transition: 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span style={{ fontSize: '16px', lineHeight: 1 }}>{icon}</span>
      <span style={{ flex: 1, lineHeight: 1.45 }}>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9fbab6',
          cursor: 'pointer',
          padding: '4px',
          marginRight: '-4px',
          fontSize: '18px',
          lineHeight: 1,
          borderRadius: '6px',
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  )
}
