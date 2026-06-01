import { motion } from 'framer-motion'
import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Clock, Filter, RefreshCw, Loader2, Brain } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import PageBackground from '@/components/ui/PageBackground'
import { useSignals } from '@/hooks/useSignals'

const MARKET_TABS = ['all', 'crypto', 'forex', 'stocks', 'metals'] as const
type MarketTab = typeof MARKET_TABS[number]

export default function SignalsPage() {
  const [activeMarket, setActiveMarket] = useState<MarketTab>('all')
  const [activeSide,   setActiveSide]   = useState<'all' | 'buy' | 'sell'>('all')

  const { signals, stats, loading, error, lastUpdated, refresh } = useSignals()

  const filtered = signals.filter(s => {
    const mOk = activeMarket === 'all' || s.market === activeMarket
    const dOk = activeSide   === 'all' || s.direction.toLowerCase() === activeSide
    return mOk && dOk
  })

  return (
    <div className="min-h-screen bg-[#020206] flex relative">
      <PageBackground />
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-black tracking-tight">AI Signals</h1>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full" />
            </div>
            <p className="text-white/35 text-sm font-mono">
              {lastUpdated
                ? `// ${lastUpdated.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} yangilandi`
                : '// real vaqtda AI signallar'}
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={refresh} disabled={loading}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-400' : 'text-white/40'} />
            <span className="text-white/60">Yangilash</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        {(() => {
          const statItems = [
            { label: 'Faol signallar', value: loading ? '—' : stats.active.toString(),         icon: BarChart3,   hex: '#00f5ff'  },
            { label: 'BUY signallar',  value: loading ? '—' : signals.filter(s=>s.direction==='BUY').length.toString(), icon: TrendingUp, hex: '#4ade80' },
            { label: 'SELL signallar', value: loading ? '—' : signals.filter(s=>s.direction==='SELL').length.toString(), icon: TrendingDown, hex: '#f87171' },
            { label: 'Avg Confidence', value: loading ? '—' : `${stats.avgConfidence}%`,       icon: Brain,       hex: '#a78bfa'  },
          ]
          return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {statItems.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 150 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="relative rounded-2xl p-5 overflow-hidden group"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                className="absolute top-0 left-0 right-0 h-[2px] origin-left"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.hex}, transparent)` }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 20% 50%, ${stat.hex}10, transparent 70%)` }} />
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/35 text-xs">{stat.label}</span>
                <motion.div animate={{ boxShadow: [`0 0 0px ${stat.hex}00`, `0 0 10px ${stat.hex}50`, `0 0 0px ${stat.hex}00`] }}
                  transition={{ duration: 2.5 + i * 0.4, repeat: Infinity }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.hex}12`, border: `1px solid ${stat.hex}25` }}>
                  <stat.icon size={13} style={{ color: stat.hex }} />
                </motion.div>
              </div>
              <div className="text-2xl font-black" style={{ color: stat.hex }}>{stat.value}</div>
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full" style={{ background: stat.hex }} />
            </motion.div>
          ))}
        </div>
          )
        })()}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-7">
          <div className="flex gap-0.5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {MARKET_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveMarket(tab)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background: activeMarket === tab ? 'rgba(0,245,255,0.1)' : 'transparent',
                  color: activeMarket === tab ? '#00f5ff' : 'rgba(255,255,255,0.35)',
                  border: activeMarket === tab ? '1px solid rgba(0,245,255,0.25)' : '1px solid transparent',
                }}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-0.5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['all', 'buy', 'sell'] as const).map(s => (
              <button key={s} onClick={() => setActiveSide(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all uppercase"
                style={{
                  background: activeSide === s ? s === 'buy' ? 'rgba(74,222,128,0.12)' : s === 'sell' ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.08)' : 'transparent',
                  color: activeSide === s ? s === 'buy' ? '#4ade80' : s === 'sell' ? '#f87171' : '#fff' : 'rgba(255,255,255,0.35)',
                  border: activeSide === s ? `1px solid ${s === 'buy' ? 'rgba(74,222,128,0.3)' : s === 'sell' ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.2)'}` : '1px solid transparent',
                }}>
                {s}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-white/30 text-xs font-mono">
            <Filter size={11} />
            {filtered.length} signal
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-2xl p-16 border border-white/[0.07] text-center"
            style={{ background: 'rgba(255,255,255,0.025)' }}>
            <Loader2 size={32} className="text-cyan-400/50 mx-auto mb-3 animate-spin" />
            <p className="text-white/40 text-sm">AI signallar yuklanmoqda...</p>
            <p className="text-white/20 text-xs mt-1 font-mono">// Binance va Claude AI dan ma'lumot olinmoqda</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s, i) => {
              const isBuy = s.direction === 'BUY'
              const accentColor = isBuy ? '#4ade80' : '#f87171'
              return (
                <motion.div key={s.id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="relative rounded-2xl p-5 overflow-hidden group"
                  style={{
                    background: isBuy ? 'rgba(74,222,128,0.03)' : 'rgba(248,113,113,0.03)',
                    border: isBuy ? '1px solid rgba(74,222,128,0.15)' : '1px solid rgba(248,113,113,0.15)',
                  }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)` }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(circle at 30% 40%, ${accentColor}06, transparent 65%)` }} />
                  {/* Top */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${isBuy ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                        {isBuy
                          ? <TrendingUp size={18} className="text-green-400" />
                          : <TrendingDown size={18} className="text-red-400" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{s.pair}</div>
                        <div className="text-xs text-white/40 mt-0.5">{s.concept}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-cyan-500/15 text-cyan-400 border-cyan-500/20">
                        Live ●
                      </span>
                      <span className={`text-xs font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                        {s.direction}
                      </span>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/40">AI Confidence</span>
                      <span className="text-xs font-bold text-cyan-400">{s.confidence.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-600"
                        style={{ width: `${s.confidence}%` }} />
                    </div>
                  </div>

                  {/* Levels */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Entry',     value: s.entry,   color: 'text-white'   },
                      { label: 'Stop Loss', value: s.sl,      color: 'text-red-400' },
                      { label: 'TP1',       value: s.tp,      color: 'text-green-400' },
                    ].map(item => (
                      <div key={item.label} className="bg-white/3 rounded-lg p-2 text-center">
                        <div className="text-white/30 text-xs mb-0.5">{item.label}</div>
                        <div className={`text-xs font-medium ${item.color}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{s.timeframe}</span>
                      <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{s.type}</span>
                      <span className="text-xs text-cyan-400/60 bg-cyan-500/5 px-2 py-0.5 rounded-full">{s.riskReward}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/30 text-xs shrink-0">
                      <Clock size={11} />
                      {s.time}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl p-16 text-center"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.12)' }}>
              <Brain size={24} className="text-cyan-400/40" />
            </div>
            <p className="text-white/30 text-sm font-medium">Hozir signal topilmadi</p>
            <p className="text-white/20 text-xs mt-1.5 font-mono">
              // AI har 30 daqiqada BTC, ETH, SOL, EUR/USD va boshqalarni tahlil qiladi
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
