import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const requireEnvironmentVariable = (name: string): string => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const parsePort = (value: string): number => {
  const port = Number(value)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535')
  }

  return port
}

const parseUrl = (name: string, value: string): string => {
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Unsupported protocol')
    return url.toString().replace(/\/$/, '')
  } catch {
    throw new Error(`${name} must be a valid HTTP or HTTPS URL`)
  }
}

const mongodbUri = requireEnvironmentVariable('MONGODB_URI')
if (!/^mongodb(?:\+srv)?:\/\//.test(mongodbUri)) {
  throw new Error('MONGODB_URI must use the mongodb:// or mongodb+srv:// scheme')
}

export const env = Object.freeze({
  port: parsePort(requireEnvironmentVariable('PORT')),
  mongodbUri,
  clientUrl: parseUrl('CLIENT_URL', requireEnvironmentVariable('CLIENT_URL')),
})
