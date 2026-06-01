import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { TrendingUp, TrendingDown, Bell, Loader2, ChevronDown, Activity, Zap, BarChart3 } from 'lucide-react'
import SignalCard from '@/components/dashboard/SignalCard'
import WatchlistPanel from '@/components/dashboard/WatchlistPanel'
import TradingViewChart from '@/components/charts/TradingViewChart'
import AIChatPanel from '@/components/dashboard/AIChatPanel'
import Sidebar from '@/components/layout/Sidebar'
import PageBackground from '@/components/ui/PageBackground'
import { useMarketData } from '@/hooks/useMarketData'
import { useSignals } from '@/hooks/useSignals'

const TF_MAP: Record<string, string> = {
  '1M': '1', '5M': '5', '15M': '15', '1H': '60',
  '4H': '240', '1D': 'D', '1W': 'W',
}
const TF_VISIBLE = ['1M', '5M', '15M', '1H']
const TF_MORE    = ['4H', '1D', '1W']

const TICKER_MAP: Record<string, string> = {
  BTCUSDT: 'BTC', ETHUSDT: 'ETH', SOLUSDT: 'SOL', BNBUSDT: 'BNB', XRPUSDT: 'XRP',
}
const TV_TO_BINANCE: Record<string, string> = {
  'BINANCE:BTCUSDT': 'BTCUSDT', 'BINANCE:ETHUSDT': 'ETHUSDT',
  'BINANCE:SOLUSDT': 'SOLUSDT', 'BINANCE:BNBUSDT': 'BNBUSDT', 'BINANCE:XRPUSDT': 'XRPUSDT',
}

function formatPrice(price: string, symbol: string): string {
  const n = parseFloat(price)
  if (symbol.includes('BTC')) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n < 1)   return n.toFixed(4)
  if (n > 100) return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return n.toFixed(2)
}

const STAT_META = [
  { icon: Zap,      color: '#00f5ff' },
  { icon: Activity, color: '#4ade80' },
  { icon: BarChart3,color: '#7c3aed' },
  { icon: TrendingUp,color: '#fbbf24' },
]

