import { Router } from 'express'
import { runAnalysis, runImageAnalysis, getAnalysisHistory } from '../controllers/analysis.controller'
import { authenticate } from '../middleware/auth'
import { analysisLimiter } from '../middleware/rateLimiter'
import { body } from 'express-validator'
import { validate } from '../middleware/validate'

const router = Router()

router.post(
  '/',
  authenticate,
  analysisLimiter,
  [body('symbol').notEmpty(), body('market').notEmpty(), body('timeframe').notEmpty(), body('strategy').notEmpty()],
  validate,
  runAnalysis,
)

router.post('/image', authenticate, analysisLimiter, runImageAnalysis)

router.get('/history', authenticate, getAnalysisHistory)

export default router
