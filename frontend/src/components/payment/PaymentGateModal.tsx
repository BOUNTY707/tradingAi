import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { X, Upload, Check, CheckCircle, AlertCircle, CreditCard, MessageSquare, Clock, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

import clickIcon  from '@/assets/click-icon.png'
import paymeIcon  from '@/assets/payme-icon.png'
import uzumIcon   from '@/assets/uzum-bank.png'

function BankCardLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="12" fill="url(#cg)"/>
      <rect x="6" y="13" width="32" height="19" rx="3.5" fill="white" fillOpacity="0.12"/>
      <rect x="6" y="13" width="32" height="7" rx="3.5" fill="white" fillOpacity="0.22"/>
      <rect x="9" y="24" width="8" height="5.5" rx="1.5" fill="#FFD166"/>
      <rect x="11" y="24" width="1" height="5.5" fill="#C9A227" fillOpacity="0.4"/>
      <rect x="13.5" y="24" width="1" height="5.5" fill="#C9A227" fillOpacity="0.4"/>
      <rect x="9" y="26.5" width="8" height="0.8" fill="#C9A227" fillOpacity="0.4"/>
      <circle cx="31.5" cy="19" r="3" fill="#FF5F00" fillOpacity="0.9"/>
      <circle cx="35" cy="19" r="3" fill="#FFB300" fillOpacity="0.9"/>
      <defs><linearGradient id="cg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#6D28D9"/><stop offset="1" stopColor="#3B0764"/></linearGradient></defs>
    </svg>
  )
}

const PLANS = [
  { name: '1 Oylik',  price: '100 000', duration: '1 oy',  amount: 100000 },
  { name: '3 Oylik',  price: '250 000', duration: '3 oy',  amount: 250000, popular: true },
  { name: '12 Oylik', price: '999 000', duration: '12 oy', amount: 999000 },
]

const METHODS = [
  { id: 'click',  name: 'Click',      glow: '#0068FF', card: '9860 0101 2689 9433', logo: () => <img src={clickIcon} alt="Click" width={44} height={44} className="rounded-xl" /> },
  { id: 'payme',  name: 'Payme',      glow: '#00D162', card: '9860 0101 2689 9433', logo: () => <img src={paymeIcon} alt="Payme" width={44} height={44} className="rounded-xl" /> },
  { id: 'uzum',   name: 'Uzum Bank',  glow: '#FF7A29', card: '4916 9903 1372 1554', logo: () => <img src={uzumIcon}  alt="Uzum"  width={44} height={44} className="rounded-xl" /> },
  { id: 'card',   name: 'Bank Karta', glow: '#6D28D9', card: '9860 0101 2689 9433', logo: () => <BankCardLogo /> },
]

interface Props { onClose: () => void }

