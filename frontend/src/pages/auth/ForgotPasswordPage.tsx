import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { TrendingUp, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />

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
          <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
          <p className="text-white/40 text-sm">Enter your email to receive a reset link</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/5">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Check your inbox</h3>
              <p className="text-white/50 text-sm mb-6">
                We sent a reset link to <span className="text-white">{email}</span>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">Email address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full glass rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-cyan-500/50 border border-white/5 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        {!sent && (
          <p className="text-center mt-6 text-white/40 text-sm">
            Remember your password?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link>
          </p>
        )}
      </motion.div>
    </div>
  )
}
