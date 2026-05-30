import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { Check, Zap, Shield, Star, X, Upload, CheckCircle, AlertCircle, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuthStore } from '@/store/authStore'
import LoginRequiredModal from '@/components/payment/LoginRequiredModal'
import clickIcon  from '@/assets/click-icon.png'
import paymeIcon  from '@/assets/payme-icon.png'
import uzumIcon   from '@/assets/uzum-bank.png'

// ─────────────────────────────────────────────────────────────────
// PAYMENT ICONS
// ─────────────────────────────────────────────────────────────────

function ImgLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={52}
      height={52}
      className="rounded-[14px] object-cover"
      style={{ width: 52, height: 52 }}
    />
  )
}

function BankCardLogo() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="14" fill="url(#card_bg)"/>
      <rect x="8" y="16" width="36" height="22" rx="4" fill="white" fillOpacity="0.12"/>
      <rect x="8" y="16" width="36" height="8" rx="4" fill="white" fillOpacity="0.22"/>
      <rect x="12" y="28" width="9" height="6.5" rx="2" fill="#FFD166"/>
      <rect x="14" y="28" width="1" height="6.5" fill="#C9A227" fillOpacity="0.5"/>
      <rect x="16.5" y="28" width="1" height="6.5" fill="#C9A227" fillOpacity="0.5"/>
      <rect x="12" y="30.5" width="9" height="1" fill="#C9A227" fillOpacity="0.5"/>
      <path d="M27 30 Q29 28 29 31 Q29 34 27 32" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeOpacity="0.8"/>
      <path d="M29.5 28.5 Q33 27 33 31 Q33 35 29.5 33.5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeOpacity="0.55"/>
      <circle cx="36" cy="22" r="3.5" fill="#FF5F00" fillOpacity="0.9"/>
      <circle cx="40" cy="22" r="3.5" fill="#FFB300" fillOpacity="0.9"/>
      <ellipse cx="38" cy="22" rx="1.5" ry="3.5" fill="#FF8000" fillOpacity="0.9"/>
      <defs>
        <linearGradient id="card_bg" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D28D9"/>
          <stop offset="1" stopColor="#3B0764"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────

const plans = [
  { name: '1 Oylik',  price: '100 000', period: "so'm / oy",    usd: '~$8',  savings: null,        popular: false, description: 'Boshlash uchun qulay',     duration: '1 oy',  amount: 100000  },
  { name: '3 Oylik',  price: '250 000', period: "so'm / 3 oy",  usd: '~$20', savings: 'Tejash 17%', popular: true,  description: "Ko'pchilik tanlov",       duration: '3 oy',  amount: 250000  },
  { name: '12 Oylik', price: '999 000', period: "so'm / yil",   usd: '~$80', savings: 'Tejash 17%', popular: false, description: 'Maksimal tejamkorlik',     duration: '12 oy', amount: 999000  },
]

const features = [
  'Cheksiz AI signallar',       'Smart Money tahlili',            'Barcha bozorlar (Crypto · Forex · Stocks)',
  'AI trading assistant',        'Real vaqt WebSocket signallar',  'Kengaytirilgan SMC tahlili',
  'Ustuvor qo\'llab-quvvatlash', 'API kirish (12 oylik planda)',   'Portfolio kuzatish',
]

const METHODS = [
  { id: 'click',  name: 'Click',       sub: 'Karta orqali',  glow: '#0068FF',  cardNum: '9860 0101 2689 9433', Logo: () => <ImgLogo src={clickIcon} alt="Click" />   },
  { id: 'payme',  name: 'Payme',       sub: 'Karta orqali',  glow: '#00D162',  cardNum: '9860 0101 2689 9433', Logo: () => <ImgLogo src={paymeIcon} alt="Payme" />   },
  { id: 'uzum',   name: 'Uzum Bank',   sub: 'Karta orqali',  glow: '#FF7A29',  cardNum: '4916 9903 1372 1554', Logo: () => <ImgLogo src={uzumIcon}  alt="Uzum Bank" /> },
  { id: 'card',   name: 'Bank Karta',  sub: 'Istalgan bank', glow: '#6D28D9',  cardNum: '9860 0101 2689 9433', Logo: BankCardLogo },
]

