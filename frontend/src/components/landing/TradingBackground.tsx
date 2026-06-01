import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number
  alpha: number; size: number; cyan: boolean
}
interface Candle {
  x: number; y: number; speed: number; body: number
  wickT: number; wickB: number; w: number; bull: boolean; alpha: number
  bright: boolean
}

export default function TradingBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let raf: number
    let time = 0
    const particles: Particle[] = []
    const candles: Candle[] = []

    const spawnParticles = (W: number, H: number) => {
      particles.length = 0
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -Math.random() * 0.4 - 0.05,
          alpha: Math.random() * 0.35 + 0.05,
          size: Math.random() * 1.6 + 0.3,
          cyan: Math.random() > 0.4,
        })
      }
    }

    const spawnCandles = (W: number, H: number) => {
      candles.length = 0
      for (let i = 0; i < 40; i++) {
        const bright = Math.random() < 0.15
        candles.push({
          x: Math.random() * W, y: Math.random() * H,
          speed: Math.random() * 0.25 + 0.06,
          body: bright ? Math.random() * 48 + 20 : Math.random() * 32 + 12,
          wickT: bright ? Math.random() * 28 + 10 : Math.random() * 18 + 6,
          wickB: bright ? Math.random() * 22 + 8 : Math.random() * 14 + 5,
          w: bright ? Math.random() * 11 + 6 : Math.random() * 7 + 4,
          bull: Math.random() > 0.45,
          alpha: bright ? Math.random() * 0.2 + 0.6 : Math.random() * 0.45 + 0.18,
          bright,
        })
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      spawnParticles(canvas.width, canvas.height)
      spawnCandles(canvas.width, canvas.height)
    }

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      time += 0.007

      // ── 3D PERSPECTIVE GRID ──────────────────────────────────────────
      const vx = W / 2
      const vy = H * 0.32
      const ROWS = 22
      const COLS = 20
      const gridOff = (time * 0.38) % 1

      for (let i = 0; i < ROWS + 1; i++) {
        const raw = ((i + gridOff) / ROWS) % 1
        if (raw < 0.001) continue
        const t = Math.pow(raw, 2.4)
        const nextRaw = ((i + 1 + gridOff) / ROWS) % 1
        const tNext = nextRaw < 0.001 ? 0 : Math.pow(nextRaw, 2.4)

        const y = vy + (H * 1.25 - vy) * t
        const hw = W * 1.9 * t
        const alpha = Math.min(t * 0.22, 0.18)

        if (y > H * 1.15) continue

        // Horizontal line
        ctx.strokeStyle = `rgba(0,245,255,${alpha})`
        ctx.lineWidth = 0.7
        ctx.beginPath(); ctx.moveTo(vx - hw, y); ctx.lineTo(vx + hw, y); ctx.stroke()

        // Glow on close lines
        if (alpha > 0.12) {
          ctx.strokeStyle = `rgba(0,245,255,${alpha * 0.4})`
          ctx.lineWidth = 2.5
          ctx.beginPath(); ctx.moveTo(vx - hw, y); ctx.lineTo(vx + hw, y); ctx.stroke()
        }

        if (tNext < 0.001) continue
        const yN = vy + (H * 1.25 - vy) * tNext
        const hwN = W * 1.9 * tNext

        // Vertical lines
        ctx.lineWidth = 0.4
        for (let j = 0; j <= COLS; j++) {
          const frac = (j / COLS - 0.5) * 2
          ctx.strokeStyle = `rgba(0,245,255,${alpha * 0.55})`
          ctx.beginPath()
          ctx.moveTo(vx + frac * hw, y)
          ctx.lineTo(vx + frac * hwN, yN)
          ctx.stroke()
        }
      }

      // ── HORIZON GLOW LINE ────────────────────────────────────────────
      const horizonY = vy + 2
      const grad = ctx.createLinearGradient(0, horizonY, W, horizonY)
      grad.addColorStop(0, 'rgba(0,245,255,0)')
      grad.addColorStop(0.5, 'rgba(0,245,255,0.35)')
      grad.addColorStop(1, 'rgba(0,245,255,0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 18
      ctx.shadowColor = 'rgba(0,245,255,0.6)'
      ctx.beginPath(); ctx.moveTo(0, horizonY); ctx.lineTo(W, horizonY); ctx.stroke()
      ctx.shadowBlur = 0

      // ── ANIMATED CHART LINES ─────────────────────────────────────────
      const amp = H * 0.07
      const cy = H * 0.6

      // Primary chart
      ctx.save()
      ctx.shadowBlur = 16
      ctx.shadowColor = 'rgba(0,245,255,0.25)'
      ctx.strokeStyle = 'rgba(0,245,255,0.11)'
      ctx.lineWidth = 1.8
      ctx.beginPath()
      for (let x = 0; x <= W; x += 4) {
        const tt = x / W
        const yy = cy
          + Math.sin(tt * 11 + time * 0.5) * amp
          + Math.sin(tt * 6  + time * 0.3) * amp * 0.55
          + Math.sin(tt * 22 + time * 1.1) * amp * 0.18
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy)
      }
      ctx.stroke()
      ctx.restore()

      // Secondary chart (violet)
      ctx.strokeStyle = 'rgba(124,58,237,0.07)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      for (let x = 0; x <= W; x += 4) {
        const tt = x / W
        const yy = cy * 0.65
          + Math.sin(tt * 8 - time * 0.45) * amp * 1.15
          + Math.sin(tt * 16 - time * 0.7) * amp * 0.35
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy)
      }
      ctx.stroke()

      // ── FLOATING CANDLESTICKS ────────────────────────────────────────
      candles.forEach(c => {
        c.y -= c.speed
        if (c.y < -60) { c.y = H + 60; c.x = Math.random() * W }
        const col = c.bull ? `rgba(74,222,128,${c.alpha})` : `rgba(248,113,113,${c.alpha})`
        const shadowCol = c.bull ? `rgba(74,222,128,0.6)` : `rgba(248,113,113,0.6)`

        // Glow effect
        ctx.shadowBlur = 8
        ctx.shadowColor = shadowCol

        ctx.strokeStyle = col
        ctx.fillStyle = col
        ctx.lineWidth = 0.8
        // Wick
        ctx.beginPath()
        ctx.moveTo(c.x, c.y - c.wickT)
        ctx.lineTo(c.x, c.y + c.body + c.wickB)
        ctx.stroke()
        // Body
        ctx.fillRect(c.x - c.w / 2, c.y, c.w, c.body)

        // Reset shadow
        ctx.shadowBlur = 0
      })

      // ── PARTICLES ────────────────────────────────────────────────────
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W }
        if (p.x < -5) p.x = W + 5
        if (p.x > W + 5) p.x = -5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.cyan
          ? `rgba(0,245,255,${p.alpha})`
          : `rgba(124,58,237,${p.alpha})`
        ctx.fill()
      })

      // ── SCAN LINE ────────────────────────────────────────────────────
      const scanY = ((time * 0.15) % 1) * H
      const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60)
      scanGrad.addColorStop(0, 'rgba(0,245,255,0)')
      scanGrad.addColorStop(0.5, 'rgba(0,245,255,0.03)')
      scanGrad.addColorStop(1, 'rgba(0,245,255,0)')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanY - 60, W, 120)

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
