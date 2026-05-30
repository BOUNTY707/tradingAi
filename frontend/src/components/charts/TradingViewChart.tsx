import { useEffect, useRef } from 'react'

interface Props {
  symbol: string      // e.g. "BINANCE:BTCUSDT"
  interval?: string   // "60" | "240" | "D" | "W"
  height?: number
}

declare global {
  interface Window {
    TradingView?: { widget: new (opts: Record<string, unknown>) => void }
  }
}

let tvScriptLoaded = false
const tvWaiters: Array<() => void> = []

function loadTVScript(): Promise<void> {
  return new Promise(resolve => {
    if (tvScriptLoaded) { resolve(); return }
    tvWaiters.push(resolve)
    if (tvWaiters.length > 1) return
    const s = document.createElement('script')
    s.src = 'https://s3.tradingview.com/tv.js'
    s.async = true
    s.onload = () => {
      tvScriptLoaded = true
      tvWaiters.forEach(fn => fn())
      tvWaiters.length = 0
    }
    document.head.appendChild(s)
  })
}

let _uid = 0
function nextId() { return `tv_chart_${++_uid}` }

export default function TradingViewChart({ symbol, interval = '240', height = 380 }: Props) {
  const contRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<unknown>(null)

  useEffect(() => {
    if (!contRef.current) return
    let cancelled = false

    // clear previous
    contRef.current.innerHTML = ''
    widgetRef.current = null

    // give a stable unique id each time
    const id = nextId()
    const div = document.createElement('div')
    div.id = id
    div.style.height = `${height}px`
    div.style.width = '100%'
    contRef.current.appendChild(div)

    loadTVScript().then(() => {
      if (cancelled || !window.TradingView || !document.getElementById(id)) return

      widgetRef.current = new window.TradingView.widget({
        autosize:            true,
        symbol,
        interval,
        container_id:        id,
        timezone:            'Asia/Tashkent',
        theme:               'dark',
        style:               '1',
        locale:              'en',
        toolbar_bg:          '#050508',
        backgroundColor:     'rgba(5,5,8,1)',
        gridColor:           'rgba(255,255,255,0.03)',
        enable_publishing:   false,
        hide_top_toolbar:    false,
        hide_legend:         false,
        hide_side_toolbar:   false,
        allow_symbol_change: false,
        save_image:          false,
        withdateranges:      true,
        studies:             ['MASimple@tv-basicstudies'],
        overrides: {
          'mainSeriesProperties.candleStyle.upColor':         '#00ff88',
          'mainSeriesProperties.candleStyle.downColor':       '#ff4444',
          'mainSeriesProperties.candleStyle.borderUpColor':   '#00ff88',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ff4444',
          'mainSeriesProperties.candleStyle.wickUpColor':     '#00ff88',
          'mainSeriesProperties.candleStyle.wickDownColor':   '#ff4444',
          'paneProperties.background':                        '#050508',
          'paneProperties.backgroundType':                    'solid',
          'paneProperties.vertGridProperties.color':          'rgba(255,255,255,0.03)',
          'paneProperties.horzGridProperties.color':          'rgba(255,255,255,0.03)',
          'scalesProperties.textColor':                       'rgba(255,255,255,0.4)',
        },
      })
    })

    return () => { cancelled = true }
  }, [symbol, interval, height])

  return (
    <div
      ref={contRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden"
    />
  )
}
