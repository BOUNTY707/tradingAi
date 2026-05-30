import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'AI signallar qanday hosil qilinadi?',
    a: 'Bizning AI bir vaqtda bir nechta vaqt oraliqlarida narx harakati, hajm, order flow va smart money kontseptsiyalarini tahlil qiladi. U institutional naqshlarni, likvidlik sweeplarini va BOS/CHOCH tuzilmalarini aniqlab, yuqori ishonchli signallar yaratadi.',
  },
  {
    q: 'Qaysi bozorlar qo\'llab-quvvatlanadi?',
    a: 'Biz Cryptocurrency (100+ juftlik), Forex (asosiy, kichik va ekzotik juftliklar) va Aksiyalarni (AQSh va xalqaro) qamrab olamiz. Barcha bozorlar 24/7 tahlil qilinadi.',
  },
  {
    q: 'Nima uchun faqat 80%+ ishonch signallari?',
    a: 'Pastroq ishonch signallari juda ko\'p shovqin yaratadi va ortiqcha savdoga olib keladi. 80%+ ga filtrlab, faqat qat\'iy sifat standartlarimizga mos keladigan yuqori ehtimollik signallarini ko\'rasiz.',
  },
  {
    q: 'Bepul sinov bormi?',
    a: 'Ha! 7 kunlik bepul Pro sinovi bilan boshlang. Kredit karta talab qilinmaydi. Barcha imkoniyatlarga ega bo\'ling va nima uchun 12,000+ treyder TradeAI ga ishonishini ko\'ring.',
  },
  {
    q: 'Mobil qurilmada ishlaydimi?',
    a: 'Albatta. TradeAI to\'liq moslashuvchan va barcha qurilmalarda ishlaydi. Signallarni hech qachon o\'tkazib yubormasligingiz uchun mobil push bildirishnomalarini ham taklif etamiz.',
  },
  {
    q: 'To\'lov qanday amalga oshiriladi?',
    a: 'O\'zbekistondagi barcha mashhur to\'lov tizimlari orqali to\'lash mumkin: Click, Payme, Uzum Bank va bank kartasi. To\'lovni tasdiqlash uchun screenshot yuklashingiz kifoya — 1-2 soat ichida hisobingiz faollashtiriladi.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-28">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            Ko'p so'raladigan <span className="gradient-text">savollar</span>
          </h2>
          <p className="text-white/40">Javob topolmadingizmi? Biz bilan bog'laning.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: isOpen ? 'rgba(0,245,255,0.04)' : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isOpen ? 'rgba(0,245,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
                }}>

                <button onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-white/2 transition-colors">
                  <span className={`text-sm font-semibold leading-snug transition-colors ${isOpen ? 'text-white' : 'text-white/70'}`}>
                    {faq.q}
                  </span>
                  <span className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: isOpen ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {isOpen
                      ? <Minus size={13} className="text-cyan-400" />
                      : <Plus  size={13} className="text-white/40" />
                    }
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm text-white/50 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
