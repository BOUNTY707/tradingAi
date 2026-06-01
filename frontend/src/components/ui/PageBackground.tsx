export default function PageBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none select-none" style={{ zIndex: 0 }}>
      {/* Subtle perspective grid */}
      <div className="absolute inset-0" style={{
        backgroundImage:
          'linear-gradient(rgba(0,245,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.022) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      {/* Corner vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.04) 0%, transparent 55%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 100% 100%, rgba(124,58,237,0.05) 0%, transparent 50%)',
      }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48" style={{
        background: 'linear-gradient(to top, rgba(2,2,6,0.6), transparent)',
      }} />
    </div>
  )
}
