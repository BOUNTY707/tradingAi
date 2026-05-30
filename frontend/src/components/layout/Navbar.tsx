import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TrendingUp, Zap, Menu, X, LayoutDashboard, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import PaymentGateModal from '@/components/payment/PaymentGateModal'
import LoginRequiredModal from '@/components/payment/LoginRequiredModal'

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative glass rounded-2xl p-8 border border-white/10 max-w-sm w-full mx-4 z-10 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <LogOut size={22} className="text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-center mb-2">Chiqmoqchimisiz?</h3>
        <p className="text-white/50 text-sm text-center mb-7 leading-relaxed">
          Hisobingizdan chiqib ketmoqchimisiz?<br />
          <span className="text-white/30 text-xs">Qayta kirish uchun parolingiz kerak bo'ladi.</span>
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 glass rounded-xl py-3 text-sm font-medium hover:bg-white/8 transition-colors border border-white/8">
            Bekor qilish
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl py-3 text-sm font-medium transition-colors">
            Ha, chiqish
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Signals',  href: '/signals'   },
  { label: 'Pricing',  href: '/pricing'   },
  { label: 'About',    href: '/#about'    },
]

export default function Navbar() {
  const [open,        setOpen]        = useState(false)
  const [showGate,    setShowGate]    = useState(false)
  const [showLogout,  setShowLogout]  = useState(false)
  const [showLogin,   setShowLogin]   = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const confirmLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    navigate('/')
    setOpen(false)
    setShowLogout(false)
  }

  const handleDashboard = () => {
    setOpen(false)
    if (!isAuthenticated) {
      setShowLogin(true)
    } else if (!user?.isApproved) {
      setShowGate(true)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">TradeAI</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(item => (
              item.href.startsWith('/#')
                ? <a key={item.label} href={item.href}
                    className="text-white/60 hover:text-white text-sm transition-colors">
                    {item.label}
                  </a>
                : <Link key={item.label} to={item.href}
                    className="text-white/60 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button onClick={handleDashboard}>
                  <Button size="sm" className="gap-2">
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Button>
                </button>
                <button onClick={() => setShowLogout(true)}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/register">
                  <Button size="sm">
                    <Zap size={14} />
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white/70" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-4">
              {NAV_LINKS.map(item => (
                item.href.startsWith('/#')
                  ? <a key={item.label} href={item.href} onClick={() => setOpen(false)}
                      className="text-white/60 hover:text-white text-sm">{item.label}</a>
                  : <Link key={item.label} to={item.href} onClick={() => setOpen(false)}
                      className="text-white/60 hover:text-white text-sm">{item.label}</Link>
              ))}
              {isAuthenticated ? (
                <>
                  <button onClick={handleDashboard}>
                    <Button size="sm" className="w-full gap-2">
                      <LayoutDashboard size={14} /> Dashboard
                    </Button>
                  </button>
                  <button onClick={() => { setShowLogout(true); setOpen(false) }}>
                    <Button variant="ghost" size="sm" className="w-full">Chiqish</Button>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {showLogin  && <LoginRequiredModal onClose={() => setShowLogin(false)} />}
        {showGate   && <PaymentGateModal   onClose={() => setShowGate(false)}  />}
        {showLogout && <LogoutModal onConfirm={confirmLogout} onCancel={() => setShowLogout(false)} />}
      </AnimatePresence>
    </>
  )
}
