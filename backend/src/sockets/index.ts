import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import { verifyToken } from '../utils/jwt'
import { logger } from '../utils/logger'

export function initSockets(httpServer: HttpServer, frontendUrl: string): Server {
  const io = new Server(httpServer, {
    cors: { origin: frontendUrl, credentials: true },
    transports: ['websocket', 'polling'],
  })

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth as Record<string, string>)['token'] ||
      socket.handshake.headers['authorization']?.replace('Bearer ', '')
    if (!token) { next(new Error('Authentication required')); return }
    try {
      const payload = verifyToken(token)
      socket.data['user'] = payload
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data['user'] as { userId: string } | undefined
    logger.info(`Socket connected: ${socket.id} (user: ${user?.userId})`)
    socket.join(`user:${user?.userId}`)

    socket.on('subscribe:signals', (market: string) => {
      socket.join(`signals:${market}`)
    })

    socket.on('unsubscribe:signals', (market: string) => {
      socket.leave(`signals:${market}`)
    })

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`)
    })
  })

  // Broadcast mock live signals every 30s
  setInterval(() => {
    const symbols = ['BTC/USDT', 'ETH/USDT', 'EUR/USD']
    const mockSignal = {
      id: Date.now().toString(),
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
      confidence: Math.round(80 + Math.random() * 17),
      timestamp: new Date().toISOString(),
    }
    io.to('signals:CRYPTO').emit('signal:new', mockSignal)
    io.emit('signal:update', mockSignal)
  }, 30000)

  return io
}
