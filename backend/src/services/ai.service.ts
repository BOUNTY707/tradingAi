import Groq from 'groq-sdk'
import https from 'https'
import { getRealPrice } from './price.service'

export interface AIAnalysisInput {
  symbol: string
  market: string
  timeframe: string
  strategy: string
}

export interface AIAnalysisResult {
  direction: 'BUY' | 'SELL' | 'WAIT'
  confidence: number
  entry: string
  stopLoss: string
  takeProfit1: string
  takeProfit2: string
  trend: string
  riskLevel: string
  sentiment: string
  riskReward: string
  concepts: string[]
  explanation: string
  processingTime: number
  currentPrice: number
  message?: string
  // raw float values for DB storage
  raw?: {
    entryMin: number
    entryMax: number
    stopLoss: number
    takeProfit1: number
    takeProfit2: number
  }
}

const TF_MAP: Record<string, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1H': '1h', '4H': '4h', '1D': '1d', '1W': '1w',
}

const BINANCE_MAP: Record<string, string> = {
  'BTC/USDT': 'BTCUSDT', 'ETH/USDT': 'ETHUSDT', 'SOL/USDT': 'SOLUSDT',
  'BNB/USDT': 'BNBUSDT', 'XRP/USDT': 'XRPUSDT', 'ADA/USDT': 'ADAUSDT',
  'DOGE/USDT': 'DOGEUSDT', 'AVAX/USDT': 'AVAXUSDT', 'TON/USDT': 'TONUSDT',
  'SUI/USDT': 'SUIUSDT', 'APT/USDT': 'APTUSDT', 'ARB/USDT': 'ARBUSDT',
  'OP/USDT': 'OPUSDT', 'TRX/USDT': 'TRXUSDT', 'LTC/USDT': 'LTCUSDT',
  'LINK/USDT': 'LINKUSDT', 'DOT/USDT': 'DOTUSDT',
}

// Yahoo Finance symbol mapping for forex/metals
const YAHOO_MAP: Record<string, string> = {
  'XAU/USD': 'GC=F', 'XAG/USD': 'SI=F',
  'EUR/USD': 'EURUSD=X', 'GBP/USD': 'GBPUSD=X',
  'USD/JPY': 'JPY=X', 'AUD/USD': 'AUDUSD=X',
  'USD/CHF': 'CHF=X', 'GBP/JPY': 'GBPJPY=X',
  'OIL': 'CL=F', 'WTI/USD': 'CL=F',
}

// Yahoo interval/range per timeframe
const YAHOO_TF: Record<string, { interval: string; range: string }> = {
  '1m': { interval: '1m', range: '1d' },
  '5m': { interval: '5m', range: '5d' },
  '15m': { interval: '15m', range: '5d' },
  '30m': { interval: '30m', range: '5d' },
  '1H': { interval: '1h', range: '10d' },
  '4H': { interval: '1h', range: '30d' },
  '1D': { interval: '1d', range: '6mo' },
  '1W': { interval: '1wk', range: '2y' },
}

