import { UserModel } from '../models/User.js'

const demoUsers = [
  { name: 'Alice', email: 'alice@demo.example' },
  { name: 'Bob', email: 'bob@demo.example' },
  { name: 'Charlie', email: 'charlie@demo.example' },
] as const

/**
 * Ensure the accounts required by the demo application exist.
 * Upserts make this safe to run on every server start without deleting data.
 */
export const ensureDemoUsers = async (): Promise<void> => {
  await UserModel.bulkWrite(
    demoUsers.map((user) => ({
      updateOne: {
        filter: { email: user.email },
        update: { $set: user },
        upsert: true,
      },
    })),
  )
}
