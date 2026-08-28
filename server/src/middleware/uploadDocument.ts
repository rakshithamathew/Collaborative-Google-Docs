import path from 'node:path'
import multer from 'multer'
import { AppError } from '../utils/AppError.js'

const allowedMimeTypes: Record<string, Set<string>> = {
  '.txt': new Set(['text/plain']),
  '.md': new Set(['text/markdown', 'text/x-markdown', 'text/plain', 'application/octet-stream']),
  '.docx': new Set([
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ]),
}

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const mimeTypes = allowedMimeTypes[extension]

    if (!mimeTypes || !mimeTypes.has(file.mimetype.toLowerCase())) {
      callback(new AppError(400, 'Unsupported file type. Supported files: TXT, MD, DOCX'))
      return
    }

    callback(null, true)
  },
}).single('file')
