import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'

interface Signal {
  id: number | string
  pair: string
  direction: 'BUY' | 'SELL'
  confidence: number
  entry: string
  sl: string
  tp: string
  timeframe: string
  type: string
  concept: string
  time: string
}

export default function SignalCard({ signal: s, index }: { signal: Signal; index: number }) {
  const isBuy = s.direction === 'BUY'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isBuy ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
            {isBuy ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
          <div>
            <div className="font-semibold text-sm">{s.pair}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>{s.direction}</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/40">{s.concept}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40 mb-1">Confidence</div>
          <div className="text-sm font-bold text-cyan-400">{s.confidence}%</div>
          <div className="w-16 h-1 rounded-full bg-white/10 mt-1">
            <div className={`h-full rounded-full ${isBuy ? 'bg-green-400' : 'bg-red-400'}`} style={{ width: `${s.confidence}%` }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Entry', value: s.entry },
          { label: 'Stop Loss', value: s.sl },
          { label: 'Take Profit', value: s.tp },
        ].map(item => (
          <div key={item.label} className="bg-white/3 rounded-lg p-2 text-center">
            <div className="text-white/30 text-xs mb-0.5">{item.label}</div>
            <div className="text-xs font-medium">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{s.timeframe}</span>
          <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{s.type}</span>
        </div>
        <div className="flex items-center gap-1 text-white/30 text-xs">
          <Clock size={11} />
          {s.time}
        </div>
      </div>
    </motion.div>
  )
}
