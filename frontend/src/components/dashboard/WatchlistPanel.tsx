import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wifi, WifiOff, ChevronRight } from 'lucide-react'
import { useMarketData } from '@/hooks/useMarketData'

// Binance WebSocket symbols
const CRYPTO = [
  { label: 'BTC/USDT', binance: 'BTCUSDT', tv: 'BINANCE:BTCUSDT' },
  { label: 'ETH/USDT', binance: 'ETHUSDT', tv: 'BINANCE:ETHUSDT' },
  { label: 'SOL/USDT', binance: 'SOLUSDT', tv: 'BINANCE:SOLUSDT' },
  { label: 'BNB/USDT', binance: 'BNBUSDT', tv: 'BINANCE:BNBUSDT' },
  { label: 'XRP/USDT', binance: 'XRPUSDT', tv: 'BINANCE:XRPUSDT' },
]

// Forex / Metals / Stocks — static display, TradingView da real
const OTHER = [
  { label: 'EUR/USD', tv: 'FX:EURUSD',       tag: 'FX'     },
  { label: 'GBP/USD', tv: 'FX:GBPUSD',       tag: 'FX'     },
  { label: 'XAU/USD', tv: 'OANDA:XAUUSD',    tag: 'Metal'  },
  { label: 'AAPL',    tv: 'NASDAQ:AAPL',      tag: 'Stock'  },
  { label: 'NVDA',    tv: 'NASDAQ:NVDA',      tag: 'Stock'  },
]

function formatPrice(price: string, symbol: string): string {
  const n = parseFloat(price)
  if (symbol.includes('BTC'))  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n < 1)  return n.toFixed(4)
  if (n > 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return n.toFixed(2)
}

interface Props {
  selected?: string           // TV symbol currently shown in chart
  onSelect: (tv: string, label: string) => void
}

export default function WatchlistPanel({ selected, onSelect }: Props) {
  const { tickers, connected } = useMarketData()

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="font-semibold text-sm">Watchlist</h2>
        <div className="flex items-center gap-1.5">
          {connected
            ? <Wifi size={11} className="text-green-400" />
            : <WifiOff size={11} className="text-white/25" />}
          <span className={`text-[10px] font-semibold ${connected ? 'text-green-400' : 'text-white/25'}`}>
            {connected ? 'LIVE' : 'STATIC'}
          </span>
        </div>
      </div>

      {/* Crypto — live prices */}
      <div className="px-2 pt-2">
        <div className="px-3 py-1.5 text-[10px] text-white/25 uppercase tracking-widest font-semibold">
          Crypto — Binance Live
        </div>
        {CRYPTO.map((sym, i) => {
          const t    = tickers[sym.binance]
          const pct  = t ? parseFloat(t.priceChangePercent) : 0
          const isUp = pct >= 0
          const active = selected === sym.tv

          return (
            <motion.button
              key={sym.label}
              onClick={() => onSelect(sym.tv, sym.label)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all group text-left"
              style={{
                background: active ? 'rgba(0,245,255,0.08)' : 'transparent',
                border:     active ? '1px solid rgba(0,245,255,0.18)' : '1px solid transparent',
              }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t ? 'bg-green-400 animate-pulse' : 'bg-white/15'}`} />
                <span className={`text-sm font-medium truncate ${active ? 'text-white' : 'text-white/75 group-hover:text-white'}`}>
                  {sym.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className={`text-sm font-mono font-semibold ${active ? 'text-white' : 'text-white/80'}`}>
                    {t ? `$${formatPrice(t.price, sym.label)}` : '—'}
                  </div>
                  <div className={`text-xs flex items-center gap-0.5 justify-end ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {t ? `${isUp ? '+' : ''}${pct.toFixed(2)}%` : '—'}
                  </div>
                </div>
                <ChevronRight size={12} className={`transition-opacity ${active ? 'text-cyan-400 opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`} />
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="mx-4 my-1 h-px bg-white/5" />

      {/* Forex / Metals / Stocks */}
      <div className="px-2 pb-2">
        <div className="px-3 py-1.5 text-[10px] text-white/25 uppercase tracking-widest font-semibold">
          Forex · Metals · Stocks
        </div>
        {OTHER.map((item, i) => {
          const active = selected === item.tv
          return (
            <motion.button
              key={item.label}
              onClick={() => onSelect(item.tv, item.label)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (i + 5) * 0.04 }}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all group text-left"
              style={{
                background: active ? 'rgba(0,245,255,0.08)' : 'transparent',
                border:     active ? '1px solid rgba(0,245,255,0.18)' : '1px solid transparent',
              }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[9px] font-bold text-white/20 w-8 shrink-0">{item.tag}</span>
                <span className={`text-sm font-medium ${active ? 'text-white' : 'text-white/75 group-hover:text-white'}`}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-white/20">TradingView</span>
                <ChevronRight size={12} className={`transition-opacity ${active ? 'text-cyan-400 opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`} />
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
