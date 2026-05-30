import { Router } from 'express'
import { getSignals, getSignalStats } from '../controllers/signals.controller'

const router = Router()
router.get('/',      getSignals)
router.get('/stats', getSignalStats)

export default router
