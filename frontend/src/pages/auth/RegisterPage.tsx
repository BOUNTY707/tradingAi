import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Parol kamida 8 ta belgidan iborat bo\'lishi kerak'); return }
    setLoading(true)
    setError('')
    try {
      const result = await authService.register(form)
      setAuth(result.user, result.token)
      navigate('/')  // Landing page — to'lov kerak
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik.')
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      setError('')
      try {
        const result = await authService.loginWithGoogle(tokenResponse.access_token)
        setAuth(result.user, result.token)
        if (result.user?.isApproved) {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Google orqali kirish amalga oshmadi.')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => {
      setError('Google login bekor qilindi yoki xatolik yuz berdi.')
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden py-12">
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">TradeAI</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-white/40 text-sm">Hisob yarating va savdoni boshlang</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/5">
          <button
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3 text-sm font-medium hover:bg-white/5 active:scale-[0.98] transition-all border border-white/8 mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="w-4 h-4 animate-spin text-white/50" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Signing up...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">First Name</label>
                <input type="text" value={form.firstName} onChange={set('firstName')} placeholder="John" required
                  className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/50 border border-white/5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">Last Name</label>
                <input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Doe" required
                  className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/50 border border-white/5" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required
                className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/50 border border-white/5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required
                className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/50 border border-white/5" />
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" required className="mt-1" />
              <label className="text-xs text-white/40">
                I agree to the{' '}
                <Link to="/terms" className="text-cyan-400">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-cyan-400">Privacy Policy</Link>
              </label>
            </div>

            {error && (
              <div className="glass rounded-xl px-4 py-3 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account — Free Trial
            </Button>
          </form>
        </div>
        <p className="text-center mt-6 text-white/40 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
