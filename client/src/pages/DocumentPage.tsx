import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShareDialog } from '../components/ShareDialog'
import { documentService, type SharingInfo, type TiptapContent } from '../services/documentService'

type SaveStatus = 'saving' | 'saved' | 'failed'

const statusLabels: Record<SaveStatus, string> = {
  saving: 'Saving...',
  saved: 'Saved',
  failed: 'Save failed',
}

export function DocumentPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [access, setAccess] = useState<'owned' | 'shared'>('owned')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [sharing, setSharing] = useState<SharingInfo | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const titleRef = useRef('')
  const contentRef = useRef<TiptapContent>({ type: 'doc', content: [] })
  const revisionRef = useRef(0)
  const savedRevisionRef = useRef(0)
  const saveTimerRef = useRef<number | undefined>(undefined)
  const persistRef = useRef<() => Promise<boolean>>(async () => true)

  const editor = useEditor({
    extensions: [StarterKit],
    content: { type: 'doc', content: [] },
    editable: false,
    editorProps: {
      attributes: {
        class: 'tiptap min-h-[60vh] px-4 py-5 outline-none sm:px-8 sm:py-6',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      contentRef.current = currentEditor.getJSON() as TiptapContent
      revisionRef.current += 1
      setSaveStatus('saving')
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = window.setTimeout(() => void persistRef.current(), 800)
    },
  })

  const persist = useCallback(async (): Promise<boolean> => {
    window.clearTimeout(saveTimerRef.current)
    const revision = revisionRef.current

    if (revision === savedRevisionRef.current) return true

    setSaveStatus('saving')
    try {
      await documentService.update(id, { title: titleRef.current, content: contentRef.current })
      savedRevisionRef.current = revision

      if (revisionRef.current === revision) {
        setSaveStatus('saved')
      } else {
        saveTimerRef.current = window.setTimeout(() => void persistRef.current(), 800)
      }
      return true
    } catch {
      setSaveStatus('failed')
      return false
    }
  }, [id])

  persistRef.current = persist

  useEffect(() => {
    if (!editor) return

    let cancelled = false
    setLoading(true)
    setLoadError('')
    const loadDocument = async () => {
      try {
        const document = await documentService.get(id)
        if (cancelled) return

        titleRef.current = document.title
        contentRef.current = document.content
        revisionRef.current = 0
        savedRevisionRef.current = 0
        setTitle(document.title)
        setAccess(document.access)
        setSharing(document.sharing ?? null)
        editor.commands.setContent(document.content, { emitUpdate: false })
        editor.setEditable(true)
        setSaveStatus('saved')
      } catch (error: unknown) {
        if (cancelled) return
        const apiMessage = axios.isAxiosError(error) ? error.response?.data?.error : undefined
        setLoadError(apiMessage ?? 'Document failed to load. Please return to the dashboard and try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDocument()
    return () => {
      cancelled = true
    }
  }, [editor, id])

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (revisionRef.current !== savedRevisionRef.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warnBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload)
      window.clearTimeout(saveTimerRef.current)
      if (revisionRef.current !== savedRevisionRef.current) void persistRef.current()
    }
  }, [])

  const updateTitle = (value: string) => {
    setTitle(value)
    titleRef.current = value
    revisionRef.current += 1
    setSaveStatus('saving')
    window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => void persistRef.current(), 800)
  }

  const goBack = async () => {
    if (await persist()) navigate('/')
  }

  const toolbarButton = (active: boolean) =>
    `rounded px-3 py-1.5 text-sm font-medium ${active ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl space-y-3 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => void goBack()} className="text-sm font-medium text-blue-600 hover:text-blue-700">Back to documents</button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {!loading && !loadError && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase text-slate-600">{access}</span>}
              {!loading && !loadError && access === 'owned' && sharing && (
                <button onClick={() => setShareDialogOpen(true)} className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50">Share</button>
              )}
              {!loading && !loadError && (
                <span aria-live="polite" className={`min-w-20 text-right text-sm font-medium ${saveStatus === 'failed' ? 'text-red-600' : 'text-slate-500'}`}>
                  {statusLabels[saveStatus]}
                </span>
              )}
            </div>
          </div>
          <input
            aria-label="Document title"
            value={title}
            disabled={loading || !!loadError}
            onChange={(event) => updateTitle(event.target.value)}
            onBlur={() => {
              const normalizedTitle = title.trim() || 'Untitled document'
              if (normalizedTitle !== title) updateTitle(normalizedTitle)
            }}
            className="w-full rounded-md border border-transparent px-3 py-2 text-xl font-semibold text-slate-900 outline-none hover:border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {!loading && !loadError && sharing && <p className="px-3 text-sm text-slate-600">Owner: <span className="font-medium text-slate-900">{sharing.owner.name}</span> ({sharing.owner.email})</p>}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {loading ? <p className="text-slate-600">Loading document...</p> : loadError ? (
          <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{loadError}</p>
        ) : editor ? (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <button type="button" aria-label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarButton(editor.isActive('bold'))}>Bold</button>
              <button type="button" aria-label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarButton(editor.isActive('italic'))}>Italic</button>
              <button type="button" aria-label="Heading" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarButton(editor.isActive('heading', { level: 2 }))}>Heading</button>
              <button type="button" aria-label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarButton(editor.isActive('bulletList'))}>Bullet list</button>
            </div>
            <EditorContent editor={editor} />
          </section>
        ) : null}
      </div>
      {shareDialogOpen && sharing && <ShareDialog documentId={id} sharing={sharing} onChange={setSharing} onClose={() => setShareDialogOpen(false)} />}
    </main>
  )
}
