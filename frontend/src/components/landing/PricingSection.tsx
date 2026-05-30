import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

const plans = [
  {
    name: '1 Oylik',
    price: '100 000',
    period: 'so\'m',
    usd: '~$8/oy',
    description: 'Boshlash uchun qulay',
    features: ['Cheksiz AI signallar', 'Barcha bozorlar', 'Asosiy tahlil', 'Email qo\'llab-quvvatlash'],
    cta: 'Boshlash',
    popular: false,
  },
  {
    name: '3 Oylik',
    price: '250 000',
    period: 'so\'m',
    usd: '~$20 / 3 oy',
    description: 'Ko\'pchilik tanlov',
    features: ['Cheksiz signallar', 'Crypto + Forex + Stocks', 'Smart Money tahlili', 'AI chat assistant', 'Ustuvor qo\'llab-quvvatlash', 'Kengaytirilgan SMC'],
    cta: 'Pro olish',
    popular: true,
  },
  {
    name: '12 Oylik',
    price: '999 000',
    period: 'so\'m',
    usd: '~$80 / yil',
    description: 'Maksimal tejamkorlik',
    features: ['3 Oylikdagi hamma narsa', 'API kirish', 'Webhook signallar', 'Portfolio kuzatish', 'Maxsus AI strategiyalar', 'Shaxsiy menejger'],
    cta: 'Elite olish',
    popular: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Oddiy, <span className="gradient-text">Shaffof Narxlar</span>
          </h2>
          <p className="text-white/50">Click, Payme, Uzum yoki Karta orqali to'lang.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass rounded-2xl p-8 border relative ${plan.popular ? 'border-cyan-500/40 glow-neon' : 'border-white/5'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Zap size={10} /> Tavsiya etiladi
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-white/40 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-white/40">{plan.period}</span>
                </div>
                <div className="text-xs text-white/30 mt-1">{plan.usd}</div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <Check size={14} className="text-cyan-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing">
                <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
