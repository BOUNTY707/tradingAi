import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, TrendingDown, Plus, BarChart3, Activity, DollarSign,
  X, Loader2, Trash2, CheckSquare, Search, RefreshCw,
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import PageBackground from '@/components/ui/PageBackground'
import { Button } from '@/components/ui/Button'
import { useMarketData } from '@/hooks/useMarketData'
import api from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────

interface Trade {
  id: string
  symbol: string
  direction: 'BUY' | 'SELL'
  entryPrice: number
  exitPrice: number | null
  size: number
  pnl: number | null
  pnlPercent: number | null
  status: 'OPEN' | 'CLOSED'
  openedAt: string
  closedAt: string | null
  notes: string | null
}

// map WebSocket ticker → symbol
const TICKER_TO_SYMBOL: Record<string, string> = {
  BTCUSDT: 'BTC/USDT', ETHUSDT: 'ETH/USDT', SOLUSDT: 'SOL/USDT',
  BNBUSDT: 'BNB/USDT', XRPUSDT: 'XRP/USDT',
}

const COMMON_SYMBOLS = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  'EUR/USD', 'GBP/USD', 'XAU/USD', 'AAPL', 'NVDA', 'TSLA',
]

// ─── Add Trade Modal ──────────────────────────────────────────────

function AddTradeModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [symbol,     setSymbol]     = useState('BTC/USDT')
  const [direction,  setDirection]  = useState<'BUY' | 'SELL'>('BUY')
  const [entryPrice, setEntryPrice] = useState('')
  const [size,       setSize]       = useState('')
  const [notes,      setNotes]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [showSugg,   setShowSugg]   = useState(false)

  const filtered = COMMON_SYMBOLS.filter(s =>
    s.toLowerCase().includes(symbol.toLowerCase())
  )

  const handleAdd = async () => {
    if (!symbol || !entryPrice || !size) { setError("Barcha maydonlarni to'ldiring"); return }
    setLoading(true); setError('')
    try {
      await api.post('/portfolio', { symbol, direction, entryPrice: +entryPrice, size: +size, notes })
      onSaved()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Xatolik yuz berdi')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10"
        style={{ background: 'linear-gradient(160deg,rgba(9,9,16,0.99),rgba(13,9,22,0.99))' }}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-white/7">
          <h3 className="font-bold text-base">Yangi trade qo'shish</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/8 border border-white/8">
            <X size={15} className="text-white/50" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Symbol */}
          <div className="relative">
            <label className="block text-xs text-white/40 mb-2">Symbol</label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
                onFocus={() => setShowSugg(true)} onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm border border-white/5 outline-none focus:border-cyan-500/40 uppercase" />
            </div>
            {showSugg && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl border border-white/8 overflow-hidden z-20 shadow-xl">
                {filtered.slice(0, 6).map(s => (
                  <button key={s} onMouseDown={() => { setSymbol(s); setShowSugg(false) }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/8 text-white/70 hover:text-white transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direction */}
          <div>
            <label className="block text-xs text-white/40 mb-2">Yo'nalish</label>
            <div className="grid grid-cols-2 gap-2">
              {(['BUY', 'SELL'] as const).map(d => (
                <button key={d} onClick={() => setDirection(d)}
                  className="py-2.5 rounded-xl text-sm font-bold transition-all border"
                  style={{
                    background: direction === d
                      ? d === 'BUY' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'
                      : 'rgba(255,255,255,0.03)',
                    borderColor: direction === d
                      ? d === 'BUY' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'
                      : 'rgba(255,255,255,0.07)',
                    color: direction === d
                      ? d === 'BUY' ? '#4ade80' : '#f87171'
                      : 'rgba(255,255,255,0.4)',
                  }}>
                  {d === 'BUY' ? '↑ BUY' : '↓ SELL'}
                </button>
              ))}
            </div>
          </div>

          {/* Entry + Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-2">Kirish narxi</label>
              <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)}
                placeholder="0.00" step="any"
                className="w-full glass rounded-xl px-4 py-2.5 text-sm border border-white/5 outline-none focus:border-cyan-500/40" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-2">Hajm (size)</label>
              <input type="number" value={size} onChange={e => setSize(e.target.value)}
                placeholder="0.00" step="any"
                className="w-full glass rounded-xl px-4 py-2.5 text-sm border border-white/5 outline-none focus:border-cyan-500/40" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-white/40 mb-2">Izoh (ixtiyoriy)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Signal asosida, SMC setup..."
              className="w-full glass rounded-xl px-4 py-2.5 text-sm border border-white/5 outline-none focus:border-cyan-500/40" />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5 border border-red-500/20">{error}</p>
          )}

          <Button onClick={handleAdd} loading={loading} size="lg" className="w-full !rounded-xl">
            <Plus size={16} /> Trade qo'shish
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Close Trade Modal ────────────────────────────────────────────

function CloseTradeModal({ trade, livePrice, onClose, onSaved }: {
  trade: Trade; livePrice?: number; onClose: () => void; onSaved: () => void
}) {
  const [exitPrice, setExitPrice] = useState(livePrice?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const exit = parseFloat(exitPrice) || 0
  const rawPnl = exit > 0
    ? trade.direction === 'BUY'
      ? (exit - trade.entryPrice) * trade.size
      : (trade.entryPrice - exit) * trade.size
    : 0
  const pnlPct = exit > 0 ? (rawPnl / (trade.entryPrice * trade.size)) * 100 : 0

  const handleClose = async () => {
    if (!exitPrice) { setError("Chiqish narxini kiriting"); return }
    setLoading(true); setError('')
    try {
      await api.patch(`/portfolio/${trade.id}`, { exitPrice: +exitPrice })
      onSaved()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Xatolik')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 p-6"
        style={{ background: 'linear-gradient(160deg,rgba(9,9,16,0.99),rgba(13,9,22,0.99))' }}>

        <h3 className="font-bold mb-1">{trade.symbol} trade yopish</h3>
        <p className="text-xs text-white/40 mb-5">Entry: ${trade.entryPrice.toLocaleString()} · {trade.direction} · {trade.size}</p>

        <label className="block text-xs text-white/40 mb-2">Chiqish narxi</label>
        <input type="number" value={exitPrice} onChange={e => setExitPrice(e.target.value)}
          placeholder={livePrice?.toString() || '0.00'} step="any"
          className="w-full glass rounded-xl px-4 py-3 text-sm border border-white/5 outline-none focus:border-cyan-500/40 mb-4" />

        {exit > 0 && (
          <div className="glass rounded-xl p-4 border border-white/5 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">P&L</span>
              <span className={rawPnl >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {rawPnl >= 0 ? '+' : ''}${rawPnl.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-white/40">P&L %</span>
              <span className={pnlPct >= 0 ? 'text-green-400' : 'text-red-400'}>
                {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 glass rounded-xl py-2.5 text-sm border border-white/8 hover:bg-white/8 transition-colors">
            Bekor
          </button>
          <Button onClick={handleClose} loading={loading} size="md" className="flex-1 !rounded-xl">
            <CheckSquare size={15} /> Yopish
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [trades,    setTrades]    = useState<Trade[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<'all' | 'open' | 'closed'>('all')
  const [showAdd,   setShowAdd]   = useState(false)
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null)
  const { tickers } = useMarketData()

  // symbol → live price map
  const livePrice = useCallback((symbol: string): number | undefined => {
    const ticker = Object.entries(TICKER_TO_SYMBOL).find(([, s]) => s === symbol)?.[0]
    return ticker ? parseFloat(tickers[ticker]?.price ?? '') || undefined : undefined
  }, [tickers])

  const fetchTrades = useCallback(async () => {
    try {
      const { data } = await api.get('/portfolio')
      setTrades(data.data ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu tradeni o\'chirasizmi?')) return
    await api.delete(`/portfolio/${id}`)
    setTrades(prev => prev.filter(t => t.id !== id))
  }

  // live P&L for OPEN trades
  const livePnl = (t: Trade): { pnl: number; pct: number } | null => {
    if (t.status !== 'OPEN') return null
    const price = livePrice(t.symbol)
    if (!price) return null
    const pnl = t.direction === 'BUY'
      ? (price - t.entryPrice) * t.size
      : (t.entryPrice - price) * t.size
    const pct = (pnl / (t.entryPrice * t.size)) * 100
    return { pnl, pct }
  }

  const filtered = filter === 'all' ? trades
    : trades.filter(t => filter === 'open' ? t.status === 'OPEN' : t.status === 'CLOSED')

  // stats
  const closedTrades = trades.filter(t => t.status === 'CLOSED')
  const openTrades   = trades.filter(t => t.status === 'OPEN')
  const totalPnl     = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const openPnlTotal = openTrades.reduce((s, t) => {
    const lp = livePnl(t)
    return s + (lp?.pnl ?? t.pnl ?? 0)
  }, 0)
  const winners  = closedTrades.filter(t => (t.pnl ?? 0) > 0).length
  const winRate  = closedTrades.length > 0 ? (winners / closedTrades.length) * 100 : 0

  return (
    <div className="min-h-screen bg-[#020206] flex relative">
      <PageBackground />
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Portfolio</h1>
            <p className="text-white/35 text-sm font-mono">// savdo tarixi va P&L kuzatuvi</p>
          </div>
          <div className="flex items-center gap-2.5">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={fetchTrades}
              className="rounded-xl p-2.5 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <RefreshCw size={15} className="text-white/40" />
            </motion.button>
            <Button onClick={() => setShowAdd(true)} size="md">
              <Plus size={14} /> Trade qo'shish
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        {(() => {
          const statItems = [
            { icon: DollarSign, label: 'Jami P&L',   value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`,        sub: `${closedTrades.length} yopilgan`, hex: totalPnl >= 0 ? '#4ade80' : '#f87171' },
            { icon: TrendingUp, label: 'Win Rate',    value: `${winRate.toFixed(1)}%`,                                     sub: `${winners} g'alaba`,              hex: '#00f5ff' },
            { icon: Activity,   label: 'Ochiq P&L',  value: `${openPnlTotal >= 0 ? '+' : ''}$${openPnlTotal.toFixed(2)}`, sub: `${openTrades.length} ochiq`,      hex: openPnlTotal >= 0 ? '#4ade80' : '#f87171' },
            { icon: BarChart3,  label: 'Jami Trade', value: trades.length.toString(),                                      sub: `${closedTrades.length} yopilgan`, hex: '#a78bfa' },
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
              <div className="text-2xl font-black mb-1" style={{ color: stat.hex }}>{stat.value}</div>
              <div className="text-xs text-white/30">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
          )
        })()}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(0,245,255,0.07)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <h2 className="font-bold">Savdo tarixi</h2>
            </div>
            <div className="flex gap-0.5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {(['all', 'open', 'closed'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize"
                  style={{
                    background: filter === f ? 'rgba(0,245,255,0.1)' : 'transparent',
                    color: filter === f ? '#00f5ff' : 'rgba(255,255,255,0.35)',
                    border: filter === f ? '1px solid rgba(0,245,255,0.25)' : '1px solid transparent',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-white/30">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Yuklanmoqda...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <BarChart3 size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">
                {trades.length === 0 ? 'Hali trade yo\'q. Birinchi tradeni qo\'shing!' : 'Bu filterlarda trade topilmadi.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Symbol', 'Dir.', 'Entry', 'Joriy / Exit', 'Size', 'P&L', 'P&L %', 'Status', 'Sana', ''].map(h => (
                      <th key={h} className="text-left text-xs text-white/30 font-medium px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((trade, i) => {
                    const lp        = livePnl(trade)
                    const live      = livePrice(trade.symbol)
                    const pnl       = trade.status === 'OPEN' ? lp?.pnl : trade.pnl
                    const pnlPct    = trade.status === 'OPEN' ? lp?.pct : trade.pnlPercent
                    const hasLive   = trade.status === 'OPEN' && live !== undefined

                    return (
                      <motion.tr key={trade.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-white/3 hover:bg-white/2 transition-colors group">

                        <td className="px-4 py-4">
                          <div className="font-medium text-sm">{trade.symbol}</div>
                          {trade.notes && <div className="text-xs text-white/25 mt-0.5 truncate max-w-[100px]">{trade.notes}</div>}
                        </td>

                        <td className="px-4 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 w-fit
                            ${trade.direction === 'BUY' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            {trade.direction === 'BUY' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {trade.direction}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-white/70">
                          ${trade.entryPrice.toLocaleString('en-US', { maximumFractionDigits: 5 })}
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {trade.status === 'OPEN' ? (
                            hasLive ? (
                              <span className="text-cyan-400 font-mono">
                                ${live!.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                                <span className="text-xs text-cyan-400/50 ml-1">live</span>
                              </span>
                            ) : <span className="text-white/30">—</span>
                          ) : (
                            <span className="text-white/70">
                              {trade.exitPrice ? `$${trade.exitPrice.toLocaleString('en-US', { maximumFractionDigits: 5 })}` : '—'}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm text-white/60">{trade.size}</td>

                        <td className="px-4 py-4">
                          <span className={`text-sm font-semibold ${pnl !== undefined && pnl !== null ? pnl >= 0 ? 'text-green-400' : 'text-red-400' : 'text-white/30'}`}>
                            {pnl !== undefined && pnl !== null ? `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}` : '—'}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`text-sm ${pnlPct !== undefined && pnlPct !== null ? pnlPct >= 0 ? 'text-green-400' : 'text-red-400' : 'text-white/30'}`}>
                            {pnlPct !== undefined && pnlPct !== null ? `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%` : '—'}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            trade.status === 'OPEN'
                              ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20'
                              : 'bg-white/5 text-white/40 border-white/10'
                          }`}>
                            {trade.status}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-xs text-white/30">
                          {new Date(trade.openedAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {trade.status === 'OPEN' && (
                              <button onClick={() => setClosingTrade(trade)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-500/15 hover:bg-green-500/25 border border-green-500/20 transition-colors">
                                <CheckSquare size={13} className="text-green-400" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(trade.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 transition-colors">
                              <Trash2 size={13} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAdd && (
          <AddTradeModal
            onClose={() => setShowAdd(false)}
            onSaved={() => { setShowAdd(false); fetchTrades() }}
          />
        )}
        {closingTrade && (
          <CloseTradeModal
            trade={closingTrade}
            livePrice={livePrice(closingTrade.symbol)}
            onClose={() => setClosingTrade(null)}
            onSaved={() => { setClosingTrade(null); fetchTrades() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
