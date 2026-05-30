import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TrendingUp, Activity, Zap, BarChart3, Wallet, Shield, Settings, User, LogOut, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import api from '@/lib/api'

const NAV_ITEMS = [
  { icon: Activity,   label: 'Overview',     path: '/dashboard' },
  { icon: Zap,        label: 'AI Analysis',  path: '/analysis'  },
  { icon: BarChart3,  label: 'Signals',      path: '/signals'   },
  { icon: Wallet,     label: 'Portfolio',    path: '/portfolio' },
  { icon: Shield,     label: 'Subscription', path: '/pricing'   },
  { icon: Settings,   label: 'Settings',     path: '/settings'  },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuthStore()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Har sahifaga kirganda yangi ma'lumot olish (subscription, isApproved)
  useEffect(() => {
    api.get('/auth/me').then(r => {
      if (r.data?.data) setUser(r.data.data)
    }).catch(() => {})
  }, [setUser])

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <>
      <aside className="w-64 hidden lg:flex flex-col glass border-r border-white/5 p-6 fixed h-full z-40">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
            <TrendingUp size={15} className="text-white" />
          </div>
          <span className="font-bold gradient-text">TradeAI</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.label} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-violet-600/10 text-white border border-cyan-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}>
                <item.icon size={16} className={isActive ? 'text-cyan-400' : ''} />
                {item.label}
              </Link>
            )
          })}

          {/* Admin — faqat ADMIN role uchun */}
          {user?.role === 'ADMIN' && (() => {
            const isActive = location.pathname === '/admin'
            return (
              <>
                <div className="my-2 h-px bg-white/5" />
                <Link to="/admin"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-violet-500/20 to-violet-600/10 text-white border border-violet-500/30'
                      : 'text-violet-400/60 hover:text-violet-300 hover:bg-violet-500/8'
                    }`}>
                  <ShieldCheck size={16} className={isActive ? 'text-violet-400' : 'text-violet-400/60'} />
                  Admin Panel
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    SUPER
                  </span>
                </Link>
              </>
            )
          })()}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shrink-0">
              <User size={13} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Pro Trader'}
              </div>
              <div className="text-xs flex items-center gap-1.5">
                {user?.subscription?.status === 'ACTIVE'
                  ? <><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /><span className="text-green-400 font-semibold">{user.subscription.plan?.name ?? 'Pro'}</span></>
                  : <span className="text-white/35">Free Plan</span>
                }
              </div>
            </div>
            <LogOut size={14} className="text-white/30 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative glass rounded-2xl p-8 border border-white/10 max-w-sm w-full mx-4 z-10 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <LogOut size={22} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">Chiqmoqchimisiz?</h3>
            <p className="text-white/50 text-sm text-center mb-7 leading-relaxed">
              Hisobingizdan chiqib ketmoqchimisiz?<br />
              <span className="text-white/30 text-xs">Qayta kirish uchun parolingiz kerak bo'ladi.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 glass rounded-xl py-3 text-sm font-medium hover:bg-white/8 transition-colors border border-white/8"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl py-3 text-sm font-medium transition-colors"
              >
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