async function fetchYahooCandles(yahooSym: string, timeframe: string): Promise<Candle[]> {
  const tf = YAHOO_TF[timeframe] ?? { interval: '1h', range: '30d' }
  try {
    const raw = JSON.parse(
      await httpsGet(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=${tf.interval}&range=${tf.range}`)
    )
    const result = raw?.chart?.result?.[0]
    if (!result) return []
    const timestamps: number[] = result.timestamp ?? []
    const q = result.indicators?.quote?.[0] ?? {}
    const candles: Candle[] = []
    for (let i = 0; i < timestamps.length; i++) {
      const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i], v = q.volume?.[i]
      if (o && h && l && c) {
        candles.push({
          time: new Date(timestamps[i] * 1000).toISOString().slice(0, 16),
          open: o, high: h, low: l, close: c, volume: v ?? 0,
        })
      }
    }
    // For 4H timeframe, aggregate 1h candles into 4h
    if (timeframe === '4H' && candles.length > 0) {
      const agg: Candle[] = []
      for (let i = 0; i + 3 < candles.length; i += 4) {
        const group = candles.slice(i, i + 4)
        agg.push({
          time: group[0].time,
          open: group[0].open,
          high: Math.max(...group.map(c => c.high)),
          low: Math.min(...group.map(c => c.low)),
          close: group[3].close,
          volume: group.reduce((s, c) => s + c.volume, 0),
        })
      }
      return agg.slice(-50)
    }
    return candles.slice(-100)
  } catch {
    return []
  }
}

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      timeout: 6000,
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

interface Candle {
  time: string; open: number; high: number; low: number; close: number; volume: number
}

async function fetchCandles(symbol: string, timeframe: string): Promise<Candle[]> {
  const key = symbol.toUpperCase()
  // Try Binance for crypto
  const binanceSym = BINANCE_MAP[key]
  if (binanceSym) {
    const interval = TF_MAP[timeframe] ?? '4h'
    try {
      const raw = JSON.parse(
        await httpsGet(`https://api.binance.com/api/v3/klines?symbol=${binanceSym}&interval=${interval}&limit=100`)
      ) as any[][]
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map(c => ({
          time: new Date(c[0]).toISOString().slice(0, 16),
          open: parseFloat(c[1]), high: parseFloat(c[2]),
          low: parseFloat(c[3]), close: parseFloat(c[4]),
          volume: parseFloat(c[5]),
        }))
      }
    } catch {}
  }
  // Try Yahoo Finance for forex/metals
  const yahooSym = YAHOO_MAP[key]
  if (yahooSym) {
    const candles = await fetchYahooCandles(yahooSym, timeframe)
    if (candles.length > 0) return candles
  }
  return []
}

function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (price >= 1000) return price.toFixed(2)
  if (price >= 100) return price.toFixed(2)
  if (price >= 1) return price.toFixed(4)
  return price.toFixed(5)
}

function calcEMA(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1] ?? 0
  const k = 2 / (period + 1)
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < closes.length; i++) ema = closes[i] * k + ema * (1 - k)
  return ema
}

function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff
    else losses -= diff
  }
  const rs = losses === 0 ? 100 : gains / losses
  return 100 - 100 / (1 + rs)
}

function buildCandleSummary(candles: Candle[], currentPrice: number): string {
  if (!candles.length) return `Current price: ${formatPrice(currentPrice)}\nNo candle data.`

  const closes = candles.map(c => c.close)
  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2]

  const high50 = Math.max(...candles.slice(-50).map(c => c.high))
  const low50 = Math.min(...candles.slice(-50).map(c => c.low))
  const high20 = Math.max(...candles.slice(-20).map(c => c.high))
  const low20 = Math.min(...candles.slice(-20).map(c => c.low))
  const avgVol20 = candles.slice(-20).reduce((s, c) => s + c.volume, 0) / 20
  const lastVol = last.volume

  const ema21 = calcEMA(closes, 21)
  const ema50 = calcEMA(closes, 50)
  const rsi = calcRSI(closes)

  // Candle pattern detection
  const bullEngulf = prev && prev.close < prev.open && last.close > last.open && last.close > prev.open && last.open < prev.close
  const bearEngulf = prev && prev.close > prev.open && last.close < last.open && last.close < prev.open && last.open > prev.close
  const doji = Math.abs(last.close - last.open) / (last.high - last.low) < 0.1

  return [
    `Current price: ${formatPrice(currentPrice)}`,
    `Last candle [${last.time}]: O=${last.open} H=${last.high} L=${last.low} C=${last.close} Vol=${lastVol.toFixed(0)}`,
    `Prev candle: O=${prev?.open} H=${prev?.high} L=${prev?.low} C=${prev?.close}`,
    `50-candle range: High=${high50} Low=${low50}`,
    `20-candle range: High=${high20} Low=${low20}`,
    `Volume: Last=${lastVol.toFixed(0)}, Avg20=${avgVol20.toFixed(0)}, VolumeRatio=${(lastVol / avgVol20).toFixed(2)}x`,
    `EMA21=${ema21.toFixed(4)}, EMA50=${ema50.toFixed(4)}`,
    `RSI(14)=${rsi.toFixed(1)}`,
    `Pattern: ${bullEngulf ? 'Bullish Engulfing' : bearEngulf ? 'Bearish Engulfing' : doji ? 'Doji' : 'Normal'}`,
    `Last 10 closes: ${closes.slice(-10).map(c => formatPrice(c)).join(' → ')}`,
  ].join('\n')
}

