import { useState, useEffect, useRef } from 'react'

export interface TickerData {
  symbol: string
  price: string
  priceChange: string
  priceChangePercent: string
  high: string
  low: string
  volume: string
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
const BINANCE_WS = 'wss://stream.binance.com:9443/stream?streams='

export function useMarketData() {
  const [tickers, setTickers] = useState<Record<string, TickerData>>({})
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const streams = SYMBOLS.map(s => `${s.toLowerCase()}@miniTicker`).join('/')
    const ws = new WebSocket(`${BINANCE_WS}${streams}`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)

    ws.onmessage = (event) => {
      const { data } = JSON.parse(event.data) as {
        data: { s: string; c: string; o: string; h: string; l: string; v: string }
      }
      const change = parseFloat(data.c) - parseFloat(data.o)
      const changePct = (change / parseFloat(data.o)) * 100

      setTickers(prev => ({
        ...prev,
        [data.s]: {
          symbol: data.s,
          price: data.c,
          priceChange: change.toFixed(2),
          priceChangePercent: changePct.toFixed(2),
          high: data.h,
          low: data.l,
          volume: data.v,
        },
      }))
    }

    return () => ws.close()
  }, [])

  return { tickers, connected }
}

export function useSingleTicker(symbol: string) {
  const [ticker, setTicker] = useState<TickerData | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const s = symbol.replace('/', '').toUpperCase()
    if (!s.endsWith('USDT') && !s.endsWith('USD') && !s.endsWith('BTC')) return

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${s.toLowerCase()}@miniTicker`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as { s: string; c: string; o: string; h: string; l: string; v: string }
      const change = parseFloat(data.c) - parseFloat(data.o)
      const changePct = (change / parseFloat(data.o)) * 100
      setTicker({
        symbol: data.s,
        price: data.c,
        priceChange: change.toFixed(2),
        priceChangePercent: changePct.toFixed(2),
        high: data.h,
        low: data.l,
        volume: data.v,
      })
    }

    return () => ws.close()
  }, [symbol])

  return ticker
}
