import { Types } from 'mongoose'
import { DocumentModel, type DocumentRecord } from '../models/Document.js'
import { UserModel, type UserDocument } from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { isValidEmail } from '../utils/validation.js'

export interface SharingUser {
  id: string
  name: string
  email: string
}

export interface SharingInfo {
  owner: SharingUser
  sharedWith: SharingUser[]
}

const publicUser = (user: UserDocument): SharingUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
})

const validateId = (id: string, label: string): void => {
  if (!Types.ObjectId.isValid(id)) throw new AppError(400, `Invalid ${label} ID`)
}

const ownerDocument = async (documentId: string, ownerId: string): Promise<DocumentRecord> => {
  validateId(documentId, 'document')
  const document = await DocumentModel.findById(documentId)

  if (!document) throw new AppError(404, 'Document not found')
  if (document.owner.toString() !== ownerId) {
    throw new AppError(403, 'Only the document owner may manage sharing')
  }

  return document
}

export const buildSharingInfo = async (document: DocumentRecord): Promise<SharingInfo> => {
  const [owner, sharedUsers] = await Promise.all([
    UserModel.findById(document.owner),
    UserModel.find({ _id: { $in: document.sharedWith } }),
  ])

  if (!owner) throw new AppError(500, 'Document owner could not be loaded')
  const usersById = new Map(sharedUsers.map((user) => [user.id, user]))

  return {
    owner: publicUser(owner),
    sharedWith: document.sharedWith
      .map((id) => usersById.get(id.toString()))
      .filter((user): user is UserDocument => Boolean(user))
      .map(publicUser),
  }
}

export const shareDocument = async (documentId: string, ownerId: string, email: unknown): Promise<SharingInfo> => {
  if (typeof email !== 'string' || !isValidEmail(email.trim())) {
    throw new AppError(400, 'Email must be a valid email address')
  }

  const document = await ownerDocument(documentId, ownerId)
  const user = await UserModel.findOne({ email: email.trim().toLowerCase() })

  if (!user) throw new AppError(404, 'User not found')
  if (user.id === ownerId) throw new AppError(400, 'You cannot share a document with yourself')
  if (document.sharedWith.some((id) => id.equals(user._id))) {
    throw new AppError(409, 'This user already has access')
  }

  document.sharedWith.push(user._id)
  await document.save()
  return buildSharingInfo(document)
}

export const removeSharedAccess = async (documentId: string, ownerId: string, userId: string): Promise<SharingInfo> => {
  validateId(userId, 'user')
  const document = await ownerDocument(documentId, ownerId)
  const sharedIndex = document.sharedWith.findIndex((id) => id.toString() === userId)

  if (sharedIndex === -1) throw new AppError(404, 'User does not have shared access')

  document.sharedWith.splice(sharedIndex, 1)
  await document.save()
  return buildSharingInfo(document)
}
