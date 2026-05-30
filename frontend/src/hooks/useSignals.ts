import { useState, useEffect, useCallback, useRef } from 'react'
import { signalsService, type LiveSignal, type SignalStats } from '@/services/signals.service'

const POLL_MS = 60_000 // refresh every 60 seconds

export function useSignals(market?: string, direction?: string) {
  const [signals, setSignals]     = useState<LiveSignal[]>([])
  const [stats,   setStats]       = useState<SignalStats>({ active: 0, total24h: 0, avgConfidence: 0 })
  const [loading, setLoading]     = useState(true)
  const [error,   setError]       = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch = useCallback(async () => {
    try {
      const [sigs, st] = await Promise.all([
        signalsService.getSignals(market, direction),
        signalsService.getStats(),
      ])
      setSignals(sigs)
      setStats(st)
      setLastUpdated(new Date())
      setError(null)
    } catch {
      setError('Signallarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }, [market, direction])

  useEffect(() => {
    setLoading(true)
    fetch()
    timerRef.current = setInterval(fetch, POLL_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetch])

  const refresh = useCallback(() => { setLoading(true); fetch() }, [fetch])

  return { signals, stats, loading, error, lastUpdated, refresh }
}
