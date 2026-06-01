import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export const THEME_BG: Record<string, { bg: string; surface: string }> = {
  dark:      { bg: '#050508', surface: '#0a0a0f' },
  midnight:  { bg: '#0a0a15', surface: '#0f0f20' },
  deepspace: { bg: '#020208', surface: '#08080f' },
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function applyTheme(theme: string, accentColor: string) {
  const t = THEME_BG[theme] ?? THEME_BG.dark
  const [r, g, b] = hexToRgb(accentColor)

  document.documentElement.style.setProperty('--bg-main', t.bg)
  document.documentElement.style.setProperty('--bg-surface', t.surface)
  document.documentElement.style.setProperty('--accent', accentColor)
  document.documentElement.style.setProperty('--accent-rgb', `${r},${g},${b}`)

  let el = document.getElementById('dynamic-theme')
  if (!el) {
    el = document.createElement('style')
    el.id = 'dynamic-theme'
    document.head.appendChild(el)
  }

  el.textContent = `
    body { background: ${t.bg} !important; }

    /* Background overrides */
    .bg-\\[\\#050508\\] { background-color: ${t.bg} !important; }
    .bg-\\[\\#0a0a15\\] { background-color: ${t.bg} !important; }
    .bg-\\[\\#020208\\] { background-color: ${t.bg} !important; }

    /* Accent text */
    .text-cyan-400 { color: ${accentColor} !important; }
    .text-cyan-300 { color: ${accentColor} !important; }
    .hover\\:text-cyan-300:hover { color: ${accentColor} !important; }
    .hover\\:text-cyan-400:hover { color: ${accentColor} !important; }

    /* Accent backgrounds */
    .bg-cyan-500 { background-color: ${accentColor} !important; }
    .bg-cyan-500\\/10 { background-color: rgba(${r},${g},${b},0.1) !important; }
    .bg-cyan-500\\/20 { background-color: rgba(${r},${g},${b},0.2) !important; }
    .hover\\:bg-cyan-500\\/10:hover { background-color: rgba(${r},${g},${b},0.1) !important; }

    /* Accent borders */
    .border-cyan-500 { border-color: ${accentColor} !important; }
    .border-cyan-500\\/20 { border-color: rgba(${r},${g},${b},0.2) !important; }
    .border-cyan-500\\/40 { border-color: rgba(${r},${g},${b},0.4) !important; }
    .border-cyan-500\\/50 { border-color: rgba(${r},${g},${b},0.5) !important; }
    .focus\\:border-cyan-500\\/50:focus { border-color: rgba(${r},${g},${b},0.5) !important; }

    /* Gradient: buttons (from-cyan-500 to-violet-600) */
    .bg-gradient-to-r.from-cyan-500 {
      background-image: linear-gradient(to right, ${accentColor}, #7c3aed) !important;
    }
    .hover\\:from-cyan-400:hover {
      background-image: linear-gradient(to right, ${accentColor}, #6d28d9) !important;
    }
    /* Sidebar active gradient */
    .from-cyan-500\\/15 { --tw-gradient-from: rgba(${r},${g},${b},0.15) !important; }

    /* Ring */
    .ring-cyan-500 { --tw-ring-color: ${accentColor} !important; }

    /* Glow & gradient text */
    .glow-neon { box-shadow: 0 0 20px rgba(${r},${g},${b},0.3) !important; }
    .gradient-text {
      background: linear-gradient(135deg, ${accentColor}, #7c3aed) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
  `
}

export function useTheme() {
  const user = useAuthStore(s => s.user)
  useEffect(() => {
    const a = user?.settings?.appearance
    applyTheme(a?.theme ?? 'dark', a?.accentColor ?? '#00f5ff')
  }, [user?.settings?.appearance])
}
