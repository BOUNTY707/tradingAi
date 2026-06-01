import { motion, AnimatePresence, useSpring } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp, Shield, Zap, Activity, Brain, ChevronRight } from 'lucide-react'
import MiniChart from '@/components/charts/MiniChart'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import PaymentGateModal from '@/components/payment/PaymentGateModal'
import LoginRequiredModal from '@/components/payment/LoginRequiredModal'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

interface LiveSignal {
  id: string; pair: string; direction: 'BUY' | 'SELL'
  confidence: number; market: string
}
interface Ticker {
  s: string; p: string; c: string; up: boolean
}

// Animated counter
function Counter({ to, duration = 2 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = to / (duration * 60)
    const id = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(id) } else setVal(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(id)
  }, [to, duration])
  return <>{val}</>
}

// Floating holographic badge
function HoloBadge({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      style={style}
      className="absolute z-20"
    >
      {children}
    </motion.div>
  )
}

export default function HeroSection() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([])
  const [activeCount, setActiveCount] = useState<number | null>(null)
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [lastUpdated, setLastUpdated] = useState('yuklanmoqda...')
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D tilt on card
  const rotX = useSpring(0, { stiffness: 150, damping: 20 })
  const rotY = useSpring(0, { stiffness: 150, damping: 20 })
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rotY.set(((e.clientX - cx) / rect.width) * 12)
    rotX.set(-((e.clientY - cy) / rect.height) * 8)
  }
  const handleMouseLeave = () => { rotX.set(0); rotY.set(0) }

  // Live signals
  useEffect(() => {
    const load = async () => {
      try {
        const [sigRes, statsRes] = await Promise.all([
          axios.get(`${API}/signals`),
          axios.get(`${API}/signals/stats`),
        ])
        const sigs: any[] = sigRes.data?.data ?? []
        setLiveSignals(sigs.slice(0, 3))
        setActiveCount(statsRes.data?.data?.active ?? sigs.length)
        setLastUpdated('hozir')
      } catch { setLastUpdated('—') }
    }
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  // Tickers
  useEffect(() => {
    const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
    const LABELS: Record<string, string> = { BTCUSDT: 'BTC', ETHUSDT: 'ETH', SOLUSDT: 'SOL', BNBUSDT: 'BNB', XRPUSDT: 'XRP' }
    const load = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(SYMBOLS)}`)
        const data: any[] = await res.json()
        setTickers(data.map(t => ({
          s: LABELS[t.symbol] ?? t.symbol,
          p: parseFloat(t.lastPrice) > 100
            ? `$${parseFloat(t.lastPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
            : `$${parseFloat(t.lastPrice).toFixed(4)}`,
          c: `${parseFloat(t.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(t.priceChangePercent).toFixed(2)}%`,
          up: parseFloat(t.priceChangePercent) >= 0,
        })))
      } catch {}
    }
    load()
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [])

  const handleCTA = (dest: string) => {
    if (!isAuthenticated) setShowLogin(true)
    else if (!user?.isApproved) setShowGate(true)
    else navigate(dest)
  }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-16">

      {/* ── Extra glow blobs on top of canvas ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-[15%] left-[10%] w-[700px] h-[700px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[5%] w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* ── Ticker strip ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="relative border-b border-white/[0.04] overflow-hidden"
        style={{ zIndex: 2, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
        {/* Scrolling ticker */}
        <div className="flex overflow-hidden py-2">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="flex gap-10 px-6 shrink-0"
          >
            {(tickers.length > 0 ? [...tickers, ...tickers, ...tickers, ...tickers] : [
              { s: 'BTC', p: '—', c: '—', up: true },
              { s: 'ETH', p: '—', c: '—', up: true },
              { s: 'SOL', p: '—', c: '—', up: true },
              { s: 'BNB', p: '—', c: '—', up: true },
              { s: 'XRP', p: '—', c: '—', up: true },
            ]).map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs font-bold text-white/40 tracking-widest">{t.s}</span>
                <span className="text-xs font-mono font-semibold text-white/80">{t.p}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  t.up ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>{t.c}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Main content ── */}
      <div className="relative flex-1 flex items-center" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 xl:gap-20 items-center w-full">

          {/* ── LEFT: Text ── */}
          <div>
            {/* Live badge */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.18)', boxShadow: '0 0 20px rgba(0,245,255,0.06)' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <span className="text-cyan-400">AI Real-time • 24/7 Monitoring</span>
                <ChevronRight size={12} className="text-cyan-400/60" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <h1 className="font-black leading-[1.05] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5rem)' }}>
                <span className="text-white">Savdoni</span>
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #00f5ff 0%, #7c3aed 50%, #00ff88 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(0,245,255,0.3))',
                }}>
                  Sun'iy Intellekt
                </span>
                <br />
                <span className="text-white">bilan boshqaring</span>
              </h1>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
              className="text-white/45 text-lg leading-relaxed mb-10 max-w-lg">
              Institutional darajadagi AI tahlil — smart money harakatlarini,
              likvidlik sweeplarini va yuqori ishonchli savdo signallarini
              <span className="text-cyan-400/70"> avtomatik aniqlaydi.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
              className="flex flex-wrap gap-3 mb-12">
              <button
                onClick={() => handleCTA('/register')}
                className="group relative px-7 py-3.5 rounded-2xl font-semibold text-sm text-white overflow-hidden transition-all"
                style={{ background: 'linear-gradient(135deg, #00f5ff, #7c3aed)', boxShadow: '0 0 30px rgba(0,245,255,0.25), 0 8px 32px rgba(0,0,0,0.4)' }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Boshlash <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #00d4e0, #6d28d9)' }} />
              </button>

              <button
                onClick={() => handleCTA('/dashboard')}
                className="group px-7 py-3.5 rounded-2xl font-semibold text-sm text-white/70 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Live signallar
                </span>
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 max-w-sm">
              {[
                { icon: Shield,   num: 94,   suffix: '%', label: 'Win Rate' },
                { icon: Brain,    num: 80,   suffix: '%+', label: 'Confidence' },
                { icon: Activity, num: 24,   suffix: '/7', label: 'Monitoring' },
              ].map(({ icon: Icon, num, suffix, label }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center p-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Icon size={14} className="text-cyan-400 mx-auto mb-1.5" />
                  <div className="text-xl font-black text-white">
                    <Counter to={num} duration={1.5} />{suffix}
                  </div>
                  <div className="text-[10px] text-white/30 mt-0.5">{label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: 3D Card Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className="relative"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: '1200px' }}
          >
            <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}>

              {/* Top-right floating badge */}
              <HoloBadge delay={0.7} style={{ top: -20, right: -12 }}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
                  style={{
                    background: 'rgba(0,10,20,0.85)',
                    border: '1px solid rgba(0,245,255,0.3)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 0 30px rgba(0,245,255,0.15), inset 0 1px 0 rgba(0,245,255,0.1)',
                  }}
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,245,255,0.1)' }}>
                    <TrendingUp size={13} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white">Smart Money</div>
                    <div className="text-[10px] text-cyan-400/70">Institutional Buy</div>
                  </div>
                </motion.div>
              </HoloBadge>

              {/* Bottom-left floating badge */}
              <HoloBadge delay={0.9} style={{ bottom: -16, left: -12 }}>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{
                    background: 'rgba(0,10,20,0.85)',
                    border: '1px solid rgba(74,222,128,0.2)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {activeCount !== null ? `${activeCount} faol signal` : '...'}
                  </span>
                </motion.div>
              </HoloBadge>

              {/* AI Badge top-left */}
              <HoloBadge delay={1.0} style={{ top: '35%', left: -20 }}>
                <motion.div
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                  style={{
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.35)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 0 20px rgba(124,58,237,0.15)',
                  }}
                >
                  <Brain size={12} className="text-violet-400" />
                  <span className="text-[10px] font-bold text-violet-300">AI Processing</span>
                </motion.div>
              </HoloBadge>

              {/* ── MAIN CARD ── */}
              <div className="rounded-3xl overflow-hidden relative"
                style={{
                  background: 'rgba(5,5,15,0.85)',
                  border: '1px solid rgba(0,245,255,0.12)',
                  backdropFilter: 'blur(40px)',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>

                {/* Scan line animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl" style={{ zIndex: 20 }}>
                  <motion.div
                    animate={{ y: ['-5%', '105%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                    className="absolute left-0 right-0 h-[60px]"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, rgba(0,245,255,0.025), transparent)',
                    }}
                  />
                </div>

                {/* Card header */}
                <div className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                      </span>
                      <span className="text-xs font-semibold text-white/70">Live AI Signals</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={10} className="text-cyan-400/50" />
                    <span className="text-[10px] text-white/25 font-mono">{lastUpdated}</span>
                  </div>
                </div>

                {/* Chart area */}
                <div className="px-4 pt-4 pb-2">
                  <MiniChart />
                </div>

                {/* Signals list */}
                <div className="p-4 space-y-2.5">
                  {liveSignals.length > 0 ? liveSignals.map((s, i) => {
                    const isBuy = s.direction === 'BUY'
                    const color = isBuy ? '#4ade80' : '#f87171'
                    const bgColor = isBuy ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)'
                    return (
                      <motion.div key={s.id}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="flex items-center justify-between p-3.5 rounded-2xl"
                        style={{ background: bgColor, border: `1px solid ${color}18` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-black"
                            style={{ background: isBuy ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', color }}>
                            {isBuy ? '↑' : '↓'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{s.pair}</div>
                            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>{s.direction}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-white/30 mb-1.5">Ishonch</div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <motion.div
                                initial={{ width: 0 }} animate={{ width: `${s.confidence}%` }}
                                transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${color}, rgba(0,245,255,0.8))` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-cyan-400">{s.confidence}%</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  }) : (
                    <div className="text-center py-6">
                      <div className="w-8 h-8 rounded-xl mx-auto mb-3 flex items-center justify-center"
                        style={{ background: 'rgba(0,245,255,0.08)' }}>
                        <Brain size={14} className="text-cyan-400 animate-pulse" />
                      </div>
                      <div className="text-xs text-white/25">AI signallar tayyorlanmoqda...</div>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {[Shield, Zap, Activity].map((Icon, i) => (
                      <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.1)' }}>
                        <Icon size={11} className="text-cyan-400/60" />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCTA('/signals')}
                    className="text-xs text-cyan-400/60 hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    Barchasini ko'rish <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ zIndex: 2,
        background: 'linear-gradient(to bottom, transparent, rgba(2,2,6,0.9))' }} />

      <AnimatePresence>
        {showLogin && <LoginRequiredModal onClose={() => setShowLogin(false)} />}
        {showGate  && <PaymentGateModal  onClose={() => setShowGate(false)}  />}
      </AnimatePresence>
    </section>
  )
}
