import { Router } from 'express'
import {
  register, login, logout, me,
  registerValidators, loginValidators,
  forgotPasswordHandler, resetPasswordHandler,
  forgotPasswordValidators, resetPasswordValidators,
  googleAuthHandler,
  updateProfile, updateProfileValidators,
  changePassword, changePasswordValidators,
  updateSettings,
} from '../controllers/auth.controller'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'

const router = Router()

router.post('/register', authLimiter, registerValidators, validate, register)
router.post('/login', authLimiter, loginValidators, validate, login)
router.post('/logout', logout)
router.get('/me', authenticate, me)
router.patch('/me', authenticate, updateProfileValidators, validate, updateProfile)
router.post('/change-password', authenticate, changePasswordValidators, validate, changePassword)
router.patch('/settings', authenticate, updateSettings)
router.post('/forgot-password', authLimiter, forgotPasswordValidators, validate, forgotPasswordHandler)
router.post('/reset-password', authLimiter, resetPasswordValidators, validate, resetPasswordHandler)
router.post('/google', authLimiter, googleAuthHandler)

export default router
