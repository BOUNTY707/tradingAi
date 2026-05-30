import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { success, error } from '../utils/apiResponse'

function formatPrice(n: number): string {
  if (n >= 10000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (n >= 1000)  return n.toFixed(2)
  if (n >= 100)   return n.toFixed(2)
  if (n >= 1)     return n.toFixed(4)
  return n.toFixed(5)
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const min  = Math.floor(diff / 60000)
  const hr   = Math.floor(diff / 3600000)
  if (min < 1)  return 'just now'
  if (min < 60) return `${min}m ago`
  return `${hr}h ago`
}

export async function getSignals(req: Request, res: Response): Promise<void> {
  try {
    const { market, direction, minConfidence = '58' } = req.query as {
      market?: string; direction?: string; minConfidence?: string
    }

    const signals = await prisma.tradingSignal.findMany({
      where: {
        isActive: true,
        confidence: { gte: parseFloat(minConfidence) },
        ...(market    && market    !== 'all' && { market:    market.toUpperCase()    as any }),
        ...(direction && direction !== 'all' && { direction: direction.toUpperCase() as any }),
      },
      orderBy: [{ confidence: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    })

    const formatted = signals.map(s => ({
      id:         s.id,
      pair:       s.symbol,
      market:     s.market.toLowerCase(),
      direction:  s.direction as 'BUY' | 'SELL',
      confidence: s.confidence,
      entry:      `${formatPrice(s.entryMin)} – ${formatPrice(s.entryMax)}`,
      sl:         formatPrice(s.stopLoss),
      tp:         formatPrice(s.takeProfit1),
      tp2:        s.takeProfit2 ? formatPrice(s.takeProfit2) : null,
      timeframe:  s.timeframe,
      type:       s.tradeType,
      concept:    s.smcConcept,
      trend:      s.trend,
      riskLevel:  s.riskLevel,
      sentiment:  s.sentiment,
      riskReward: s.riskReward ?? '1:2',
      concepts:   s.concepts ?? [],
      explanation:s.explanation ?? '',
      currentPrice: s.currentPrice,
      time:       timeAgo(s.createdAt),
      expiresAt:  s.expiresAt,
      status:     'active',
    }))

    success(res, formatted)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch signals'
    error(res, message, 500)
  }
}

export async function getSignalStats(req: Request, res: Response): Promise<void> {
  try {
    const [active, total24h] = await Promise.all([
      prisma.tradingSignal.count({ where: { isActive: true } }),
      prisma.tradingSignal.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      }),
    ])

    const active_signals = await prisma.tradingSignal.findMany({
      where: { isActive: true },
      select: { confidence: true },
    })
    const avgConf = active_signals.length
      ? (active_signals.reduce((s, x) => s + x.confidence, 0) / active_signals.length).toFixed(1)
      : '0'

    success(res, { active, total24h, avgConfidence: parseFloat(avgConf) })
  } catch (err: unknown) {
    error(res, 'Failed to fetch stats', 500)
  }
}
