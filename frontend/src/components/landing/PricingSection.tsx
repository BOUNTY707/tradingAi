import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useState, useRef } from 'react'
import { Check, Zap, Crown, Star } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import PaymentModal from '@/components/payment/PaymentModal'
import LoginRequiredModal from '@/components/payment/LoginRequiredModal'

const plans = [
  {
    name: '1 Oylik', price: '100 000', period: "so'm", usd: '~$8/oy',
    description: 'Boshlash uchun qulay', duration: '1 oy',
    features: ['Cheksiz AI signallar', 'Barcha bozorlar', 'Asosiy tahlil', 'Email qo\'llab-quvvatlash'],
    cta: 'Boshlash', popular: false, color: '#7c3aed', icon: Star,
  },
  {
    name: '3 Oylik', price: '250 000', period: "so'm", usd: '~$20 / 3 oy',
    description: "Ko'pchilik tanlovi", duration: '3 oy',
    features: ['Cheksiz signallar', 'Crypto + Forex + Stocks', 'Smart Money tahlili', 'AI chat assistant', 'Ustuvor qo\'llab-quvvatlash', 'Kengaytirilgan SMC'],
    cta: 'Pro olish', popular: true, color: '#00f5ff', icon: Zap,
  },
  {
    name: '12 Oylik', price: '999 000', period: "so'm", usd: '~$80 / yil',
    description: 'Maksimal tejamkorlik', duration: '12 oy',
    features: ['3 Oylikdagi hamma narsa', 'API kirish', 'Webhook signallar', 'Portfolio kuzatish', 'Maxsus AI strategiyalar', 'Shaxsiy menejger'],
    cta: 'Elite olish', popular: false, color: '#fbbf24', icon: Crown,
  },
]

function PriceCard({ plan, i, onBuy }: { plan: typeof plans[0]; i: number; onBuy: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const sRx = useSpring(rx, { stiffness: 180, damping: 20 })
  const sRy = useSpring(ry, { stiffness: 180, damping: 20 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - rect.left) / rect.width - 0.5) * 12)
    rx.set(-((e.clientY - rect.top) / rect.height - 0.5) * 8)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.12, type: 'spring', stiffness: 100 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: sRx, rotateY: sRy, transformStyle: 'preserve-3d', perspective: 900 }}
      className="relative pt-5 h-full"
    >
      {/* Popular badge — outside overflow-hidden card */}
      {plan.popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            animate={{ boxShadow: ['0 0 10px rgba(0,245,255,0.4)', '0 0 25px rgba(0,245,255,0.7)', '0 0 10px rgba(0,245,255,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap"
            style={{ background: 'linear-gradient(90deg, #00f5ff, #7c3aed)' }}
          >
            <Zap size={10} /> Tavsiya etiladi
          </motion.div>
        </div>
      )}

      <div
        ref={ref}
        className="relative rounded-3xl p-8 h-full overflow-hidden flex flex-col"
        style={{
          background: plan.popular
            ? `linear-gradient(135deg, rgba(0,245,255,0.06), rgba(124,58,237,0.06))`
            : 'rgba(255,255,255,0.025)',
          border: plan.popular
            ? `1px solid rgba(0,245,255,0.3)`
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: plan.popular
            ? `0 0 60px rgba(0,245,255,0.08), 0 20px 60px rgba(0,0,0,0.4)`
            : '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Popular: animated beam sweep */}
        {plan.popular && (
          <>
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-1/3 h-full pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.06), transparent)', zIndex: 0 }}
            />
            {/* Orbiting dots */}
            {[0, 1, 2, 3].map(j => (
              <motion.div key={j}
                animate={{ rotate: 360 }}
                transition={{ duration: 6 + j, repeat: Infinity, ease: 'linear' }}
                className="absolute pointer-events-none"
                style={{ inset: -20, zIndex: 0 }}
              >
                <div
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    top: '50%', left: j % 2 === 0 ? 0 : '100%',
                    transform: `translateY(${j * 25 - 38}px)`,
                    background: '#00f5ff',
                    opacity: 0.4,
                    boxShadow: '0 0 6px rgba(0,245,255,0.8)',
                  }}
                />
              </motion.div>
            ))}
          </>
        )}


        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}>
                  <plan.icon size={13} style={{ color: plan.color }} />
                </div>
                <h3 className="font-bold text-sm text-white/70">{plan.name}</h3>
              </div>
              <p className="text-white/30 text-xs">{plan.description}</p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1.5">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                className="text-4xl font-black"
                style={{ color: plan.popular ? '#fff' : 'rgba(255,255,255,0.85)' }}
              >
                {plan.price}
              </motion.span>
              <span className="text-white/30 text-sm">{plan.period}</span>
            </div>
            <div className="text-xs mt-1" style={{ color: `${plan.color}90` }}>{plan.usd}</div>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 mb-8 flex-1">
            {plan.features.map((f, j) => (
              <motion.li key={f}
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.4 + j * 0.06 }}
                className="flex items-center gap-2.5 text-sm text-white/60">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${plan.color}18` }}>
                  <Check size={10} style={{ color: plan.color }} />
                </div>
                {f}
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <motion.button
            onClick={onBuy}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all"
            style={plan.popular ? {
              background: 'linear-gradient(135deg, #00f5ff, #7c3aed)',
              boxShadow: '0 0 25px rgba(0,245,255,0.25)',
              color: '#fff',
            } : {
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${plan.color}30`,
              color: plan.color,
            }}
          >
            {plan.cta}
          </motion.button>
        </div>

        {/* Bottom corner accent */}
        <div className="absolute bottom-4 right-4 text-6xl font-black select-none pointer-events-none"
          style={{ color: plan.color, opacity: 0.04 }}>
          {i + 1}
        </div>
      </div>
    </motion.div>
  )
}

export default function PricingSection() {
  const { isAuthenticated } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  const handleBuy = (plan: typeof plans[0]) => {
    if (!isAuthenticated) setShowLogin(true)
    else setSelectedPlan(plan)
  }

  return (
    <>
    <section id="pricing" className="py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.12), rgba(124,58,237,0.12), transparent)' }} />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-semibold text-cyan-400"
            style={{ background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.18)' }}>
            <Zap size={11} /> Oddiy narxlash
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            Oddiy, <span className="gradient-text">Shaffof Narxlar</span>
          </h2>
          <p className="text-white/40 text-lg">Click, Payme, Uzum yoki Karta orqali to'lang.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <PriceCard key={plan.name} plan={plan} i={i} onBuy={() => handleBuy(plan)} />
          ))}
        </div>

        {/* Guarantee */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
            style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.12)' }}>
            <Check size={14} className="text-green-400" />
            <span className="text-sm text-white/50">Click · Payme · Uzum Bank · Karta · Istalgan vaqt bekor qilish</span>
          </div>
        </motion.div>
      </div>
    </section>

    <AnimatePresence>
      {showLogin    && <LoginRequiredModal onClose={() => setShowLogin(false)} />}
      {selectedPlan && <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </AnimatePresence>
    </>
  )
}
