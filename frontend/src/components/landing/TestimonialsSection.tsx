import { motion } from 'framer-motion'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'

const testimonials = [
  {
    name: 'Azizbek Toshmatov', role: 'Crypto Treyder · Toshkent',
    text: "TradeAI mening savdoimni tubdan o'zgartirdi. Smart money aniqlash inanilmas darajada aniq — o'tgan haftada 3 ta katta institutional harakatni ushladim.",
    rating: 5, avatar: 'AT', color: '#00f5ff', profit: '+47%', bull: true, trades: 34,
  },
  {
    name: 'Dilnoza Yusupova', role: 'Forex Trader · Samarqand',
    text: 'AI ishonch filtri haqiqatan ham o\'yinni o\'zgartiradi. Faqat yuqori ehtimollik signallarini ko\'raman. Win rateim 52% dan 79% ga ko\'tarildi.',
    rating: 5, avatar: 'DY', color: '#7c3aed', profit: '+79%', bull: true, trades: 61,
  },
  {
    name: 'Jasur Karimov', role: 'Swing Trader · Namangan',
    text: "Order block va liquidity sweep alertlari men ko'rgan eng yaxshisi. Boshqa hech qanday vosita bilan solishtirib bo'lmaydi.",
    rating: 5, avatar: 'JK', color: '#4ade80', profit: '+91%', bull: true, trades: 88,
  },
  {
    name: 'Shahlo Mirzayeva', role: 'Day Trader · Farg\'ona',
    text: "BTC va ETH signallari ajoyib aniqlikda keladi. Har kuni kamida 2-3 ta kuchli signal olaman. ROI ni ikki baravarga oshirdim.",
    rating: 5, avatar: 'SM', color: '#fbbf24', profit: '+112%', bull: true, trades: 120,
  },
  {
    name: 'Bobur Xasanov', role: 'Algo Trader · Toshkent',
    text: "SMC kontseptsiyalari asosida qurilgan signallar professional tizimga o'xshaydi. API integratsiyasi ham silliq ishlaydi.",
    rating: 5, avatar: 'BX', color: '#f472b6', profit: '+63%', bull: true, trades: 47,
  },
  {
    name: 'Nodira Kalandarova', role: 'Crypto Investor · Buxoro',
    text: "Boshlanuvchi sifatida bu platforma menga savdoni tushunishga juda yordam berdi. Har bir signal tushuntirilgan bo'ladi.",
    rating: 5, avatar: 'NK', color: '#fb923c', profit: '+38%', bull: true, trades: 22,
  },
]

/* Mini fake sparkline */
function MiniChart({ color }: { color: string; bull?: boolean }) {
  const pts = [30, 45, 38, 55, 48, 62, 55, 70, 65, 80, 72, 88]
    .map((v, i) => `${(i / 11) * 80 + 5},${90 - v * 0.7}`)
    .join(' ')
  return (
    <svg viewBox="0 0 90 50" className="w-20 h-8" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`5,90 ${pts} 85,90`} fill={color} fillOpacity="0.06" stroke="none" />
    </svg>
  )
}

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div
      className="relative rounded-2xl p-6 shrink-0 group overflow-hidden"
      style={{
        width: 320,
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: `radial-gradient(circle at 20% 30%, ${t.color}10, transparent 65%)` }} />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-0.5">
          {Array(t.rating).fill(0).map((_, i) => (
            <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black"
          style={{ background: t.bull ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: t.bull ? '#4ade80' : '#f87171' }}>
          {t.bull ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {t.profit}
        </div>
      </div>

      <p className="text-white/55 text-sm leading-relaxed mb-5">"{t.text}"</p>

      {/* Chart + trades */}
      <div className="flex items-center justify-between mb-4">
        <MiniChart color={t.color} bull={t.bull} />
        <div className="text-right">
          <div className="text-[10px] text-white/25">Savdolar</div>
          <div className="text-sm font-bold" style={{ color: t.color }}>{t.trades}</div>
        </div>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
          style={{ background: `${t.color}18`, border: `1px solid ${t.color}30`, color: t.color }}>
          {t.avatar}
        </div>
        <div>
          <div className="font-semibold text-sm text-white">{t.name}</div>
          <div className="text-white/30 text-xs">{t.role}</div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${t.color}35, transparent)` }} />
    </div>
  )
}

export default function TestimonialsSection() {
  const doubled = [...testimonials, ...testimonials]

  return (
    <section id="about" className="py-28 relative overflow-hidden">

      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />

      {/* Bg glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.05) 0%, transparent 60%)' }} />

      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold text-violet-400"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Star size={11} className="fill-violet-400" /> Real foydalanuvchilar
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            <span className="gradient-text">12,000+</span> Treyder ishonadi
          </h2>
          <p className="text-white/40 text-lg">Real foydalanuvchilar, real natijalar</p>
        </motion.div>
      </div>

      {/* Marquee row 1 — left */}
      <div className="relative mb-4 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(2,2,6,1), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, rgba(2,2,6,1), transparent)' }} />
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="flex gap-4 w-max"
        >
          {doubled.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </motion.div>
      </div>

      {/* Marquee row 2 — right (reverse) */}
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(2,2,6,1), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, rgba(2,2,6,1), transparent)' }} />
        <motion.div
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="flex gap-4 w-max"
        >
          {[...doubled].reverse().map((t, i) => <TestimonialCard key={i} t={t} />)}
        </motion.div>
      </div>
    </section>
  )
}
