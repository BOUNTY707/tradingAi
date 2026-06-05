import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useState, useRef } from 'react'
import { Check, Zap, Shield, Star, Crown, Activity, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuthStore } from '@/store/authStore'
import LoginRequiredModal from '@/components/payment/LoginRequiredModal'
import PaymentModal from '@/components/payment/PaymentModal'
import TradingBackground from '@/components/landing/TradingBackground'
import clickIcon from '@/assets/click-icon.png'
import paymeIcon from '@/assets/payme-icon.png'
import uzumIcon  from '@/assets/uzum-bank.png'

// ── Payment method logos (for the display row only) ────────────────
function ImgLogo({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} width={52} height={52} className="rounded-[14px] object-cover" style={{ width: 52, height: 52 }} />
}
function BankCardLogo() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="14" fill="url(#card_bg_disp)"/>
      <rect x="8" y="16" width="36" height="22" rx="4" fill="white" fillOpacity="0.12"/>
      <rect x="8" y="16" width="36" height="8" rx="4" fill="white" fillOpacity="0.22"/>
      <rect x="12" y="28" width="9" height="6.5" rx="2" fill="#FFD166"/>
      <circle cx="36" cy="22" r="3.5" fill="#FF5F00" fillOpacity="0.9"/>
      <circle cx="40" cy="22" r="3.5" fill="#FFB300" fillOpacity="0.9"/>
      <ellipse cx="38" cy="22" rx="1.5" ry="3.5" fill="#FF8000" fillOpacity="0.9"/>
      <defs>
        <linearGradient id="card_bg_disp" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D28D9"/><stop offset="1" stopColor="#3B0764"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Data ───────────────────────────────────────────────────────────
const plans = [
  { name: '1 Oylik',  price: '250 000', period: "so'm / oy",   usd: '~$20', savings: null,         popular: false, description: 'Boshlash uchun qulay', duration: '1 oy',  amount: 250000, icon: Star,  color: '#7c3aed', cta: 'Boshlash'   },
  { name: '2 Oylik',  price: '399 000', period: "so'm / 2 oy", usd: '~$31', savings: 'Tejash 20%', popular: true,  description: "Ko'pchilik tanlovi",   duration: '2 oy',  amount: 399000, icon: Zap,   color: '#00f5ff', cta: 'Pro olish'  },
  { name: '12 Oylik', price: '2 777 000', period: "so'm / yil",  usd: '~$218', savings: 'Tejash 8%', popular: false, description: 'Maksimal tejamkorlik', duration: '12 oy', amount: 2777000, icon: Crown, color: '#fbbf24', cta: 'Elite olish'},
]

const features = [
  'Cheksiz AI signallar',                'Smart Money Concepts tahlili',      'Barcha bozorlar (Crypto · Forex · Metals)',
  'Real vaqt WebSocket signallar',       'AI trading assistant (chat)',        'Kengaytirilgan SMC + Price Action',
  'Grafik tahlili (rasm yuklash)',       'Portfolio kuzatish va monitoring',   'Webhook & API kirish (12 oylik)',
  "Ustuvor qo'llab-quvvatlash 24/7",    'Risk menejment vositalari',          'VIP Telegram va shaxsiy menejmer',
]

const DISPLAY_METHODS = [
  { id: 'click', name: 'Click',      glow: '#0068FF', Logo: () => <ImgLogo src={clickIcon} alt="Click" /> },
  { id: 'payme', name: 'Payme',      glow: '#00D162', Logo: () => <ImgLogo src={paymeIcon} alt="Payme" /> },
  { id: 'uzum',  name: 'Uzum Bank',  glow: '#FF7A29', Logo: () => <ImgLogo src={uzumIcon}  alt="Uzum"  /> },
  { id: 'card',  name: 'Bank Karta', glow: '#6D28D9', Logo: BankCardLogo },
]

