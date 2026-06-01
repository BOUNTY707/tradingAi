import { prisma } from '../config/database'
import { generateAIAnalysis } from './ai.service'
import { logger } from '../utils/logger'

interface WatchItem {
  symbol: string
  market: 'CRYPTO' | 'FOREX' | 'METALS' | 'STOCKS'
  timeframe: string
  tradeType: 'Scalp' | 'Intraday' | 'Swing'
}

// ─── Watchlists per tier ──────────────────────────────────────────────────────

const SCALP_LIST: WatchItem[] = [
  { symbol: 'BTC/USDT', market: 'CRYPTO', timeframe: '1m',  tradeType: 'Scalp' },
  { symbol: 'BTC/USDT', market: 'CRYPTO', timeframe: '5m',  tradeType: 'Scalp' },
  { symbol: 'ETH/USDT', market: 'CRYPTO', timeframe: '1m',  tradeType: 'Scalp' },
  { symbol: 'ETH/USDT', market: 'CRYPTO', timeframe: '5m',  tradeType: 'Scalp' },
  { symbol: 'SOL/USDT', market: 'CRYPTO', timeframe: '5m',  tradeType: 'Scalp' },
  { symbol: 'XRP/USDT', market: 'CRYPTO', timeframe: '5m',  tradeType: 'Scalp' },
  { symbol: 'XAU/USD',  market: 'METALS', timeframe: '5m',  tradeType: 'Scalp' },
  { symbol: 'XAU/USD',  market: 'METALS', timeframe: '1m',  tradeType: 'Scalp' },
]

const INTRADAY_LIST: WatchItem[] = [
  { symbol: 'BTC/USDT', market: 'CRYPTO', timeframe: '15m', tradeType: 'Intraday' },
  { symbol: 'ETH/USDT', market: 'CRYPTO', timeframe: '15m', tradeType: 'Intraday' },
  { symbol: 'SOL/USDT', market: 'CRYPTO', timeframe: '15m', tradeType: 'Intraday' },
  { symbol: 'BNB/USDT', market: 'CRYPTO', timeframe: '15m', tradeType: 'Intraday' },
  { symbol: 'XAU/USD',  market: 'METALS', timeframe: '1H',  tradeType: 'Intraday' },
  { symbol: 'EUR/USD',  market: 'FOREX',  timeframe: '1H',  tradeType: 'Intraday' },
  { symbol: 'GBP/USD',  market: 'FOREX',  timeframe: '1H',  tradeType: 'Intraday' },
]

const SWING_LIST: WatchItem[] = [
  { symbol: 'BTC/USDT', market: 'CRYPTO', timeframe: '4H', tradeType: 'Swing' },
  { symbol: 'ETH/USDT', market: 'CRYPTO', timeframe: '4H', tradeType: 'Swing' },
  { symbol: 'SOL/USDT', market: 'CRYPTO', timeframe: '4H', tradeType: 'Swing' },
  { symbol: 'BNB/USDT', market: 'CRYPTO', timeframe: '4H', tradeType: 'Swing' },
  { symbol: 'XRP/USDT', market: 'CRYPTO', timeframe: '1D', tradeType: 'Swing' },
  { symbol: 'EUR/USD',  market: 'FOREX',  timeframe: '4H', tradeType: 'Swing' },
  { symbol: 'GBP/USD',  market: 'FOREX',  timeframe: '4H', tradeType: 'Swing' },
  { symbol: 'XAU/USD',  market: 'METALS', timeframe: '4H', tradeType: 'Swing' },
]

// ─── Intervals ────────────────────────────────────────────────────────────────

const SCALP_INTERVAL_MS    = 30 * 60 * 1000   // 30 daqiqa
const INTRADAY_INTERVAL_MS =  2 * 60 * 60 * 1000   // 2 soat
const SWING_INTERVAL_MS    =  6 * 60 * 60 * 1000   // 6 soat

const SCALP_DELAY_MS   = 3_000   // 3 sec (scalp orasida)
const DEFAULT_DELAY_MS = 7_000   // 7 sec (intraday/swing orasida)

const MIN_CONFIDENCE = 58

// ─── Expiry per timeframe ─────────────────────────────────────────────────────

const TF_EXPIRY_MS: Record<string, number> = {
  '1m':  24 * 60 * 60 * 1000,
  '5m':  24 * 60 * 60 * 1000,
  '15m': 24 * 60 * 60 * 1000,
  '30m': 24 * 60 * 60 * 1000,
  '1H':  24 * 60 * 60 * 1000,
  '4H':  24 * 60 * 60 * 1000,
  '1D':  48 * 60 * 60 * 1000,
  '1W':  14 * 24 * 60 * 60 * 1000,
}

