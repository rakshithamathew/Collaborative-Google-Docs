import type { TiptapContent } from '../models/Document.js'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export const isTiptapDocument = (value: unknown): value is TiptapContent => {
  if (!isRecord(value) || value.type !== 'doc' || !Array.isArray(value.content)) return false

  const stack: Array<{ node: unknown; depth: number }> = value.content.map((node) => ({ node, depth: 1 }))
  let nodeCount = 0

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || !isRecord(current.node) || typeof current.node.type !== 'string' || !current.node.type) return false
    if (current.depth > 100 || ++nodeCount > 10_000) return false
    if ('text' in current.node && typeof current.node.text !== 'string') return false

    if ('marks' in current.node) {
      if (!Array.isArray(current.node.marks)) return false
      for (const mark of current.node.marks) {
        if (!isRecord(mark) || typeof mark.type !== 'string' || !mark.type) return false
      }
    }

    if ('content' in current.node) {
      if (!Array.isArray(current.node.content)) return false
      for (const child of current.node.content) stack.push({ node: child, depth: current.depth + 1 })
    }
  }

  return true
}
