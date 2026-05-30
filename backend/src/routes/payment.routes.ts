import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { submitPayment, getMyPaymentStatus } from '../controllers/payment.controller'

const router = Router()
router.use(authenticate)
router.post('/',       submitPayment)
router.get('/status',  getMyPaymentStatus)

export default router
