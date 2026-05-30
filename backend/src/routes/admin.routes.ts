import { Router } from 'express'
import {
  getDashboardStats, getUsers,
  resetUserPassword, toggleUserApproval,
  getPaymentRequests, getPaymentRequestById,
  approvePayment, rejectPayment,
} from '../controllers/admin.controller'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()
router.use(authenticate, requireAdmin)

router.get('/stats',                          getDashboardStats)
router.get('/users',                          getUsers)
router.post('/users/:id/reset-password',      resetUserPassword)
router.post('/users/:id/toggle-approval',     toggleUserApproval)
router.get('/payments',                       getPaymentRequests)
router.get('/payments/:id',                   getPaymentRequestById)
router.post('/payments/:id/approve',          approvePayment)
router.post('/payments/:id/reject',           rejectPayment)

export default router
