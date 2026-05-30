import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Azizbek Toshmatov',
    role: 'Crypto Treyder · Toshkent',
    text: 'TradeAI mening savdoimni tubdan o\'zgartirdi. Smart money aniqlash inanilmas darajada aniq — o\'tgan haftada 3 ta katta institutional harakatni ushladim.',
    rating: 5,
    avatar: 'AT',
    color: '#00f5ff',
    profit: '+47%',
  },
  {
    name: 'Dilnoza Yusupova',
    role: 'Forex Trader · Samarqand',
    text: 'AI ishonch filtri haqiqatan ham o\'yinni o\'zgartiradi. Faqat yuqori ehtimollik signallarini ko\'raman. Win rateim 52% dan 79% ga ko\'tarildi.',
    rating: 5,
    avatar: 'DY',
    color: '#7c3aed',
    profit: '+79%',
  },
  {
    name: 'Jasur Karimov',
    role: 'Swing Trader · Namangan',
    text: 'Order block va liquidity sweep alertlari men ko\'rgan eng yaxshisi. Boshqa hech qanday vosita bilan solishtirib bo\'lmaydi.',
    rating: 5,
    avatar: 'JK',
    color: '#4ade80',
    profit: '+91%',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="about" className="py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            <span className="gradient-text">12,000+</span> Treyder ishonadi
          </h2>
          <p className="text-white/40 text-lg">Real foydalanuvchilar, real natijalar</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="relative rounded-2xl p-7 group"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>

              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ background: `radial-gradient(circle at 20% 30%, ${t.color}10, transparent 70%)` }} />

              {/* Quote icon */}
              <Quote size={28} className="mb-5 opacity-20" style={{ color: t.color }} />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array(t.rating).fill(0).map((_, j) => (
                  <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-white/60 text-sm leading-relaxed mb-6">"{t.text}"</p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black"
                    style={{ background: `${t.color}18`, border: `1px solid ${t.color}30`, color: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">{t.name}</div>
                    <div className="text-white/35 text-xs">{t.role}</div>
                  </div>
                </div>
                <div className="text-sm font-black text-green-400">{t.profit}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
