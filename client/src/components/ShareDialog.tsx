import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { documentService, type SharingInfo } from '../services/documentService'

interface ShareDialogProps {
  documentId: string
  sharing: SharingInfo
  onChange: (sharing: SharingInfo) => void
  onClose: () => void
}

export function ShareDialog({ documentId, sharing, onChange, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const share = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setError('')
    try {
      onChange(await documentService.share(documentId, email))
      setEmail('')
      setMessage('Access shared successfully')
    } catch (requestError: unknown) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.error ?? 'Unable to share document' : 'Unable to share document')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (userId: string) => {
    setBusy(true)
    setMessage('')
    setError('')
    try {
      onChange(await documentService.removeSharedAccess(documentId, userId))
      setMessage('Access removed')
    } catch (requestError: unknown) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.error ?? 'Unable to remove access' : 'Unable to remove access')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 px-4" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 id="share-title" className="text-xl font-semibold text-slate-900">Share document</h2>
          <button onClick={onClose} aria-label="Close share dialog" className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100">Close</button>
        </div>

        <form onSubmit={share} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input aria-label="User email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@example.com" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
          <button disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60">Share</button>
        </form>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="py-1 text-slate-500">Demo users:</span>
          {['bob@demo.example', 'charlie@demo.example'].map((demoEmail) => (
            <button key={demoEmail} type="button" onClick={() => setEmail(demoEmail)} className="rounded bg-slate-100 px-2 py-1 text-blue-700 hover:bg-slate-200">
              {demoEmail}
            </button>
          ))}
        </div>

        {message && <p className="mt-3 text-sm text-green-700" role="status">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">People with access</h3>
          <ul className="mt-3 divide-y divide-slate-200">
            <li className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{sharing.owner.name}</p>
                <p className="truncate text-sm text-slate-600">{sharing.owner.email}</p>
              </div>
              <span className="text-xs font-medium uppercase text-slate-500">Owner</span>
            </li>
            {sharing.sharedWith.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{user.name}</p>
                  <p className="truncate text-sm text-slate-600">{user.email}</p>
                </div>
                <button disabled={busy} onClick={() => void remove(user.id)} className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60">Remove access</button>
              </li>
            ))}
          </ul>
          {sharing.sharedWith.length === 0 && <p className="mt-2 text-sm text-slate-500">No one else has access.</p>}
        </div>
      </div>
    </div>
  )
}
