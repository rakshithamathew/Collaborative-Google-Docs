import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { ensureDemoUsers } from '../services/ensureDemoUsers.js'

const seed = async (): Promise<void> => {
  await connectDatabase()
  await ensureDemoUsers()
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
