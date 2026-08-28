import type { RequestHandler } from 'express'
import type { TiptapContent } from '../models/Document.js'
import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '../services/documentService.js'
import { AppError } from '../utils/AppError.js'
import { importFileAsDocument } from '../services/fileImportService.js'
import { removeSharedAccess, shareDocument } from '../services/sharingService.js'

const currentUserId = (userId: unknown): string => {
  if (!userId) throw new AppError(503, 'Demo user is unavailable')
  return String(userId)
}

const documentId = (id: string | string[] | undefined): string => {
  if (typeof id !== 'string') throw new AppError(400, 'Invalid document ID')
  return id
}

export const createDocumentController: RequestHandler = async (request, response) => {
  response.status(201).json({ document: await createDocument(currentUserId(request.user?._id)) })
}

export const importDocumentController: RequestHandler = async (request, response) => {
  if (!request.file) throw new AppError(400, 'Select one file to import')
  const document = await importFileAsDocument(request.file, currentUserId(request.user?._id))
  response.status(201).json({ document })
}

export const listDocumentsController: RequestHandler = async (request, response) => {
  response.json({ documents: await listDocuments(currentUserId(request.user?._id)) })
}

export const getDocumentController: RequestHandler = async (request, response) => {
  response.json({ document: await getDocument(documentId(request.params.id), currentUserId(request.user?._id)) })
}

export const updateDocumentController: RequestHandler = async (request, response) => {
  response.json({
    document: await updateDocument(
      documentId(request.params.id),
      currentUserId(request.user?._id),
      request.body as { title?: string; content?: TiptapContent },
    ),
  })
}

export const deleteDocumentController: RequestHandler = async (request, response) => {
  await deleteDocument(documentId(request.params.id), currentUserId(request.user?._id))
  response.status(204).send()
}

export const shareDocumentController: RequestHandler = async (request, response) => {
  const sharing = await shareDocument(
    documentId(request.params.id),
    currentUserId(request.user?._id),
    request.body?.email,
  )
  response.json({ sharing })
}

export const removeSharedAccessController: RequestHandler = async (request, response) => {
  const sharing = await removeSharedAccess(
    documentId(request.params.id),
    currentUserId(request.user?._id),
    documentId(request.params.userId),
  )
  response.json({ sharing })
}
