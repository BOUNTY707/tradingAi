import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'

export default function DashboardChart() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 280,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: 'rgba(255,255,255,0.4)' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.05)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.05)', timeVisible: true },
      crosshair: { mode: 1 },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff88',
      downColor: '#ff4444',
      borderUpColor: '#00ff88',
      borderDownColor: '#ff4444',
      wickUpColor: '#00ff88',
      wickDownColor: '#ff4444',
    })

    const data = Array.from({ length: 80 }, (_, i) => {
      const base = 65000 + Math.sin(i * 0.15) * 3000
      const o = base + (Math.random() - 0.5) * 500
      const c = base + (Math.random() - 0.5) * 500
      const h = Math.max(o, c) + Math.random() * 300
      const l = Math.min(o, c) - Math.random() * 300
      return { time: (1700000000 + i * 3600) as any, open: o, high: h, low: l, close: c }
    })
    series.setData(data)
    chart.timeScale().fitContent()

    const ro = new ResizeObserver(() => {
      if (ref.current) chart.resize(ref.current.clientWidth, 280)
    })
    ro.observe(ref.current)
    return () => { chart.remove(); ro.disconnect() }
  }, [])

  return <div ref={ref} />
}
