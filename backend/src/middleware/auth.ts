import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { error } from '../utils/apiResponse'

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) { error(res, 'Authentication required', 401); return }
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    error(res, 'Invalid or expired token', 401)
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') { error(res, 'Admin access required', 403); return }
  next()
}
