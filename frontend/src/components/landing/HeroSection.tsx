import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ArrowRight, TrendingUp, Shield, Zap, Activity, Play } from 'lucide-react'
import MiniChart from '@/components/charts/MiniChart'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import PaymentGateModal from '@/components/payment/PaymentGateModal'
import LoginRequiredModal from '@/components/payment/LoginRequiredModal'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

interface LiveSignal {
  id: string
  pair: string
  direction: 'BUY' | 'SELL'
  confidence: number
  market: string
}

interface Ticker {
  s: string; p: string; c: string; up: boolean
}

export default function HeroSection() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [showLogin,    setShowLogin]    = useState(false)
  const [showGate,     setShowGate]     = useState(false)
  const [liveSignals,  setLiveSignals]  = useState<LiveSignal[]>([])
  const [activeCount,  setActiveCount]  = useState<number | null>(null)
  const [tickers,      setTickers]      = useState<Ticker[]>([])
  const [lastUpdated,  setLastUpdated]  = useState<string>('yuklanmoqda...')

  // Fetch real signals + stats
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
        setLastUpdated('az oldin')
      } catch {
        setLastUpdated('—')
      }
    }
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  // Fetch real Binance tickers
  useEffect(() => {
    const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
    const LABELS: Record<string, string> = {
      BTCUSDT: 'BTC', ETHUSDT: 'ETH', SOLUSDT: 'SOL', BNBUSDT: 'BNB', XRPUSDT: 'XRP',
    }
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
    if (!isAuthenticated) {
      setShowLogin(true)
    } else if (!user?.isApproved) {
      setShowGate(true)
    } else {
      navigate(dest)
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-16">

      {/* ── Animated BG ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan-500/3 to-violet-500/3 blur-[80px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,245,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── Live Ticker Strip ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="relative z-10 border-b border-white/4 overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}>
        <div className="flex gap-8 px-6 py-2 overflow-x-auto scrollbar-none">
          {(tickers.length > 0 ? [...tickers, ...tickers] : [
            { s: 'BTC', p: '...', c: '...', up: true },
            { s: 'ETH', p: '...', c: '...', up: true },
            { s: 'SOL', p: '...', c: '...', up: true },
          ]).map((t, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-white/50">{t.s}</span>
              <span className="text-xs font-mono text-white">{t.p}</span>
              <span className={`text-xs font-semibold ${t.up ? 'text-green-400' : 'text-red-400'}`}>{t.c}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center w-full">

          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-medium text-cyan-400"
                style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                AI Signallar • Real vaqtda yangilanadi
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl lg:text-[4.5rem] font-black leading-[1.08] tracking-tight mb-6">
              Savdoni{' '}
              <span className="gradient-text">Sun'iy Intellekt</span>{' '}
              bilan boshqaring
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-white/50 text-lg leading-relaxed mb-8 max-w-xl">
              Institutional darajadagi AI tahlil — smart money harakatlarini, likvidlik sweeplarini va yuqori ishonchli savdo signallarini avtomatik aniqlaydi.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 mb-12">
              <Button onClick={() => handleCTA('/register')} size="lg" className="!px-8 !rounded-2xl shadow-lg shadow-cyan-500/20">
                Bepul boshlash <ArrowRight size={16} />
              </Button>
              <Button onClick={() => handleCTA('/dashboard')} variant="secondary" size="lg" className="!px-8 !rounded-2xl gap-2">
                <Play size={14} className="text-cyan-400" /> Live signallar
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center gap-6 flex-wrap">
              {[
                { icon: Shield,   label: '94% Win Rate' },
                { icon: Zap,      label: '< 50ms Latency' },
                { icon: Activity, label: '80%+ Confidence' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/40 text-sm">
                  <Icon size={13} className="text-cyan-400" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Signal Panel */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            className="relative">

            {/* Floating badge top-right */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 -right-3 z-10 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)', backdropFilter: 'blur(12px)', boxShadow: '0 0 24px rgba(0,245,255,0.15)' }}>
              <TrendingUp size={13} className="text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">Smart Money</div>
                <div className="text-xs text-white/40">Institutional Buy</div>
              </div>
            </motion.div>

            {/* Floating badge bottom-left */}
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -left-3 z-10 flex items-center gap-2 px-3.5 py-2 rounded-2xl"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(12px)' }}>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-white">
                {activeCount !== null ? `${activeCount} faol signal` : '... faol signal'}
              </span>
            </motion.div>

            {/* Main card */}
            <div className="rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-white/80">Live AI Signals</span>
                </div>
                <span className="text-xs text-white/25">Yangilandi: {lastUpdated}</span>
              </div>

              {/* Chart */}
              <div className="px-4 pt-4">
                <MiniChart />
              </div>

              {/* Signals */}
              <div className="p-4 space-y-3">
                {liveSignals.length > 0 ? liveSignals.map((s, i) => {
                  const isBuy = s.direction === 'BUY'
                  const color = isBuy ? '#4ade80' : '#f87171'
                  return (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.12 }}
                      className="flex items-center justify-between p-3.5 rounded-2xl transition-colors"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                          style={{ background: isBuy ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', color }}>
                          {isBuy ? '↑' : '↓'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{s.pair}</div>
                          <div className="text-xs font-medium" style={{ color }}>{s.direction}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/40 mb-1">Ishonch</div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-600"
                              style={{ width: `${s.confidence}%` }} />
                          </div>
                          <span className="text-xs font-bold text-cyan-400">{s.confidence}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                }) : (
                  <div className="text-center py-4 text-white/25 text-xs">
                    AI signallar yuklanmoqda...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(5,5,8,0.8))' }} />

      <AnimatePresence>
        {showLogin && <LoginRequiredModal onClose={() => setShowLogin(false)} />}
        {showGate  && <PaymentGateModal  onClose={() => setShowGate(false)}  />}
      </AnimatePresence>
    </section>
  )
}
