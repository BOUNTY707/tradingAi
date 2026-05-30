import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('Bounty707', 12)
  const user = await prisma.user.upsert({
    where:  { email: 'mehrobakooo@gmail.com' },
    update: { password: hash, role: 'ADMIN', isApproved: true, emailVerified: true },
    create: {
      email: 'mehrobakooo@gmail.com', password: hash,
      firstName: 'Mehribon', lastName: 'Admin',
      role: 'ADMIN', isApproved: true, emailVerified: true,
    },
  })
  console.log('✅ Admin tayyor:', user.email, '| role:', user.role, '| isApproved:', user.isApproved)
}

main().finally(() => prisma.$disconnect())
