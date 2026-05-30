import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { success, error } from '../utils/apiResponse'
import { AuthRequest } from '../middleware/auth'

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [
      totalUsers,
      approvedUsers,
      activeSubscriptions,
      totalSignals,
      pendingPayments,
      approvedPayments,
      allApprovedPayments,
      newUsersThisMonth,
      newUsersLastMonth,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isApproved: true } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.tradingSignal.count({ where: { isActive: true } }),
      prisma.paymentRequest.count({ where: { status: 'PENDING' } }),
      prisma.paymentRequest.count({ where: { status: 'APPROVED' } }),
      prisma.paymentRequest.findMany({
        where: { status: 'APPROVED' },
        select: { amount: true, planName: true, createdAt: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isApproved: true, createdAt: true },
      }),
    ])

    // Revenue calculations
    const totalRevenue = allApprovedPayments.reduce((s, p) => s + p.amount, 0)
    const revenueThisMonth = allApprovedPayments
      .filter(p => new Date(p.createdAt) >= startOfMonth)
      .reduce((s, p) => s + p.amount, 0)
    const revenueLastMonth = allApprovedPayments
      .filter(p => new Date(p.createdAt) >= startOfLastMonth && new Date(p.createdAt) <= endOfLastMonth)
      .reduce((s, p) => s + p.amount, 0)

    // Revenue by plan
    const revenueByPlan: Record<string, { count: number; amount: number }> = {}
    for (const p of allApprovedPayments) {
      if (!revenueByPlan[p.planName]) revenueByPlan[p.planName] = { count: 0, amount: 0 }
      revenueByPlan[p.planName].count++
      revenueByPlan[p.planName].amount += p.amount
    }

    const MONTHS_UZ = ['Yan','Feb','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek']

    // Revenue by day — last 30 days
    const revenueByDay: { label: string; amount: number; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
      const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
      const pays  = allApprovedPayments.filter(p => { const t = new Date(p.createdAt); return t >= start && t <= end })
      revenueByDay.push({ label: `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}`, amount: pays.reduce((s,p)=>s+p.amount,0), count: pays.length })
    }

    // Revenue by month — last 12 months
    const revenueByMonth: { label: string; amount: number; count: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const pays  = allApprovedPayments.filter(p => { const t = new Date(p.createdAt); return t >= start && t <= end })
      revenueByMonth.push({ label: `${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()}`, amount: pays.reduce((s,p)=>s+p.amount,0), count: pays.length })
    }

    // Revenue by year — last 5 years
    const revenueByYear: { label: string; amount: number; count: number }[] = []
    for (let i = 4; i >= 0; i--) {
      const yr = now.getFullYear() - i
      const pays = allApprovedPayments.filter(p => new Date(p.createdAt).getFullYear() === yr)
      revenueByYear.push({ label: `${yr}`, amount: pays.reduce((s,p)=>s+p.amount,0), count: pays.length })
    }

    // Users by day — last 30 days
    const allUsers = await prisma.user.findMany({ select: { createdAt: true } })
    const usersByDay: { label: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
      const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
      usersByDay.push({ label: `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}`, count: allUsers.filter(u => { const t = new Date(u.createdAt); return t >= start && t <= end }).length })
    }

    // Users by month — last 12 months
    const usersByMonth: { label: string; count: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      usersByMonth.push({ label: `${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()}`, count: allUsers.filter(u => { const t = new Date(u.createdAt); return t >= start && t <= end }).length })
    }

    // Users by year — last 5 years
    const usersByYear: { label: string; count: number }[] = []
    for (let i = 4; i >= 0; i--) {
      const yr = now.getFullYear() - i
      usersByYear.push({ label: `${yr}`, count: allUsers.filter(u => new Date(u.createdAt).getFullYear() === yr).length })
    }

    success(res, {
      totalUsers,
      approvedUsers,
      activeSubscriptions,
      totalSignals,
      pendingPayments,
      approvedPayments,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      revenueByPlan,
      newUsersThisMonth,
      newUsersLastMonth,
      revenueByDay,
      revenueByMonth,
      revenueByYear,
      usersByDay,
      usersByMonth,
      usersByYear,
      recentUsers,
    })
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const page  = parseInt(req.query['page']  as string) || 1
    const limit = parseInt(req.query['limit'] as string) || 20
    const search = req.query['search'] as string | undefined
    const where = search
      ? { OR: [{ email: { contains: search } }, { firstName: { contains: search } }] }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isApproved: true, emailVerified: true, createdAt: true,
          subscription: { include: { plan: true } },
        },
      }),
      prisma.user.count({ where }),
    ])
    success(res, { users, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

// ── User management ──────────────────────────────────────────────

export async function resetUserPassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id       = req.params['id'] as string
    const { newPassword } = req.body as { newPassword: string }

    if (!newPassword || newPassword.length < 6) {
      error(res, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak', 400); return
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) { error(res, 'Foydalanuvchi topilmadi', 404); return }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id }, data: { password: hashed } })

    success(res, { reset: true, email: user.email })
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export async function toggleUserApproval(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params['id'] as string
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) { error(res, 'Foydalanuvchi topilmadi', 404); return }

    const updated = await prisma.user.update({
      where: { id },
      data: { isApproved: !user.isApproved },
      select: { id: true, email: true, isApproved: true },
    })
    success(res, updated)
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

// ── Payment requests ──────────────────────────────────────────────

export async function getPaymentRequests(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query['status'] as string | undefined
    const requests = await prisma.paymentRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, isApproved: true },
        },
      },
    })
    // Don't send base64 in list (too heavy), just metadata
    const mapped = requests.map(r => ({
      id: r.id, userId: r.userId, planName: r.planName, amount: r.amount,
      method: r.method, status: r.status, note: r.note, createdAt: r.createdAt,
      hasScreenshot: !!r.screenshot,
      user: r.user,
    }))
    success(res, mapped)
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export async function getPaymentRequestById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params['id'] as string
    const r = await prisma.paymentRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    })
    if (!r) { error(res, 'Not found', 404); return }
    success(res, r)
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export async function approvePayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params['id'] as string
    const { note } = req.body as { note?: string }

    const pr = await prisma.paymentRequest.findUnique({ where: { id } })
    if (!pr) { error(res, 'Payment request not found', 404); return }

    // Determine plan duration from planName
    const durationMap: Record<string, number> = {
      '1 Oylik': 1, '3 Oylik': 3, '12 Oylik': 12,
    }
    const months = durationMap[pr.planName] ?? 1
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + months)

    // Find or create a Pro plan
    let plan = await prisma.plan.findFirst({ where: { type: 'PRO' } })
    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          name: 'Pro',
          type: 'PRO',
          priceMonthly: 100000,
          durationMonths: 1,
          features: ['Unlimited signals', 'All markets', 'AI analysis'],
        },
      })
    }

    // Upsert subscription
    const existingSub = await prisma.subscription.findUnique({ where: { userId: pr.userId } })
    if (existingSub) {
      await prisma.subscription.update({
        where: { userId: pr.userId },
        data: { planId: plan.id, status: 'ACTIVE', endDate, startDate: new Date() },
      })
    } else {
      await prisma.subscription.create({
        data: {
          userId: pr.userId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate,
        },
      })
    }

    await Promise.all([
      prisma.paymentRequest.update({
        where: { id },
        data: { status: 'APPROVED', note: note ?? null },
      }),
      prisma.user.update({
        where: { id: pr.userId },
        data: { isApproved: true },
      }),
    ])

    success(res, { approved: true })
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export async function rejectPayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params['id'] as string
    const { note } = req.body as { note?: string }

    const pr = await prisma.paymentRequest.findUnique({ where: { id } })
    if (!pr) { error(res, 'Payment request not found', 404); return }

    await prisma.paymentRequest.update({
      where: { id },
      data: { status: 'REJECTED', note: note ?? null },
    })

    success(res, { rejected: true })
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}
