import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useCallback } from 'react'
import {
  Brain, CheckCircle, Upload, X, Image, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Clock, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Sidebar from '@/components/layout/Sidebar'
import PageBackground from '@/components/ui/PageBackground'

interface AnalysisResult {
  direction: 'BUY' | 'SELL' | 'WAIT'
  confidence: number
  symbol: string
  timeframe: string
  entry: string
  stopLoss: string
  takeProfit1: string
  takeProfit2: string
  trend: string
  riskLevel: string
  sentiment: string
  riskReward: string
  concepts: string[]
  explanation: string
  processingTime: number
  message?: string
}

// Resize image on canvas before sending (max 1600px wide)
function resizeImage(file: File, maxW = 1600): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = img.width > maxW ? maxW / img.width : 1
      const w = Math.round(img.width  * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      const base64 = canvas.toDataURL('image/jpeg', 0.88).split(',')[1]
      resolve({ base64, mediaType: 'image/jpeg' })
    }
    img.onerror = reject
    img.src = url
  })
}

const DIRECTION_CONFIG = {
  BUY: {
    label: 'BUY', icon: TrendingUp, arrow: '↑',
    bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)',
    color: '#4ade80', glow: 'rgba(74,222,128,0.15)',
  },
  SELL: {
    label: 'SELL', icon: TrendingDown, arrow: '↓',
    bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)',
    color: '#f87171', glow: 'rgba(248,113,113,0.15)',
  },
  WAIT: {
    label: 'WAIT', icon: Minus, arrow: '—',
    bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)',
    color: '#fbbf24', glow: 'rgba(251,191,36,0.15)',
  },
}

