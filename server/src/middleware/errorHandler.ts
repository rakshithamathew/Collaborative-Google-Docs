import type { ErrorRequestHandler } from 'express'
import { AppError } from '../utils/AppError.js'
import multer from 'multer'
import mongoose from 'mongoose'

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof multer.MulterError) {
    response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      error: error.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Maximum size is 5 MB' : error.message,
    })
    return
  }
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    })
    return
  }
  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ error: 'Request validation failed' })
    return
  }
  if (error instanceof SyntaxError && typeof error === 'object' && error !== null && 'body' in error) {
    response.status(400).json({ error: 'Malformed JSON request body' })
    return
  }
  if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large') {
    response.status(413).json({ error: 'Request body is too large' })
    return
  }

  console.error(error)
  response.status(500).json({ error: 'Internal server error' })
}