export default function PaymentGateModal({ onClose }: Props) {
  const { isAuthenticated } = useAuthStore()
  const [step,     setStep]     = useState<'plan' | 'pay' | 'done'>('plan')
  const [plan,     setPlan]     = useState(PLANS[1])
  const [method,   setMethod]   = useState<typeof METHODS[0] | null>(null)
  const [file,     setFile]     = useState<File | null>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [copied,   setCopied]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
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
    navigator.clipboard.writeText(method.card.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const submit = async () => {
    if (!isAuthenticated) return
    if (!method || !file || !preview) return
    setLoading(true); setError('')
    try {
      await api.post('/payments', {
        planName:   plan.name,
        amount:     plan.amount,
        method:     method.name,
        screenshot: preview,
      })
      setStep('done')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Xatolik yuz berdi. Qayta urinib ko\'ring.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />

      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative z-10 w-full max-w-md flex flex-col"
        style={{
          maxHeight: 'calc(100dvh - 40px)',
          background: 'linear-gradient(160deg,rgba(9,9,16,0.99),rgba(13,9,22,0.99))',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '24px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/7 shrink-0 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">
              {step === 'plan' ? 'Reja tanlang' : step === 'pay' ? 'To\'lov' : 'Yuborildi!'}
            </h3>
            <p className="text-xs text-white/35 mt-0.5">
              {step === 'plan' ? 'Dashboard uchun obuna kerak' : step === 'pay' ? `${plan.name} — ${plan.price} so'm` : 'Admin tekshirayapti'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/8 border border-white/8">
            <X size={15} className="text-white/50" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ scrollbarWidth: 'none' }}>

          {/* ── Step: Plan ── */}
          {step === 'plan' && (
            <>
              <p className="text-sm text-white/50 text-center">Dashboard ga kirish uchun to'lov talab qilinadi</p>
              <div className="space-y-2.5">
                {PLANS.map(p => (
                  <button key={p.name} onClick={() => setPlan(p)}
                    className="w-full p-4 rounded-2xl text-left transition-all relative"
                    style={{
                      background: plan.name === p.name ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${plan.name === p.name ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    {p.popular && (
                      <span className="absolute -top-2.5 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white">
                        Tavsiya
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">{p.name}</div>
                        <div className="text-xs text-white/35 mt-0.5">{p.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-lg text-white">{p.price}</div>
                        <div className="text-xs text-white/30">so'm</div>
                      </div>
                    </div>
                    {plan.name === p.name && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step: Pay ── */}
          {step === 'pay' && (
            <>
              {/* Method grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {METHODS.map(m => {
                  const active = method?.id === m.id
                  return (
                    <button key={m.id} onClick={() => setMethod(m)}
                      className="p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left"
                      style={{
                        background:  active ? `${m.glow}18` : 'rgba(255,255,255,0.03)',
                        borderColor: active ? `${m.glow}55` : 'rgba(255,255,255,0.07)',
                        boxShadow:   active ? `0 0 20px ${m.glow}20` : 'none',
                      }}>
                      <m.logo />
                      <div>
                        <div className="font-semibold text-sm" style={{ color: active ? m.glow : 'rgba(255,255,255,0.8)' }}>
                          {m.name}
                        </div>
                        <div className="text-xs text-white/30">Karta</div>
                      </div>
                      {active && (
                        <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: m.glow }}>
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Payment details */}
              <AnimatePresence mode="wait">
                {method && (
                  <motion.div key={method.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: `${method.glow}12`, border: `1px solid ${method.glow}30` }}>
                    <div className="px-5 py-4 border-b" style={{ borderColor: `${method.glow}20` }}>
                      <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Karta raqami</p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono font-bold text-white tracking-widest">{method.card}</span>
                        <button onClick={copy}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl font-semibold transition-all"
                          style={{
                            background: copied ? 'rgba(34,197,94,0.18)' : `${method.glow}18`,
                            color: copied ? '#22c55e' : method.glow,
                            border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : `${method.glow}40`}`,
                          }}>
                          {copied ? <><Check size={11} /> Nusxa!</> : <><Copy size={12} /> Nusxa</>}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-5 py-3">
                      <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="flex items-center gap-1 text-white/35 text-xs mb-0.5">
                          <CreditCard size={10} /> Miqdor
                        </div>
                        <div className="font-bold text-sm text-white">{plan.price} so'm</div>
                      </div>
                      <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="flex items-center gap-1 text-white/35 text-xs mb-0.5">
                          <MessageSquare size={10} /> Izoh
                        </div>
                        <div className="font-mono text-sm text-white">TradeAI {plan.duration}</div>
                      </div>
                    </div>
                    <div className="mx-5 mb-4 flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}>
                      <AlertCircle size={12} className="text-yellow-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-300/70">Izohga <strong>TradeAI {plan.duration}</strong> va telefon raqamingizni yozing</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Screenshot upload */}
              {method && (
                <div>
                  <p className="text-xs text-white/35 mb-2 flex justify-between">
                    <span>To'lov screenshoti</span>
                    <span className="text-red-400">* majburiy</span>
                  </p>
                  {!preview ? (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f) }}
                      onClick={() => fileRef.current?.click()}
                      className="rounded-2xl cursor-pointer p-6 text-center transition-all"
                      style={{
                        border: `2px dashed ${dragging ? `${method.glow}aa` : 'rgba(255,255,255,0.1)'}`,
                        background: dragging ? `${method.glow}08` : 'rgba(255,255,255,0.02)',
                      }}>
                      <Upload size={22} className="mx-auto mb-2 text-white/25" />
                      <p className="text-sm text-white/40">Bosing yoki tashlang</p>
                      <p className="text-xs text-white/20 mt-1">PNG · JPG · max 10 MB</p>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }} />
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden relative border border-white/10">
                      <img src={preview} alt="screenshot" className="w-full max-h-36 object-cover" />
                      <button onClick={() => { setFile(null); setPreview(null) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/70 flex items-center justify-center border border-white/10">
                        <X size={13} className="text-white" />
                      </button>
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-green-400" />
                        <span className="text-xs text-green-400">{file?.name?.slice(0, 20)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5 border border-red-500/20">{error}</p>
              )}
            </>
          )}

          {/* ── Step: Done ── */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-green-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">To'lov yuborildi!</h3>
              <p className="text-white/45 text-sm leading-relaxed mb-4">
                Screenshotingiz admin tomonidan tekshirilmoqda.
                Tasdiqlangandan keyin Dashboard ga kirishingiz mumkin bo'ladi.
              </p>
              <div className="flex items-center justify-center gap-2 text-white/30 text-xs mb-6">
                <Clock size={12} />
                Taxminan 1–2 soat ichida
              </div>
              <Button onClick={onClose} className="w-full">Yopish</Button>
              <Link to="/pricing" onClick={onClose} className="block mt-3 text-xs text-white/30 hover:text-white/50 transition-colors">
                Narxlar sahifasiga o'tish →
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'done' && (
          <div className="shrink-0 px-6 py-4 border-t border-white/7 space-y-2.5"
            style={{ borderRadius: '0 0 24px 24px' }}>
            {step === 'plan' ? (
              <Button onClick={() => setStep('pay')} size="lg" className="w-full !rounded-2xl">
                Davom etish →
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={!method || !file}
                loading={loading}
                size="lg"
                className="w-full !rounded-2xl">
                <CheckCircle size={16} />
                Tasdiqlashni yuborish
              </Button>
            )}
            {step === 'pay' && (
              <button onClick={() => setStep('plan')}
                className="w-full text-xs text-white/30 hover:text-white/50 transition-colors py-1">
                ← Rejaga qaytish
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
