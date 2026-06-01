import { motion } from 'framer-motion'
import { Brain, TrendingUp, Shield, Zap, BarChart3, Target } from 'lucide-react'
import { useRef } from 'react'

const features = [
  { icon: Brain,     title: 'AI Smart Money Detection',  description: 'Institutional footprintlarni, order blocklarni va smart money entrylarni bozor harakatlanishidan oldin aniqlaydigan kengaytirilgan algoritmlar.', color: '#00f5ff', glow: 'rgba(0,245,255,0.12)',    num: '01' },
  { icon: TrendingUp,title: "Ko'p bozor qamrovi",        description: "Crypto, Forex va Stocks — hammasi bir xil institutional darajadagi AI dvigatel bilan real vaqtda tahlil qilinadi.",                              color: '#7c3aed', glow: 'rgba(124,58,237,0.12)', num: '02' },
  { icon: Shield,    title: '80%+ Ishonch filtri',       description: 'Faqat 80%+ AI ishonchi bilan signallar ko\'rsatiladi. Shovqin yo\'q, taxmin yo\'q — faqat yuqori ehtimollik setuplari.',                          color: '#4ade80', glow: 'rgba(74,222,128,0.12)',  num: '03' },
  { icon: Zap,       title: 'Real vaqt WebSocket',       description: "WebSocket orqali 50ms dan kam kechikish bilan signal yetkaziladi. Yuqori ishonchli entryni hech qachon o'tkazib yubormaslik.",                   color: '#fbbf24', glow: 'rgba(251,191,36,0.12)', num: '04' },
  { icon: BarChart3, title: 'Smart Money Concepts',      description: 'BOS, CHOCH, Order Blocks, Liquidity Sweeps, Fair Value Gaps — barchasi avtomatik aniqlanadi.',                                                     color: '#f472b6', glow: 'rgba(244,114,182,0.12)',num: '05' },
  { icon: Target,    title: 'Aniq kirish zonalari',      description: 'Har bir signal uchun AI tomonidan hisoblangan aniq entry, stop loss va take profit darajalari.',                                                   color: '#fb923c', glow: 'rgba(251,146,60,0.12)', num: '06' },
]


export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative">

      {/* Section separator top */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.15), rgba(124,58,237,0.15), transparent)' }} />

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold text-violet-400"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Zap size={11} /> Enterprise AI imkoniyatlari
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-5 leading-tight">
            Institutional intellekt,<br />
            <span className="gradient-text">Retail imkoniyat</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto text-lg">
            Hedge fondlar ishlatadigan analitik kuch endi har bir treyder uchun ochiq.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, type: 'spring', stiffness: 120 }}
              className="group relative rounded-2xl p-7 cursor-default overflow-hidden"
              whileHover={{ scale: 1.01 }}
              style={{ perspective: 800 }}
            >
              {/* TiltCard inlined for simpler ref management */}
              <InnerTiltCard f={f} i={i} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section separator bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.12), transparent)' }} />
    </section>
  )
}

function InnerTiltCard({ f, i }: { f: typeof features[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 14}deg)`
    el.style.transition = 'transform 0.08s ease'
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)'
    el.style.transition = 'transform 0.5s ease'
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className="relative rounded-2xl p-7 h-full overflow-hidden group"
      style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Hover radial glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: `radial-gradient(circle at 35% 45%, ${f.glow}, transparent 65%)` }} />

      {/* Grid overlay on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${f.color}07 1px, transparent 1px), linear-gradient(90deg, ${f.color}07 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
        }} />

      {/* Corner marks */}
      <div className="absolute top-3 left-3 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 border-t border-l" style={{ borderColor: `${f.color}55` }} />
      <div className="absolute top-3 right-3 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 border-t border-r" style={{ borderColor: `${f.color}55` }} />
      <div className="absolute bottom-3 left-3 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 border-b border-l" style={{ borderColor: `${f.color}55` }} />
      <div className="absolute bottom-3 right-3 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 border-b border-r" style={{ borderColor: `${f.color}55` }} />

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${f.color}55, transparent)` }} />

      {/* Big number bg */}
      <div className="absolute top-5 right-6 text-6xl font-black select-none pointer-events-none"
        style={{ color: f.color, opacity: 0.06 }}>{f.num}</div>

      {/* Icon with pulse glow */}
      <motion.div
        animate={{ boxShadow: [`0 0 0px ${f.color}00`, `0 0 20px ${f.color}40`, `0 0 0px ${f.color}00`] }}
        transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 relative z-10"
        style={{ background: f.glow, border: `1px solid ${f.color}28` }}>
        <f.icon size={22} style={{ color: f.color }} />
      </motion.div>

      <h3 className="font-bold text-white mb-3 text-base leading-snug relative z-10">{f.title}</h3>
      <p className="text-white/40 text-sm leading-relaxed relative z-10">{f.description}</p>
    </div>
  )
}