export async function generateAIAnalysis(input: AIAnalysisInput): Promise<AIAnalysisResult> {
  const start = Date.now()

  const [currentPrice, candles] = await Promise.all([
    getRealPrice(input.symbol),
    fetchCandles(input.symbol, input.timeframe),
  ])

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey === 'your-groq-api-key-here') {
    console.warn('[AI] GROQ_API_KEY not configured — returning WAIT')
    return buildNoApiResult(currentPrice, start)
  }

  const client = new Groq({ apiKey })
  const summary = buildCandleSummary(candles, currentPrice)

  const prompt = `You are a professional SMC (Smart Money Concepts) trading analyst with institutional-level expertise. Your job is to provide ACCURATE, HIGH-CONFIDENCE signals only. Never guess.

Symbol: ${input.symbol}
Market: ${input.market}
Timeframe: ${input.timeframe}
Strategy: ${input.strategy}

MARKET DATA:
${summary}

CRITICAL RULES:
1. Generate BUY or SELL if you see at least 2 confirming SMC/technical factors
2. If the setup is completely unclear or contradictory → direction MUST be "WAIT"
3. confidence < 55 → direction MUST be "WAIT"
4. For BUY: look for bullish structure, demand zones, RSI not overbought (below 80)
5. For SELL: look for bearish structure, supply zones, RSI not oversold (above 20)
6. Entry levels should be near current price (within ±2%)
7. For BUY: stopLoss < entry < takeProfit1 < takeProfit2
8. For SELL: stopLoss > entry > takeProfit1 > takeProfit2
9. stopLoss distance: crypto 1-4%, forex 0.2-1%, metals 0.3-1.5%
10. Risk:Reward minimum 1:1.5 (takeProfit1 distance >= 1.5x stopLoss distance)

Respond with ONLY valid JSON (no markdown, no extra text):

{
  "direction": "BUY" | "SELL" | "WAIT",
  "confidence": <integer 0-100>,
  "entryMin": <number>,
  "entryMax": <number>,
  "stopLoss": <number>,
  "takeProfit1": <number>,
  "takeProfit2": <number>,
  "trend": "Strongly Bullish" | "Bullish" | "Neutral" | "Bearish" | "Strongly Bearish",
  "riskLevel": "Low" | "Medium" | "High",
  "sentiment": "<concise market sentiment>",
  "concepts": ["<SMC concept 1>", "<SMC concept 2>", "<SMC concept 3>"],
  "explanation": "<2-3 sentences explaining the specific price action evidence for this decision>"
}`

  try {
    const message = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.choices[0]?.message?.content
    if (!textContent) throw new Error('No text in Groq response')

    let jsonStr = textContent.trim()
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) jsonStr = fenceMatch[1].trim()
    const objMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (objMatch) jsonStr = objMatch[0]

    const parsed = JSON.parse(jsonStr)
    const direction: 'BUY' | 'SELL' | 'WAIT' = parsed.direction
    const confidence: number = Math.min(100, Math.max(0, Math.round(parsed.confidence)))

    console.log(`[AI] Groq analysis for ${input.symbol}: ${direction} ${confidence}%`)

    if (direction === 'WAIT' || confidence < 55) {
      return {
        direction: 'WAIT',
        confidence,
        entry: formatPrice(currentPrice),
        stopLoss: '—',
        takeProfit1: '—',
        takeProfit2: '—',
        trend: parsed.trend ?? 'Neutral',
        riskLevel: 'High',
        sentiment: parsed.sentiment ?? 'Uncertain',
        riskReward: '—',
        concepts: Array.isArray(parsed.concepts) ? parsed.concepts.slice(0, 4) : [],
        explanation: parsed.explanation ?? 'No clear signal detected. Wait for better setup.',
        processingTime: Date.now() - start,
        currentPrice,
        message: `Low confidence (${confidence}%). No signal.`,
      }
    }

    const slDist = Math.abs((parsed.stopLoss ?? 0) - currentPrice)
    const tp1Dist = Math.abs((parsed.takeProfit1 ?? 0) - currentPrice)
    const rr = slDist > 0 ? (tp1Dist / slDist).toFixed(1) : '2.0'

    return {
      direction,
      confidence,
      entry: `${formatPrice(parsed.entryMin)} – ${formatPrice(parsed.entryMax)}`,
      stopLoss: formatPrice(parsed.stopLoss),
      takeProfit1: formatPrice(parsed.takeProfit1),
      takeProfit2: formatPrice(parsed.takeProfit2),
      trend: parsed.trend ?? (direction === 'BUY' ? 'Bullish' : 'Bearish'),
      riskLevel: parsed.riskLevel ?? 'Medium',
      sentiment: parsed.sentiment ?? direction,
      riskReward: `1:${rr}`,
      concepts: Array.isArray(parsed.concepts) ? parsed.concepts.slice(0, 6) : [],
      explanation: parsed.explanation ?? '',
      processingTime: Date.now() - start,
      currentPrice,
      raw: {
        entryMin:    Number(parsed.entryMin)    || currentPrice,
        entryMax:    Number(parsed.entryMax)    || currentPrice,
        stopLoss:    Number(parsed.stopLoss)    || currentPrice * 0.97,
        takeProfit1: Number(parsed.takeProfit1) || currentPrice * 1.03,
        takeProfit2: Number(parsed.takeProfit2) || currentPrice * 1.06,
      },
    }
  } catch (err) {
    console.error('[AI] Claude API error:', err instanceof Error ? err.message : err)
    return buildNoApiResult(currentPrice, start)
  }
}