// ── 3D tilt plan card ──────────────────────────────────────────────
function PlanCard({ plan, i, onBuy }: { plan: typeof plans[0]; i: number; onBuy: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0); const ry = useMotionValue(0)
  const sRx = useSpring(rx, { stiffness: 180, damping: 22 })
  const sRy = useSpring(ry, { stiffness: 180, damping: 22 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - rect.left) / rect.width  - 0.5) * 14)
    rx.set(-((e.clientY - rect.top)  / rect.height - 0.5) * 10)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: i * 0.12, type: 'spring', stiffness: 100 }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX: sRx, rotateY: sRy, transformStyle: 'preserve-3d', perspective: 900 }}
      className="relative pt-5 h-full"
    >
      {/* Popular badge — outside overflow-hidden */}
      {plan.popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            animate={{ boxShadow: ['0 0 10px rgba(0,245,255,0.4)', '0 0 28px rgba(0,245,255,0.75)', '0 0 10px rgba(0,245,255,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap"
            style={{ background: 'linear-gradient(90deg,#00f5ff,#7c3aed)' }}
          >
            <Zap size={10} /> Tavsiya etiladi
          </motion.div>
        </div>
      )}

      <div ref={ref} className="relative rounded-3xl p-8 overflow-hidden h-full flex flex-col"
        style={{
          background: plan.popular
            ? 'linear-gradient(135deg,rgba(0,245,255,0.06),rgba(124,58,237,0.06))'
            : 'rgba(255,255,255,0.025)',
          border: plan.popular ? '1px solid rgba(0,245,255,0.28)' : '1px solid rgba(255,255,255,0.06)',
          boxShadow: plan.popular
            ? '0 0 60px rgba(0,245,255,0.08),0 24px 60px rgba(0,0,0,0.45)'
            : '0 8px 32px rgba(0,0,0,0.3)',
        }}>

        {/* Beam sweep (popular only) */}
        {plan.popular && (
          <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-1/3 h-full pointer-events-none"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(0,245,255,0.06),transparent)', zIndex: 0 }} />
        )}

        {/* Top accent line */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.4 + i * 0.12, duration: 0.7 }}
          className="absolute top-0 left-0 right-0 h-[2px] origin-left"
          style={{ background: `linear-gradient(90deg,transparent,${plan.color},transparent)` }}
        />

        {/* Savings badge */}
        {plan.savings && (
          <div className="absolute top-5 right-5 text-xs font-bold px-2.5 py-1 rounded-full z-10"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.28)' }}>
            {plan.savings}
          </div>
        )}

        <div className="relative z-10 flex flex-col flex-1">
          {/* Icon + name */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${plan.color}14`, border: `1px solid ${plan.color}28` }}>
              <plan.icon size={16} style={{ color: plan.color }} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">{plan.name}</div>
              <div className="text-white/30 text-xs">{plan.description}</div>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black tracking-tight" style={{ color: plan.popular ? '#fff' : 'rgba(255,255,255,0.88)' }}>{plan.price}</span>
              <span className="text-white/30 text-sm">so'm</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: `${plan.color}90` }}>{plan.usd} · {plan.period}</div>
          </div>

          {/* Divider */}
          <div className="h-px mb-6" style={{ background: `linear-gradient(90deg,transparent,${plan.color}25,transparent)` }} />

          {/* Spacer — pushes button to bottom */}
          <div className="flex-1" />

          {/* CTA */}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onBuy}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            style={plan.popular ? {
              background: 'linear-gradient(135deg,#00f5ff,#7c3aed)',
              boxShadow: '0 0 28px rgba(0,245,255,0.22)',
              color: '#fff',
            } : {
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${plan.color}30`,
              color: plan.color,
            }}>
            <Zap size={14} /> {plan.cta}
          </motion.button>
        </div>

        {/* Ghost number */}
        <div className="absolute bottom-4 right-5 text-7xl font-black select-none pointer-events-none"
          style={{ color: plan.color, opacity: 0.04 }}>{i + 1}</div>
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default function PricingPage() {
  const { isAuthenticated } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [showLogin,    setShowLogin]    = useState(false)

  const handleBuy = (plan: typeof plans[0]) => {
    if (!isAuthenticated) setShowLogin(true)
    else setSelectedPlan(plan)
  }

  return (
    <div className="min-h-screen bg-[#020206] relative">
      <TradingBackground />

      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />

        {/* Extra glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] rounded-full blur-[160px]"
            style={{ background: 'radial-gradient(circle,rgba(0,245,255,0.05) 0%,transparent 70%)' }} />
          <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[140px]"
            style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)' }} />
        </div>

        <div className="pt-32 pb-28">
          <div className="max-w-5xl mx-auto px-6">

            {/* Heading */}
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}
              className="text-center mb-20">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-semibold text-cyan-400"
                style={{ background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.18)', boxShadow: '0 0 20px rgba(0,245,255,0.05)' }}>
                <Shield size={11} /> Click · Payme · Uzum · Bank Karta
              </div>
              <h1 className="font-black leading-[1.05] tracking-tight mb-5"
                style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)' }}>
                Pro sotib{' '}
                <span style={{
                  background: 'linear-gradient(135deg,#00f5ff 0%,#7c3aed 50%,#00ff88 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 24px rgba(0,245,255,0.25))',
                }}>
                  olish
                </span>
              </h1>
              <p className="text-white/40 text-lg">Bir reja. Barcha imkoniyatlar. Muddatni tanlang.</p>
            </motion.div>

            {/* Plan cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-16 items-stretch">
              {plans.map((plan, i) => (
                <PlanCard key={plan.name} plan={plan} i={i} onBuy={() => handleBuy(plan)} />
              ))}
            </div>

            {/* Payment methods */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="rounded-3xl p-8 mb-8 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(0,245,255,0.2),rgba(124,58,237,0.2),transparent)' }} />

              <p className="text-center text-xs text-white/25 uppercase tracking-widest font-medium mb-7">To'lov usullari</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {DISPLAY_METHODS.map((m, i) => (
                  <motion.div key={m.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                    whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
                    className="group flex flex-col items-center gap-3 p-5 rounded-2xl cursor-default relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg,${m.glow}12,${m.glow}04)`, border: `1px solid ${m.glow}28` }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                      style={{ background: `radial-gradient(circle at 50% 40%,${m.glow}18,transparent 65%)` }} />
                    <div style={{ filter: `drop-shadow(0 6px 16px ${m.glow}55)` }}><m.Logo /></div>
                    <span className="text-xs font-semibold" style={{ color: m.glow }}>{m.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.2),transparent)' }} />

              <div className="flex items-center gap-3 justify-center mb-8">
                <Activity size={16} className="text-cyan-400" />
                <h2 className="font-bold text-xl">Pro paketga nima kiradi</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-3.5">
                {features.map((f, i) => (
                  <motion.div key={f}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="group flex items-center gap-3 p-3.5 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.025)' }}
                    whileHover={{ background: 'rgba(0,245,255,0.04)', transition: { duration: 0.15 } }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.22)' }}>
                      <Check size={11} className="text-cyan-400" strokeWidth={3} />
                    </div>
                    <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">{f}</span>
                  </motion.div>
                ))}
              </div>

              {/* Bottom info strip */}
              <div className="mt-8 pt-6 flex items-center justify-center gap-6 flex-wrap"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                  { icon: Shield,   text: '256-bit shifrlash' },
                  { icon: CheckCircle, text: '1–2 soatda faollashtirish' },
                  { icon: Zap,      text: '24/7 monitoring' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-white/30">
                    <Icon size={12} className="text-cyan-400/50" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>

        <Footer />
      </div>

      <AnimatePresence>
        {showLogin    && <LoginRequiredModal onClose={() => setShowLogin(false)} />}
        {selectedPlan && <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
      </AnimatePresence>
    </div>
  )
}
