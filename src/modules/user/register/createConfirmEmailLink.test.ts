import * as Redis from 'ioredis'
import fetch from 'node-fetch'
import * as faker from 'faker'
import { Connection } from 'typeorm'

import { createConfirmEmailLink } from "./createConfirmEmailLink"
import { createTestConn } from '../../../testUtils/createTestConn'
import { User } from '../../../entity/User'



let userId: string
let redis: Redis.Redis
let url: string
let conn: Connection

beforeAll(async () => {
  conn = await createTestConn()
  const user = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password(),
  }).save()
  userId = user.id
  redis = new Redis()
  url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis,
  )
})

afterAll(async () => {
  await conn.close()
})


describe('test createConfirmEmailLink', () => {
  test('response text is equal ok', async () => {
    const response = await fetch(url)
    const text = await response.text()
    expect(text).toEqual('ok')
  })

  test('user is found in redis', async () => {
    const user = await User.findOne({ where: { id: userId } })
    expect((user as User).confirmed).toBeTruthy()
  })

  test('value is removed from redis', async () => {
    const chunks = url.split("/")
    const key = chunks[chunks.length - 1]
    const value = await redis.get(key)
    expect(value).toBeNull()
  })
})