export default function DashboardPage() {
  const [activeTab,   setActiveTab]   = useState<'all'|'crypto'|'forex'|'stocks'|'metals'>('all')
  const [tvSymbol,    setTvSymbol]    = useState('BINANCE:BTCUSDT')
  const [symbolLabel, setSymbolLabel] = useState('BTC/USDT')
  const [tf,          setTf]          = useState('4H')
  const [moreOpen,    setMoreOpen]    = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const { tickers, connected } = useMarketData()
  const { signals, stats, loading: signalsLoading, lastUpdated } = useSignals()
  const filteredSignals = activeTab === 'all' ? signals : signals.filter(s => s.market === activeTab)
  const binanceTicker = TV_TO_BINANCE[tvSymbol]
  const liveTicker    = binanceTicker ? tickers[binanceTicker] : null

  const handleSelectSymbol = (tv: string, label: string) => { setTvSymbol(tv); setSymbolLabel(label) }

  const statItems = [
    { label: 'Faol signallar',  value: signalsLoading ? '…' : stats.active.toString(),      color: '#00f5ff'  },
    { label: 'Avg Confidence',  value: signalsLoading ? '…' : `${stats.avgConfidence}%`,    color: '#4ade80'  },
    { label: 'Signallar (24s)', value: signalsLoading ? '…' : stats.total24h.toString(),    color: '#7c3aed'  },
    { label: 'Bozorlar',        value: '4',                                                  color: '#fbbf24'  },
  ]

  return (
    <div className="min-h-screen bg-[#020206] flex relative">
      <PageBackground />
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 relative" style={{ zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-black tracking-tight">Trading Dashboard</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono"
                style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.15)' }}>
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-cyan-400/80">{connected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
            <p className="text-white/35 text-sm font-mono">
              {lastUpdated
                ? `// yangilandi ${lastUpdated.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`
                : '// real vaqt AI signallar'}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative rounded-xl p-2.5 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Bell size={15} className="text-white/50" />
              {signals.length > 0 && (
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* ── Ticker strip ── */}
        {Object.keys(tickers).length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex gap-3 mb-7 overflow-x-auto pb-1">
            {Object.values(tickers).map((t, idx) => {
              const pos = parseFloat(t.priceChangePercent) >= 0
              const sel = TV_TO_BINANCE[tvSymbol] === t.symbol
              return (
                <motion.button key={t.symbol}
                  whileHover={{ y: -2, scale: 1.02 }}
                  onClick={() => handleSelectSymbol(`BINANCE:${t.symbol}`, `${TICKER_MAP[t.symbol] ?? t.symbol}/USDT`)}
                  className="relative rounded-2xl px-4 py-3 shrink-0 min-w-[130px] text-left overflow-hidden transition-all"
                  style={{
                    background: sel ? 'rgba(0,245,255,0.07)' : 'rgba(255,255,255,0.025)',
                    border: sel ? '1px solid rgba(0,245,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: sel ? '0 0 20px rgba(0,245,255,0.08)' : 'none',
                  }}>
                  {/* Top accent */}
                  {sel && (
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
                  )}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-white/60">{TICKER_MAP[t.symbol] || t.symbol}</span>
                    {pos
                      ? <TrendingUp size={10} className="text-green-400" />
                      : <TrendingDown size={10} className="text-red-400" />}
                  </div>
                  <div className="text-sm font-black text-white">${formatPrice(t.price, t.symbol)}</div>
                  <div className={`text-xs font-bold mt-0.5 px-1.5 py-0.5 rounded inline-block text-[10px] ${pos ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {pos ? '+' : ''}{t.priceChangePercent}%
                  </div>
                  {/* Invisible rank to prevent TS unused warning */}
                  <span className="sr-only">{idx}</span>
                </motion.button>
              )
            })}
          </motion.div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {statItems.map((stat, i) => {
            const Meta = STAT_META[i]
            return (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 150 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="relative rounded-2xl p-5 overflow-hidden group"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>

                {/* Top accent line */}
                <motion.div
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                  className="absolute top-0 left-0 right-0 h-[2px] origin-left"
                  style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
                />

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at 20% 50%, ${stat.color}10, transparent 70%)` }} />

                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/35 text-xs font-medium">{stat.label}</span>
                  <motion.div
                    animate={{ boxShadow: [`0 0 0px ${stat.color}00`, `0 0 10px ${stat.color}50`, `0 0 0px ${stat.color}00`] }}
                    transition={{ duration: 2.5 + i * 0.4, repeat: Infinity }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}25` }}>
                    <Meta.icon size={13} style={{ color: stat.color }} />
                  </motion.div>
                </div>
                <div className="text-2xl font-black" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                {/* Pulsing dot */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                  className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full"
                  style={{ background: stat.color }}
                />
              </motion.div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left: Chart + Signals ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Chart panel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>

              {/* Top gradient border */}
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.4), rgba(124,58,237,0.4), transparent)' }} />

              <div className="p-5">
                {/* Chart header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <h2 className="font-black text-base">{symbolLabel}</h2>
                    </div>
                    {liveTicker && (
                      <>
                        <span className="text-lg font-black text-white">
                          ${formatPrice(liveTicker.price, symbolLabel)}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          parseFloat(liveTicker.priceChangePercent) >= 0
                            ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                            : 'text-red-400 bg-red-500/10 border border-red-500/20'
                        }`}>
                          {parseFloat(liveTicker.priceChangePercent) >= 0 ? '+' : ''}
                          {liveTicker.priceChangePercent}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Timeframe */}
                  <div className="flex items-center gap-1">
                    {TF_VISIBLE.map(label => (
                      <button key={label} onClick={() => setTf(label)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
                        style={{
                          background: tf === label ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${tf === label ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          color:  tf === label ? '#00f5ff' : 'rgba(255,255,255,0.4)',
                        }}>
                        {label}
                      </button>
                    ))}
                    <div className="relative" ref={moreRef}>
                      <button onClick={() => setMoreOpen(o => !o)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
                        style={{
                          background: TF_MORE.includes(tf) ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${TF_MORE.includes(tf) ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          color:  TF_MORE.includes(tf) ? '#00f5ff' : 'rgba(255,255,255,0.4)',
                        }}>
                        {TF_MORE.includes(tf) ? tf : 'More'}
                        <ChevronDown size={11} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {moreOpen && (
                        <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-full mt-1.5 flex flex-col overflow-hidden rounded-xl z-30"
                          style={{ background: 'rgba(8,8,16,0.98)', border: '1px solid rgba(0,245,255,0.15)', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', minWidth: 80 }}>
                          {TF_MORE.map(label => (
                            <button key={label} onClick={() => { setTf(label); setMoreOpen(false) }}
                              className="px-4 py-2.5 text-xs font-medium text-left hover:bg-white/6 transition-colors"
                              style={{ color: tf === label ? '#00f5ff' : 'rgba(255,255,255,0.55)' }}>
                              {label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <TradingViewChart symbol={tvSymbol} interval={TF_MAP[tf]} height={380} />
              </div>
            </motion.div>

            {/* Signals panel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>

              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />

              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      animate={{ boxShadow: ['0 0 0px rgba(0,245,255,0)', '0 0 12px rgba(0,245,255,0.5)', '0 0 0px rgba(0,245,255,0)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full" />
                    <h2 className="font-bold">AI Signals</h2>
                    {!signalsLoading && signals.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/12 text-green-400 border border-green-500/20">
                        {signals.length} live
                      </span>
                    )}
                  </div>
                  <div className="flex gap-0.5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {(['all','crypto','forex','stocks','metals'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize"
                        style={{
                          background: activeTab === tab ? 'rgba(0,245,255,0.1)' : 'transparent',
                          color: activeTab === tab ? '#00f5ff' : 'rgba(255,255,255,0.35)',
                          border: activeTab === tab ? '1px solid rgba(0,245,255,0.25)' : '1px solid transparent',
                        }}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {signalsLoading ? (
                  <div className="flex items-center justify-center py-12 gap-3">
                    <Loader2 size={18} className="animate-spin text-cyan-400" />
                    <span className="text-sm text-white/30 font-mono">AI signallar yuklanmoqda...</span>
                  </div>
                ) : filteredSignals.length > 0 ? (
                  <div className="space-y-3">
                    {filteredSignals.map((s, i) => <SignalCard key={s.id} signal={s} index={i} />)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.12)' }}>
                      <Activity size={16} className="text-cyan-400/50" />
                    </div>
                    <p className="text-white/30 text-sm">Bu kategoriyada hozir signal yo'q</p>
                    <p className="text-white/20 text-xs mt-1 font-mono">// AI har 30 daqiqada yangi signal qidiradi</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Watchlist ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <WatchlistPanel selected={tvSymbol} onSelect={handleSelectSymbol} />
          </motion.div>
        </div>
      </main>

      <AIChatPanel />
    </div>
  )
}
