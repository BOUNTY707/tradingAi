import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, LogIn, UserPlus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props { onClose: () => void }

export default function LoginRequiredModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/75 backdrop-blur-xl"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(160deg,rgba(9,9,16,0.99),rgba(13,9,22,0.99))',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,245,255,0.05)',
        }}>

        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/8 border border-white/8 transition-colors">
          <X size={14} className="text-white/40" />
        </button>

        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center mx-auto mb-5"
          style={{ boxShadow: '0 8px 32px rgba(0,245,255,0.2)' }}>
          <TrendingUp size={28} className="text-white" />
        </div>

        <h3 className="text-xl font-bold mb-2">Avval tizimga kiring</h3>
        <p className="text-white/45 text-sm leading-relaxed mb-8">
          Dashboard va to'lov imkoniyatlaridan foydalanish uchun hisobingizga kiring yoki ro'yxatdan o'ting.
        </p>

        <div className="space-y-3">
          <Link to="/login" onClick={onClose}>
            <Button size="lg" className="w-full !rounded-2xl gap-2">
              <LogIn size={16} />
              Kirish
            </Button>
          </Link>
          <Link to="/register" onClick={onClose}>
            <Button variant="secondary" size="lg" className="w-full !rounded-2xl gap-2">
              <UserPlus size={16} />
              Ro'yxatdan o'tish
            </Button>
          </Link>
        </div>

        <p className="text-white/20 text-xs mt-5">
          Ro'yxatdan o'tish bepul
        </p>
      </motion.div>
    </div>
  )
}
