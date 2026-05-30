import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { prisma } from '../config/database'
import { success, error } from '../utils/apiResponse'

export async function getTrades(req: AuthRequest, res: Response): Promise<void> {
  try {
    const trades = await prisma.tradingHistory.findMany({
      where: { userId: req.user!.userId },
      orderBy: { openedAt: 'desc' },
    })
    success(res, trades)
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed to fetch trades', 500)
  }
}

export async function addTrade(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { symbol, direction, entryPrice, size, notes } = req.body as {
      symbol: string; direction: string; entryPrice: number; size: number; notes?: string
    }
    if (!symbol || !direction || !entryPrice || !size) {
      error(res, 'symbol, direction, entryPrice, size majburiy', 400); return
    }
    const trade = await prisma.tradingHistory.create({
      data: {
        userId:     req.user!.userId,
        symbol:     symbol.toUpperCase(),
        direction:  direction as 'BUY' | 'SELL',
        entryPrice: Number(entryPrice),
        size:       Number(size),
        status:     'OPEN',
        openedAt:   new Date(),
        notes:      notes ?? null,
      },
    })
    success(res, trade, 201)
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed to add trade', 500)
  }
}

export async function closeTrade(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params['id'] as string
    const { exitPrice } = req.body as { exitPrice: number }

    const trade = await prisma.tradingHistory.findFirst({
      where: { id, userId: req.user!.userId },
    })
    if (!trade) { error(res, 'Trade topilmadi', 404); return }
    if (trade.status !== 'OPEN') { error(res, 'Trade allaqachon yopiq', 400); return }

    const exit   = Number(exitPrice)
    const rawPnl = trade.direction === 'BUY'
      ? (exit - trade.entryPrice) * trade.size
      : (trade.entryPrice - exit) * trade.size
    const pnl        = parseFloat(rawPnl.toFixed(4))
    const pnlPercent = parseFloat(((rawPnl / (trade.entryPrice * trade.size)) * 100).toFixed(2))

    const updated = await prisma.tradingHistory.update({
      where: { id },
      data: { exitPrice: exit, pnl, pnlPercent, status: 'CLOSED', closedAt: new Date() },
    })
    success(res, updated)
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed to close trade', 500)
  }
}

export async function deleteTrade(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params['id'] as string
    const trade = await prisma.tradingHistory.findFirst({
      where: { id, userId: req.user!.userId },
    })
    if (!trade) { error(res, 'Trade topilmadi', 404); return }
    await prisma.tradingHistory.delete({ where: { id } })
    success(res, { deleted: true })
  } catch (err: unknown) {
    error(res, err instanceof Error ? err.message : 'Failed to delete trade', 500)
  }
}
