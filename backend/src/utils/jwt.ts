import jwt from 'jsonwebtoken'
import { config } from '../config/env'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '30d' } as jwt.SignOptions)
}
