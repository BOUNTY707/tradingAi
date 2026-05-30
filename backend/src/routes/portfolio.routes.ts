import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { getTrades, addTrade, closeTrade, deleteTrade } from '../controllers/portfolio.controller'

const router = Router()
router.use(authenticate)
router.get('/',        getTrades)
router.post('/',       addTrade)
router.patch('/:id',   closeTrade)
router.delete('/:id',  deleteTrade)

export default router
