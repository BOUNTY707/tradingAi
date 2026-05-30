import api from '@/lib/api'

export interface LiveSignal {
  id: string
  pair: string
  market: 'crypto' | 'forex' | 'stocks' | 'metals'
  direction: 'BUY' | 'SELL'
  confidence: number
  entry: string
  sl: string
  tp: string
  tp2: string | null
  timeframe: string
  type: string
  concept: string
  trend: string
  riskLevel: string
  sentiment: string
  riskReward: string
  concepts: string[]
  explanation: string
  currentPrice: number | null
  time: string
  expiresAt: string | null
  status: 'active'
}

export interface SignalStats {
  active: number
  total24h: number
  avgConfidence: number
}

export const signalsService = {
  async getSignals(market?: string, direction?: string): Promise<LiveSignal[]> {
    const params = new URLSearchParams()
    if (market    && market    !== 'all') params.set('market',    market.toUpperCase())
    if (direction && direction !== 'all') params.set('direction', direction.toUpperCase())
    const { data } = await api.get(`/signals?${params}`)
    return data.data ?? []
  },

  async getStats(): Promise<SignalStats> {
    const { data } = await api.get('/signals/stats')
    return data.data ?? { active: 0, total24h: 0, avgConfidence: 0 }
  },

  async runAnalysis(payload: { symbol: string; market: string; timeframe: string; strategy: string }) {
    const { data } = await api.post('/analysis', payload)
    return data.data
  },

  async getAnalysisHistory() {
    const { data } = await api.get('/analysis/history')
    return data.data as any[]
  },
}
