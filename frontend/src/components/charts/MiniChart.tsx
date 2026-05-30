import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, AreaSeries } from 'lightweight-charts'

export default function MiniChart() {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 120,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: 'rgba(255,255,255,0.3)' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.05)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.05)', timeVisible: false },
      crosshair: { horzLine: { visible: false }, vertLine: { visible: false } },
    })

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#00f5ff',
      topColor: 'rgba(0,245,255,0.18)',
      bottomColor: 'rgba(0,245,255,0)',
      lineWidth: 2,
    })

    fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=60')
      .then(r => r.json())
      .then((raw: any[][]) => {
        const data = raw.map(c => ({
          time: Math.floor(c[0] / 1000) as any,
          value: parseFloat(c[4]),
        }))
        series.setData(data)
        chart.timeScale().fitContent()
      })
      .catch(() => setError(true))

    const ro = new ResizeObserver(() => {
      if (ref.current) chart.resize(ref.current.clientWidth, 120)
    })
    ro.observe(ref.current)
    return () => { chart.remove(); ro.disconnect() }
  }, [])

  return <div ref={ref} style={{ opacity: error ? 0.3 : 1 }} />
}
