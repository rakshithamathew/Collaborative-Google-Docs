import type { RequestHandler } from 'express'
import { AppError } from '../utils/AppError.js'

export const requireBodyFields = (...fields: string[]): RequestHandler => {
  return (request, _response, next) => {
    const missingFields = fields.filter((field) => {
      const value: unknown = request.body?.[field]
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
    })

    if (missingFields.length > 0) {
      next(new AppError(400, 'Request validation failed', { missingFields }))
      return
    }

    next()
  }
}
