import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import {
  Users, TrendingUp, Activity, Shield,
  LogOut, CreditCard, CheckCircle, XCircle,
  Clock, RefreshCw, Eye, KeyRound, UserCheck, UserX, Search, Info,
  DollarSign, BarChart2, UserPlus, Wallet,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import api from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────

interface PaymentRequest {
  id: string
  userId: string
  planName: string
  amount: number
  method: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  note: string | null
  createdAt: string
  hasScreenshot: boolean
  user: { id: string; email: string; firstName: string; lastName: string; isApproved: boolean }
}

interface UserRow {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isApproved: boolean
  createdAt: string
  subscription?: { status: string; plan?: { name: string }; endDate?: string } | null
}

interface Stats {
  totalUsers: number
  approvedUsers: number
  activeSubscriptions: number
  totalSignals: number
  pendingPayments: number
  approvedPayments: number
  totalRevenue: number
  revenueThisMonth: number
  revenueLastMonth: number
  revenueByPlan: Record<string, { count: number; amount: number }>
  newUsersThisMonth: number
  newUsersLastMonth: number
  revenueByDay:   { label: string; amount: number; count: number }[]
  revenueByMonth: { label: string; amount: number; count: number }[]
  revenueByYear:  { label: string; amount: number; count: number }[]
  usersByDay:     { label: string; count: number }[]
  usersByMonth:   { label: string; count: number }[]
  usersByYear:    { label: string; count: number }[]
}

const STATUS_COLOR = {
  PENDING:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  APPROVED: 'bg-green-500/15  text-green-400  border-green-500/20',
  REJECTED: 'bg-red-500/15    text-red-400    border-red-500/20',
}

// ─── Screenshot modal ─────────────────────────────────────────────

function ScreenshotModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [img, setImg] = useState<string | null>(null)
  useEffect(() => {
    api.get(`/admin/payments/${id}`).then(r => {
      const ss = r.data.data?.screenshot
      if (ss) setImg(`data:image/jpeg;base64,${ss}`)
    }).catch(() => {})
  }, [id])
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} />
      <div className="relative z-10 max-w-2xl w-full rounded-2xl overflow-hidden border border-white/10">
        {img
          ? <img src={img} alt="screenshot" className="w-full max-h-[80vh] object-contain bg-[#0a0a12]" />
          : <div className="h-48 flex items-center justify-center text-white/30">Yuklanmoqda...</div>}
        <button onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-black/70 rounded-xl flex items-center justify-center border border-white/10">
          <XCircle size={15} className="text-white/60" />
        </button>
      </div>
    </div>
  )
}

// ─── User Profile Modal ───────────────────────────────────────────

function UserProfileModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'rgba(9,9,16,0.99)', border: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/7">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-600/30 flex items-center justify-center text-xl font-black text-white/80">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="font-bold text-base">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-white/40 mt-0.5">{user.email}</div>
            </div>
            <button onClick={onClose}
              className="ml-auto w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/8 border border-white/8">
              <XCircle size={14} className="text-white/40" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          {[
            { label: 'Email',        value: user.email,     mono: true  },
            { label: 'Role',         value: user.role,      mono: false },
            { label: 'Status',
              value: user.isApproved ? '✅ Tasdiqlangan' : '⏳ Tasdiqlanmagan',
              mono: false },
            { label: 'Obuna',
              value: user.subscription?.status === 'ACTIVE'
                ? `✅ ${user.subscription.plan?.name ?? 'Pro'} (${user.subscription.endDate ? new Date(user.subscription.endDate).toLocaleDateString('uz-UZ') : ''})`
                : '❌ Yo\'q',
              mono: false },
            { label: "Ro'yxat sanasi",
              value: new Date(user.createdAt).toLocaleString('uz-UZ', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
              mono: false },
          ].map(row => (
            <div key={row.label} className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
              <span className="text-xs text-white/40 shrink-0 w-28">{row.label}</span>
              <span className={`text-sm text-right ${row.mono ? 'font-mono text-white/70' : 'text-white/85 font-medium'}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5">
          <div className="rounded-xl px-4 py-3 text-xs text-white/30 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            Parollar xavfsizlik sababli ko'rsatilmaydi
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Reset Password Modal ─────────────────────────────────────────

function ResetPasswordModal({ user, onClose, onDone }: {
  user: UserRow; onClose: () => void; onDone: () => void
}) {
  const [newPass, setNewPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const submit = async () => {
    if (newPass.length < 6) { setError('Kamida 6 ta belgi'); return }
    setLoading(true); setError('')
    try {
      await api.post(`/admin/users/${user.id}/reset-password`, { newPassword: newPass })
      setDone(true)
      setTimeout(() => { onDone(); onClose() }, 1500)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Xatolik')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm rounded-2xl p-7"
        style={{ background: 'rgba(9,9,16,0.99)', border: '1px solid rgba(255,255,255,0.1)' }}>

        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center mx-auto mb-5">
          <KeyRound size={22} className="text-violet-400" />
        </div>

        {done ? (
          <div className="text-center">
            <CheckCircle size={28} className="text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-semibold">Parol yangilandi!</p>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-center mb-1">Parolni yangilash</h3>
            <p className="text-white/40 text-xs text-center mb-5">{user.email}</p>

            <label className="block text-xs text-white/40 mb-2">Yangi parol</label>
            <input
              type="text"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Yangi parolni kiriting"
              className="w-full glass rounded-xl px-4 py-3 text-sm border border-white/8 outline-none focus:border-violet-500/50 mb-4 font-mono"
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 glass rounded-xl py-2.5 text-sm border border-white/8 hover:bg-white/5 transition-colors">
                Bekor
              </button>
              <button onClick={submit} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}>
                {loading ? '...' : 'Saqlash'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  type Tab = 'overview' | 'payments' | 'users'
  const [activeTab,   setActiveTab]   = useState<Tab>('overview')
  const [stats,       setStats]       = useState<Stats | null>(null)
  const [payments,    setPayments]    = useState<PaymentRequest[]>([])
  const [users,       setUsers]       = useState<UserRow[]>([])
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState<'PENDING'|'APPROVED'|'REJECTED'|'ALL'>('PENDING')
  const [loading,     setLoading]     = useState(true)
  const [viewId,      setViewId]      = useState<string | null>(null)
  const [resetUser,   setResetUser]   = useState<UserRow | null>(null)
  const [profileUser, setProfileUser] = useState<UserRow | null>(null)
  const [processing,   setProcessing]  = useState<string | null>(null)
  const [revPeriod,    setRevPeriod]   = useState<'day'|'month'|'year'>('month')
  const [userPeriod,   setUserPeriod]  = useState<'day'|'month'|'year'>('month')
  const actionNote = ''

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, pRes, uRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/payments'),
        api.get('/admin/users'),
      ])
      setStats(sRes.data.data)
      setPayments(pRes.data.data)
      setUsers(uRes.data.data?.users ?? [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout(); navigate('/')
  }

  const approve = async (id: string) => {
    setProcessing(id)
    try {
      await api.post(`/admin/payments/${id}/approve`, { note: actionNote })
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED', user: { ...p.user, isApproved: true } } : p))
      if (stats) setStats({ ...stats, pendingPayments: Math.max(0, stats.pendingPayments - 1) })
    } catch {}
    finally { setProcessing(null) }
  }

  const reject = async (id: string) => {
    setProcessing(id)
    try {
      await api.post(`/admin/payments/${id}/reject`, { note: actionNote })
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p))
      if (stats) setStats({ ...stats, pendingPayments: Math.max(0, stats.pendingPayments - 1) })
    } catch {}
    finally { setProcessing(null) }
  }

  const toggleApproval = async (u: UserRow) => {
    try {
      await api.post(`/admin/users/${u.id}/toggle-approval`)
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isApproved: !x.isApproved } : x))
    } catch {}
  }

  const filteredPayments = filter === 'ALL' ? payments : payments.filter(p => p.status === filter)
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase())
  )

  const TABS = [
    { id: 'overview'  as Tab, icon: BarChart2,  label: 'Statistika',         badge: undefined              },
    { id: 'payments'  as Tab, icon: CreditCard, label: "To'lovlar",          badge: stats?.pendingPayments },
    { id: 'users'     as Tab, icon: Users,      label: 'Foydalanuvchilar',   badge: undefined              },
  ]

  const fmt = (n: number) => n.toLocaleString('uz-UZ') + ' so\'m'

  return (
    <div className="min-h-screen bg-[#050508] flex">
      {/* Sidebar */}
      <aside className="w-60 hidden lg:flex flex-col glass border-r border-white/5 p-5 fixed h-full z-40">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
            <TrendingUp size={15} className="text-white" />
          </div>
          <span className="font-bold gradient-text">TradeAI Admin</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {TABS.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                ${activeTab === item.id
                  ? 'bg-gradient-to-r from-cyan-500/15 to-violet-600/10 text-white border border-cyan-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={16} className={activeTab === item.id ? 'text-cyan-400' : ''} />
              {item.label}
              {item.badge ? (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <Shield size={13} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">{user?.firstName}</div>
              <div className="text-[10px] text-cyan-400">Super Admin</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 text-sm transition-colors">
            <LogOut size={14} /> Chiqish
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {activeTab === 'overview' ? 'Statistika' : activeTab === 'payments' ? "To'lov so'rovlari" : 'Foydalanuvchilar'}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              {activeTab === 'overview'
                ? `Jami ${stats?.totalUsers ?? 0} foydalanuvchi`
                : activeTab === 'payments'
                ? `${payments.filter(p => p.status === 'PENDING').length} ta kutilmoqda`
                : `${users.length} ta foydalanuvchi`}
            </p>
          </div>
          <button onClick={fetchData}
            className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-sm border border-white/5 hover:bg-white/5 transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin text-cyan-400' : 'text-white/50'} />
            Yangilash
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users,      label: 'Jami foydalanuvchilar',  value: stats?.totalUsers ?? '—',          color: 'text-cyan-400'   },
            { icon: CreditCard, label: "Kutilayotgan to'lovlar",  value: stats?.pendingPayments ?? '—',     color: 'text-yellow-400' },
            { icon: TrendingUp, label: 'Faol signallar',          value: stats?.totalSignals ?? '—',        color: 'text-green-400'  },
            { icon: Activity,   label: 'Faol obunalar',           value: stats?.activeSubscriptions ?? '—', color: 'text-violet-400' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs">{s.label}</span>
                <s.icon size={14} className={s.color} />
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Revenue cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Wallet, label: "Jami daromad", color: 'text-green-400',
                  value: stats ? fmt(stats.totalRevenue) : '—',
                  sub: `${stats?.approvedPayments ?? 0} ta tasdiqlangan to'lov`,
                },
                {
                  icon: DollarSign, label: 'Shu oylik daromad', color: 'text-cyan-400',
                  value: stats ? fmt(stats.revenueThisMonth) : '—',
                  sub: stats && stats.revenueLastMonth > 0
                    ? `O'tgan oy: ${fmt(stats.revenueLastMonth)}`
                    : 'O\'tgan oy: 0',
                },
                {
                  icon: Users, label: "To'lagan mijozlar", color: 'text-violet-400',
                  value: stats?.approvedUsers ?? '—',
                  sub: `Jami ${stats?.totalUsers ?? 0} dan`,
                },
                {
                  icon: UserPlus, label: 'Yangi (shu oy)', color: 'text-yellow-400',
                  value: stats?.newUsersThisMonth ?? '—',
                  sub: `O'tgan oy: ${stats?.newUsersLastMonth ?? 0} ta`,
                },
              ].map((card, i) => (
                <motion.div key={card.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="glass rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/40 text-xs">{card.label}</span>
                    <card.icon size={15} className={card.color} />
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${card.color}`}>{card.value}</div>
                  <div className="text-xs text-white/25">{card.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Revenue chart with period toggle */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-400" /> Daromad
                </h3>
                <div className="flex gap-1 p-1 bg-white/4 rounded-xl border border-white/6">
                  {(['day','month','year'] as const).map(p => (
                    <button key={p} onClick={() => setRevPeriod(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${revPeriod === p ? 'bg-white/12 text-white' : 'text-white/35 hover:text-white/60'}`}>
                      {p === 'day' ? 'Kunlik' : p === 'month' ? 'Oylik' : 'Yillik'}
                    </button>
                  ))}
                </div>
              </div>
              {stats && (() => {
                const data = revPeriod === 'day' ? stats.revenueByDay : revPeriod === 'month' ? stats.revenueByMonth : stats.revenueByYear
                const max = Math.max(...(data ?? []).map(d => d.amount), 1)
                const hasData = (data ?? []).some(d => d.amount > 0)
                // Show fewer labels to avoid clutter
                const step = revPeriod === 'day' ? 5 : 1
                return (
                  <div>
                    <div className="flex items-end gap-1 h-40 mb-2">
                      {(data ?? []).map((d, i) => {
                        const pct = (d.amount / max) * 100
                        const isLast = i === data.length - 1
                        return (
                          <div key={i} className="flex-1 flex flex-col items-end justify-end group relative h-full">
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#0d0d18] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                              <div className="font-bold text-green-400">{d.amount.toLocaleString()} so'm</div>
                              <div className="text-white/40">{d.count} ta to'lov</div>
                              <div className="text-white/30">{d.label}</div>
                            </div>
                            <div className="w-full rounded-t-sm"
                              style={{
                                height: `${Math.max(pct, d.amount > 0 ? 3 : 0)}%`,
                                background: isLast
                                  ? 'linear-gradient(to top,rgba(0,245,255,0.7),rgba(0,245,255,0.25))'
                                  : 'linear-gradient(to top,rgba(124,58,237,0.55),rgba(124,58,237,0.15))',
                                border: isLast ? '1px solid rgba(0,245,255,0.3)' : '1px solid rgba(124,58,237,0.2)',
                              }} />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex gap-1">
                      {(data ?? []).map((d, i) => (
                        <div key={i} className="flex-1 text-center text-[8px] text-white/20 truncate">
                          {i % step === 0 ? d.label.split(' ')[0] : ''}
                        </div>
                      ))}
                    </div>
                    {!hasData && <p className="text-white/20 text-xs text-center mt-4">Hali ma'lumot yo'q</p>}
                  </div>
                )
              })()}
            </motion.div>

            {/* Revenue by plan */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="font-semibold mb-5 flex items-center gap-2">
                <BarChart2 size={16} className="text-cyan-400" /> Reja bo'yicha daromad
              </h3>
              {stats && Object.keys(stats.revenueByPlan).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.revenueByPlan).map(([plan, data]) => {
                    const pct = stats.totalRevenue > 0 ? (data.amount / stats.totalRevenue) * 100 : 0
                    return (
                      <div key={plan}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium">{plan}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/40">{data.count} ta sotildi</span>
                            <span className="text-sm font-bold text-green-400">{fmt(data.amount)}</span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/6">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-600" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-white/25 text-sm text-center py-6">Hali tasdiqlangan to'lov yo'q</p>
              )}
            </motion.div>

            {/* User growth chart */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserPlus size={16} className="text-cyan-400" /> Foydalanuvchi o'sishi
                </h3>
                <div className="flex gap-1 p-1 bg-white/4 rounded-xl border border-white/6">
                  {(['day','month','year'] as const).map(p => (
                    <button key={p} onClick={() => setUserPeriod(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${userPeriod === p ? 'bg-white/12 text-white' : 'text-white/35 hover:text-white/60'}`}>
                      {p === 'day' ? 'Kunlik' : p === 'month' ? 'Oylik' : 'Yillik'}
                    </button>
                  ))}
                </div>
              </div>
              {stats && (() => {
                const data = userPeriod === 'day' ? stats.usersByDay : userPeriod === 'month' ? stats.usersByMonth : stats.usersByYear
                const max = Math.max(...(data ?? []).map(d => d.count), 1)
                const hasData = (data ?? []).some(d => d.count > 0)
                const step = userPeriod === 'day' ? 5 : 1
                const total = (data ?? []).reduce((s, d) => s + d.count, 0)
                return (
                  <div>
                    <div className="text-sm text-white/40 mb-4">
                      Jami: <span className="text-cyan-400 font-bold">{total} ta</span> ro'yxatdan o'tgan
                    </div>
                    <div className="flex items-end gap-1 h-36 mb-2">
                      {(data ?? []).map((d, i) => {
                        const pct = (d.count / max) * 100
                        const isLast = i === data.length - 1
                        return (
                          <div key={i} className="flex-1 flex flex-col items-end justify-end group relative h-full">
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#0d0d18] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                              <div className="font-bold text-cyan-400">{d.count} ta foydalanuvchi</div>
                              <div className="text-white/30">{d.label}</div>
                            </div>
                            <div className="w-full rounded-t-sm"
                              style={{
                                height: `${Math.max(pct, d.count > 0 ? 3 : 0)}%`,
                                background: isLast
                                  ? 'linear-gradient(to top,rgba(0,245,255,0.7),rgba(0,245,255,0.25))'
                                  : 'linear-gradient(to top,rgba(34,197,94,0.5),rgba(34,197,94,0.12))',
                                border: isLast ? '1px solid rgba(0,245,255,0.3)' : '1px solid rgba(34,197,94,0.2)',
                              }} />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex gap-1">
                      {(data ?? []).map((d, i) => (
                        <div key={i} className="flex-1 text-center text-[8px] text-white/20 truncate">
                          {i % step === 0 ? d.label.split(' ')[0] : ''}
                        </div>
                      ))}
                    </div>
                    {!hasData && <p className="text-white/20 text-xs text-center mt-4">Hali ma'lumot yo'q</p>}
                  </div>
                )
              })()}
            </motion.div>

            {/* System stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity size={16} className="text-violet-400" /> Tizim holati
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Faol signallar',    value: stats?.totalSignals ?? '—',        color: 'text-green-400'  },
                  { label: 'Faol obunalar',      value: stats?.activeSubscriptions ?? '—', color: 'text-cyan-400'   },
                  { label: "Kutilayotgan to'lov", value: stats?.pendingPayments ?? '—',    color: 'text-yellow-400' },
                  { label: "Rad etilganlar",
                    value: payments.filter(p => p.status === 'REJECTED').length,           color: 'text-red-400'    },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-4 bg-white/3 border border-white/5 text-center">
                    <div className={`text-2xl font-bold mb-1 ${item.color}`}>{item.value}</div>
                    <div className="text-xs text-white/35">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Payments Tab ── */}
        {activeTab === 'payments' && (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-white/5 flex-wrap">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
                  {f === 'ALL' ? 'Barchasi' : f === 'PENDING' ? 'Kutilmoqda' : f === 'APPROVED' ? 'Tasdiqlangan' : 'Rad etilgan'}
                  {f === 'PENDING' && stats?.pendingPayments ? (
                    <span className="ml-1.5 text-[9px] bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded">{stats.pendingPayments}</span>
                  ) : null}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-16 text-center text-white/30 text-sm">Yuklanmoqda...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-16 text-center">
                <CreditCard size={28} className="text-white/15 mx-auto mb-2" />
                <p className="text-white/30 text-sm">To'lov so'rovlari yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredPayments.map(pr => (
                  <motion.div key={pr.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-5 hover:bg-white/2 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white/70">
                            {pr.user.firstName[0]}{pr.user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{pr.user.firstName} {pr.user.lastName}</div>
                          <div className="text-xs text-white/40 mt-0.5">{pr.user.email}</div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs bg-white/5 px-2 py-1 rounded-lg">{pr.planName}</span>
                            <span className="text-xs text-white/50">{pr.amount.toLocaleString()} so'm</span>
                            <span className="text-xs text-white/40">{pr.method}</span>
                            <span className="text-xs text-white/25 flex items-center gap-1">
                              <Clock size={9} />
                              {new Date(pr.createdAt).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLOR[pr.status]}`}>
                          {pr.status === 'PENDING' ? 'Kutilmoqda' : pr.status === 'APPROVED' ? 'Tasdiqlangan ✓' : 'Rad etildi'}
                        </span>
                        {pr.hasScreenshot && (
                          <button onClick={() => setViewId(pr.id)}
                            className="flex items-center gap-1 text-xs glass px-2.5 py-1 rounded-lg border border-white/8 hover:bg-white/8 transition-colors">
                            <Eye size={11} /> Ko'rish
                          </button>
                        )}
                        {pr.status === 'PENDING' && (
                          <>
                            <button onClick={() => approve(pr.id)} disabled={!!processing}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all disabled:opacity-50"
                              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                              <CheckCircle size={12} />
                              {processing === pr.id ? '...' : 'Tasdiqlash'}
                            </button>
                            <button onClick={() => reject(pr.id)} disabled={!!processing}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all disabled:opacity-50"
                              style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
                              <XCircle size={12} />
                              Rad etish
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            {/* Search */}
            <div className="p-5 border-b border-white/5 flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Email yoki ism bo'yicha qidirish..."
                  className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm border border-white/8 outline-none focus:border-cyan-500/40"
                />
              </div>
              <span className="text-xs text-white/30">{filteredUsers.length} ta</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-white/30 text-sm">Yuklanmoqda...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={28} className="text-white/15 mx-auto mb-2" />
                <p className="text-white/30 text-sm">Foydalanuvchi topilmadi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Foydalanuvchi', 'Email', 'Status', 'Sana', 'Amallar'].map(h => (
                        <th key={h} className="text-left text-xs text-white/30 font-medium px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <motion.tr key={u.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-white/3 hover:bg-white/2 transition-colors group">

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-600/30 flex items-center justify-center text-xs font-bold text-white/70 shrink-0">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <span className="text-sm font-medium">{u.firstName} {u.lastName}</span>
                            {u.role === 'ADMIN' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                                ADMIN
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-sm text-white/50 font-mono">{u.email}</td>

                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${
                            u.isApproved
                              ? 'bg-green-500/15 text-green-400 border-green-500/20'
                              : 'bg-white/5 text-white/30 border-white/10'
                          }`}>
                            {u.isApproved ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-white/30">
                          {new Date(u.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Profile */}
                            <button onClick={() => setProfileUser(u)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition-all"
                              style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', color: '#67e8f9' }}>
                              <Info size={11} /> Profil
                            </button>

                            {/* Reset password */}
                            <button onClick={() => setResetUser(u)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition-all"
                              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                              <KeyRound size={11} /> Parol
                            </button>

                            {/* Toggle approval */}
                            {u.role !== 'ADMIN' && (
                              <button onClick={() => toggleApproval(u)}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition-all"
                                style={u.isApproved
                                  ? { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }
                                  : { background: 'rgba(34,197,94,0.1)',  border: '1px solid rgba(34,197,94,0.25)',  color: '#4ade80'  }
                                }>
                                {u.isApproved ? <><UserX size={11} /> Bloklash</> : <><UserCheck size={11} /> Tasdiqlash</>}
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {viewId      && <ScreenshotModal   id={viewId}     onClose={() => setViewId(null)}    />}
        {profileUser && <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />}
        {resetUser   && (
          <ResetPasswordModal
            user={resetUser}
            onClose={() => setResetUser(null)}
            onDone={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
