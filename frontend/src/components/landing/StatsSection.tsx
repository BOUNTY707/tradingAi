import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react'

const stats = [
  { value: 94.2, suffix: '%',  label: 'Win Rate',           sub: '30 kunlik natija',   icon: TrendingUp,  color: '#00f5ff', bar: 94 },
  { value: 80,   suffix: '%+', label: 'Min AI Confidence',  sub: 'Faqat yuqori sifat', icon: Activity,    color: '#7c3aed', bar: 80 },
  { value: 12,   suffix: 'K+', label: 'Faol treyderlar',    sub: 'Dunyo bo\'ylab',     icon: Users,       color: '#4ade80', bar: 72 },
  { value: 2.4,  suffix: 'B$', label: 'Kuzatilgan hajm',    sub: "So'nggi 30 kunda",   icon: DollarSign,  color: '#fbbf24', bar: 88 },
]

function AnimNum({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 70, damping: 18 })
  const display = useTransform(spring, v =>
    (value % 1 !== 0 ? v.toFixed(1) : Math.floor(v).toString()) + suffix
  )
  useEffect(() => { if (inView) mv.set(value) }, [inView, value, mv])
  return <motion.span ref={ref}>{display}</motion.span>
}

/* Mini sparkline bar chart */
function Sparkline({ color, seed }: { color: string; seed: number }) {
  const bars = Array.from({ length: 14 }, (_, i) => {
    const h = 20 + Math.abs(Math.sin((i + seed) * 1.7) * 50 + Math.cos((i + seed) * 0.9) * 20)
    return Math.max(10, Math.min(80, h))
  })
  return (
    <div className="flex items-end gap-0.5 h-10">
      {bars.map((h, i) => (
        <motion.div key={i}
          initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.05 * i, duration: 0.4 }}
          style={{ height: `${h}%`, background: color, originY: 1, opacity: i === bars.length - 1 ? 1 : 0.35 + (i / bars.length) * 0.45 }}
          className="w-2 rounded-sm"
        />
      ))}
    </div>
  )
}

export default function StatsSection() {
  return (
    <section className="py-28 relative overflow-hidden">

      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[300px]"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,245,255,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-6">

        {/* Terminal header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg text-xs font-mono text-green-400"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            system.metrics — live
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            Raqamlar <span className="gradient-text">gapiradi</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 120 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-2xl p-6 overflow-hidden group"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              {/* Top accent line */}
              <motion.div
                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, originX: 0 }}
              />

              {/* Corner glow */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${s.color}18, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

              {/* Icon row */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                {/* Pulsing ring */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: s.color }}
                />
              </div>

              {/* Number */}
              <div className="text-3xl lg:text-4xl font-black mb-1 tabular-nums leading-none"
                style={{ color: s.color, filter: `drop-shadow(0 0 12px ${s.color}50)` }}>
                <AnimNum value={s.value} suffix={s.suffix} />
              </div>

              <div className="text-white/70 text-xs font-semibold mb-0.5">{s.label}</div>
              <div className="text-white/30 text-[10px] mb-4">{s.sub}</div>

              {/* Sparkline */}
              <Sparkline color={s.color} seed={i * 3 + 1} />

              {/* Progress bar */}
              <div className="mt-3 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }} whileInView={{ width: `${s.bar}%` }} viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${s.color}80, ${s.color})` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom ticker strip */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 rounded-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-4"
          style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.08)' }}>
          {[
            { label: 'Avg Signal/kun', val: '18–24' },
            { label: 'Avg RR Ratio',   val: '1:2.8' },
            { label: 'Draw-down',      val: '< 5%' },
            { label: 'Platforma',      val: '24/7' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-white/30 text-xs font-mono">{item.label}</span>
              <span className="text-cyan-400 text-xs font-bold font-mono">{item.val}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
