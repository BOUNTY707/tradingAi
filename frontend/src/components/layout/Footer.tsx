import { TrendingUp, Send, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const LINKS = [
  {
    title: 'Mahsulot',
    items: [
      { label: 'Imkoniyatlar', href: '/#features' },
      { label: 'Signallar',    href: '/signals'   },
      { label: 'Narxlar',      href: '/pricing'   },
      { label: 'Dashboard',    href: '/dashboard' },
    ],
  },
  {
    title: 'Kompaniya',
    items: [
      { label: 'Biz haqimizda', href: '/#about'  },
      { label: 'Blog',          href: '#'         },
      { label: 'Ish o\'rinlari', href: '#'        },
      { label: 'Aloqa',         href: '#'         },
    ],
  },
  {
    title: 'Huquqiy',
    items: [
      { label: 'Maxfiylik',    href: '#' },
      { label: 'Shartlar',     href: '#' },
      { label: 'Cookie',       href: '#' },
      { label: 'Disclaimer',   href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 pt-20 pb-10">
      {/* Top glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="font-black text-xl gradient-text">TradeAI</span>
            </Link>
            <p className="text-white/35 text-sm leading-relaxed mb-6 max-w-xs">
              Institutional AI savdo intellekti — zamonaviy treyderlar uchun. Har 30 daqiqada yangi real signallar.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {[
                { Icon: ExternalLink, href: '#', label: 'Twitter'  },
                { Icon: Send,         href: '#', label: 'Telegram' },
                { Icon: ExternalLink, href: '#', label: 'GitHub'   },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  aria-label={label}>
                  <Icon size={15} className="text-white/40 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {LINKS.map(col => (
            <div key={col.title}>
              <div className="font-bold text-sm text-white mb-5">{col.title}</div>
              <ul className="space-y-3">
                {col.items.map(item => (
                  <li key={item.label}>
                    {item.href.startsWith('/#')
                      ? <a href={item.href} className="text-white/40 hover:text-white/75 text-sm transition-colors">{item.label}</a>
                      : <Link to={item.href} className="text-white/40 hover:text-white/75 text-sm transition-colors">{item.label}</Link>
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">© 2026 TradeAI. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <p className="text-white/20 text-xs">Savdo xavf talab qiladi. O'tgan natijalar kelajakni kafolatlamaydi.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
