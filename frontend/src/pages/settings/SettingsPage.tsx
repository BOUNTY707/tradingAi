import { motion } from 'framer-motion'
import { useState } from 'react'
import { User, Bell, Shield, Palette, Globe, Save, Eye, EyeOff, Check, Loader2, AlertCircle } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import PageBackground from '@/components/ui/PageBackground'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'
import { applyTheme } from '@/hooks/useTheme'

const TABS = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'preferences', icon: Globe, label: 'Preferences' },
] as const

type Tab = typeof TABS[number]['id']

const DEFAULT_NOTIFS = { signals: true, email: true, browser: false, highConf: true, dailySummary: false }
const DEFAULT_PREFS = { currency: 'USD', timezone: 'UTC+5', language: 'English', defaultMarket: 'Crypto', defaultTimeframe: '4H', minConfidence: '80' }
const DEFAULT_APPEARANCE = { theme: 'dark', accentColor: '#00f5ff' }

const THEMES = [
  { id: 'dark', name: 'Dark (Default)', bg: '#050508', accent: '#00f5ff' },
  { id: 'midnight', name: 'Midnight', bg: '#0a0a15', accent: '#7c3aed' },
  { id: 'deepspace', name: 'Deep Space', bg: '#020208', accent: '#00ff88' },
]
const ACCENT_COLORS = ['#00f5ff', '#7c3aed', '#00ff88', '#f59e0b', '#ef4444']

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Profile
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')

  // Security
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showNew, setShowNew] = useState(false)

  // Notifications
  const [notifs, setNotifs] = useState({ ...DEFAULT_NOTIFS, ...user?.settings?.notifications })

  // Appearance
  const [appearance, setAppearance] = useState({ ...DEFAULT_APPEARANCE, ...user?.settings?.appearance })

  // Preferences
  const [prefs, setPrefs] = useState({ ...DEFAULT_PREFS, ...user?.settings?.preferences })

  const showSuccess = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleProfileSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('First name and last name are required')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const updated = await authService.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() })
      setUser(updated)
      showSuccess()
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('All password fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      await authService.changePassword({ currentPassword, newPassword, confirmPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showSuccess()
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleNotifsSave = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const updated = await authService.updateSettings({ ...user?.settings, notifications: notifs })
      if (user) setUser({ ...user, settings: updated })
      showSuccess()
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to save notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleAppearanceSave = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const updated = await authService.updateSettings({ ...user?.settings, appearance })
      if (user) setUser({ ...user, settings: updated })
      showSuccess()
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to save appearance')
    } finally {
      setLoading(false)
    }
  }

  const handlePrefsSave = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const updated = await authService.updateSettings({ ...user?.settings, preferences: prefs })
      if (user) setUser({ ...user, settings: updated })
      showSuccess()
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  const onTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setErrorMsg('')
    setSaved(false)
  }

  const SaveBtn = ({ onClick }: { onClick: () => void }) => (
    <Button onClick={onClick} size="lg" disabled={loading}>
      {loading ? (
        <><Loader2 size={15} className="animate-spin" /> Saving...</>
      ) : saved ? (
        <><Check size={15} /> Saved!</>
      ) : (
        <><Save size={15} /> Save Changes</>
      )}
    </Button>
  )

  return (
    <div className="min-h-screen bg-[#020206] flex relative">
      <PageBackground />
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 relative" style={{ zIndex: 1 }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">
          {/* Sidebar tabs */}
          <div className="lg:w-52 shrink-0">
            <div className="glass rounded-2xl p-2 border border-white/5">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/15 to-violet-600/10 text-white border border-cyan-500/20'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}>
                  <tab.icon size={15} className={activeTab === tab.id ? 'text-cyan-400' : ''} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>

              {/* Error banner */}
              {errorMsg && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle size={14} />
                  {errorMsg}
                </div>
              )}

              {/* Profile */}
              {activeTab === 'profile' && (
                <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
                  <h2 className="font-semibold text-lg">Profile Information</h2>

                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white">
                      {(firstName?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{firstName} {lastName}</p>
                      <p className="text-xs text-white/40">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/40 mb-2">First Name</label>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)}
                        className="w-full glass rounded-xl px-4 py-3 text-sm border border-white/5 outline-none focus:border-cyan-500/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-2">Last Name</label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)}
                        className="w-full glass rounded-xl px-4 py-3 text-sm border border-white/5 outline-none focus:border-cyan-500/50 transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-white/40 mb-2">Email</label>
                      <input value={user?.email || ''} disabled
                        className="w-full glass rounded-xl px-4 py-3 text-sm border border-white/5 outline-none opacity-50 cursor-not-allowed" />
                    </div>
                  </div>

                  <SaveBtn onClick={handleProfileSave} />
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
                  <h2 className="font-semibold text-lg">Notification Settings</h2>

                  <div className="space-y-4">
                    {[
                      { key: 'signals', label: 'New AI Signals', desc: 'Get notified when new signals are generated' },
                      { key: 'email', label: 'Email Notifications', desc: 'Receive signals and updates via email' },
                      { key: 'browser', label: 'Browser Push Notifications', desc: 'Real-time browser notifications' },
                      { key: 'highConf', label: 'High Confidence Only (90%+)', desc: 'Only notify for signals with 90%+ confidence' },
                      { key: 'dailySummary', label: 'Daily Summary', desc: 'Daily performance and signal recap email' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                        <div>
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs text-white/40 mt-0.5">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                          className={`w-12 h-6 rounded-full transition-all relative ${notifs[item.key as keyof typeof notifs] ? 'bg-cyan-500' : 'bg-white/10'}`}>
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifs[item.key as keyof typeof notifs] ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <SaveBtn onClick={handleNotifsSave} />
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
                  <h2 className="font-semibold text-lg">Security</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-white/40 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full glass rounded-xl px-4 py-3 pr-10 text-sm border border-white/5 outline-none focus:border-cyan-500/50 transition-colors" />
                        <button onClick={() => setShowPass(!showPass)} type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full glass rounded-xl px-4 py-3 pr-10 text-sm border border-white/5 outline-none focus:border-cyan-500/50 transition-colors" />
                        <button onClick={() => setShowNew(!showNew)} type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                          {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full glass rounded-xl px-4 py-3 text-sm border border-white/5 outline-none focus:border-cyan-500/50 transition-colors" />
                    </div>
                  </div>

                  <div className="glass rounded-xl p-4 border border-yellow-500/20">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-1">
                      <Shield size={14} />
                      Two-Factor Authentication
                    </div>
                    <p className="text-white/40 text-xs">2FA is currently disabled. Enable it for extra security.</p>
                    <button className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                      Enable 2FA →
                    </button>
                  </div>

                  <Button onClick={handlePasswordSave} size="lg" disabled={loading}>
                    {loading ? (
                      <><Loader2 size={15} className="animate-spin" /> Updating...</>
                    ) : saved ? (
                      <><Check size={15} /> Updated!</>
                    ) : (
                      <><Save size={15} /> Update Password</>
                    )}
                  </Button>
                </div>
              )}

              {/* Appearance */}
              {activeTab === 'appearance' && (
                <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
                  <h2 className="font-semibold text-lg">Appearance</h2>

                  <div>
                    <label className="block text-xs text-white/40 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {THEMES.map(theme => (
                        <button key={theme.id}
                          onClick={() => {
                            setAppearance(a => ({ ...a, theme: theme.id }))
                            applyTheme(theme.id, appearance.accentColor)
                          }}
                          className={`glass rounded-xl p-4 border text-center transition-all ${appearance.theme === theme.id ? 'border-cyan-500/40' : 'border-white/5 hover:border-white/15'}`}>
                          <div className="w-full h-8 rounded-lg mb-3 border border-white/10"
                            style={{ background: `linear-gradient(135deg, ${theme.bg}, ${theme.accent}20)` }} />
                          <div className="text-xs text-white/60">{theme.name}</div>
                          {appearance.theme === theme.id && <div className="text-xs text-cyan-400 mt-1">Active</div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 mb-3">Accent Color</label>
                    <div className="flex gap-3">
                      {ACCENT_COLORS.map(color => (
                        <button key={color}
                          onClick={() => {
                            setAppearance(a => ({ ...a, accentColor: color }))
                            applyTheme(appearance.theme, color)
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${appearance.accentColor === color ? 'border-white scale-110' : 'border-transparent hover:border-white/40'}`}
                          style={{ background: color }} />
                      ))}
                    </div>
                  </div>

                  <SaveBtn onClick={handleAppearanceSave} />
                </div>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
                  <h2 className="font-semibold text-lg">Trading Preferences</h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: 'currency', label: 'Display Currency', options: ['USD', 'EUR', 'UZS', 'BTC'] },
                      { key: 'timezone', label: 'Timezone', options: ['UTC+5', 'UTC+0', 'UTC+3', 'UTC-5', 'UTC+8'] },
                      { key: 'language', label: 'Language', options: ['English', "O'zbek", 'Русский'] },
                      { key: 'defaultMarket', label: 'Default Market', options: ['Crypto', 'Forex', 'Stocks', 'Metals'] },
                      { key: 'defaultTimeframe', label: 'Default Timeframe', options: ['1H', '4H', '1D', '1W'] },
                      { key: 'minConfidence', label: 'Min. Confidence Filter', options: ['70', '75', '80', '85', '90'] },
                    ].map(item => (
                      <div key={item.key}>
                        <label className="block text-xs text-white/40 mb-2">{item.label}</label>
                        <select
                          value={prefs[item.key as keyof typeof prefs]}
                          onChange={e => setPrefs(p => ({ ...p, [item.key]: e.target.value }))}
                          className="w-full glass rounded-xl px-4 py-3 text-sm border border-white/5 outline-none bg-transparent">
                          {item.options.map(o => <option key={o} value={o} className="bg-[#0a0a0f]">{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  <SaveBtn onClick={handlePrefsSave} />
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
