import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Terminal, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: 'AI signallar qanday hosil qilinadi?',
    a: 'Bizning AI bir vaqtda bir nechta vaqt oraliqlarida narx harakati, hajm, order flow va smart money kontseptsiyalarini tahlil qiladi. U institutional naqshlarni, likvidlik sweeplarini va BOS/CHOCH tuzilmalarini aniqlab, yuqori ishonchli signallar yaratadi.',
    tag: 'algorithm',
  },
  {
    q: "Qaysi bozorlar qo'llab-quvvatlanadi?",
    a: "Biz Cryptocurrency (100+ juftlik), Forex (asosiy, kichik va ekzotik juftliklar) va Aksiyalarni (AQSh va xalqaro) qamrab olamiz. Barcha bozorlar 24/7 tahlil qilinadi.",
    tag: 'markets',
  },
  {
    q: 'Nima uchun faqat 80%+ ishonch signallari?',
    a: "Pastroq ishonch signallari juda ko'p shovqin yaratadi va ortiqcha savdoga olib keladi. 80%+ ga filtrlab, faqat qat'iy sifat standartlarimizga mos keladigan yuqori ehtimollik signallarini ko'rasiz.",
    tag: 'quality',
  },
  {
    q: "Ro'yxatdan o'tgandan so'ng qancha vaqtda kirish olaman?",
    a: "To'lovni amalga oshirib, screenshot yuborarasiz — admin 1-2 soat ichida hisobingizni faollashtiradi. Faollashtirilgandan so'ng barcha imkoniyatlarga to'liq kirish huquqiga ega bo'lasiz.",
    tag: 'access',
  },
  {
    q: 'Mobil qurilmada ishlaydimi?',
    a: "Albatta. TradeAI to'liq moslashuvchan va barcha qurilmalarda ishlaydi. Signallarni hech qachon o'tkazib yubormasligingiz uchun mobil push bildirishnomalarini ham taklif etamiz.",
    tag: 'mobile',
  },
  {
    q: "To'lov qanday amalga oshiriladi?",
    a: "O'zbekistondagi barcha mashhur to'lov tizimlari orqali to'lash mumkin: Click, Payme, Uzum Bank va bank kartasi. To'lovni tasdiqlash uchun screenshot yuklashingiz kifoya — 1-2 soat ichida hisobingiz faollashtiriladi.",
    tag: 'payment',
  },
]

const TAG_COLORS: Record<string, string> = {
  algorithm: '#00f5ff', markets: '#7c3aed', quality: '#4ade80',
  access: '#fbbf24', mobile: '#f472b6', payment: '#fb923c',
}

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-28 relative">

      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.1), transparent)' }} />

      {/* BG glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(0,245,255,0.03) 0%, transparent 60%)' }} />

      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-400"
            style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.15)' }}>
            <Terminal size={11} /> faq.md — docs
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            Ko'p so'raladigan <span className="gradient-text">savollar</span>
          </h2>
          <p className="text-white/35 font-mono text-sm">// Javob topolmadingizmi? Biz bilan bog'laning.</p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            const color = TAG_COLORS[faq.tag] ?? '#00f5ff'
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 150 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: isOpen ? `rgba(${hexToRgb(color)},0.04)` : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isOpen ? `${color}28` : 'rgba(255,255,255,0.07)'}`,
                  transition: 'background 0.3s, border-color 0.3s',
                }}
              >
                {/* Top accent line when open */}
                <motion.div
                  animate={{ scaleX: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-px origin-left"
                  style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                />

                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start justify-between px-6 py-5 text-left gap-4 group"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Tag badge */}
                    <div className="mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono shrink-0 uppercase tracking-wider"
                      style={{ background: `${color}14`, color, border: `1px solid ${color}25` }}>
                      {faq.tag}
                    </div>
                    <span className={`text-sm font-semibold leading-snug transition-colors duration-200 ${isOpen ? 'text-white' : 'text-white/65 group-hover:text-white/90'}`}>
                      {faq.q}
                    </span>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mt-0.5"
                    style={{
                      background: isOpen ? `${color}18` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isOpen ? `${color}30` : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <ChevronDown size={13} style={{ color: isOpen ? color : 'rgba(255,255,255,0.35)' }} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 flex gap-3">
                        <div className="w-px shrink-0 mt-1 rounded-full"
                          style={{ background: `linear-gradient(to bottom, ${color}50, transparent)`, minHeight: 40 }} />
                        <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-white/35 text-sm">
            <HelpCircle size={14} className="text-cyan-400/50" />
            Boshqa savollar uchun{' '}
            <a href="mailto:support@tradeai.uz" className="text-cyan-400/70 hover:text-cyan-400 transition-colors underline underline-offset-2">
              support@tradeai.uz
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r},${g},${b}`
}
