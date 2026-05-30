import { Response } from 'express'

export function success(res: Response, data: unknown, statusCode = 200, message = 'Success') {
  return res.status(statusCode).json({ success: true, message, data })
}

export function error(res: Response, message: string, statusCode = 400, errors?: unknown) {
  return res.status(statusCode).json({ success: false, message, errors })
}
