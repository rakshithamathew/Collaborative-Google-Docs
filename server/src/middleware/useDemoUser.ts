import type { RequestHandler } from 'express'
import { UserModel } from '../models/User.js'
import { AppError } from '../utils/AppError.js'

const DEMO_USER_EMAIL = 'alice@demo.example'

export const useDemoUser: RequestHandler = async (request, _response, next) => {
  const user = await UserModel.findOne({ email: DEMO_USER_EMAIL })

  if (!user) {
    throw new AppError(503, 'Demo user is unavailable. Run the database seed script first.')
  }

  request.user = user
  next()
}
