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
          borderRadius: 8,
          background: '#0a0a0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          {/* Left strand (S-curve) with gradient effect */}
          <path 
            d="M10 4 C10 9, 22 11, 22 16 C22 21, 10 23, 10 28" 
            stroke="#a78bfa" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            fill="none" 
          />
          {/* Right strand (mirrored S-curve) */}
          <path 
            d="M22 4 C22 9, 10 11, 10 16 C10 21, 22 23, 22 28" 
            stroke="#5eead4" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            fill="none" 
          />
          {/* Horizontal rungs */}
          <line x1="12" y1="8" x2="20" y2="8" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="14" y1="12.5" x2="18" y2="12.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="14" y1="19.5" x2="18" y2="19.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="12" y1="24" x2="20" y2="24" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {/* Nodes at intersections */}
          <circle cx="16" cy="10.5" r="2" fill="#a78bfa" />
          <circle cx="16" cy="16" r="2.5" fill="#5eead4" />
          <circle cx="16" cy="21.5" r="2" fill="#a78bfa" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
