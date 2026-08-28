import type { RequestHandler } from 'express'
import { AppError } from '../utils/AppError.js'
import { isTiptapDocument } from '../utils/tiptapValidation.js'
import { MAX_DOCUMENT_TITLE_LENGTH } from '../utils/validation.js'

const allowedFields = new Set(['title', 'content'])

export const validateDocumentUpdate: RequestHandler = (request, _response, next) => {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    throw new AppError(400, 'Request body must be an object')
  }

  const fields = Object.keys(request.body)
  const unsupportedFields = fields.filter((field) => !allowedFields.has(field))
  if (fields.length === 0) throw new AppError(400, 'At least one of title or content is required')
  if (unsupportedFields.length > 0) {
    throw new AppError(400, 'Request contains unsupported fields', { unsupportedFields })
  }
  if ('title' in request.body && (typeof request.body.title !== 'string' || request.body.title.trim() === '')) {
    throw new AppError(400, 'Title must be a non-empty string')
  }
  if (typeof request.body.title === 'string' && request.body.title.trim().length > MAX_DOCUMENT_TITLE_LENGTH) {
    throw new AppError(400, `Title must be ${MAX_DOCUMENT_TITLE_LENGTH} characters or fewer`)
  }
  if ('content' in request.body) {
    if (!isTiptapDocument(request.body.content)) throw new AppError(400, 'Content must be valid Tiptap JSON')
  }
  if (typeof request.body.title === 'string') request.body.title = request.body.title.trim()
  next()
}
