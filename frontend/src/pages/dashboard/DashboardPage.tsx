import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { TrendingUp, TrendingDown, Bell, Loader2, ChevronDown } from 'lucide-react'
import SignalCard from '@/components/dashboard/SignalCard'
import WatchlistPanel from '@/components/dashboard/WatchlistPanel'
import TradingViewChart from '@/components/charts/TradingViewChart'
import AIChatPanel from '@/components/dashboard/AIChatPanel'
import Sidebar from '@/components/layout/Sidebar'
import { useMarketData } from '@/hooks/useMarketData'
import { useSignals } from '@/hooks/useSignals'

// Timeframe label → TradingView interval
const TF_MAP: Record<string, string> = {
  '1M': '1', '5M': '5', '15M': '15', '1H': '60',
  '4H': '240', '1D': 'D', '1W': 'W',
}
const TF_VISIBLE = ['1M', '5M', '15M', '1H']   // always shown as buttons
const TF_MORE    = ['4H', '1D', '1W']           // in dropdown

// Binance ticker → display label
const TICKER_MAP: Record<string, string> = {
  BTCUSDT: 'BTC', ETHUSDT: 'ETH', SOLUSDT: 'SOL', BNBUSDT: 'BNB', XRPUSDT: 'XRP',
}

// TV symbol → Binance ticker
const TV_TO_BINANCE: Record<string, string> = {
  'BINANCE:BTCUSDT': 'BTCUSDT',
  'BINANCE:ETHUSDT': 'ETHUSDT',
  'BINANCE:SOLUSDT': 'SOLUSDT',
  'BINANCE:BNBUSDT': 'BNBUSDT',
  'BINANCE:XRPUSDT': 'XRPUSDT',
}

function formatPrice(price: string, symbol: string): string {
  const n = parseFloat(price)
  if (symbol.includes('BTC')) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n < 1)  return n.toFixed(4)
  if (n > 100) return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return n.toFixed(2)
}

