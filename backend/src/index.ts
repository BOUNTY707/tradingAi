import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { config } from './config/env'
import { logger } from './utils/logger'
import { generalLimiter } from './middleware/rateLimiter'
import { initSockets } from './sockets'
import authRoutes from './routes/auth.routes'
import analysisRoutes from './routes/analysis.routes'
import signalRoutes from './routes/signals.routes'
import adminRoutes from './routes/admin.routes'
import chatRoutes from './routes/chat.routes'
import { startSignalGenerator } from './services/signal.generator.service'
import { seedAdmin } from './services/seed.service'
import portfolioRoutes from './routes/portfolio.routes'
import paymentRoutes  from './routes/payment.routes'

const app = express()
const httpServer = createServer(app)

// Security middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
app.use(cors({ origin: config.frontendUrl, credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }))
app.use('/api', generalLimiter)

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/analysis', analysisRoutes)
app.use('/api/v1/signals', signalRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/portfolio', portfolioRoutes)
app.use('/api/v1/payments',  paymentRoutes)
app.use('/api/v1/chat', chatRoutes)

// Health check
app.get('/health', (_req: Request, res: Response) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() }),
)

// 404 handler
app.use((_req: Request, res: Response) =>
  res.status(404).json({ success: false, message: 'Route not found' }),
)

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// Init WebSockets
initSockets(httpServer, config.frontendUrl)

function keepAlive(): void {
  if (config.nodeEnv !== 'production') return
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.port}`
  setInterval(async () => {
    try {
      await fetch(`${url}/health`)
      logger.info('[KeepAlive] ping ok')
    } catch {
      logger.warn('[KeepAlive] ping failed')
    }
  }, 10 * 60 * 1000)
}

httpServer.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} (${config.nodeEnv})`)
  seedAdmin()
  startSignalGenerator()
  keepAlive()
})
