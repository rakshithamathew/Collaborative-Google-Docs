import axios from 'axios'

// Vite injects VITE_* variables at build time. Removing a trailing slash keeps
// request URLs consistent when endpoints below begin with `/api`.
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export const api = axios.create({
  baseURL: API_BASE_URL,
})

const responseData = async <T>(request: Promise<{ data: T }>) => {
  const response = await request
  return response.data
}

export const documentApi = {
  getAll: <T = unknown>() => responseData<T>(api.get('/api/documents')),
  getOne: <T = unknown>(id: string) => responseData<T>(api.get(`/api/documents/${id}`)),
  create: <T = unknown>(data: unknown) => responseData<T>(api.post('/api/documents', data)), // ✅ Added data parameter
  importFile: <T = unknown>(file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return responseData<T>(api.post('/api/documents/import', formData))
  },
  update: <T = unknown>(id: string, data: unknown) => responseData<T>(api.patch(`/api/documents/${id}`, data)),
  delete: <T = unknown>(id: string) => responseData<T>(api.delete(`/api/documents/${id}`)),
  share: <T = unknown>(id: string, email: string) => responseData<T>(api.post(`/api/documents/${id}/share`, { email })),
  removeSharedAccess: <T = unknown>(id: string, userId: string) => responseData<T>(api.delete(`/api/documents/${id}/share/${userId}`)),
}
