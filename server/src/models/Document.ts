import { model, Schema, Types, type HydratedDocument } from 'mongoose'
import { isTiptapDocument } from '../utils/tiptapValidation.js'
import { MAX_DOCUMENT_TITLE_LENGTH } from '../utils/validation.js'

export interface TiptapContent {
  type: 'doc'
  content?: Array<Record<string, unknown>>
  [key: string]: unknown
}

export interface Document {
  title: string
  content: TiptapContent
  owner: Types.ObjectId
  sharedWith: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

export type DocumentRecord = HydratedDocument<Document>

const documentSchema = new Schema<Document>(
  {
    title: { type: String, required: true, trim: true, maxlength: MAX_DOCUMENT_TITLE_LENGTH },
    content: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: isTiptapDocument,
        message: 'Document content must be valid Tiptap JSON',
      },
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true },
)

export const DocumentModel = model<Document>('Document', documentSchema)
