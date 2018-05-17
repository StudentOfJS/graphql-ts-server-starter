import { redisSessionPrefix, userSessionIdPrefix } from "../constants"
import { Redis } from "ioredis";

export const removeAllUsersSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(`${userSessionIdPrefix}${userId}`, 0, -1)
  const promises = sessionIds.map((sessId: any) => redis.del(`${redisSessionPrefix}${sessId}`))
  await Promise.all(promises)
}