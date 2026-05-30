import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { prisma } from '../config/database'
import { success, error } from '../utils/apiResponse'

export async function submitPayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { planName, amount, method, screenshot } = req.body as {
      planName: string; amount: number; method: string; screenshot: string
    }
    if (!planName || !amount || !method || !screenshot) {
      error(res, 'planName, amount, method, screenshot majburiy', 400); return
    }

    const existing = await prisma.paymentRequest.findFirst({
      where: { userId: req.user!.userId, status: 'PENDING' },
    })
    if (existing) {
      error(res, 'Sizning kutilayotgan to\'lov so\'rovingiz allaqachon mavjud', 400); return
    }

    const pr = await prisma.paymentRequest.create({
      data: {
        userId:     req.user!.userId,
        planName,
        amount:     Number(amount),
        method,
        screenshot: screenshot.replace(/^data:image\/\w+;base64,/, ''),
      },
    })
    success(res, { id: pr.id, status: pr.status }, 201)
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export async function getMyPaymentStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pr = await prisma.paymentRequest.findFirst({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, planName: true, createdAt: true },
    })
    success(res, pr ?? null)
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}
