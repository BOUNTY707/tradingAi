import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../config/database'
import { signToken, signRefreshToken } from '../utils/jwt'

export async function registerUser(data: {
  email: string; password: string; firstName: string; lastName: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Email already in use')

  const hashed = await bcrypt.hash(data.password, 12)
  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashed,
      emailVerifyToken: crypto.randomUUID(),
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isApproved: true, createdAt: true },
  })

  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  return { user, token }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) throw new Error('Invalid credentials')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Invalid credentials')

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role })

  return {
    user: {
      id: user.id, email: user.email, firstName: user.firstName,
      lastName: user.lastName, role: user.role, isApproved: user.isApproved,
    },
    token,
    refreshToken,
  }
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  // Always return success to prevent email enumeration
  if (!user) return { sent: true }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetExp = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: resetToken, resetPasswordExp: resetExp },
  })

  // In production: send email with reset link
  // The reset link would be: ${FRONTEND_URL}/reset-password?token=${resetToken}
  return { sent: true, token: resetToken } // token only returned for dev/testing
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExp: { gt: new Date() },
    },
  })

  if (!user) throw new Error('Invalid or expired reset token')

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetPasswordToken: null, resetPasswordExp: null },
  })

  return { success: true }
}

export async function googleAuthUser(data: {
  googleId: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
}) {
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: data.googleId }, { email: data.email }] },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        googleId: data.googleId,
        avatar: data.avatar,
        emailVerified: true,
      },
    })
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: data.googleId, emailVerified: true, ...(data.avatar && { avatar: data.avatar }) },
    })
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  return {
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isApproved: user.isApproved, avatar: user.avatar },
    token,
  }
}
