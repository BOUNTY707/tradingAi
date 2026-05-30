import { motion } from 'framer-motion'
import { Brain, TrendingUp, Shield, Zap, BarChart3, Target } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Smart Money Detection',
    description: 'Institutional footprintlarni, order blocklarni va smart money entrylarni bozor harakatlanishidan oldin aniqlaydigan kengaytirilgan algoritmlar.',
    color: '#00f5ff',
    glow: 'rgba(0,245,255,0.15)',
    num: '01',
  },
  {
    icon: TrendingUp,
    title: 'Ko\'p bozor qamrovi',
    description: 'Crypto, Forex va Stocks — hammasi bir xil institutional darajadagi AI dvigatel bilan real vaqtda tahlil qilinadi.',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.15)',
    num: '02',
  },
  {
    icon: Shield,
    title: '80%+ Ishonch filtri',
    description: 'Faqat 80%+ AI ishonchi bilan signallar ko\'rsatiladi. Shovqin yo\'q, taxmin yo\'q — faqat yuqori ehtimollik setuplari.',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.15)',
    num: '03',
  },
  {
    icon: Zap,
    title: 'Real vaqt WebSocket',
    description: 'WebSocket orqali 50ms dan kam kechikish bilan signal yetkaziladi. Yuqori ishonchli entryni hech qachon o\'tkazib yubormaslik.',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.15)',
    num: '04',
  },
  {
    icon: BarChart3,
    title: 'Smart Money Concepts',
    description: 'BOS, CHOCH, Order Blocks, Liquidity Sweeps, Fair Value Gaps — barchasi avtomatik aniqlanadi.',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.15)',
    num: '05',
  },
  {
    icon: Target,
    title: 'Aniq kirish zonalari',
    description: 'Har bir signal uchun AI tomonidan hisoblangan aniq entry, stop loss va take profit darajalari.',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.15)',
    num: '06',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-xs font-medium text-violet-400"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Zap size={12} /> Enterprise AI imkoniyatlari
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-5 leading-tight">
            Institutional intellekt,<br />
            <span className="gradient-text">Retail imkoniyat</span>
          </h2>
          <p className="text-white/45 max-w-xl mx-auto text-lg">
            Hedge fondlar ishlatadigan analitik kuch endi har bir treyder uchun ochiq.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="relative rounded-2xl p-7 cursor-default group overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(10px)',
              }}>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 40%, ${f.glow}, transparent 60%)` }} />

              {/* Number */}
              <div className="absolute top-6 right-6 text-3xl font-black tabular-nums pointer-events-none select-none"
                style={{ color: f.color, opacity: 0.1 }}>
                {f.num}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 relative"
                style={{ background: `${f.glow}`, border: `1px solid ${f.color}25` }}>
                <f.icon size={22} style={{ color: f.color }} />
              </div>

              <h3 className="font-bold text-white mb-3 text-base leading-tight">{f.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{f.description}</p>

              {/* Bottom line */}
              <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${f.color}50, transparent)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
