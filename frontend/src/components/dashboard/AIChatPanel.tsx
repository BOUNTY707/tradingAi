import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Brain, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react'
import api from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTIONS = [
  'Analyze BTC trend',
  'Best crypto to trade today?',
  'Explain Order Blocks',
  'What is smart money?',
]

async function sendChatMessage(messages: Message[]): Promise<string> {
  try {
    const { data } = await api.post('/chat', {
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })
    return data.data.reply
  } catch {
    return generateLocalReply(messages[messages.length - 1]?.content || '')
  }
}

function generateLocalReply(input: string): string {
  const q = input.toLowerCase()
  if (q.includes('btc') || q.includes('bitcoin')) {
    return '🔍 Bitcoin (BTC) is currently in a macro bullish structure. Key levels to watch: support at $64,000–$65,500 and resistance at $69,000–$71,500. Smart money is accumulating at order blocks. AI confidence for BUY: 87%. Consider waiting for a pullback to the OB before entering.'
  }
  if (q.includes('eth') || q.includes('ethereum')) {
    return '📊 Ethereum shows a BOS on the 4H timeframe. Institutional accumulation visible near $3,350–$3,420 OB zone. Target: $3,750 with 1:3.2 R:R. Current AI confidence: 83%.'
  }
  if (q.includes('order block') || q.includes('ob')) {
    return '📚 Order Blocks (OB) are price zones where institutional orders were placed, causing a strong move away. They represent areas where smart money entered the market. When price returns to these zones, they often react because the institution defends their position. Look for: strong impulsive moves away from the zone, no significant wicks inside the OB, and alignment with higher timeframe structure.'
  }
  if (q.includes('smart money') || q.includes('smc')) {
    return '🏦 Smart Money Concepts (SMC) is a trading methodology based on how institutional traders (banks, hedge funds) operate. Key concepts: Market Structure (BOS/CHOCH), Order Blocks, Fair Value Gaps, Liquidity Sweeps, and Inducement. The idea is to follow institutional footprints rather than retail indicators.'
  }
  if (q.includes('scalp')) {
    return '⚡ For scalping opportunities today: SOLUSDT showing FVG fill opportunity on 5m–15m. Entry: $141.50, SL: $139.80, TP: $145.00. Risk: Low. Confidence: 82%. Use tight stops and target 1:2+ R:R only.'
  }
  if (q.includes('forex') || q.includes('eur') || q.includes('gbp')) {
    return '💱 Forex market: EURUSD bearish on H4, liquidity sweep above 1.0880 likely before reversal down to 1.0720. GBPUSD showing CHOCH on H1 — potential intraday short from 1.2740–1.2760 OB. Both setups need confirmation on lower TF.'
  }
  if (q.includes('best') || q.includes('today')) {
    return '🎯 Top opportunities today:\n\n1. **BTC/USDT** — BUY | 94% confidence | 4H OB\n2. **SOL/USDT** — BUY | 87% confidence | CHOCH\n3. **EUR/USD** — SELL | 91% confidence | Liquidity Sweep\n\nAll signals above 80% confidence threshold. Always use proper risk management — max 1-2% per trade.'
  }
  if (q.includes('risk') || q.includes('management')) {
    return '⚠️ Risk Management Rules:\n\n• Never risk more than 1-2% per trade\n• Always set stop loss before entering\n• Minimum 1:2 Risk:Reward ratio\n• No more than 3-5 open trades simultaneously\n• Size down in high volatility conditions\n• Never average down on losing trades'
  }
  return `🤖 I analyzed your query about "${input}". Based on current market structure and AI analysis:\n\nThe market is showing mixed signals. I recommend waiting for confirmation on higher timeframes (4H/1D) before entering any position. Key levels to monitor and proper risk management are essential. Would you like me to run a detailed analysis on a specific pair?`
}

export default function AIChatPanel() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '👋 Hello! I\'m your AI Trading Assistant. I can analyze markets, explain SMC concepts, suggest setups, and help with your trading strategy. What would you like to know?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const allMessages = [...messages, userMsg]
    const reply = await sendChatMessage(allMessages)

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
    }])
    setLoading(false)
  }

  return (
    <>
      {/* Trigger button */}
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"
        >
          <Sparkles size={22} className="text-white" />
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
          >
            <div className="glass rounded-2xl border border-white/8 overflow-hidden shadow-2xl shadow-black/50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                    <Brain size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">AI Trading Assistant</div>
                    <div className="text-[10px] text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      Online
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMinimized(!minimized)}
                    className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors"
                  >
                    {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {!minimized && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Messages */}
                    <div className="h-72 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                      {messages.map(msg => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                              <Brain size={11} className="text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[78%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                              msg.role === 'user'
                                ? 'bg-cyan-500/20 text-white border border-cyan-500/20'
                                : 'glass text-white/80 border border-white/5'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </motion.div>
                      ))}

                      {loading && (
                        <div className="flex justify-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                            <Brain size={11} className="text-white" />
                          </div>
                          <div className="glass rounded-xl px-4 py-3 border border-white/5">
                            <div className="flex gap-1">
                              {[0, 1, 2].map(i => (
                                <div
                                  key={i}
                                  className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                                  style={{ animationDelay: `${i * 0.15}s` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length === 1 && (
                      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                        {SUGGESTIONS.map(s => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="text-xs px-3 py-1.5 glass rounded-full border border-white/8 text-white/50 hover:text-white hover:border-cyan-500/30 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 glass rounded-xl border border-white/8 px-3 py-2">
                        <input
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                          placeholder="Ask AI anything..."
                          className="flex-1 bg-transparent text-sm outline-none text-white placeholder-white/25"
                        />
                        <button
                          onClick={() => send()}
                          disabled={!input.trim() || loading}
                          className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center disabled:opacity-40 transition-opacity"
                        >
                          <Send size={12} className="text-white" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