// ─────────────────────────────────────────────────────────────────
// PAYMENT MODAL
// ─────────────────────────────────────────────────────────────────

function PaymentModal({ plan, onClose }: { plan: typeof plans[0]; onClose: () => void }) {
  const [method, setMethod]       = useState<typeof METHODS[0] | null>(null)
  const [file,   setFile]         = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [copied,  setCopied]      = useState(false)
  const [dragging, setDragging]   = useState(false)
  const [done,    setDone]        = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const pickFile = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    const r = new FileReader()
    r.onload = e => setPreview(e.target?.result as string)
    r.readAsDataURL(f)
  }

  const copy = () => {
    if (!method) return
    navigator.clipboard.writeText(method.cardNum.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Success screen ──────────────────────────────────────────────
  if (done) return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-5">
      <motion.div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="relative z-10 max-w-sm w-full rounded-3xl p-8 text-center"
        style={{ background: 'linear-gradient(145deg,#0a0f0a,#050d08)', border: '1px solid rgba(0,209,98,0.25)', boxShadow: '0 0 80px rgba(0,209,98,0.12)' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
          className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,rgba(0,209,98,0.2),rgba(0,209,98,0.05))', border: '1px solid rgba(0,209,98,0.3)' }}>
          <CheckCircle size={36} className="text-green-400" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">To'lov yuborildi!</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-1">
          Screenshotingiz qabul qilindi.
        </p>
        <p className="text-white/70 text-sm mb-6">
          <span className="text-green-400 font-semibold">1–2 soat</span> ichida hisobingiz faollashtiriladi.
        </p>
        <div className="text-xs text-white/30 mb-6 font-mono bg-white/3 rounded-xl px-4 py-2.5 border border-white/5">
          mehrobakooo@gmail.com
        </div>
        <Button onClick={onClose} size="lg" className="w-full">Yopish</Button>
      </motion.div>
    </div>
  )

  // ── Main modal ──────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative z-10 w-full max-w-md flex flex-col"
        style={{
          maxHeight: 'calc(100dvh - 40px)',
          background: 'linear-gradient(160deg,rgba(9,9,16,0.99),rgba(13,9,22,0.99))',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '24px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}>

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg leading-tight">To'lov usuli</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/35">{plan.name}</span>
                <span className="text-white/15">·</span>
                <span className="font-bold text-cyan-400">{plan.price} so'm</span>
              </div>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-2xl flex items-center justify-center transition-colors hover:bg-white/8"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={15} className="text-white/50" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-5"
          style={{ scrollbarWidth: 'none' }}>

          {/* Method selection */}
          <div>
            <p className="text-xs font-medium text-white/35 uppercase tracking-widest mb-3">To'lov usulini tanlang</p>
            <div className="grid grid-cols-2 gap-2.5">
              {METHODS.map(m => {
                const active = method?.id === m.id
                return (
                  <motion.button
                    key={m.id}
                    onClick={() => setMethod(m)}
                    whileTap={{ scale: 0.97 }}
                    className="relative p-4 rounded-2xl text-left transition-all flex items-center gap-3.5 overflow-hidden"
                    style={{
                      background: active
                        ? `linear-gradient(135deg, ${m.glow}22, ${m.glow}08)`
                        : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${active ? m.glow + '55' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: active ? `0 0 24px ${m.glow}20, inset 0 1px 0 ${m.glow}30` : 'none',
                    }}>
                    {/* Glow bg blob */}
                    {active && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: `radial-gradient(circle at 20% 50%, ${m.glow}18 0%, transparent 70%)` }} />
                    )}
                    <div className="relative shrink-0" style={{ filter: active ? `drop-shadow(0 4px 12px ${m.glow}60)` : 'none', transition: 'filter .25s' }}>
                      <m.Logo />
                    </div>
                    <div className="relative min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate"
                        style={{ color: active ? 'white' : 'rgba(255,255,255,0.75)' }}>{m.name}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: active ? m.glow : 'rgba(255,255,255,0.3)' }}>{m.sub}</p>
                    </div>
                    {active && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: m.glow }}>
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Payment details */}
          <AnimatePresence mode="wait">
            {method && (
              <motion.div key={method.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${method.glow}16, ${method.glow}05, rgba(0,0,0,0.3))`,
                  border: `1px solid ${method.glow}35`,
                  boxShadow: `0 8px 32px ${method.glow}12`,
                }}>

                {/* Method header row */}
                <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${method.glow}20` }}>
                  <div style={{ filter: `drop-shadow(0 4px 16px ${method.glow}80)` }}>
                    <method.Logo />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: method.glow }}>{method.name} orqali to'lov</p>
                    <p className="text-xs text-white/40 mt-0.5">"Jo'natma" → karta raqami</p>
                  </div>
                </div>

                {/* Card number */}
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${method.glow}15` }}>
                  <p className="text-xs text-white/35 uppercase tracking-widest mb-2.5 font-medium">Karta raqami</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-1 flex-wrap">
                      {method.cardNum.split(' ').map((g, i) => (
                        <span key={i} className="font-mono text-white font-bold text-xl tracking-widest">{g}</span>
                      ))}
                    </div>
                    <motion.button onClick={copy} whileTap={{ scale: 0.9 }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
                      style={{
                        background: copied ? 'rgba(0,209,98,0.18)' : `${method.glow}18`,
                        color: copied ? '#00d162' : method.glow,
                        border: `1px solid ${copied ? 'rgba(0,209,98,0.4)' : method.glow + '40'}`,
                      }}>
                      {copied ? <><Check size={12} strokeWidth={3} /> Nusxa!</> : <><Copy size={12} /> Nusxa</>}
                    </motion.button>
                  </div>
                </div>

                {/* Amount + note */}
                <div className="grid grid-cols-2 gap-2 px-5 py-4" style={{ borderBottom: `1px solid ${method.glow}15` }}>
                  <div className="rounded-xl px-3.5 py-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-white/35 mb-1">Miqdor</p>
                    <p className="font-bold text-sm text-white">{plan.price} <span className="text-white/40 font-normal text-xs">so'm</span></p>
                  </div>
                  <div className="rounded-xl px-3.5 py-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-white/35 mb-1">Izohga yozing</p>
                    <p className="font-mono text-sm text-white">TradeAI {plan.duration}</p>
                  </div>
                </div>

                {/* Warning */}
                <div className="mx-5 my-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.18)' }}>
                  <AlertCircle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300/75 leading-relaxed">
                    Izohga <strong className="text-yellow-200">TradeAI {plan.duration}</strong> va ro'yxatdan o'tgan telefon raqamingizni yozing
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Screenshot upload */}
          <AnimatePresence>
            {method && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-medium text-white/35 uppercase tracking-widest">To'lov screenshoti</p>
                  <span className="text-xs text-red-400 font-medium">* Majburiy</span>
                </div>

                {!preview ? (
                  <motion.div
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f) }}
                    onClick={() => fileRef.current?.click()}
                    animate={{ borderColor: dragging ? method.glow + 'cc' : 'rgba(255,255,255,0.09)' }}
                    className="rounded-2xl cursor-pointer transition-all select-none"
                    style={{
                      border: `2px dashed ${dragging ? method.glow + 'cc' : 'rgba(255,255,255,0.09)'}`,
                      background: dragging ? `${method.glow}08` : 'rgba(255,255,255,0.02)',
                    }}>
                    <div className="flex flex-col items-center py-8 gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${method.glow}15`, border: `1px solid ${method.glow}30` }}>
                        <Upload size={20} style={{ color: method.glow }} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-white/50 font-medium">Bosing yoki sudrab tashlang</p>
                        <p className="text-xs text-white/20 mt-1">PNG · JPG · max 5 MB</p>
                      </div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }} />
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl overflow-hidden relative"
                    style={{ border: `1px solid ${method.glow}40`, boxShadow: `0 4px 24px ${method.glow}18` }}>
                    <img src={preview} alt="screenshot" className="w-full max-h-44 object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)' }} />
                    <button onClick={() => { setFile(null); setPreview(null) }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center transition-colors hover:bg-black/80"
                      style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <X size={13} className="text-white" />
                    </button>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={13} className="text-green-400" />
                        <span className="text-xs text-green-400 font-semibold">Yuklandi</span>
                      </div>
                      <span className="text-xs text-white/40 truncate max-w-[140px]">{file?.name}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* bottom padding for footer */}
          <div className="h-1" />
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 py-5 space-y-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(5,5,8,0.9)', borderRadius: '0 0 24px 24px' }}>
          <Button
            onClick={() => { if (method && file) setDone(true) }}
            disabled={!method || !file}
            size="lg"
            className="w-full !rounded-2xl !py-4 !text-base font-bold"
          >
            <CheckCircle size={18} />
            Tasdiqlashni yuborish
          </Button>
          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            To'lov tekshirilgandan so'ng 1–2 soat ichida faollashtiriladi
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { isAuthenticated } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [showLogin,    setShowLogin]    = useState(false)

  const handleBuy = (plan: typeof plans[0]) => {
    if (!isAuthenticated) {
      setShowLogin(true)
    } else {
      setSelectedPlan(plan)
    }
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      <Navbar />

      <div className="pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6">

          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 text-xs text-cyan-400 mb-5 border border-cyan-500/20">
              <Shield size={12} /> Click · Payme · Uzum · Bank Karta
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Pro sotib <span className="gradient-text">olish</span>
            </h1>
            <p className="text-white/45 text-lg">Bir reja. Barcha imkoniyatlar. Muddatni tanlang.</p>
          </motion.div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {plans.map((plan, i) => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 border ${plan.popular ? 'border-cyan-500/35 glow-neon' : 'border-white/6 glass'}`}
                style={plan.popular ? { background: 'linear-gradient(145deg,rgba(0,245,255,0.04),rgba(124,58,237,0.06),rgba(5,5,8,0.96))' } : {}}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold px-5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star size={10} fill="white" /> Tavsiya etiladi
                  </div>
                )}
                {plan.savings && (
                  <div className="absolute top-5 right-5 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                    {plan.savings}
                  </div>
                )}
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-white/35 text-sm mb-6">{plan.description}</p>
                <div className="mb-1 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-white/35 text-sm">so'm</span>
                </div>
                <p className="text-white/25 text-xs mb-7">{plan.usd} · {plan.period}</p>
                <div className="h-px mb-7" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
                <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full !rounded-xl" size="lg"
                  onClick={() => handleBuy(plan)}>
                  <Zap size={15} /> Pro sotib olish
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Payment icons row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl border border-white/5 p-6 mb-8">
            <p className="text-center text-xs text-white/25 uppercase tracking-widest font-medium mb-5">To'lov usullari</p>
            <div className="grid grid-cols-4 gap-4">
              {METHODS.map(m => (
                <motion.div key={m.id} whileHover={{ scale: 1.04, y: -2 }} transition={{ type: 'spring', stiffness: 400 }}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl cursor-default"
                  style={{ background: `linear-gradient(135deg, ${m.glow}14, ${m.glow}04)`, border: `1px solid ${m.glow}30` }}>
                  <div style={{ filter: `drop-shadow(0 6px 16px ${m.glow}55)` }}>
                    <m.Logo />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: m.glow }}>{m.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-8 border border-white/5">
            <h2 className="font-bold text-xl mb-7 text-center">Pro paketga nima kiradi</h2>
            <div className="grid md:grid-cols-3 gap-3.5">
              {features.map(f => (
                <div key={f} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.25)' }}>
                    <Check size={11} className="text-cyan-400" strokeWidth={3} />
                  </div>
                  <span className="text-white/65">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      <Footer />

      <AnimatePresence>
        {showLogin    && <LoginRequiredModal onClose={() => setShowLogin(false)} />}
        {selectedPlan && <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
      </AnimatePresence>
    </div>
  )
}
