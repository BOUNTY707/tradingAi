import { motion } from 'framer-motion'
import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Clock, Filter, RefreshCw, Loader2, Brain } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
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
    <div className="min-h-screen bg-[#050508] flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">AI Signals</h1>
            <p className="text-white/40 text-sm mt-0.5">
              {lastUpdated
                ? `Oxirgi yangilanish: ${lastUpdated.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`
                : 'Real vaqtda AI signallar'}
            </p>
          </div>
          <button onClick={refresh} disabled={loading}
            className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-sm font-medium border border-white/5 hover:bg-white/5 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-400' : 'text-white/50'} />
            Yangilash
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Faol signallar', value: loading ? '—' : stats.active.toString(),         icon: BarChart3,   color: 'text-white'    },
            { label: 'BUY signallar',  value: loading ? '—' : signals.filter(s=>s.direction==='BUY').length.toString(), icon: TrendingUp, color: 'text-green-400' },
            { label: 'SELL signallar', value: loading ? '—' : signals.filter(s=>s.direction==='SELL').length.toString(), icon: TrendingDown, color: 'text-red-400' },
            { label: 'Avg Confidence', value: loading ? '—' : `${stats.avgConfidence}%`,       icon: Brain,       color: 'text-cyan-400' },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs">{stat.label}</span>
                <stat.icon size={14} className={stat.color} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-1 p-1 glass rounded-xl border border-white/5">
            {MARKET_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveMarket(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize
                  ${activeMarket === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 glass rounded-xl border border-white/5">
            {(['all', 'buy', 'sell'] as const).map(s => (
              <button key={s} onClick={() => setActiveSide(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors uppercase
                  ${activeSide === s
                    ? s === 'buy'  ? 'bg-green-500/20 text-green-400'
                    : s === 'sell' ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/70'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1 text-white/30 text-xs">
            <Filter size={11} />
            {filtered.length} signal
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="glass rounded-2xl p-16 border border-white/5 text-center">
            <Loader2 size={32} className="text-cyan-400/50 mx-auto mb-3 animate-spin" />
            <p className="text-white/40 text-sm">AI signallar yuklanmoqda...</p>
            <p className="text-white/20 text-xs mt-1">Binance va Claude AI dan ma'lumot olinmoqda</p>
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-16 border border-red-500/20 text-center">
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s, i) => {
              const isBuy = s.direction === 'BUY'
              return (
                <motion.div key={s.id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`glass rounded-2xl p-5 border transition-all hover:border-white/10
                    ${isBuy ? 'border-green-500/15' : 'border-red-500/15'}`}>
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
          <div className="glass rounded-2xl p-16 border border-white/5 text-center">
            <Brain size={36} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm font-medium">Hozir signal topilmadi</p>
            <p className="text-white/20 text-xs mt-1.5">
              AI har 30 daqiqada BTC, ETH, SOL, EUR/USD va boshqalarni tahlil qiladi.<br />
              Bozor sharoiti yetarli bo'lganda signal avtomatik paydo bo'ladi.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
