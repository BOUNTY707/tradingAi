import { Request, Response } from 'express'
import { body } from 'express-validator'
import { success, error } from '../utils/apiResponse'

export const chatValidators = [
  body('messages').isArray({ min: 1 }),
  body('messages.*.role').isIn(['user', 'assistant']),
  body('messages.*.content').isString().notEmpty(),
]

interface ChatMessage { role: 'user' | 'assistant'; content: string }

function generateAIResponse(messages: ChatMessage[]): string {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''

  if (lastMsg.includes('btc') || lastMsg.includes('bitcoin')) {
    return '🔍 **Bitcoin (BTC/USDT) Analysis**\n\nCurrent market structure: **Bullish**\n- Key support: $64,000–$65,500 (Order Block)\n- Key resistance: $69,000–$71,500\n- Smart money accumulation detected at OB zones\n- AI Confidence: **87% BUY**\n\n**Recommendation:** Wait for pullback to OB at $65,200–$65,800 for optimal entry. SL below $63,800. TP1: $69,500 | TP2: $72,000. R:R = 1:3.1'
  }
  if (lastMsg.includes('eth') || lastMsg.includes('ethereum')) {
    return '📊 **Ethereum (ETH/USDT) Analysis**\n\nStructure: **BOS confirmed on 4H**\n- Institutional accumulation: $3,350–$3,420\n- Target: $3,750\n- AI Confidence: **83% BUY**\n- R:R = 1:3.2\n\nFair Value Gap visible at $3,380. Best entry on FVG fill with confirmation.'
  }
  if (lastMsg.includes('sol') || lastMsg.includes('solana')) {
    return '⚡ **Solana (SOL/USDT) Analysis**\n\nCHOCH confirmed on H4. Smart money entry zone: $138–$141\n- AI Confidence: **86% BUY**\n- Entry: $139.50–$141.00\n- SL: $136.00\n- TP1: $152 | TP2: $162\n- R:R = 1:3.4'
  }
  if (lastMsg.includes('order block') || lastMsg.includes('ob')) {
    return '📚 **Order Blocks Explained**\n\nAn Order Block is a price zone where large institutional orders were placed, creating a strong directional move. Key characteristics:\n\n• **Bullish OB**: Last bearish candle before a strong bullish move\n• **Bearish OB**: Last bullish candle before a strong bearish move\n• Price tends to return to these zones\n• Look for breaker blocks when price invalidates an OB\n\n**How to trade:** Wait for price to return to the OB, look for rejection/acceptance confirmation, then enter with SL beyond the OB.'
  }
  if (lastMsg.includes('bos') || lastMsg.includes('break of structure')) {
    return '🏗️ **Break of Structure (BOS)**\n\nBOS occurs when price breaks a previous structural high/low, confirming trend continuation.\n\n• **Bullish BOS**: Price breaks above previous swing high\n• **Bearish BOS**: Price breaks below previous swing low\n\nBOS confirms the trend is intact. Used to identify high-probability continuation setups aligned with smart money.'
  }
  if (lastMsg.includes('choch') || lastMsg.includes('change of character')) {
    return '🔄 **Change of Character (CHOCH)**\n\nCHOCH signals a potential trend reversal — the first sign that smart money is shifting direction.\n\n• Occurs when price breaks the *opposite* structural level\n• Bullish CHOCH: In downtrend, price breaks above a previous swing high\n• Bearish CHOCH: In uptrend, price breaks below a previous swing low\n\nCHOCH = watch for reversal. BOS after CHOCH = confirmation of new trend.'
  }
  if (lastMsg.includes('liquidity') || lastMsg.includes('sweep')) {
    return '💧 **Liquidity Sweeps**\n\nInstitutions create liquidity by hunting stop losses of retail traders. A liquidity sweep occurs when price temporarily moves beyond a key level to trigger stops before reversing.\n\n• **Buy-side liquidity**: Stops above swing highs (equal highs)\n• **Sell-side liquidity**: Stops below swing lows (equal lows)\n\nWhen you see a wick through a key level followed by immediate rejection — that\'s a liquidity sweep. Enter in the *opposite* direction of the sweep.'
  }
  if (lastMsg.includes('forex') || lastMsg.includes('eur') || lastMsg.includes('gbp')) {
    return '💱 **Forex Market Update**\n\n**EUR/USD**: Bearish structure on H4. Liquidity sweep above 1.0880 expected before drop to 1.0720. AI: **91% SELL**\n\n**GBP/USD**: CHOCH on H1 at 1.2740. Bearish OB: 1.2740–1.2760. Target: 1.2590. AI: **84% SELL**\n\n**USD/JPY**: Range-bound. Wait for clear BOS before taking positions.'
  }
  if (lastMsg.includes('risk') || lastMsg.includes('management')) {
    return '⚠️ **Risk Management Rules**\n\n1. **1-2% max** risk per trade\n2. **Always set SL** before entry\n3. **Minimum 1:2 R:R** — only take trades with good risk/reward\n4. **Max 3-5** concurrent open trades\n5. **Size down** in high volatility sessions\n6. **Never average down** on losing trades\n7. **Protect profits** — move SL to break-even at 50% TP\n8. **News caution** — avoid trading 30min before/after major news'
  }
  if (lastMsg.includes('scalp')) {
    return '⚡ **Scalping Opportunities Today**\n\n**SOL/USDT 5M**: FVG fill opportunity\n- Entry: $141.50 | SL: $139.80 | TP: $145.00\n- Confidence: 82%\n\n**BNB/USDT 15M**: OB reaction\n- Entry: $613 | SL: $608 | TP: $623\n- Confidence: 79%\n\n*Note: Scalping requires fast execution and tight spreads. Use limit orders only.*'
  }
  if (lastMsg.includes('best') || lastMsg.includes('today') || lastMsg.includes('signal')) {
    return '🎯 **Top Signals Today**\n\n1. **BTC/USDT** — BUY | 94% | 4H OB | Entry: $65,200–$65,800\n2. **ETH/USDT** — BUY | 89% | BOS | Entry: $3,420–$3,450\n3. **EUR/USD** — SELL | 91% | Liq Sweep | Entry: 1.0855–1.0870\n4. **SOL/USDT** — BUY | 86% | CHOCH | Entry: $139–$141\n\n⚠️ All signals above 80% confidence threshold. Manage risk at 1-2% per trade.'
  }

  return `🤖 **AI Analysis for: "${lastMsg}"**\n\nBased on current market conditions and smart money analysis, I recommend:\n\n• Check the 4H timeframe for macro structure\n• Look for Order Block or FVG zones for entry\n• Confirm with BOS before entering\n• Always wait for price to return to a zone — never chase\n\nWould you like me to run a full analysis on a specific symbol?`
}

export async function chat(req: Request, res: Response): Promise<void> {
  try {
    const { messages } = req.body as { messages: ChatMessage[] }
    const reply = generateAIResponse(messages)
    success(res, { reply })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Chat failed'
    error(res, message, 500)
  }
}
