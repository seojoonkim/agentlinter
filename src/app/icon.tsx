import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <path d="M10 6 C10 10, 22 12, 22 16 C22 20, 10 22, 10 26" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M22 6 C22 10, 10 12, 10 16 C10 20, 22 22, 22 26" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
          <line x1="12" y1="9" x2="20" y2="9" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="14" y1="13" x2="18" y2="13" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="14" y1="19" x2="18" y2="19" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="12" y1="23" x2="20" y2="23" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="2.5" fill="#5eead4" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