// ─── Core analyze function ────────────────────────────────────────────────────

async function analyzeOne(item: WatchItem): Promise<void> {
  try {
    logger.info(`[SignalGen] Analyzing ${item.symbol} ${item.timeframe}...`)
    const result = await generateAIAnalysis({
      symbol:   item.symbol,
      market:   item.market,
      timeframe: item.timeframe,
      strategy: 'Smart Money Concepts',
    })

    if (result.direction === 'WAIT' || result.confidence < MIN_CONFIDENCE) {
      logger.info(`[SignalGen] ${item.symbol} ${item.timeframe} → WAIT (${result.confidence}%) — skipped`)
      return
    }

    if (!result.raw) {
      logger.warn(`[SignalGen] ${item.symbol} ${item.timeframe} → no raw values — skipped`)
      return
    }

    const expiresAt = new Date(Date.now() + (TF_EXPIRY_MS[item.timeframe] ?? TF_EXPIRY_MS['4H']))

    await prisma.tradingSignal.updateMany({
      where: { symbol: item.symbol, timeframe: item.timeframe, isActive: true },
      data:  { isActive: false },
    })

    const smcConcept = Array.isArray(result.concepts) && result.concepts.length > 0
      ? result.concepts[0]
      : 'Price Action'

    await prisma.tradingSignal.create({
      data: {
        symbol:       item.symbol,
        market:       item.market,
        direction:    result.direction as 'BUY' | 'SELL',
        confidence:   result.confidence,
        entryMin:     result.raw.entryMin,
        entryMax:     result.raw.entryMax,
        stopLoss:     result.raw.stopLoss,
        takeProfit1:  result.raw.takeProfit1,
        takeProfit2:  result.raw.takeProfit2,
        timeframe:    item.timeframe,
        tradeType:    item.tradeType,
        smcConcept,
        trend:        result.trend,
        riskLevel:    result.riskLevel,
        sentiment:    result.sentiment,
        riskReward:   result.riskReward,
        concepts:     result.concepts,
        explanation:  result.explanation,
        currentPrice: result.currentPrice,
        isActive:     true,
        expiresAt,
      },
    })

    logger.info(`[SignalGen] ✓ ${result.direction} ${item.symbol} ${item.timeframe} (${result.confidence}%)`)
  } catch (err) {
    logger.error(`[SignalGen] Error ${item.symbol} ${item.timeframe}: ${err instanceof Error ? err.message : err}`)
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Tier runners ─────────────────────────────────────────────────────────────

async function runScalp(): Promise<void> {
  // Expire old signals
  await prisma.tradingSignal.updateMany({
    where: { isActive: true, expiresAt: { lt: new Date() } },
    data:  { isActive: false },
  }).catch(() => {})

  logger.info('[SignalGen] Scalp cycle start...')
  for (const item of SCALP_LIST) {
    await analyzeOne(item)
    await delay(SCALP_DELAY_MS)
  }
  logger.info('[SignalGen] Scalp cycle done.')
}

async function runIntraday(): Promise<void> {
  logger.info('[SignalGen] Intraday cycle start...')
  for (const item of INTRADAY_LIST) {
    await analyzeOne(item)
    await delay(DEFAULT_DELAY_MS)
  }
  logger.info('[SignalGen] Intraday cycle done.')
}

async function runSwing(): Promise<void> {
  logger.info('[SignalGen] Swing cycle start...')
  for (const item of SWING_LIST) {
    await analyzeOne(item)
    await delay(DEFAULT_DELAY_MS)
  }
  logger.info('[SignalGen] Swing cycle done.')
}

// ─── Start / Stop ─────────────────────────────────────────────────────────────

const timers: NodeJS.Timeout[] = []

export function startSignalGenerator(): void {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey === 'your-groq-api-key-here') {
    logger.warn('[SignalGen] GROQ_API_KEY not set — signal generator disabled')
    return
  }

  logger.info('[SignalGen] Started — Scalp:2min / Intraday:15min / Swing:30min')

  // Boot delay: 15 sec for scalp, 20 sec for intraday, 25 sec for swing
  setTimeout(() => { runScalp();    timers.push(setInterval(runScalp,    SCALP_INTERVAL_MS))    }, 15_000)
  setTimeout(() => { runIntraday(); timers.push(setInterval(runIntraday, INTRADAY_INTERVAL_MS)) }, 20_000)
  setTimeout(() => { runSwing();    timers.push(setInterval(runSwing,    SWING_INTERVAL_MS))    }, 25_000)
}

export function stopSignalGenerator(): void {
  timers.forEach(t => clearInterval(t))
  timers.length = 0
}