export default function AnalysisPage() {
  const { isAuthenticated } = useAuthStore()
  const [file,     setFile]     = useState<File | null>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<AnalysisResult | null>(null)
  const [error,    setError]    = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) { setError('Faqat rasm fayllari qabul qilinadi (PNG, JPG, WEBP)'); return }
    if (f.size > 15 * 1024 * 1024) { setError('Fayl hajmi 15MB dan oshmasin'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError('')
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const clearFile = () => {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setResult(null)
    setError('')
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true); setError(''); setResult(null)
    try {
      const { base64, mediaType } = await resizeImage(file)
      const { data } = await api.post('/analysis/image', { image: base64, mediaType })
      const r = data.data

      if (r?.confidence === 0 && r?.message) {
        // API xatosi yoki sozlanmagan
        setError(`❌ ${r.message}`)
      } else if (r?.direction === 'WAIT' && r?.message) {
        // Past ishonch — bu normal holat
        setError(`⏳ Signal aniqlanmadi (${r.confidence}% ishonch). Boshqa setup kuting.`)
        setResult(r)
      } else {
        setResult(r)
      }
    } catch (e: any) {
      const msg = e.response?.data?.message
      if (e.response?.status === 401) setError('Tahlil uchun tizimga kiring.')
      else setError(msg || 'Tahlil amalga oshmadi. Qayta urinib ko\'ring.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020206] flex relative">
      <PageBackground />
      <Sidebar />

      <main className="flex-1 lg:ml-64 relative" style={{ zIndex: 1 }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: 'rgba(2,2,8,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(0,245,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(0,245,255,0)', '0 0 14px rgba(0,245,255,0.5)', '0 0 0px rgba(0,245,255,0)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.22)' }}>
              <Brain size={17} className="text-cyan-400" />
            </motion.div>
            <div>
              <div className="font-black text-sm tracking-tight">AI Chart Analysis</div>
              <div className="text-xs text-white/35 font-mono">// TradingView screenshot yuklang</div>
            </div>
          </div>
          {!isAuthenticated && (
            <Link to="/login" className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              <AlertTriangle size={12} /> Login kerak
            </Link>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* ── Upload Zone ── */}
            <div className="mb-6">
              {!preview ? (
                /* Drop area */
                <motion.div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => isAuthenticated && fileRef.current?.click()}
                  animate={{
                    borderColor: dragging ? 'rgba(0,245,255,0.6)' : 'rgba(255,255,255,0.1)',
                    background:  dragging ? 'rgba(0,245,255,0.05)' : 'rgba(255,255,255,0.02)',
                  }}
                  className="relative rounded-3xl cursor-pointer transition-all overflow-hidden"
                  style={{ border: '2px dashed rgba(255,255,255,0.1)', minHeight: 340 }}>

                  {/* Background grid pattern */}
                  <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(rgba(0,245,255,1) 1px, transparent 1px), linear-gradient(90deg,rgba(0,245,255,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
                    <motion.div
                      animate={dragging ? { scale: 1.15, rotate: -5 } : { scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-20 h-20 rounded-3xl flex items-center justify-center"
                      style={{ background: dragging ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${dragging ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                      <Image size={32} className={dragging ? 'text-cyan-400' : 'text-white/25'} />
                    </motion.div>

                    <div className="text-center">
                      <p className="text-white/70 font-semibold text-lg mb-2">
                        {dragging ? 'Qo\'yib yuboring!' : 'Chart screenshotini yuklang'}
                      </p>
                      <p className="text-white/35 text-sm">
                        TradingView dan screenshot oling va bu yerga tashlang
                      </p>
                      <p className="text-white/20 text-xs mt-1">PNG · JPG · WEBP · max 15 MB</p>
                    </div>

                    {isAuthenticated ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:scale-105"
                          style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff' }}>
                          <Upload size={15} /> Fayl tanlash
                        </button>
                      </div>
                    ) : (
                      <Link to="/login"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold"
                        style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                        Tahlil uchun kiring →
                      </Link>
                    )}
                  </div>

                  {/* How it works strip */}
                  <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 px-6 py-3 flex items-center justify-center gap-8"
                    style={{ background: 'rgba(0,0,0,0.3)' }}>
                    {[
                      { n: '1', t: 'TradingView chartni oching' },
                      { n: '2', t: 'Screenshot oling (Win+Shift+S)' },
                      { n: '3', t: 'Bu yerga yuklang' },
                      { n: '4', t: 'AI signal olasiz' },
                    ].map(s => (
                      <div key={s.n} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(0,245,255,0.15)', color: '#00f5ff' }}>{s.n}</span>
                        <span className="text-xs text-white/30 hidden sm:block">{s.t}</span>
                      </div>
                    ))}
                  </div>

                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                </motion.div>
              ) : (
                /* Preview */
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl overflow-hidden relative"
                  style={{ border: '1px solid rgba(0,245,255,0.2)', boxShadow: '0 8px 40px rgba(0,245,255,0.08)' }}>
                  <img src={preview} alt="Chart" className="w-full max-h-[480px] object-contain bg-[#0a0a12]" />

                  {/* Overlay controls */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={clearFile}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-red-500/30"
                      style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <X size={15} className="text-white/70" />
                    </button>
                  </div>

                  {/* File info */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3"
                    style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-green-400" />
                      <span className="text-xs text-green-400 font-medium">{file?.name}</span>
                      <span className="text-xs text-white/30">{file ? `(${(file.size / 1024).toFixed(0)} KB)` : ''}</span>
                    </div>
                    <button onClick={() => fileRef.current?.click()}
                      className="text-xs text-white/40 hover:text-white transition-colors">
                      Boshqa rasm
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                </motion.div>
              )}
            </div>

            {/* Analyze button */}
            {preview && !loading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <Button onClick={analyze} size="lg" className="w-full !rounded-2xl !py-4 !text-base font-bold shadow-lg shadow-cyan-500/15">
                  <Brain size={20} />
                  AI bilan tahlil qilish
                </Button>
              </motion.div>
            )}

            {/* ── Loading ── */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-3xl p-14 text-center mb-6"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="relative w-20 h-20 mx-auto mb-5">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/15" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                    <Brain size={28} className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
                  </div>
                  <p className="text-white/60 font-medium mb-1">Chart tahlil qilinmoqda...</p>
                  <p className="text-white/25 text-sm">Claude AI pattern va SMC strukturalarni aniqlayapti</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Error ── */}
            <AnimatePresence>
              {error && !loading && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-6"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-white/65">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Result ── */}
            <AnimatePresence>
              {result && !loading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-4">

                  {/* Direction hero card */}
                  {(() => {
                    const cfg = DIRECTION_CONFIG[result.direction]
                    return (
                      <div className="rounded-3xl p-7 relative overflow-hidden"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: `0 0 60px ${cfg.glow}` }}>
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                          style={{ background: `radial-gradient(circle, ${cfg.glow}, transparent 70%)`, transform: 'translate(30%,-30%)' }} />

                        <div className="relative flex items-center justify-between flex-wrap gap-6">
                          {/* Left */}
                          <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-black"
                              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                              {cfg.arrow}
                            </div>
                            <div>
                              <div className="text-4xl font-black mb-1" style={{ color: cfg.color }}>
                                {result.direction}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white/50 text-sm font-semibold">{result.symbol}</span>
                                {result.timeframe !== 'Unknown' && (
                                  <>
                                    <span className="text-white/20">·</span>
                                    <span className="text-white/50 text-sm">{result.timeframe}</span>
                                  </>
                                )}
                                <span className="text-white/20">·</span>
                                <span className="text-sm text-white/40">{result.sentiment}</span>
                              </div>
                              {result.processingTime && (
                                <div className="flex items-center gap-1 mt-1.5 text-white/25 text-xs">
                                  <Clock size={10} />
                                  {(result.processingTime / 1000).toFixed(1)}s
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right — confidence */}
                          <div className="text-right">
                            <div className="text-xs text-white/35 mb-1.5 uppercase tracking-wider">AI Ishonch</div>
                            <div className="text-5xl font-black mb-2" style={{ color: cfg.color }}>
                              {result.confidence}%
                            </div>
                            <div className="w-32 h-2.5 rounded-full bg-black/30 ml-auto overflow-hidden">
                              <motion.div className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${result.confidence}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{ background: `linear-gradient(90deg, ${cfg.color}, rgba(255,255,255,0.6))` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Trade levels */}
                  {result.direction !== 'WAIT' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Entry Zone',    value: result.entry,       color: 'text-white',    bg: 'rgba(255,255,255,0.05)' },
                        { label: 'Stop Loss',     value: result.stopLoss,    color: 'text-red-400',  bg: 'rgba(248,113,113,0.06)' },
                        { label: 'Take Profit 1', value: result.takeProfit1, color: 'text-green-400', bg: 'rgba(74,222,128,0.06)' },
                        { label: 'Take Profit 2', value: result.takeProfit2, color: 'text-emerald-300', bg: 'rgba(52,211,153,0.06)' },
                      ].map(item => (
                        <div key={item.label} className="rounded-2xl p-4 text-center"
                          style={{ background: item.bg, border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div className="text-white/35 text-xs mb-2 uppercase tracking-wide">{item.label}</div>
                          <div className={`font-bold text-sm font-mono ${item.color}`}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Trend',       value: result.trend       },
                      { label: 'Risk Level',  value: result.riskLevel   },
                      { label: 'Risk:Reward', value: result.riskReward  },
                      { label: 'Symbol',      value: result.symbol      },
                    ].map(item => (
                      <div key={item.label} className="rounded-2xl px-4 py-3"
                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="text-white/35 text-xs mb-1 uppercase tracking-wide">{item.label}</div>
                        <div className="font-semibold text-sm text-white/85">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Concepts + Explanation */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* SMC Concepts */}
                    <div className="rounded-2xl p-5"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-cyan-400" />
                        Aniqlangan SMC strukturalar
                      </h3>
                      {result.concepts.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.concepts.map(c => (
                            <span key={c} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                              style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.15)', color: '#67e8f9' }}>
                              <CheckCircle size={10} className="text-cyan-400" />
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/30 text-sm">Aniq struktura aniqlanmadi</p>
                      )}
                    </div>

                    {/* AI Explanation */}
                    <div className="rounded-2xl p-5"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                        <Brain size={14} className="text-cyan-400" />
                        AI tahlil izohi
                      </h3>
                      <p className="text-white/55 text-sm leading-relaxed">{result.explanation}</p>
                    </div>
                  </div>

                  {/* Analyze another */}
                  <div className="flex justify-center pt-2">
                    <button onClick={clearFile}
                      className="flex items-center gap-2 text-sm text-white/35 hover:text-white/65 transition-colors">
                      <Upload size={14} /> Boshqa chart yuklash
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      </main>
    </div>
  )
}
