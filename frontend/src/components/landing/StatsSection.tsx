import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

const stats = [
  { value: 94.2, suffix: '%',  label: 'Win Rate (30 kun)',    sub: 'Tasdiqlangan natija' },
  { value: 80,   suffix: '%+', label: 'Min AI Confidence',    sub: 'Faqat yuqori sifatli' },
  { value: 12,   suffix: 'K+', label: 'Faol treyderlar',      sub: 'Dunyo bo\'ylab' },
  { value: 2.4,  suffix: 'B$', label: 'Kuzatilgan hajm',      sub: 'So\'nggi 30 kunda' },
]

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, v => {
    if (value % 1 !== 0) return v.toFixed(1) + suffix
    return Math.floor(v).toString() + suffix
  })

  useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, value, mv])

  return <motion.span ref={ref}>{display}</motion.span>
}

export default function StatsSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-violet-500/3 to-transparent" />
      </div>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.04), rgba(124,58,237,0.04))', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Inner glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5 divide-y lg:divide-y-0">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 lg:p-10 text-center group">
                <div className="text-4xl lg:text-5xl font-black gradient-text mb-2 tabular-nums">
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-white/70 text-sm font-semibold mb-1">{s.label}</div>
                <div className="text-white/30 text-xs">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