export default function DashboardPage() {
  const [activeTab,    setActiveTab]    = useState<'all'|'crypto'|'forex'|'stocks'|'metals'>('all')
  const [tvSymbol,     setTvSymbol]     = useState('BINANCE:BTCUSDT')
  const [symbolLabel,  setSymbolLabel]  = useState('BTC/USDT')
  const [tf,           setTf]           = useState('4H')
  const [moreOpen,     setMoreOpen]     = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { tickers, connected } = useMarketData()
  const { signals, stats, loading: signalsLoading, lastUpdated } = useSignals()

  const filteredSignals = activeTab === 'all'
    ? signals
    : signals.filter(s => s.market === activeTab)

  // Get live price for selected symbol (if crypto)
  const binanceTicker = TV_TO_BINANCE[tvSymbol]
  const liveTicker    = binanceTicker ? tickers[binanceTicker] : null

  const handleSelectSymbol = (tv: string, label: string) => {
    setTvSymbol(tv)
    setSymbolLabel(label)
  }

  return (
    <div className="min-h-screen bg-[#050508] flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Trading Dashboard</h1>
            <p className="text-white/40 text-sm mt-0.5">
              {lastUpdated
                ? `Yangilandi: ${lastUpdated.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`
                : 'Real vaqt AI signallar'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative glass rounded-xl p-2.5 hover:bg-white/8 transition-colors border border-white/5">
              <Bell size={16} className="text-white/60" />
              {signals.length > 0 && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              )}
            </button>
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs text-white/60">{connected ? 'Binance Live' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Live Ticker Strip */}
        {Object.keys(tickers).length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-6 overflow-x-auto pb-1">
            {Object.values(tickers).map(t => {
              const isPositive = parseFloat(t.priceChangePercent) >= 0
              const isSelected = TV_TO_BINANCE[tvSymbol] === t.symbol
              return (
                <button key={t.symbol}
                  onClick={() => handleSelectSymbol(`BINANCE:${t.symbol}`, `${TICKER_MAP[t.symbol] ?? t.symbol}/USDT`)}
                  className="glass rounded-xl px-4 py-2.5 border shrink-0 min-w-[130px] text-left transition-all hover:scale-105"
                  style={{
                    borderColor: isSelected ? 'rgba(0,245,255,0.35)' : 'rgba(255,255,255,0.06)',
                    background:  isSelected ? 'rgba(0,245,255,0.06)' : undefined,
                  }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white/70">{TICKER_MAP[t.symbol] || t.symbol}</span>
                    {isPositive ? <TrendingUp size={11} className="text-green-400" /> : <TrendingDown size={11} className="text-red-400" />}
                  </div>
                  <div className="text-sm font-bold mt-0.5">${formatPrice(t.price, t.symbol)}</div>
                  <div className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{t.priceChangePercent}%
                  </div>
                </button>
              )
            })}
          </motion.div>
        )}

        {/* Stats — real data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Faol signallar', value: signalsLoading ? '…' : stats.active.toString(),           color: 'text-cyan-400'   },
            { label: 'Avg Confidence', value: signalsLoading ? '…' : `${stats.avgConfidence}%`,         color: 'text-green-400'  },
            { label: 'Signallar (24s)', value: signalsLoading ? '…' : stats.total24h.toString(),        color: 'text-violet-400' },
            { label: 'Bozorlar',        value: '4',                                                      color: 'text-yellow-400' },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 border border-white/5">
              <div className="text-white/40 text-xs mb-2">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Chart + Signals */}
          <div className="lg:col-span-2 space-y-6">

            {/* TradingView Chart */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              {/* Chart header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-bold text-base">{symbolLabel}</h2>
                  {liveTicker && (
                    <>
                      <span className="text-lg font-black text-white">
                        ${formatPrice(liveTicker.price, symbolLabel)}
                      </span>
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${
                        parseFloat(liveTicker.priceChangePercent) >= 0
                          ? 'text-green-400 bg-green-500/10'
                          : 'text-red-400 bg-red-500/10'
                      }`}>
                        {parseFloat(liveTicker.priceChangePercent) >= 0 ? '+' : ''}
                        {liveTicker.priceChangePercent}%
                      </span>
                    </>
                  )}
                </div>
                {/* Timeframe selector */}
                <div className="flex items-center gap-1">
                  {/* Visible buttons */}
                  {TF_VISIBLE.map(label => (
                    <button key={label} onClick={() => setTf(label)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
                      style={{
                        background: tf === label ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.04)',
                        border:     `1px solid ${tf === label ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                        color:      tf === label ? '#00f5ff' : 'rgba(255,255,255,0.45)',
                      }}>
                      {label}
                    </button>
                  ))}

                  {/* More dropdown */}
                  <div className="relative" ref={moreRef}>
                    <button
                      onClick={() => setMoreOpen(o => !o)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
                      style={{
                        background: TF_MORE.includes(tf) ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.04)',
                        border:     `1px solid ${TF_MORE.includes(tf) ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                        color:      TF_MORE.includes(tf) ? '#00f5ff' : 'rgba(255,255,255,0.45)',
                      }}>
                      {TF_MORE.includes(tf) ? tf : 'More'}
                      <ChevronDown size={11} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1.5 flex flex-col overflow-hidden rounded-xl z-30"
                        style={{ background: 'rgba(10,10,18,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', minWidth: 80 }}>
                        {TF_MORE.map(label => (
                          <button key={label}
                            onClick={() => { setTf(label); setMoreOpen(false) }}
                            className="px-4 py-2.5 text-xs font-medium text-left transition-colors hover:bg-white/6"
                            style={{ color: tf === label ? '#00f5ff' : 'rgba(255,255,255,0.6)' }}>
                            {label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Real TradingView chart */}
              <TradingViewChart
                symbol={tvSymbol}
                interval={TF_MAP[tf]}
                height={380}
              />
            </div>

            {/* AI Signals */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">AI Signals</h2>
                  {!signalsLoading && signals.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                      {signals.length} live
                    </span>
                  )}
                </div>
                <div className="flex gap-1 p-1 glass rounded-xl border border-white/5">
                  {(['all','crypto','forex','stocks','metals'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize
                        ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {signalsLoading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-white/30">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">AI signallar yuklanmoqda...</span>
                </div>
              ) : filteredSignals.length > 0 ? (
                <div className="space-y-3">
                  {filteredSignals.map((s, i) => (
                    <SignalCard key={s.id} signal={s} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-white/30 text-sm">Bu kategoriyada hozir signal yo'q</p>
                  <p className="text-white/20 text-xs mt-1">AI har 30 daqiqada yangi signal qidiradi</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Watchlist */}
          <div>
            <WatchlistPanel
              selected={tvSymbol}
              onSelect={handleSelectSymbol}
            />
          </div>
        </div>
      </main>

      <AIChatPanel />
    </div>
  )
}
