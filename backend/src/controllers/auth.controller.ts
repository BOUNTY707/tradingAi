import { Request, Response } from 'express'
import { body } from 'express-validator'
import bcrypt from 'bcryptjs'
import { registerUser, loginUser, forgotPassword, resetPassword, googleAuthUser } from '../services/auth.service'
import { success, error } from '../utils/apiResponse'
import { AuthRequest } from '../middleware/auth'
import { prisma } from '../config/database'

export const registerValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
]

export const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
]

export const forgotPasswordValidators = [
  body('email').isEmail().normalizeEmail(),
]

export const resetPasswordValidators = [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
]

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await registerUser(req.body)
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    success(res, result, 201, 'Account created successfully')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    error(res, message)
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await loginUser(req.body.email, req.body.password)
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    success(res, result, 200, 'Login successful')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed'
    error(res, message, 401)
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token')
  success(res, null, 200, 'Logged out successfully')
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isApproved: true,
        emailVerified: true,
        settings: true,
        createdAt: true,
        subscription: { include: { plan: true } },
      },
    })
    if (!user) { error(res, 'User not found', 404); return }
    const parsed = { ...user, settings: user.settings ? JSON.parse(user.settings as string) : null }
    success(res, parsed)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user'
    error(res, message, 500)
  }
}

export const updateProfileValidators = [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
]

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { firstName, lastName } = req.body
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { firstName, lastName },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isApproved: true, emailVerified: true, settings: true,
        subscription: { include: { plan: true } },
      },
    })
    const parsed = { ...user, settings: user.settings ? JSON.parse(user.settings as string) : null }
    success(res, parsed, 200, 'Profile updated')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile'
    error(res, message, 500)
  }
}

export const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('confirmPassword').notEmpty(),
]

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body
    if (newPassword !== confirmPassword) {
      error(res, 'Passwords do not match', 400); return
    }
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
    if (!user || !user.password) {
      error(res, 'User not found', 404); return
    }
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      error(res, 'Current password is incorrect', 400); return
    }
    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.user!.userId }, data: { password: hashed } })
    success(res, null, 200, 'Password updated successfully')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to change password'
    error(res, message, 500)
  }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const settings = req.body
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { settings: JSON.stringify(settings) },
    })
    success(res, settings, 200, 'Settings saved')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save settings'
    error(res, message, 500)
  }
}

export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await forgotPassword(req.body.email)
    success(res, result, 200, 'If that email exists, a reset link was sent')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process request'
    error(res, message, 500)
  }
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await resetPassword(req.body.token, req.body.password)
    success(res, result, 200, 'Password reset successfully')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reset password'
    error(res, message, 400)
  }
}

export async function googleAuthHandler(req: Request, res: Response): Promise<void> {
  try {
    const { accessToken } = req.body
    if (!accessToken) { error(res, 'Access token required', 400); return }

    const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!resp.ok) {
      const errBody = await resp.text()
      console.error('[Google Auth] userinfo failed:', resp.status, errBody)
      error(res, `Google token invalid (${resp.status})`, 401)
      return
    }

    const googleUser = await resp.json() as {
      sub: string; email: string; given_name?: string; family_name?: string; picture?: string
    }

    if (!googleUser.email) { error(res, 'Google account has no email', 400); return }

    const result = await googleAuthUser({
      googleId: googleUser.sub,
      email: googleUser.email,
      firstName: googleUser.given_name || 'User',
      lastName: googleUser.family_name || '',
      avatar: googleUser.picture,
    })

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    success(res, result, 200, 'Google login successful')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Google authentication failed'
    error(res, message, 401)
  }
}
