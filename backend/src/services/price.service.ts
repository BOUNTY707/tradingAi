import https from 'https'

// In-memory cache: { symbol -> { price, fetchedAt } }
const cache = new Map<string, { price: number; fetchedAt: number }>()
const CACHE_TTL = 60_000 // 1 daqiqa

// Yahoo Finance symbol mapping
const YAHOO_MAP: Record<string, string> = {
  // Metals
  'XAU/USD': 'GC=F', 'XAUUSD': 'GC=F', 'XAU/USDT': 'GC=F', 'XAUUSDT': 'GC=F',
  'XAG/USD': 'SI=F', 'XAGUSD': 'SI=F', 'XAG/USDT': 'SI=F',
  'WTI/USD': 'CL=F', 'OIL': 'CL=F', 'USOIL': 'CL=F',
  // Forex
  'EUR/USD': 'EURUSD=X', 'EURUSD': 'EURUSD=X',
  'GBP/USD': 'GBPUSD=X', 'GBPUSD': 'GBPUSD=X',
  'USD/JPY': 'JPY=X',    'USDJPY': 'JPY=X',
  'AUD/USD': 'AUDUSD=X', 'AUDUSD': 'AUDUSD=X',
  'USD/CHF': 'CHF=X',    'USDCHF': 'CHF=X',
  'USD/CAD': 'CAD=X',    'USDCAD': 'CAD=X',
  'NZD/USD': 'NZDUSD=X', 'NZDUSD': 'NZDUSD=X',
  'EUR/GBP': 'EURGBP=X', 'EURGBP': 'EURGBP=X',
  'EUR/JPY': 'EURJPY=X', 'EURJPY': 'EURJPY=X',
  'GBP/JPY': 'GBPJPY=X', 'GBPJPY': 'GBPJPY=X',
  // Stocks (use directly)
  'AAPL': 'AAPL', 'NVDA': 'NVDA', 'TSLA': 'TSLA',
  'MSFT': 'MSFT', 'AMZN': 'AMZN', 'GOOGL': 'GOOGL',
  'META': 'META', 'SPY': 'SPY', 'QQQ': 'QQQ',
}

// Binance symbol mapping (for crypto)
const BINANCE_MAP: Record<string, string> = {
  'BTC/USDT': 'BTCUSDT', 'ETH/USDT': 'ETHUSDT',
  'SOL/USDT': 'SOLUSDT', 'BNB/USDT': 'BNBUSDT',
  'XRP/USDT': 'XRPUSDT', 'ADA/USDT': 'ADAUSDT',
  'DOGE/USDT': 'DOGEUSDT', 'AVAX/USDT': 'AVAXUSDT',
  'DOT/USDT': 'DOTUSDT', 'LINK/USDT': 'LINKUSDT',
  'MATIC/USDT': 'MATICUSDT', 'LTC/USDT': 'LTCUSDT',
  'ATOM/USDT': 'ATOMUSDT', 'UNI/USDT': 'UNIUSDT',
  'TON/USDT': 'TONUSDT', 'SUI/USDT': 'SUIUSDT',
  'APT/USDT': 'APTUSDT', 'ARB/USDT': 'ARBUSDT',
  'OP/USDT': 'OPUSDT', 'TRX/USDT': 'TRXUSDT',
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 5000,
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function fetchBinancePrice(symbol: string): Promise<number> {
  const raw = await fetchUrl(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
  const json = JSON.parse(raw)
  return parseFloat(json.price)
}

async function fetchYahooPrice(symbol: string): Promise<number> {
  const encoded = encodeURIComponent(symbol)
  const raw = await fetchUrl(`https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1m&range=1d`)
  const json = JSON.parse(raw)
  const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice
  if (!price) throw new Error(`No price for ${symbol}`)
  return price
}

export async function getRealPrice(symbol: string): Promise<number> {
  const key = symbol.toUpperCase().trim()

  // Cache hit
  const cached = cache.get(key)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.price
  }

  let price: number | null = null

  // Try Binance first (crypto)
  const binanceSym = BINANCE_MAP[key] || (key.endsWith('USDT') && !key.includes('/') ? key : null)
  if (binanceSym) {
    try {
      price = await fetchBinancePrice(binanceSym)
    } catch {}
  }

  // Try Yahoo Finance (metals, forex, stocks)
  if (!price) {
    const yahooSym = YAHOO_MAP[key] || key
    try {
      price = await fetchYahooPrice(yahooSym)
    } catch {}
  }

  if (price && price > 0) {
    cache.set(key, { price, fetchedAt: Date.now() })
    return price
  }

  // Fallback to approximate prices if API fails
  return getFallbackPrice(key)
}

function getFallbackPrice(symbol: string): number {
  const fallbacks: Record<string, number> = {
    'XAU/USD': 4490, 'XAUUSD': 4490, 'XAU/USDT': 4490,
    'XAG/USD': 32, 'XAG/USDT': 32,
    'BTC/USDT': 76000, 'ETH/USDT': 3800, 'SOL/USDT': 155,
    'BNB/USDT': 650, 'XRP/USDT': 2.1,
    'EUR/USD': 1.0842, 'GBP/USD': 1.2641, 'USD/JPY': 154.2,
    'AAPL': 215, 'NVDA': 950, 'TSLA': 280,
  }
  return fallbacks[symbol] ?? 100
}
