import { motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { TrendingUp, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    setError('')
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch {
      setError('Invalid or expired reset link. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="text-center">
          <p className="text-white/50 mb-4">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300 text-sm">
            Request a new one
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">TradeAI</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Create new password</h1>
          <p className="text-white/40 text-sm">Choose a strong password for your account</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/5">
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Password updated!</h3>
              <p className="text-white/50 text-sm">Redirecting you to sign in...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full glass rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-cyan-500/50 border border-white/5 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/50 border border-white/5 transition-colors"
                />
              </div>

              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <div
                        key={n}
                        className={`flex-1 h-1 rounded-full transition-colors ${
                          password.length >= n * 2
                            ? n <= 1 ? 'bg-red-500' : n <= 2 ? 'bg-yellow-500' : n <= 3 ? 'bg-blue-500' : 'bg-green-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/30">
                    {password.length < 4 ? 'Too weak' : password.length < 6 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Set New Password
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
