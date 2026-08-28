import app from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { ensureDemoUsers } from './services/ensureDemoUsers.js'

const startServer = async (): Promise<void> => {
  await connectDatabase()
  await ensureDemoUsers()

  const server = app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`)
  })
  server.on('error', (error) => {
    console.error('Server listener failed:', error)
    void disconnectDatabase().finally(() => process.exit(1))
  })

  let shuttingDown = false
  const shutdown = (): void => {
    if (shuttingDown) return
    shuttingDown = true
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0))
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

startServer().catch((error: unknown) => {
  console.error('Server startup failed:', error)
  process.exit(1)
})