// ─── Image-based chart analysis ──────────────────────────────────────────────

export interface ImageAnalysisResult {
  direction: 'BUY' | 'SELL' | 'WAIT'
  confidence: number
  symbol: string
  timeframe: string
  entry: string
  stopLoss: string
  takeProfit1: string
  takeProfit2: string
  trend: string
  riskLevel: string
  sentiment: string
  riskReward: string
  concepts: string[]
  explanation: string
  processingTime: number
  message?: string
}

export async function generateImageAnalysis(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
): Promise<ImageAnalysisResult> {
  const start = Date.now()

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey === 'your-groq-api-key-here') {
    return {
      direction: 'WAIT', confidence: 0, symbol: 'Unknown', timeframe: 'Unknown',
      entry: '—', stopLoss: '—', takeProfit1: '—', takeProfit2: '—',
      trend: 'Neutral', riskLevel: 'High', sentiment: 'API not configured',
      riskReward: '—', concepts: [], processingTime: Date.now() - start,
      explanation: 'GROQ_API_KEY sozlanmagan.',
      message: 'API key not configured.',
    }
  }

  const client = new Groq({ apiKey })

  const prompt = `You are an expert SMC (Smart Money Concepts) and price action trading analyst. Analyze this TradingView chart screenshot carefully.

YOUR TASK:
1. Read the chart: identify the trading symbol (from title/watermark), timeframe, current price from the right axis
2. Identify key SMC structures: Order Blocks, BOS, CHOCH, FVG, Liquidity Sweeps, Supply/Demand zones
3. Determine the highest-probability trade direction based on what you see
4. Calculate precise entry, stop loss, and take profit levels by reading the price axis

CRITICAL RULES:
- Give BUY or SELL if you see at least 2 confirming structures or price action signals
- If the chart is completely unclear or blurry → direction must be "WAIT"
- confidence < 55 → direction must be "WAIT"
- Entry must be near current price (within 1-2%)
- For BUY: stopLoss < entry < takeProfit1 < takeProfit2
- For SELL: stopLoss > entry > takeProfit1 > takeProfit2
- Risk:Reward minimum 1:2
- Read actual price values from the chart axes — do NOT make up numbers

Respond with ONLY valid JSON (no markdown, no extra text):

{
  "symbol": "<symbol from chart or 'Unknown'>",
  "timeframe": "<timeframe from chart or 'Unknown'>",
  "direction": "BUY" | "SELL" | "WAIT",
  "confidence": <integer 0-100>,
  "entry": "<price range or single price as string>",
  "stopLoss": "<price as string>",
  "takeProfit1": "<price as string>",
  "takeProfit2": "<price as string>",
  "trend": "Strongly Bullish" | "Bullish" | "Neutral" | "Bearish" | "Strongly Bearish",
  "riskLevel": "Low" | "Medium" | "High",
  "sentiment": "<short market sentiment phrase>",
  "riskReward": "1:X.X",
  "concepts": ["<SMC concept 1>", "<SMC concept 2>", "<SMC concept 3>"],
  "explanation": "<3-4 sentences: what specific structures you see, where price is relative to key zones, and why this direction>"
}`

  try {
    const message = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${base64Image}` },
          },
          { type: 'text', text: prompt },
        ],
      }],
    })

    const textContent = message.choices[0]?.message?.content
    if (!textContent) throw new Error('No text in Groq response')

    let jsonStr = textContent.trim()
    const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fence) jsonStr = fence[1].trim()
    const obj = jsonStr.match(/\{[\s\S]*\}/)
    if (obj) jsonStr = obj[0]

    const p = JSON.parse(jsonStr)
    const direction: 'BUY' | 'SELL' | 'WAIT' = p.direction
    const confidence = Math.min(100, Math.max(0, Math.round(p.confidence)))

    console.log(`[AI] Groq image analysis: ${p.symbol} ${direction} ${confidence}%`)

    if (direction === 'WAIT' || confidence < 55) {
      return {
        direction: 'WAIT', confidence, symbol: p.symbol ?? 'Unknown',
        timeframe: p.timeframe ?? 'Unknown',
        entry: p.entry ?? '—', stopLoss: '—', takeProfit1: '—', takeProfit2: '—',
        trend: p.trend ?? 'Neutral', riskLevel: 'High', sentiment: p.sentiment ?? 'Uncertain',
        riskReward: '—', concepts: p.concepts ?? [], processingTime: Date.now() - start,
        explanation: p.explanation ?? 'No clear setup detected.',
        message: `Low confidence (${confidence}%). Wait for a better setup.`,
      }
    }

    return {
      direction, confidence,
      symbol:      p.symbol      ?? 'Unknown',
      timeframe:   p.timeframe   ?? 'Unknown',
      entry:       p.entry       ?? '—',
      stopLoss:    p.stopLoss    ?? '—',
      takeProfit1: p.takeProfit1 ?? '—',
      takeProfit2: p.takeProfit2 ?? '—',
      trend:       p.trend       ?? 'Neutral',
      riskLevel:   p.riskLevel   ?? 'Medium',
      sentiment:   p.sentiment   ?? direction,
      riskReward:  p.riskReward  ?? '1:2',
      concepts:    Array.isArray(p.concepts) ? p.concepts.slice(0, 6) : [],
      explanation: p.explanation ?? '',
      processingTime: Date.now() - start,
    }
  } catch (err) {
    console.error('[AI] Image analysis error:', err instanceof Error ? err.message : err)
    return {
      direction: 'WAIT', confidence: 0, symbol: 'Unknown', timeframe: 'Unknown',
      entry: '—', stopLoss: '—', takeProfit1: '—', takeProfit2: '—',
      trend: 'Neutral', riskLevel: 'High', sentiment: 'Error',
      riskReward: '—', concepts: [], processingTime: Date.now() - start,
      explanation: 'Tahlil vaqtida xatolik yuz berdi. Qayta urinib ko\'ring.',
      message: err instanceof Error ? err.message : 'Analysis failed',
    }
  }
}

function buildNoApiResult(currentPrice: number, start: number): AIAnalysisResult {
  return {
    direction: 'WAIT',
    confidence: 0,
    entry: formatPrice(currentPrice),
    stopLoss: '—',
    takeProfit1: '—',
    takeProfit2: '—',
    trend: 'Neutral',
    riskLevel: 'High',
    sentiment: 'API not configured',
    riskReward: '—',
    concepts: [],
    explanation: 'AI tahlil uchun ANTHROPIC_API_KEY sozlanmagan. Server administratoriga murojaat qiling.',
    processingTime: Date.now() - start,
    currentPrice,
    message: 'API key not configured. Cannot generate real signal.',
  }
}
