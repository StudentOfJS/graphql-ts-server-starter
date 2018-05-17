import { v4 } from 'uuid'
import { Redis } from 'ioredis';
import { forgotPasswordIdPrefix } from '../constants';
export const createForgotPasswordLink = async (url: string, userId: string, redis: Redis) => {
  const id = v4()
  await redis.set(`${forgotPasswordIdPrefix}${id}`, userId, "ex", 60 * 20)
  return `${url}/change-password/${id}`
}