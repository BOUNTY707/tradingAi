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
  const unmountedRef = useRef(false)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    unmountedRef.current = false

    function connect() {
      if (unmountedRef.current) return

      const streams = SYMBOLS.map(s => `${s.toLowerCase()}@miniTicker`).join('/')
      const ws = new WebSocket(`${BINANCE_WS}${streams}`)
      wsRef.current = ws

      ws.onopen = () => {
        if (!unmountedRef.current) setConnected(true)
      }

      ws.onclose = () => {
        if (unmountedRef.current) return
        setConnected(false)
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }

      ws.onmessage = (event) => {
        if (unmountedRef.current) return
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
    }

    connect()

    return () => {
      unmountedRef.current = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  return { tickers, connected }
}

export function useSingleTicker(symbol: string) {
  const [ticker, setTicker] = useState<TickerData | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const unmountedRef = useRef(false)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    unmountedRef.current = false

    function connect() {
      if (unmountedRef.current) return
      const s = symbol.replace('/', '').toUpperCase()
      if (!s.endsWith('USDT') && !s.endsWith('USD') && !s.endsWith('BTC')) return

      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${s.toLowerCase()}@miniTicker`)
      wsRef.current = ws

      ws.onerror = () => ws.close()

      ws.onclose = () => {
        if (unmountedRef.current) return
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.onmessage = (event) => {
        if (unmountedRef.current) return
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
    }

    connect()

    return () => {
      unmountedRef.current = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [symbol])

  return ticker
}
