interface Props {
  size?: number
  showText?: boolean
  textSize?: string
}

export default function TradeAILogo({ size = 38, showText = true, textSize = 'text-xl' }: Props) {
  const id = `logo_${size}`

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* ── Icon mark ── */}
      <svg
        width={size} height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* Background gradient */}
          <linearGradient id={`${id}_bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00c8e8" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>

          {/* Chart bar gradient */}
          <linearGradient id={`${id}_bar`} x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="1" />
            <stop offset="1" stopColor="white" stopOpacity="0.45" />
          </linearGradient>

          {/* Glow filter for AI node */}
          <filter id={`${id}_glow`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft glow for line */}
          <filter id={`${id}_lineglow`} x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rounded background */}
        <rect width="40" height="40" rx="11" fill={`url(#${id}_bg)`} />

        {/* Inner depth layer */}
        <rect width="40" height="40" rx="11" fill="black" fillOpacity="0.18" />

        {/* Subtle grid dots */}
        {[11, 20, 29].flatMap(x =>
          [11, 20, 29].map(y => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.65" fill="white" fillOpacity="0.1" />
          ))
        )}

        {/* ── 3 ascending chart bars ── */}
        <rect x="7"  y="27" width="5" height="7"  rx="1.5" fill={`url(#${id}_bar)`} fillOpacity="0.45" />
        <rect x="14" y="20" width="5" height="14" rx="1.5" fill={`url(#${id}_bar)`} fillOpacity="0.68" />
        <rect x="21" y="13" width="5" height="21" rx="1.5" fill={`url(#${id}_bar)`} fillOpacity="0.92" />

        {/* ── Trend line connecting bar tops ── */}
        <path
          d="M9.5 27 L16.5 20 L23.5 13"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          strokeOpacity="0.95"
          filter={`url(#${id}_lineglow)`}
        />

        {/* ── AI node (glowing dot at peak) ── */}
        <circle cx="23.5" cy="13" r="3.2" fill="white" filter={`url(#${id}_glow)`} />

        {/* ── Neural connections from peak ── */}
        <line x1="25.8" y1="10.8" x2="32.5" y2="7.5"
          stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.38" />
        <line x1="25.8" y1="15.2" x2="32.5" y2="18.5"
          stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.38" />

        {/* Neural endpoint dots */}
        <circle cx="32.5" cy="7.5"  r="1.8" fill="white" fillOpacity="0.45" />
        <circle cx="32.5" cy="18.5" r="1.8" fill="white" fillOpacity="0.45" />

        {/* Small dots on trend line */}
        <circle cx="9.5"  cy="27" r="1.4" fill="white" fillOpacity="0.6" />
        <circle cx="16.5" cy="20" r="1.4" fill="white" fillOpacity="0.7" />
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <span className={`font-black tracking-tight leading-none ${textSize}`}>
          <span className="text-white">Trade</span>
          <span style={{
            background: 'linear-gradient(90deg, #00f5ff, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            AI
          </span>
        </span>
      )}
    </div>
  )
}
