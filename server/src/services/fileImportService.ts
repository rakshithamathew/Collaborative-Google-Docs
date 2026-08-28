import path from 'node:path'
import mammoth from 'mammoth'
import { DocumentModel } from '../models/Document.js'
import { AppError } from '../utils/AppError.js'
import { type DocumentResponse } from './documentService.js'
import { MAX_DOCUMENT_TITLE_LENGTH } from '../utils/validation.js'

type TiptapNode = Record<string, unknown>

const textNode = (text: string, mark?: 'bold' | 'italic'): TiptapNode => ({
  type: 'text',
  text,
  ...(mark ? { marks: [{ type: mark }] } : {}),
})

const parseInlineMarkdown = (value: string): TiptapNode[] => {
  const nodes: TiptapNode[] = []
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g
  let cursor = 0

  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > cursor) nodes.push(textNode(value.slice(cursor, index)))

    const token = match[0]
    const bold = token.startsWith('**') || token.startsWith('__')
    nodes.push(textNode(token.slice(bold ? 2 : 1, bold ? -2 : -1), bold ? 'bold' : 'italic'))
    cursor = index + token.length
  }

  if (cursor < value.length) nodes.push(textNode(value.slice(cursor)))
  return nodes
}

const paragraph = (value: string): TiptapNode => ({
  type: 'paragraph',
  ...(value ? { content: parseInlineMarkdown(value) } : {}),
})

const plainTextToTiptap = (value: string): TiptapNode[] => {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.replace(/\r?\n/g, ' ').trim())
    .filter(Boolean)
    .map((block) => ({ type: 'paragraph', content: [textNode(block)] }))
}

const markdownToTiptap = (value: string): TiptapNode[] => {
  const lines = value.replace(/\r\n/g, '\n').split('\n')
  const nodes: TiptapNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      nodes.push({ type: 'heading', attrs: { level: heading[1].length }, content: parseInlineMarkdown(heading[2]) })
      index += 1
      continue
    }

    const bullet = line.match(/^\s*[-+*]\s+(.+)$/)
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/)
    if (bullet || ordered) {
      const listType = bullet ? 'bulletList' : 'orderedList'
      const items: TiptapNode[] = []
      while (index < lines.length) {
        const item = lines[index].match(listType === 'bulletList' ? /^\s*[-+*]\s+(.+)$/ : /^\s*\d+\.\s+(.+)$/)
        if (!item) break
        items.push({ type: 'listItem', content: [paragraph(item[1])] })
        index += 1
      }
      nodes.push({ type: listType, content: items })
      continue
    }

    const paragraphLines = [line.trim()]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^\s*([-+*]\s+|\d+\.\s+)/.test(lines[index])
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }
    nodes.push(paragraph(paragraphLines.join(' ')))
  }

  return nodes
}

const documentTitle = (filename: string): string => {
  return (path.basename(filename, path.extname(filename)).trim() || 'Untitled document').slice(0, MAX_DOCUMENT_TITLE_LENGTH)
}

export const importFileAsDocument = async (file: Express.Multer.File, userId: string): Promise<DocumentResponse> => {
  const extension = path.extname(file.originalname).toLowerCase()
  let nodes: TiptapNode[]

  if (extension === '.txt') {
    nodes = plainTextToTiptap(file.buffer.toString('utf8'))
  } else if (extension === '.md') {
    nodes = markdownToTiptap(file.buffer.toString('utf8'))
  } else if (extension === '.docx') {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer })
      nodes = plainTextToTiptap(result.value)
    } catch {
      throw new AppError(400, 'Unable to parse DOCX file')
    }
  } else {
    throw new AppError(400, 'Unsupported file type. Supported files: TXT, MD, DOCX')
  }

  const document = await DocumentModel.create({
    title: documentTitle(file.originalname),
    content: { type: 'doc', content: nodes },
    owner: userId,
    sharedWith: [],
  })

  return {
    id: document.id,
    title: document.title,
    content: document.content,
    owner: document.owner.toString(),
    sharedWith: [],
    access: 'owned',
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}
