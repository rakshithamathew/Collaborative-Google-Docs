import { documentApi } from './api'

export interface TiptapContent {
  type: 'doc'
  content?: Array<Record<string, unknown>>
  [key: string]: unknown
}

export interface DocumentRecord {
  id: string
  title: string
  content: TiptapContent
  owner: string
  sharedWith: string[]
  access: 'owned' | 'shared'
  createdAt: string
  updatedAt: string
  sharing?: SharingInfo
}

export interface SharingUser {
  id: string
  name: string
  email: string
}

export interface SharingInfo {
  owner: SharingUser
  sharedWith: SharingUser[]
}

export const documentService = {
  async list(): Promise<DocumentRecord[]> {
    const data = await documentApi.getAll<{ documents: DocumentRecord[] }>()
    return data.documents
  },
  async create(): Promise<DocumentRecord> {
    const data = await documentApi.create<{ document: DocumentRecord }>()
    return data.document
  },
  async import(file: File): Promise<DocumentRecord> {
    const data = await documentApi.importFile<{ document: DocumentRecord }>(file)
    return data.document
  },
  async get(id: string): Promise<DocumentRecord> {
    const data = await documentApi.getOne<{ document: DocumentRecord }>(id)
    return data.document
  },
  async update(id: string, updates: { title: string; content: TiptapContent }): Promise<DocumentRecord> {
    const data = await documentApi.update<{ document: DocumentRecord }>(id, updates)
    return data.document
  },
  async delete(id: string): Promise<void> {
    await documentApi.delete(id)
  },
  async share(id: string, email: string): Promise<SharingInfo> {
    const data = await documentApi.share<{ sharing: SharingInfo }>(id, email)
    return data.sharing
  },
  async removeSharedAccess(id: string, userId: string): Promise<SharingInfo> {
    const data = await documentApi.removeSharedAccess<{ sharing: SharingInfo }>(id, userId)
    return data.sharing
  },
}
