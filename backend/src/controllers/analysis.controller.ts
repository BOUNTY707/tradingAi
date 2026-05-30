import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { generateAIAnalysis, generateImageAnalysis } from '../services/ai.service'
import { success, error } from '../utils/apiResponse'
import { prisma } from '../config/database'
import { setCache, getCache } from '../config/redis'

export async function runAnalysis(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { symbol, market, timeframe, strategy } = req.body as {
      symbol: string; market: string; timeframe: string; strategy: string
    }
    const cacheKey = `analysis:${symbol}:${market}:${timeframe}:${strategy}`
    const cached = await getCache(cacheKey)
    if (cached) { success(res, cached); return }

    const result = await generateAIAnalysis({ symbol, market, timeframe, strategy })

    // Block only very low confidence or WAIT signals
    if (result.direction === 'WAIT' || result.confidence < 55) {
      success(res, { message: 'No high-confidence signal detected for this setup.', confidence: result.confidence }, 200)
      return
    }

    // Persist to DB (non-blocking)
    prisma.aIAnalysis.create({
      data: {
        userId: req.user!.userId,
        symbol,
        market: market as 'CRYPTO' | 'FOREX' | 'STOCKS' | 'METALS',
        direction: result.direction as 'BUY' | 'SELL' | 'WAIT',
        confidence: result.confidence,
        timeframe,
        strategy,
        entry: result.entry,
        stopLoss: result.stopLoss,
        takeProfit1: result.takeProfit1,
        takeProfit2: result.takeProfit2,
        trend: result.trend,
        riskLevel: result.riskLevel,
        sentiment: result.sentiment,
        riskReward: result.riskReward,
        concepts: result.concepts,
        explanation: result.explanation,
      },
    }).catch(() => {})

    await setCache(cacheKey, result, 60)
    success(res, result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    error(res, message, 500)
  }
}

export async function runImageAnalysis(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { image, mediaType } = req.body as {
      image: string
      mediaType?: 'image/jpeg' | 'image/png' | 'image/webp'
    }
    if (!image) { error(res, 'image (base64) majburiy', 400); return }

    // Strip data URL prefix if present
    const base64 = image.replace(/^data:image\/\w+;base64,/, '')
    const mt = mediaType ?? 'image/jpeg'

    const result = await generateImageAnalysis(base64, mt)
    success(res, result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Image analysis failed'
    error(res, message, 500)
  }
}

export async function getAnalysisHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query['page'] as string) || 1
    const limit = parseInt(req.query['limit'] as string) || 20
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.aIAnalysis.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aIAnalysis.count({ where: { userId: req.user!.userId } }),
    ])

    success(res, { data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch history'
    error(res, message, 500)
  }
}
