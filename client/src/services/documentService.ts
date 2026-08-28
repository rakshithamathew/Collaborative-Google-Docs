import { api } from './api'

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
    const { data } = await api.get<{ documents: DocumentRecord[] }>('/api/documents')
    return data.documents
  },
  async create(): Promise<DocumentRecord> {
    const { data } = await api.post<{ document: DocumentRecord }>('/api/documents')
    return data.document
  },
  async import(file: File): Promise<DocumentRecord> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<{ document: DocumentRecord }>('/api/documents/import', formData)
    return data.document
  },
  async get(id: string): Promise<DocumentRecord> {
    const { data } = await api.get<{ document: DocumentRecord }>(`/api/documents/${id}`)
    return data.document
  },
  async update(id: string, updates: { title: string; content: TiptapContent }): Promise<DocumentRecord> {
    const { data } = await api.patch<{ document: DocumentRecord }>(`/api/documents/${id}`, updates)
    return data.document
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/api/documents/${id}`)
  },
  async share(id: string, email: string): Promise<SharingInfo> {
    const { data } = await api.post<{ sharing: SharingInfo }>(`/api/documents/${id}/share`, { email })
    return data.sharing
  },
  async removeSharedAccess(id: string, userId: string): Promise<SharingInfo> {
    const { data } = await api.delete<{ sharing: SharingInfo }>(`/api/documents/${id}/share/${userId}`)
    return data.sharing
  },
}
