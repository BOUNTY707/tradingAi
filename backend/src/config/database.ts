import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const log = process.env.NODE_ENV === 'development'
    ? (['error', 'warn'] as const)
    : (['error'] as const)

  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    // Production: Supabase / PostgreSQL
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require('pg') as typeof import('pg')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaPg } = require('@prisma/adapter-pg') as typeof import('@prisma/adapter-pg')
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter, log })
  }

  // Local dev: SQLite via libsql
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaLibSql } = require('@prisma/adapter-libsql') as typeof import('@prisma/adapter-libsql')
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter, log })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
