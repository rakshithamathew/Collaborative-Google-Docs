import { model, Schema, type HydratedDocument } from 'mongoose'

export interface User {
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export type UserDocument = HydratedDocument<User>

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true },
)

export const UserModel = model<User>('User', userSchema)
