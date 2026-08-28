import { Types } from 'mongoose'
import { DocumentModel, type DocumentRecord, type TiptapContent } from '../models/Document.js'
import { AppError } from '../utils/AppError.js'
import { buildSharingInfo, type SharingInfo } from './sharingService.js'

export interface DocumentResponse {
  id: string
  title: string
  content: TiptapContent
  owner: string
  sharedWith: string[]
  access: 'owned' | 'shared'
  createdAt: Date
  updatedAt: Date
}

const serializeDocument = (document: DocumentRecord, userId: string): DocumentResponse => ({
  id: document.id,
  title: document.title,
  content: document.content,
  owner: document.owner.toString(),
  sharedWith: document.sharedWith.map((id) => id.toString()),
  access: document.owner.toString() === userId ? 'owned' : 'shared',
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
})

const validateDocumentId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid document ID')
  }
}

const findAccessibleDocument = async (id: string, userId: string): Promise<DocumentRecord> => {
  validateDocumentId(id)
  const document = await DocumentModel.findOne({
    _id: id,
    $or: [{ owner: userId }, { sharedWith: userId }],
  })

  if (!document) {
    throw new AppError(404, 'Document not found')
  }

  return document
}

export const createDocument = async (userId: string): Promise<DocumentResponse> => {
  const document = await DocumentModel.create({
    title: 'Untitled document',
    content: { type: 'doc', content: [] },
    owner: userId,
    sharedWith: [],
  })
  return serializeDocument(document, userId)
}

export const listDocuments = async (userId: string): Promise<DocumentResponse[]> => {
  const documents = await DocumentModel.find({
    $or: [{ owner: userId }, { sharedWith: userId }],
  }).sort({ updatedAt: -1 })
  return Promise.all(
    documents.map(async (document) => ({
      ...serializeDocument(document, userId),
      sharing: await buildSharingInfo(document),
    })),
  )
}

export const getDocument = async (id: string, userId: string): Promise<DocumentResponse & { sharing: SharingInfo }> => {
  const document = await findAccessibleDocument(id, userId)
  return { ...serializeDocument(document, userId), sharing: await buildSharingInfo(document) }
}

export const updateDocument = async (
  id: string,
  userId: string,
  updates: { title?: string; content?: TiptapContent },
): Promise<DocumentResponse> => {
  const document = await findAccessibleDocument(id, userId)
  if (updates.title !== undefined) document.title = updates.title
  if (updates.content !== undefined) document.content = updates.content
  await document.save()
  return serializeDocument(document, userId)
}

export const deleteDocument = async (id: string, userId: string): Promise<void> => {
  validateDocumentId(id)
  const document = await DocumentModel.findById(id)

  if (!document) throw new AppError(404, 'Document not found')
  if (document.owner.toString() !== userId) {
    throw new AppError(403, 'Only the document owner may delete this document')
  }
  await document.deleteOne()
}
