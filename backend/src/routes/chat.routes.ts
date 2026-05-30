import { Router } from 'express'
import { chat, chatValidators } from '../controllers/chat.controller'
import { validate } from '../middleware/validate'
import { generalLimiter } from '../middleware/rateLimiter'

const router = Router()

router.post('/', generalLimiter, chatValidators, validate, chat)

export default router
