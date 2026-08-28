import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { UserModel } from '../models/User.js'

const demoUsers = [
  { name: 'Alice', email: 'alice@demo.example' },
  { name: 'Bob', email: 'bob@demo.example' },
  { name: 'Charlie', email: 'charlie@demo.example' },
] as const

const seed = async (): Promise<void> => {
  await connectDatabase()

  await UserModel.bulkWrite(
    demoUsers.map((user) => ({
      updateOne: {
        filter: { email: user.email },
        update: { $set: user },
        upsert: true,
      },
    })),
  )
  console.log('Seeded exactly 3 demo users: Alice, Bob, and Charlie')
}

seed()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })
