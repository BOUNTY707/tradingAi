import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'

export async function seedAdmin(): Promise<void> {
  try {
    const email = 'mehrobakooo@gmail.com'
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      // Always sync password, role, isApproved
      const hashed = await bcrypt.hash('Bounty707', 12)
      await prisma.user.update({
        where: { email },
        data: { password: hashed, role: 'ADMIN', isApproved: true, emailVerified: true },
      })
      logger.info('[Seed] Admin user synced (password + role + isApproved)')
      return
    }

    const hashed = await bcrypt.hash('Bounty707', 12)
    await prisma.user.create({
      data: {
        email,
        password:    hashed,
        firstName:   'Mehribon',
        lastName:    'Admin',
        role:        'ADMIN',
        isApproved:  true,
        emailVerified: true,
      },
    })
    logger.info('[Seed] Super admin created: mehrobakooo@gmail.com')
  } catch (err) {
    logger.error('[Seed] Failed:', err instanceof Error ? err.message : err)
  }
}
